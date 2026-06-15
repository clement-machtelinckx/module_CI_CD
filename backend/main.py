import os

import mysql.connector
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conn = mysql.connector.connect(
    database=os.getenv("MYSQL_DATABASE", "ynov_ci"),
    user=os.getenv("MYSQL_USER", "root"),
    password=os.getenv("MYSQL_ROOT_PASSWORD"),
    port=int(os.getenv("MYSQL_PORT", 3306)),
    host=os.getenv("MYSQL_HOST", "localhost"),
)

@app.get("/users")
async def get_users():
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    records = cursor.fetchall()
    cursor.close()

    return {"users": records}