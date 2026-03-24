import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreatePost() {
  const navigate = useNavigate()
  
  // 📌 ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่จาก LocalStorage
  const loggedInUser = JSON.parse(localStorage.getItem('pawjai_user'))

  const [step, setStep] = useState(1)
  const [provinces, setProvinces] = useState([])
  const [breeds, setBreeds] = useState([])
  const [colors, setColors] = useState([])

  const [formData, setFormData] = useState({
    cat_name: '',
    gender: '',
    age_range: '',
    weight: '',
    vaccine_status: '',
    breed_id: '',
    color_id: '',
    province_id: '',
    description: ''
  })

  const [catImage, setCatImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // ถ้ายังไม่ล็อกอิน ให้เด้งไปหน้า Login
  useEffect(() => {
    if (!loggedInUser) {
      alert("กรุณาเข้าสู่ระบบก่อนโพสต์หาบ้านให้น้องแมวครับ")
      navigate('/login')
    }
  }, [loggedInUser, navigate])

  // ดึง Master Data (พันธุ์, สี, จังหวัด) จาก Backend
  useEffect(() => {
    fetch('http://localhost:8000/api/provinces').then(res => res.json()).then(data => setProvinces(data))
    fetch('http://localhost:8000/api/breeds').then(res => res.json()).then(data => setBreeds(data))
    fetch('http://localhost:8000/api/colors').then(res => res.json()).then(data => setColors(data))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCatImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // 📌 ฟังก์ชันสำหรับส่งข้อมูลโพสต์แมวไปยัง Backend
  const handleSubmit = async () => {
    if (!catImage) {
      alert("กรุณาอัปโหลดรูปภาพน้องแมวก่อนครับ!")
      return
    }

    try {
      const payload = new FormData()
      payload.append('image', catImage)
      
      // ดักกรณีผู้ใช้ไม่กรอกข้อมูล ให้ใส่ค่าเริ่มต้นแทน
      payload.append('cat_name', formData.cat_name || 'ไม่ระบุชื่อ')
      payload.append('gender', formData.gender || 'ไม่ทราบ')
      payload.append('age_range', formData.age_range || 'ไม่ทราบอายุ')
      payload.append('weight', formData.weight || 'ไม่ทราบน้ำหนัก')
      payload.append('vaccine_status', formData.vaccine_status || 'ไม่ทราบประวัติ')
      payload.append('description', formData.description || 'ไม่ได้ระบุคำอธิบายเพิ่มเติม') 
      
      // 📌 ผูก owner_id กับ ID ของคนที่ล็อกอินอยู่
      payload.append('owner_id', loggedInUser.id)

      if (formData.breed_id) payload.append('breed_id', formData.breed_id)
      if (formData.color_id) payload.append('color_id', formData.color_id)
      if (formData.province_id) payload.append('province_id', formData.province_id)

      // ยิง API
      const response = await fetch('http://localhost:8000/api/cats', {
        method: 'POST',
        body: payload,
      })
      
      const result = await response.json()

      if (response.ok || result.status === 'success') {
        alert("โพสต์หาบ้านให้น้องแมวสำเร็จแล้ว! 🎉")
        navigate('/adopt') // พาไปหน้า Feed เพื่อดูแมวที่เพิ่งโพสต์
      } else {
        const errorMessage = result.message || 'ข้อมูลไม่ครบถ้วน';
        alert('เกิดข้อผิดพลาด: ' + errorMessage)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์หลังบ้านครับ')
    }
  }

  // ถ้ายังไม่ล็อกอิน ไม่ต้องโชว์ฟอร์ม (เพราะจะถูก Redirect ไปหน้าล็อกอินอยู่แล้ว)
  if (!loggedInUser) return null;

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-20 pt-10 px-10">
      <div className="max-w-4xl mx-auto bg-[#FCF5EB] rounded-[40px] p-10 shadow-sm border border-[#F0E6D8]">
        
        <h1 className="text-4xl font-black text-[#8E6B53] text-center mb-10">โพสต์หาบ้านให้น้องแมว 🐾</h1>

        {/* Step 1: ข้อมูลพื้นฐาน */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-[#698474] mb-4">ส่วนที่ 1: ข้อมูลพื้นฐานน้องแมว</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <input type="text" name="cat_name" placeholder="ชื่อน้องแมว" onChange={handleChange} className="border border-gray-300 rounded-full px-6 py-3 outline-none focus:border-[#A07D5A]" />
              <select name="gender" onChange={handleChange} className="border border-gray-300 rounded-full px-6 py-3 outline-none focus:border-[#A07D5A]">
                <option value="">เพศ</option>
                <option value="ตัวผู้">ตัวผู้</option>
                <option value="ตัวเมีย">ตัวเมีย</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <input type="text" name="age_range" placeholder="อายุ (เช่น 2 เดือน, 1 ปี)" onChange={handleChange} className="border border-gray-300 rounded-full px-6 py-3 outline-none focus:border-[#A07D5A]" />
              <input type="text" name="weight" placeholder="น้ำหนัก (กก.)" onChange={handleChange} className="border border-gray-300 rounded-full px-6 py-3 outline-none focus:border-[#A07D5A]" />
              <select name="vaccine_status" onChange={handleChange} className="border border-gray-300 rounded-full px-6 py-3 outline-none focus:border-[#A07D5A]">
                <option value="">สถานะวัคซีน</option>
                <option value="ฉีดแล้ว">ฉีดแล้ว</option>
                <option value="ยังไม่ฉีด">ยังไม่ฉีด</option>
              </select>
            </div>

            <button onClick={() => setStep(2)} className="mt-6 py-4 bg-[#A07D5A] text-white font-bold rounded-full hover:bg-[#8E6B53] transition">ถัดไป</button>
          </div>
        )}

        {/* Step 2: รายละเอียด & รูปภาพ */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-[#698474] mb-4">ส่วนที่ 2: รายละเอียดและรูปภาพ</h2>
            
            <div className="grid grid-cols-3 gap-6">
              <select name="breed_id" onChange={handleChange} className="border border-gray-300 rounded-full px-6 py-3 outline-none focus:border-[#A07D5A]">
                <option value="">สายพันธุ์</option>
                {breeds.map(b => <option key={b.breed_id} value={b.breed_id}>{b.breed_name}</option>)}
              </select>
              <select name="color_id" onChange={handleChange} className="border border-gray-300 rounded-full px-6 py-3 outline-none focus:border-[#A07D5A]">
                <option value="">สี</option>
                {colors.map(c => <option key={c.color_id} value={c.color_id}>{c.color_name}</option>)}
              </select>
              <select name="province_id" onChange={handleChange} className="border border-gray-300 rounded-full px-6 py-3 outline-none focus:border-[#A07D5A]">
                <option value="">จังหวัดที่น้องอยู่</option>
                {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}
              </select>
            </div>

            <textarea name="description" placeholder="อธิบายลักษณะนิสัย, ความน่ารัก, หรือเงื่อนไขเพิ่มเติม..." onChange={handleChange} className="border border-gray-300 rounded-3xl px-6 py-4 h-32 outline-none focus:border-[#A07D5A]"></textarea>

            {/* อัปโหลดรูป */}
            <div className="border-2 border-dashed border-[#A07D5A] rounded-3xl p-6 text-center">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="upload-image" />
              <label htmlFor="upload-image" className="cursor-pointer flex flex-col items-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-48 rounded-2xl object-cover mb-4 shadow-sm" />
                ) : (
                  <div className="h-48 w-full bg-white rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                    คลิกเพื่ออัปโหลดรูปถ่ายน้องแมว 📸
                  </div>
                )}
                <span className="bg-[#D1B894] px-6 py-2 rounded-full text-white font-bold hover:bg-[#A07D5A] transition">เลือกรูปภาพ</span>
              </label>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-400 transition">ย้อนกลับ</button>
              <button onClick={handleSubmit} className="flex-1 py-4 bg-[#698474] text-white font-bold rounded-full hover:bg-[#526a5b] transition shadow-md">โพสต์หาบ้านเลย! 🏡</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}