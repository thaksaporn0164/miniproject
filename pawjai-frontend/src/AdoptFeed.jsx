import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom' // 📌 นำเข้าเครื่องมือสร้างลิงก์สำหรับเปลี่ยนหน้า

export default function AdoptFeed() {
  const [cats, setCats] = useState([])
  const [provinces, setProvinces] = useState([])
  const [colors, setColors] = useState([])
  
  // State สำหรับเก็บค่าตัวกรอง
  const [filterGender, setFilterGender] = useState('')
  const [filterColor, setFilterColor] = useState('')
  const [filterProvince, setFilterProvince] = useState('')

  // ดึงข้อมูลแมวทั้งหมด และ Master Data จากหลังบ้าน
  useEffect(() => {
    fetch('http://localhost:8000/api/cats')
      .then(res => res.json())
      .then(data => setCats(data))

    fetch('http://localhost:8000/api/provinces')
      .then(res => res.json())
      .then(data => setProvinces(data))

    fetch('http://localhost:8000/api/colors')
      .then(res => res.json())
      .then(data => setColors(data))
  }, [])

  // ฟังก์ชันกรองแมวตามที่ผู้ใช้เลือกใน Dropdown
  const filteredCats = cats.filter(cat => {
    const matchGender = filterGender ? cat.gender === filterGender : true;
    const matchColor = filterColor ? cat.color_name === filterColor : true;
    const matchProvince = filterProvince ? cat.province_name === filterProvince : true;
    return matchGender && matchColor && matchProvince;
  })

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-20 pt-10">
      
      {/* 📌 แถบตัวกรองค้นหา (เหมือนเดิม) */}
      <div className="flex justify-center mb-12">
        <div className="flex bg-white shadow-md rounded-full px-8 py-3 gap-8 items-center border border-gray-100">
          
          <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="bg-transparent text-gray-700 outline-none cursor-pointer text-lg font-medium w-24">
            <option value="">เพศ</option>
            <option value="ตัวผู้">ตัวผู้</option>
            <option value="ตัวเมีย">ตัวเมีย</option>
          </select>
          
          <div className="w-px h-6 bg-gray-300"></div>
          
          <select value={filterColor} onChange={e => setFilterColor(e.target.value)} className="bg-transparent text-gray-700 outline-none cursor-pointer text-lg font-medium w-32">
            <option value="">สี</option>
            {colors.map(c => <option key={c.color_id} value={c.color_name}>{c.color_name}</option>)}
          </select>
          
          <div className="w-px h-6 bg-gray-300"></div>
          
          <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)} className="bg-transparent text-gray-700 outline-none cursor-pointer text-lg font-medium w-36">
            <option value="">จังหวัด</option>
            {provinces.map(p => <option key={p.province_id} value={p.province_name}>{p.province_name}</option>)}
          </select>
          
          <button className="px-10 py-2 bg-[#A07D5A] text-white font-bold rounded-full ml-4 hover:bg-[#8E6B53] transition shadow-md">
            ค้นหา
          </button>
        </div>
      </div>

      {/* 📌 พื้นที่โชว์การ์ดแมวทั้งหมด */}
      <div className="max-w-7xl mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {filteredCats.length > 0 ? (
            filteredCats.map(cat => (
              // 🐈 การ์ดแมว 1 ตัว (ดีไซน์เดิม)
              <div key={cat.cat_id} className="bg-[#FCF5EB] rounded-[30px] overflow-hidden shadow-sm hover:shadow-md transition duration-300 border border-[#F0E6D8] flex flex-col">
                
                {/* รูปแมว */}
                <div className="h-48 overflow-hidden bg-gray-200 m-3 rounded-[20px]">
                  {cat.image_path ? (
                    <img src={cat.image_path} alt="cat" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">ไม่มีรูปภาพ</div>
                  )}
                </div>
                
                {/* ข้อมูลด้านล่าง */}
                <div className="p-5 pt-2 flex-grow flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-gray-800 mb-1">เพศ : {cat.gender || '-'}</p>
                    <p className="font-bold text-gray-800 mb-1">สี : {cat.color_name || '-'}</p>
                    <p className="font-bold text-gray-800">จังหวัด : {cat.province_name || '-'}</p>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    {/* 📌 เปลี่ยนปุ่มดูโปรไฟล์เป็น <Link> ของจริง เพื่อเด้งไปหน้ารายละเอียดแมวตัวนั้น */}
                    <Link
                      to={`/adopt/cats/${cat.cat_id}`} // ใช้ id ของแมวตัวนั้นมาเป็น URL dynamic
                      className="px-6 py-2 bg-[#D1B894] text-white font-bold rounded-full hover:bg-[#A07D5A] transition shadow-sm text-sm" // ใช้ CSS เดิมเป๊ะๆ
                    >
                      ดูโปรไฟล์
                    </Link>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="col-span-4 text-center text-gray-400 py-20 text-xl font-bold">
              ยังไม่มีน้องแมวที่ตรงกับเงื่อนไขการค้นหาครับ 😿
            </div>
          )}

        </div>
      </div>
    </div>
  )
}