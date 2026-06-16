import os
from datetime import date, datetime
from typing import Optional

import mysql.connector
from fastapi import FastAPI, HTTPException, status
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

USER_COLUMNS = "id, name, firstName, birthDate, email, city, postalCode, createdAt"
USER_FIELDS = ("name", "firstName", "birthDate", "email", "city", "postalCode")


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


class UserResponse(UserCreate):
    id: int
    createdAt: Optional[datetime] = None


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


def get_user_or_404(cursor, user_id: int):
    cursor.execute(f"SELECT {USER_COLUMNS} FROM users WHERE id = %s", (user_id,))
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


@app.get("/users")
async def get_users():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(f"SELECT {USER_COLUMNS} FROM users ORDER BY id")
        records = cursor.fetchall()
        return {"users": records}
    finally:
        cursor.close()
        connection.close()


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        return get_user_or_404(cursor, user_id)
    finally:
        cursor.close()
        connection.close()


@app.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
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
        return get_user_or_404(cursor, cursor.lastrowid)
    except mysql.connector.IntegrityError as error:
        connection.rollback()
        raise_duplicate_email_error(error)
    finally:
        cursor.close()
        connection.close()


@app.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserUpdate):
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


@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
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
