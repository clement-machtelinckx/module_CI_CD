import base64
import hashlib
import hmac
import json
import os
import time
from datetime import date, datetime
from typing import Optional

import mysql.connector
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from mysql.connector import errorcode
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PUBLIC_USER_COLUMNS = "id, name, firstName, city"
ADMIN_USER_COLUMNS = "id, name, firstName, birthDate, email, city, postalCode, createdAt"
USER_FIELDS = ("name", "firstName", "birthDate", "email", "city", "postalCode")
TOKEN_TTL_SECONDS = 60 * 60


class UserCreate(BaseModel):
    name: str
    firstName: str
    birthDate: date
    email: str
    city: str
    postalCode: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    firstName: Optional[str] = None
    birthDate: Optional[date] = None
    email: Optional[str] = None
    city: Optional[str] = None
    postalCode: Optional[str] = None


class PublicUserResponse(BaseModel):
    id: int
    name: str
    firstName: str
    city: str


class UserResponse(UserCreate):
    id: int
    createdAt: Optional[datetime] = None


class AdminLogin(BaseModel):
    email: str
    password: str


def model_to_dict(model: BaseModel, **kwargs):
    if hasattr(model, "model_dump"):
        return model.model_dump(**kwargs)

    return model.dict(**kwargs)


def get_connection():
    return mysql.connector.connect(
        database=os.getenv("MYSQL_DATABASE", "ynov_ci"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_ROOT_PASSWORD", ""),
        port=int(os.getenv("MYSQL_PORT", 3306)),
        host=os.getenv("MYSQL_HOST", "localhost"),
        charset="utf8mb4",
        use_unicode=True,
    )


def get_required_env(name: str) -> str:
    value = os.getenv(name)

    if not value:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"La variable d'environnement {name} est manquante.",
        )

    return value


def hash_admin_password(password: str) -> str:
    salt = get_required_env("ADMIN_PASSWORD_SALT")

    return hashlib.sha256((password + salt).encode()).hexdigest()


def encode_token_part(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def decode_token_part(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)

    return base64.urlsafe_b64decode(value + padding)


def sign_token_payload(payload: str) -> str:
    secret = get_required_env("ADMIN_TOKEN_SECRET")
    signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()

    return encode_token_part(signature)


def create_admin_token(email: str) -> str:
    payload = {
        "email": email,
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    encoded_payload = encode_token_part(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
    )
    signature = sign_token_payload(encoded_payload)

    return f"{encoded_payload}.{signature}"


def unauthorized_error():
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentification admin requise.",
    )


def verify_admin_token(token: str) -> str:
    try:
        encoded_payload, signature = token.split(".", 1)
        expected_signature = sign_token_payload(encoded_payload)

        if not hmac.compare_digest(signature, expected_signature):
            unauthorized_error()

        payload = json.loads(decode_token_part(encoded_payload))

        if int(payload.get("exp", 0)) < int(time.time()):
            unauthorized_error()

        email = payload.get("email")

        if not email:
            unauthorized_error()

        return email
    except (ValueError, json.JSONDecodeError, TypeError):
        unauthorized_error()


def get_current_admin(authorization: Optional[str] = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        unauthorized_error()

    return verify_admin_token(authorization.removeprefix("Bearer ").strip())


def get_user_or_404(cursor, user_id: int, columns: str = ADMIN_USER_COLUMNS):
    cursor.execute(f"SELECT {columns} FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )

    return user


def raise_duplicate_email_error(error):
    if getattr(error, "errno", None) == errorcode.ER_DUP_ENTRY:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un utilisateur avec cet email existe déjà.",
        ) from error

    raise error


@app.post("/admin/login")
async def login_admin(credentials: AdminLogin):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT email, passwordHash FROM admins WHERE email = %s",
            (credentials.email,),
        )
        admin = cursor.fetchone()
        password_hash = hash_admin_password(credentials.password)

        if not admin or not hmac.compare_digest(admin["passwordHash"], password_hash):
            unauthorized_error()

        return {
            "token": create_admin_token(admin["email"]),
            "admin": {
                "email": admin["email"],
            },
        }
    finally:
        cursor.close()
        connection.close()


@app.get("/users")
async def get_users():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(f"SELECT {PUBLIC_USER_COLUMNS} FROM users ORDER BY id")
        records = cursor.fetchall()
        return {"users": records}
    finally:
        cursor.close()
        connection.close()


@app.post("/users", response_model=PublicUserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    data = model_to_dict(user)

    try:
        cursor.execute(
            """
            INSERT INTO users (name, firstName, birthDate, email, city, postalCode)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                data["name"],
                data["firstName"],
                data["birthDate"],
                data["email"],
                data["city"],
                data["postalCode"],
            ),
        )
        connection.commit()
        return get_user_or_404(cursor, cursor.lastrowid, PUBLIC_USER_COLUMNS)
    except mysql.connector.IntegrityError as error:
        connection.rollback()
        raise_duplicate_email_error(error)
    finally:
        cursor.close()
        connection.close()


@app.get("/admin/users")
async def get_admin_users(current_admin: str = Depends(get_current_admin)):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(f"SELECT {ADMIN_USER_COLUMNS} FROM users ORDER BY id")
        records = cursor.fetchall()
        return {"users": records}
    finally:
        cursor.close()
        connection.close()


@app.get("/admin/users/{user_id}", response_model=UserResponse)
async def get_admin_user(user_id: int, current_admin: str = Depends(get_current_admin)):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        return get_user_or_404(cursor, user_id)
    finally:
        cursor.close()
        connection.close()


@app.patch("/admin/users/{user_id}", response_model=UserResponse)
async def update_admin_user(
    user_id: int,
    user: UserUpdate,
    current_admin: str = Depends(get_current_admin),
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    data = {
        key: value
        for key, value in model_to_dict(user, exclude_unset=True).items()
        if key in USER_FIELDS and value is not None
    }

    try:
        get_user_or_404(cursor, user_id)

        if data:
            set_clause = ", ".join(f"{field} = %s" for field in data)
            cursor.execute(
                f"UPDATE users SET {set_clause} WHERE id = %s",
                tuple(data.values()) + (user_id,),
            )
            connection.commit()

        return get_user_or_404(cursor, user_id)
    except mysql.connector.IntegrityError as error:
        connection.rollback()
        raise_duplicate_email_error(error)
    finally:
        cursor.close()
        connection.close()


@app.delete("/admin/users/{user_id}")
async def delete_admin_user(user_id: int, current_admin: str = Depends(get_current_admin)):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        get_user_or_404(cursor, user_id)
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        connection.commit()
        return {"deletedId": user_id, "message": "Utilisateur supprimé."}
    finally:
        cursor.close()
        connection.close()
