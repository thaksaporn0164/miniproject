import os
import shutil
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
import bcrypt
import jwt
from datetime import datetime, timedelta

app = FastAPI(title="Pawjai API")

# ==========================================
# 1. CORS
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. Static files
# ==========================================
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ==========================================
# 3. Config — ใช้ env variable แทน hardcode
# ==========================================
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "pawjai_db"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "Mink06565_"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
}

# แก้ข้อ 11: ใช้ env variable แทน hardcode localhost
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# แก้ข้อ 1–2: JWT secret key
JWT_SECRET = os.getenv("JWT_SECRET", "pawjai_secret_change_in_production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

security = HTTPBearer(auto_error=False)


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


# ==========================================
# JWT helpers
# ==========================================
def create_token(user_id: int, full_name: str) -> str:
    payload = {
        "user_id": user_id,
        "full_name": full_name,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        return None


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """ดึง user จาก JWT token — ถ้าไม่มี token คืน None (optional auth)"""
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    return payload


def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """บังคับให้มี JWT token — ใช้กับ endpoint ที่ต้องล็อกอิน"""
    if not credentials:
        raise HTTPException(status_code=401, detail="กรุณาเข้าสู่ระบบก่อนครับ")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Token ไม่ถูกต้องหรือหมดอายุ")
    return payload


# ==========================================
# Models
# ==========================================
class CommentCreate(BaseModel):
    message: str


class AdoptionCreate(BaseModel):
    cat_id: int


class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str


class UserLogin(BaseModel):
    email: str
    password: str


class StatusUpdate(BaseModel):
    status: str


class ChatMessage(BaseModel):
    message: str


# ==========================================
# GET Endpoints
# ==========================================

@app.get("/api/provinces")
def get_provinces():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM provinces ORDER BY sort_order ASC, province_name ASC")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data


@app.get("/api/breeds")
def get_breeds():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM breeds ORDER BY sort_order ASC, breed_name ASC")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data


@app.get("/api/colors")
def get_colors():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM colors ORDER BY sort_order ASC, color_name ASC")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data


@app.get("/api/cats")
def get_cats():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sql = """
        SELECT
            c.cat_id, c.cat_name, c.gender, c.age_range, c.vaccine_status,
            c.weight, b.breed_name, col.color_name, p.province_name,
            img.image_path, c.description, c.status, c.owner_id, c.created_at
        FROM cats c
        LEFT JOIN breeds b ON c.breed_id = b.breed_id
        LEFT JOIN colors col ON c.color_id = col.color_id
        LEFT JOIN provinces p ON c.province_id = p.province_id
        LEFT JOIN cat_images img ON c.cat_id = img.cat_id AND img.is_cover = TRUE
        ORDER BY c.created_at DESC
    """
    cursor.execute(sql)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data


@app.get("/api/cats/{cat_id}/comments")
def get_comments(cat_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sql = """
        SELECT c.comment_id, c.message, c.created_at, u.full_name
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.cat_id = %s
        ORDER BY c.created_at ASC
    """
    cursor.execute(sql, (cat_id,))
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data


# ==========================================
# POST / PUT / DELETE Endpoints
# ==========================================

@app.post("/api/register", status_code=201)
def register_user(user: UserRegister):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # แก้ข้อ 1: hash รหัสผ่านก่อน INSERT
        hashed_pw = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        sql = """
            INSERT INTO users (full_name, email, password, phone)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id, full_name, email, phone
        """
        cursor.execute(sql, (user.full_name, user.email, hashed_pw, user.phone))
        new_user = cursor.fetchone()
        conn.commit()

        token = create_token(new_user["user_id"], new_user["full_name"])
        return {
            "status": "success",
            "message": "ลงทะเบียนสำเร็จ!",
            "token": token,
            "user": {
                "id": new_user["user_id"],
                "name": new_user["full_name"],
                "email": new_user["email"],
                "phone": new_user["phone"],
            },
        }
    except Exception as e:
        conn.rollback()
        if "unique constraint" in str(e).lower() or "duplicate key" in str(e).lower():
            return {"status": "error", "message": "อีเมลนี้มีผู้ใช้งานแล้ว"}
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/login")
def login_user(user: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # แก้ข้อ 1: ดึง hashed password มาเทียบด้วย bcrypt
    sql = "SELECT user_id, full_name, email, phone, password FROM users WHERE email = %s"
    cursor.execute(sql, (user.email,))
    found_user = cursor.fetchone()
    cursor.close()
    conn.close()

    if found_user and bcrypt.checkpw(user.password.encode("utf-8"), found_user["password"].encode("utf-8")):
        token = create_token(found_user["user_id"], found_user["full_name"])
        return {
            "status": "success",
            "message": "เข้าสู่ระบบสำเร็จ",
            "token": token,
            "user": {
                "id": found_user["user_id"],
                "name": found_user["full_name"],
                "email": found_user["email"],
                "phone": found_user["phone"],
            },
        }
    else:
        return {"status": "error", "message": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"}


@app.post("/api/cats/{cat_id}/comments", status_code=201)
def add_comment(cat_id: int, comment: CommentCreate, current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        sql = "INSERT INTO comments (cat_id, user_id, message) VALUES (%s, %s, %s)"
        cursor.execute(sql, (cat_id, current_user["user_id"], comment.message))
        conn.commit()
        return {"status": "success", "message": "เพิ่มคอมเมนต์สำเร็จ!"}
    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/adoptions", status_code=201)
def request_adoption(adoption: AdoptionCreate, current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # แก้ข้อ 10: เช็คสถานะแมวก่อนรับเลี้ยง
        cursor.execute("SELECT status, owner_id FROM cats WHERE cat_id = %s", (adoption.cat_id,))
        cat = cursor.fetchone()

        if not cat:
            return {"status": "error", "message": "ไม่พบแมวตัวนี้"}
        if cat["status"] != "หาบ้าน":
            return {"status": "error", "message": f"น้องแมวไม่สามารถรับเลี้ยงได้ในขณะนี้ (สถานะ: {cat['status']})"}
        if cat["owner_id"] == current_user["user_id"]:
            return {"status": "error", "message": "ไม่สามารถรับเลี้ยงแมวของตัวเองได้"}

        insert_sql = "INSERT INTO adoptions (cat_id, adopter_id, status) VALUES (%s, %s, 'Pending') RETURNING adoption_id"
        cursor.execute(insert_sql, (adoption.cat_id, current_user["user_id"]))
        adoption_id = cursor.fetchone()["adoption_id"]

        cursor.execute("UPDATE cats SET status = 'กำลังเจรจา' WHERE cat_id = %s", (adoption.cat_id,))
        conn.commit()
        return {"status": "success", "message": "ส่งคำขอรับเลี้ยงสำเร็จ!", "adoption_id": adoption_id}
    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()


@app.post("/api/cats", status_code=201)
async def create_cat_post(
    cat_name: str = Form(...),
    gender: str = Form(...),
    age_range: str = Form(...),
    weight: str = Form(...),
    vaccine_status: str = Form(...),
    breed_id: int = Form(...),
    color_id: int = Form(...),
    province_id: int = Form(...),
    description: str = Form(...),
    image: UploadFile = File(...),
    current_user: dict = Depends(require_auth),
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        insert_cat_sql = """
            INSERT INTO cats (
                owner_id, cat_name, gender, age_range, weight,
                vaccine_status, breed_id, color_id, province_id, description, status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'หาบ้าน')
            RETURNING cat_id;
        """
        cursor.execute(insert_cat_sql, (
            current_user["user_id"], cat_name, gender, age_range, weight,
            vaccine_status, breed_id, color_id, province_id, description,
        ))
        new_cat_id = cursor.fetchone()[0]

        file_extension = image.filename.split(".")[-1]
        new_file_name = f"cat_{new_cat_id}.{file_extension}"
        file_path = f"uploads/{new_file_name}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # แก้ข้อ 11: ใช้ BASE_URL จาก env
        image_url = f"{BASE_URL}/uploads/{new_file_name}"
        cursor.execute(
            "INSERT INTO cat_images (cat_id, image_path, is_cover) VALUES (%s, %s, TRUE)",
            (new_cat_id, image_url),
        )

        conn.commit()
        return {"status": "success", "message": "สร้างโพสต์พร้อมรูปภาพสำเร็จ!", "cat_id": new_cat_id}
    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()


# แก้ข้อ 2: ตรวจสอบ owner ก่อนลบ
@app.delete("/api/cats/{cat_id}")
def delete_cat(cat_id: int, current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("SELECT owner_id FROM cats WHERE cat_id = %s", (cat_id,))
        cat = cursor.fetchone()
        if not cat:
            return {"status": "error", "message": "ไม่พบแมวที่ต้องการลบ"}

        # อนุญาตเฉพาะเจ้าของโพสต์
        if cat["owner_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์ลบโพสต์นี้")

        cursor.execute("DELETE FROM cats WHERE cat_id = %s", (cat_id,))
        conn.commit()
        return {"status": "success", "message": "ลบโพสต์สำเร็จ"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()


# แก้ข้อ 2: ตรวจสอบ owner ก่อนเปลี่ยนสถานะ
@app.put("/api/cats/{cat_id}/status")
def update_cat_status(cat_id: int, status_update: StatusUpdate, current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("SELECT owner_id FROM cats WHERE cat_id = %s", (cat_id,))
        cat = cursor.fetchone()
        if not cat:
            return {"status": "error", "message": "ไม่พบแมว"}
        if cat["owner_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์แก้ไขโพสต์นี้")

        cursor.execute("UPDATE cats SET status = %s WHERE cat_id = %s", (status_update.status, cat_id))
        conn.commit()
        return {"status": "success", "message": f"อัปเดตสถานะเป็น {status_update.status} สำเร็จ!"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()


# ==========================================
# Chat — แก้ข้อ 11: ลบ duplicate routes ออก เหลืออันเดียว
# ==========================================

@app.get("/api/cats/{cat_id}/chat")
def get_chat_messages(cat_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sql = """
        SELECT cm.message_id, cm.message, cm.created_at, u.full_name, cm.sender_id
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.user_id
        WHERE cm.cat_id = %s
        ORDER BY cm.created_at ASC
    """
    cursor.execute(sql, (cat_id,))
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data


@app.post("/api/cats/{cat_id}/chat", status_code=201)
def send_chat_message(cat_id: int, chat: ChatMessage, current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        sql = "INSERT INTO chat_messages (cat_id, sender_id, message) VALUES (%s, %s, %s)"
        cursor.execute(sql, (cat_id, current_user["user_id"], chat.message))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()