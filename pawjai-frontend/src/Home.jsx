import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [provinces, setProvinces] = useState([])
  const [colors, setColors] = useState([])
  const [recommendedCats, setRecommendedCats] = useState([])
  
  // 📌 เพิ่ม State สำหรับเช็คว่ากำลังโหลดอยู่หรือไม่
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ดึงข้อมูลจังหวัดและสี (สำหรับช่องค้นหา)
    fetch('http://localhost:8000/api/provinces')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error(err))
      
    fetch('http://localhost:8000/api/colors')
      .then(res => res.json())
      .then(data => setColors(data))
      .catch(err => console.error(err))

    // ดึงข้อมูลแมวทั้งหมดมาสุ่มแสดง
    fetch('http://localhost:8000/api/cats')
      .then(res => res.json())
      .then(data => {
        // เช็คว่ามีข้อมูลตอบกลับมาจริงๆ และเป็น Array
        if (Array.isArray(data)) {
            // กรองเอาเฉพาะแมวที่สถานะ "หาบ้าน"
            const availableCats = data.filter(cat => cat.status === 'หาบ้าน')
            
            // สุ่มลำดับ Array (Fisher-Yates Shuffle)
            for (let i = availableCats.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [availableCats[i], availableCats[j]] = [availableCats[j], availableCats[i]];
            }
            
            setRecommendedCats(availableCats.slice(0, 4))
        }
      })
      .catch(err => console.error(err))
      .finally(() => {
        // 📌 เมื่อดึงข้อมูลเสร็จ (ไม่ว่าจะเจอแมวหรือไม่ หรือ Error) ให้ปิดสถานะโหลด
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-20">
      
      {/* 📌 แบนเนอร์ขนาดใหญ่ */}
      <div className="relative w-full h-[450px] bg-[#D1B894] flex items-center justify-between overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div> 
        
        <div className="relative z-10 pl-20 text-white w-1/2">
          <h2 className="text-6xl font-black mb-6 drop-shadow-md leading-tight">ให้ PAWJAI <br/> เชื่อมสายใยรัก</h2>
          <p className="text-2xl font-medium drop-shadow-md">จากแมวไร้บ้าน...สู่อ้อมกอดของคุณ 🐾</p>
        </div>

        {/* 📌 กล่องค้นหา (ลอยอยู่บนแบนเนอร์) */}
        <div className="absolute bottom-10 left-20 z-20 flex bg-white rounded-full px-8 py-4 gap-8 items-center shadow-xl border border-gray-100">
          <select className="bg-transparent text-gray-700 outline-none text-lg font-medium cursor-pointer w-24">
            <option value="">เพศ</option>
            <option value="ตัวผู้">ตัวผู้</option>
            <option value="ตัวเมีย">ตัวเมีย</option>
          </select>
          <div className="w-px h-8 bg-gray-300"></div>
          <select className="bg-transparent text-gray-700 outline-none text-lg font-medium cursor-pointer w-32">
            <option value="">สี</option>
            {colors.map(c => <option key={c.color_id} value={c.color_id}>{c.color_name}</option>)}
          </select>
          <div className="w-px h-8 bg-gray-300"></div>
          <select className="bg-transparent text-gray-700 outline-none text-lg font-medium cursor-pointer w-36">
            <option value="">จังหวัด</option>
            {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}
          </select>
          
          <Link to="/adopt" className="px-10 py-3 bg-[#A07D5A] text-white font-bold rounded-full ml-4 hover:bg-[#8E6B53] transition shadow-md">
            ค้นหาเลย
          </Link>
        </div>
      </div>

      {/* 📌 ส่วนแนะนำแมว */}
      <div className="max-w-7xl mx-auto px-10 mt-20">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-3xl font-black text-[#8E6B53]">น้องแมวแนะนำสำหรับคุณ 😻</h3>
          <Link to="/adopt" className="text-[#698474] font-bold hover:underline">ดูน้องแมวทั้งหมด &rarr;</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {/* 📌 เช็คสถานะ Loading ใหม่ */}
           {isLoading ? (
             <div className="col-span-4 text-center text-gray-400 py-20 text-xl font-bold">
               กำลังโหลดข้อมูลน้องแมว... 🐾
             </div>
           ) : recommendedCats.length > 0 ? (
             recommendedCats.map(cat => (
              <div key={cat.cat_id} className="bg-[#FCF5EB] rounded-[30px] overflow-hidden shadow-sm hover:shadow-md transition duration-300 border border-[#F0E6D8] flex flex-col relative group">
                
                {/* รูปแมว */}
                <div className="relative h-56 overflow-hidden bg-gray-200 m-3 rounded-[20px]">
                  {cat.image_path ? (
                    <img src={cat.image_path} alt="cat" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">ไม่มีรูปภาพ</div>
                  )}
                </div>
                
                {/* ข้อมูล */}
                <div className="p-5 pt-2 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-[#8E6B53] text-2xl mb-2">{cat.cat_name}</h3>
                    <p className="font-bold text-gray-800 mb-1 text-sm">เพศ : <span className="font-normal text-gray-600">{cat.gender || '-'}</span></p>
                    <p className="font-bold text-gray-800 text-sm">จังหวัด : <span className="font-normal text-gray-600">{cat.province_name || '-'}</span></p>
                  </div>
                  
                  <div className="mt-6">
                    <Link
                      to={`/adopt/cats/${cat.cat_id}`} 
                      className="block w-full text-center py-3 bg-white text-[#A07D5A] border-2 border-[#A07D5A] font-bold rounded-full hover:bg-[#A07D5A] hover:text-white transition shadow-sm"
                    >
                      ทำความรู้จัก
                    </Link>
                  </div>
                </div>
              </div>
             ))
           ) : (
             <div className="col-span-4 text-center text-gray-400 py-20 text-xl font-bold">
               ตอนนี้น้องแมวได้บ้านครบหมดแล้ว (หรือยังไม่มีโพสต์หาบ้าน) 🏡✨
             </div>
           )}
        </div>
      </div>

    </div>
  )
}