import os
import shutil
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel

app = FastAPI(title="Pawjai API")

# ==========================================
# 1. ตั้งค่า CORS (อนุญาตให้ React ดึงข้อมูลได้)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. ตั้งค่าโฟลเดอร์สำหรับเก็บรูปภาพอัปโหลด
# ==========================================
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ==========================================
# 3. ตั้งค่าการเชื่อมต่อ Database
# ==========================================
DB_CONFIG = {
    "dbname": "pawjai_db",
    "user": "postgres",
    "password": "Mink06565_", 
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

# ==========================================
# โครงสร้างข้อมูล (Models)
# ==========================================
class CommentCreate(BaseModel):
    user_id: int = 1  
    message: str

class AdoptionCreate(BaseModel):
    cat_id: int
    adopter_id: int = 1  

# ==========================================
# 4. API ดึงข้อมูล (GET Endpoints)
# ==========================================

@app.get("/api/provinces")
def get_provinces():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    # 📌 อัปเดต: เรียงตาม sort_order ก่อน แล้วค่อยเรียงตามตัวอักษร
    cursor.execute("SELECT * FROM provinces ORDER BY sort_order ASC, province_name ASC")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

@app.get("/api/breeds")
def get_breeds():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    # 📌 อัปเดต: เรียงตาม sort_order ก่อน แล้วค่อยเรียงตามตัวอักษร
    cursor.execute("SELECT * FROM breeds ORDER BY sort_order ASC, breed_name ASC")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

@app.get("/api/colors")
def get_colors():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    # 📌 อัปเดต: เรียงตาม sort_order ก่อน แล้วค่อยเรียงตามตัวอักษร
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
            b.breed_name, col.color_name, p.province_name, img.image_path,
            c.description, c.created_at
        FROM cats c
        LEFT JOIN breeds b ON c.breed_id = b.breed_id
        LEFT JOIN colors col ON c.color_id = col.color_id
        LEFT JOIN provinces p ON c.province_id = p.province_id
        LEFT JOIN cat_images img ON c.cat_id = img.cat_id AND img.is_cover = TRUE
        WHERE c.status = 'หาบ้าน'
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
# 5. API รับข้อมูลเข้า (POST Endpoints)
# ==========================================

@app.post("/api/cats/{cat_id}/comments", status_code=201)
def add_comment(cat_id: int, comment: CommentCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        sql = "INSERT INTO comments (cat_id, user_id, message) VALUES (%s, %s, %s)"
        cursor.execute(sql, (cat_id, comment.user_id, comment.message))
        conn.commit()
        return {"status": "success", "message": "เพิ่มคอมเมนต์สำเร็จ!"}
    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/adoptions", status_code=201)
def request_adoption(adoption: AdoptionCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        insert_sql = "INSERT INTO adoptions (cat_id, adopter_id, status) VALUES (%s, %s, 'Pending') RETURNING adoption_id"
        cursor.execute(insert_sql, (adoption.cat_id, adoption.adopter_id))
        adoption_id = cursor.fetchone()[0]

        update_cat_sql = "UPDATE cats SET status = 'กำลังเจรจา' WHERE cat_id = %s"
        cursor.execute(update_cat_sql, (adoption.cat_id,))

        conn.commit()
        return {"status": "success", "message": "ส่งคำขอรับเลี้ยงสำเร็จ!", "adoption_id": adoption_id}
    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()

# API สร้างโพสต์พร้อมรับไฟล์รูปภาพ
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
    owner_id: int = Form(1), 
    image: UploadFile = File(...) 
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. บันทึกข้อมูลแมว
        insert_cat_sql = """
            INSERT INTO cats (
                owner_id, cat_name, gender, age_range, weight, 
                vaccine_status, breed_id, color_id, province_id, description, status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'หาบ้าน')
            RETURNING cat_id;
        """
        cursor.execute(insert_cat_sql, (
            owner_id, cat_name, gender, age_range, weight,
            vaccine_status, breed_id, color_id, province_id, description
        ))
        new_cat_id = cursor.fetchone()[0]

        # 2. เซฟไฟล์รูปภาพลงโฟลเดอร์ uploads
        file_extension = image.filename.split('.')[-1]
        new_file_name = f"cat_{new_cat_id}.{file_extension}"
        file_path = f"uploads/{new_file_name}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # 3. บันทึก path รูปลงตาราง
        image_url = f"http://localhost:8000/uploads/{new_file_name}"
        insert_img_sql = "INSERT INTO cat_images (cat_id, image_path, is_cover) VALUES (%s, %s, TRUE)"
        cursor.execute(insert_img_sql, (new_cat_id, image_url))

        conn.commit()
        return {"status": "success", "message": "สร้างโพสต์พร้อมรูปภาพสำเร็จ!", "cat_id": new_cat_id}

    except Exception as e:
        conn.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
        conn.close()