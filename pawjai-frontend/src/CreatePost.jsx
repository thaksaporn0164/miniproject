import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreatePost() {
  const navigate = useNavigate()
  const loggedInUser = JSON.parse(localStorage.getItem('pawjai_user'))
  const token = localStorage.getItem('pawjai_token')

  const [step, setStep] = useState(1)
  const [provinces, setProvinces] = useState([])
  const [breeds, setBreeds] = useState([])
  const [colors, setColors] = useState([])
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    cat_name: '',
    gender: '',
    age_number: '',     // แก้ข้อ 7: แยกตัวเลข
    age_unit: 'เดือน',  // แก้ข้อ 7: และหน่วย
    weight: '',
    vaccine_status: '',
    breed_id: '',
    color_id: '',
    province_id: '',
    description: '',
  })

  const [catImage, setCatImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (!loggedInUser) {
      alert('กรุณาเข้าสู่ระบบก่อนโพสต์หาบ้านให้น้องแมวครับ')
      navigate('/login')
    }
  }, [])

  useEffect(() => {
    fetch('http://localhost:8000/api/provinces').then(r => r.json()).then(setProvinces)
    fetch('http://localhost:8000/api/breeds').then(r => r.json()).then(setBreeds)
    fetch('http://localhost:8000/api/colors').then(r => r.json()).then(setColors)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // ล้าง error ของ field นั้นทันทีที่กรอก
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCatImage(file)
      setImagePreview(URL.createObjectURL(file))
      if (errors.image) setErrors(prev => ({ ...prev, image: '' }))
    }
  }

  // แก้ข้อ 3: validate ก่อนเปลี่ยน step
  const validateStep1 = () => {
    const e = {}
    if (!formData.cat_name.trim()) e.cat_name = 'กรุณากรอกชื่อน้องแมว'
    if (!formData.gender) e.gender = 'กรุณาเลือกเพศ'
    if (!formData.age_number || isNaN(Number(formData.age_number)) || Number(formData.age_number) <= 0)
      e.age_number = 'กรุณากรอกอายุเป็นตัวเลข'
    if (!formData.weight || isNaN(Number(formData.weight)) || Number(formData.weight) <= 0)
      e.weight = 'กรุณากรอกน้ำหนักเป็นตัวเลข'
    if (!formData.vaccine_status) e.vaccine_status = 'กรุณาเลือกสถานะวัคซีน'
    return e
  }

  const validateStep2 = () => {
    const e = {}
    if (!formData.breed_id) e.breed_id = 'กรุณาเลือกสายพันธุ์'
    if (!formData.color_id) e.color_id = 'กรุณาเลือกสี'
    if (!formData.province_id) e.province_id = 'กรุณาเลือกจังหวัด'
    if (!formData.description.trim()) e.description = 'กรุณากรอกคำอธิบาย'
    if (!catImage) e.image = 'กรุณาอัปโหลดรูปภาพน้องแมว'
    return e
  }

  const handleNextStep = () => {
    const errs = validateStep1()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep(2)
  }

  const handleSubmit = async () => {
    const errs = validateStep2()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    try {
      const payload = new FormData()
      payload.append('image', catImage)
      payload.append('cat_name', formData.cat_name)
      payload.append('gender', formData.gender)
      // แก้ข้อ 7: รวม age_number + age_unit
      payload.append('age_range', `${formData.age_number} ${formData.age_unit}`)
      payload.append('weight', formData.weight)
      payload.append('vaccine_status', formData.vaccine_status)
      payload.append('description', formData.description)
      payload.append('breed_id', formData.breed_id)
      payload.append('color_id', formData.color_id)
      payload.append('province_id', formData.province_id)

      const response = await fetch('http://localhost:8000/api/cats', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload,
      })
      const result = await response.json()

      if (result.status === 'success') {
        alert('โพสต์หาบ้านให้น้องแมวสำเร็จแล้ว! 🎉')
        navigate('/adopt')
      } else {
        alert('เกิดข้อผิดพลาด: ' + (result.message || 'ข้อมูลไม่ครบถ้วน'))
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ครับ')
    }
  }

  if (!loggedInUser) return null

  const inputCls = (field) =>
    `border rounded-full px-6 py-3 outline-none transition w-full ${
      errors[field] ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-300 bg-white focus:border-[#A07D5A]'
    }`

  const selectCls = (field) =>
    `border rounded-full px-6 py-3 outline-none transition w-full bg-white ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-[#A07D5A]'
    }`

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-20 pt-10 px-10">
      <div className="max-w-4xl mx-auto bg-[#FCF5EB] rounded-[40px] p-10 shadow-sm border border-[#F0E6D8]">
        <h1 className="text-4xl font-black text-[#8E6B53] text-center mb-4">โพสต์หาบ้านให้น้องแมว 🐾</h1>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition ${step >= 1 ? 'bg-[#A07D5A]' : 'bg-gray-300'}`}>1</div>
          <div className={`h-1 w-24 rounded transition ${step >= 2 ? 'bg-[#A07D5A]' : 'bg-gray-200'}`}/>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition ${step >= 2 ? 'bg-[#A07D5A]' : 'bg-gray-300'}`}>2</div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-[#698474] mb-2">ส่วนที่ 1: ข้อมูลพื้นฐาน</h2>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <input name="cat_name" value={formData.cat_name} onChange={handleChange}
                  placeholder="ชื่อน้องแมว *" className={inputCls('cat_name')} />
                {errors.cat_name && <p className="text-red-500 text-sm mt-1 pl-4">{errors.cat_name}</p>}
              </div>
              <div>
                <select name="gender" value={formData.gender} onChange={handleChange} className={selectCls('gender')}>
                  <option value="">เพศ *</option>
                  <option value="ตัวผู้">ตัวผู้</option>
                  <option value="ตัวเมีย">ตัวเมีย</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1 pl-4">{errors.gender}</p>}
              </div>
            </div>

            {/* แก้ข้อ 7: อายุ = ตัวเลข + dropdown หน่วย */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1 pl-2">อายุ *</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    name="age_number"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.age_number}
                    onChange={handleChange}
                    placeholder="ระบุตัวเลข"
                    className={inputCls('age_number')}
                  />
                </div>
                <select
                  name="age_unit"
                  value={formData.age_unit}
                  onChange={handleChange}
                  className="border border-gray-300 bg-white rounded-full px-6 py-3 outline-none focus:border-[#A07D5A] w-36"
                >
                  <option value="เดือน">เดือน</option>
                  <option value="ปี">ปี</option>
                </select>
              </div>
              {errors.age_number && <p className="text-red-500 text-sm mt-1 pl-4">{errors.age_number}</p>}
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* แก้ข้อ 8: น้ำหนัก = number + decimal */}
              <div>
                <input
                  name="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="น้ำหนัก (กก.) *"
                  className={inputCls('weight')}
                />
                {errors.weight && <p className="text-red-500 text-sm mt-1 pl-4">{errors.weight}</p>}
              </div>
              <div>
                <select name="vaccine_status" value={formData.vaccine_status} onChange={handleChange}
                  className={selectCls('vaccine_status')}>
                  <option value="">สถานะวัคซีน *</option>
                  <option value="ฉีดแล้ว">ฉีดแล้ว</option>
                  <option value="ยังไม่ฉีด">ยังไม่ฉีด</option>
                </select>
                {errors.vaccine_status && <p className="text-red-500 text-sm mt-1 pl-4">{errors.vaccine_status}</p>}
              </div>
            </div>

            <button onClick={handleNextStep}
              className="mt-4 py-4 bg-[#A07D5A] text-white font-bold rounded-full hover:bg-[#8E6B53] transition">
              ถัดไป →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-[#698474] mb-2">ส่วนที่ 2: รายละเอียดและรูปภาพ</h2>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <select name="breed_id" value={formData.breed_id} onChange={handleChange} className={selectCls('breed_id')}>
                  <option value="">สายพันธุ์ *</option>
                  {breeds.map(b => <option key={b.breed_id} value={b.breed_id}>{b.breed_name}</option>)}
                </select>
                {errors.breed_id && <p className="text-red-500 text-sm mt-1 pl-4">{errors.breed_id}</p>}
              </div>
              <div>
                <select name="color_id" value={formData.color_id} onChange={handleChange} className={selectCls('color_id')}>
                  <option value="">สี *</option>
                  {colors.map(c => <option key={c.color_id} value={c.color_id}>{c.color_name}</option>)}
                </select>
                {errors.color_id && <p className="text-red-500 text-sm mt-1 pl-4">{errors.color_id}</p>}
              </div>
              <div>
                <select name="province_id" value={formData.province_id} onChange={handleChange} className={selectCls('province_id')}>
                  <option value="">จังหวัด *</option>
                  {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}
                </select>
                {errors.province_id && <p className="text-red-500 text-sm mt-1 pl-4">{errors.province_id}</p>}
              </div>
            </div>

            <div>
              <textarea name="description" value={formData.description} onChange={handleChange}
                placeholder="อธิบายลักษณะนิสัย, ความน่ารัก หรือเงื่อนไขเพิ่มเติม... *"
                className={`border rounded-3xl px-6 py-4 h-32 outline-none transition w-full resize-none ${
                  errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white focus:border-[#A07D5A]'
                }`} />
              {errors.description && <p className="text-red-500 text-sm mt-1 pl-4">{errors.description}</p>}
            </div>

            <div className={`border-2 border-dashed rounded-3xl p-6 text-center transition ${
              errors.image ? 'border-red-400 bg-red-50' : 'border-[#A07D5A]'
            }`}>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="upload-image" />
              <label htmlFor="upload-image" className="cursor-pointer flex flex-col items-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-48 rounded-2xl object-cover mb-4 shadow-sm" />
                ) : (
                  <div className="h-48 w-full bg-white rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                    คลิกเพื่ออัปโหลดรูปถ่ายน้องแมว 📸
                  </div>
                )}
                <span className="bg-[#D1B894] px-6 py-2 rounded-full text-white font-bold hover:bg-[#A07D5A] transition">
                  เลือกรูปภาพ
                </span>
              </label>
              {errors.image && <p className="text-red-500 text-sm mt-2">{errors.image}</p>}
            </div>

            <div className="flex gap-4 mt-2">
              <button onClick={() => setStep(1)}
                className="flex-1 py-4 bg-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-400 transition">
                ← ย้อนกลับ
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-4 bg-[#698474] text-white font-bold rounded-full hover:bg-[#526a5b] transition shadow-md">
                โพสต์หาบ้านเลย! 🏡
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}