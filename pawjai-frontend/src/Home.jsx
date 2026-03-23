import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [provinces, setProvinces] = useState([])
  const [colors, setColors] = useState([])

  useEffect(() => {
    fetch('http://localhost:8000/api/provinces').then(res => res.json()).then(data => setProvinces(data))
    fetch('http://localhost:8000/api/colors').then(res => res.json()).then(data => setColors(data))
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-10">
      
      {/* 📌 แบนเนอร์ขนาดใหญ่ */}
      <div className="relative w-full h-[400px] bg-[#D1B894] flex items-center justify-between overflow-hidden">
        {/* ตรงนี้เดี๋ยวเราค่อยเอารูปแมวหมู่แบบในรูปที่ 2 มาใส่เป็นภาพพื้นหลัง */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div> 
        
        <div className="relative z-10 pl-20 text-white w-1/2">
          <h2 className="text-6xl font-bold mb-4 drop-shadow-md">ให้ PAWJAI เชื่อมสายใยรัก</h2>
          <p className="text-2xl drop-shadow-md">จากแมวไร้บ้าน...สู่อ้อมกอดของคุณ</p>
        </div>

        {/* 📌 กล่องค้นหา (ลอยอยู่บนแบนเนอร์) */}
        <div className="absolute bottom-10 left-20 z-20 flex bg-white rounded-full px-8 py-4 gap-8 items-center shadow-xl">
          <select className="bg-transparent text-gray-700 outline-none text-lg">
            <option value="">เพศ</option>
            <option value="ตัวผู้">ตัวผู้</option>
            <option value="ตัวเมีย">ตัวเมีย</option>
          </select>
          <div className="w-px h-8 bg-gray-300"></div>
          <select className="bg-transparent text-gray-700 outline-none text-lg">
            <option value="">สี</option>
            {colors.map(c => <option key={c.color_id} value={c.color_id}>{c.color_name}</option>)}
          </select>
          <div className="w-px h-8 bg-gray-300"></div>
          <select className="bg-transparent text-gray-700 outline-none text-lg">
            <option value="">จังหวัด</option>
            {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}
          </select>
          
          {/* พอกดปุ่มค้นหา จะพาไปหน้า Feed รับเลี้ยงแมว */}
          <Link to="/adopt" className="px-10 py-3 bg-[#A07D5A] text-white font-bold rounded-full ml-4 hover:bg-[#8E6B53] transition shadow-md">
            ค้นหา
          </Link>
        </div>
      </div>

      {/* 📌 ส่วนแนะนำแมว (จำลองไว้ก่อน) */}
      <div className="max-w-7xl mx-auto px-10 mt-16">
        <h3 className="text-3xl font-bold text-gray-800 mb-8">แมวแนะนำสำหรับคุณ</h3>
        <div className="grid grid-cols-4 gap-6">
           {/* เดี๋ยวเรามาเขียนโค้ดดึงรูปลง Card ตรงนี้ครับ */}
           <div className="bg-[#FCF5EB] h-64 rounded-3xl p-4 flex items-center justify-center text-gray-400">Card แมว 1</div>
           <div className="bg-[#FCF5EB] h-64 rounded-3xl p-4 flex items-center justify-center text-gray-400">Card แมว 2</div>
           <div className="bg-[#FCF5EB] h-64 rounded-3xl p-4 flex items-center justify-center text-gray-400">Card แมว 3</div>
           <div className="bg-[#FCF5EB] h-64 rounded-3xl p-4 flex items-center justify-center text-gray-400">Card แมว 4</div>
        </div>
      </div>

    </div>
  )
}