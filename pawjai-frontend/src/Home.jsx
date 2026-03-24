import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [provinces, setProvinces] = useState([])
  const [colors, setColors] = useState([])
  const [recommendedCats, setRecommendedCats] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // แก้ข้อ 5: state สำหรับ filter
  const [filterGender, setFilterGender] = useState('')
  const [filterColor, setFilterColor] = useState('')
  const [filterProvince, setFilterProvince] = useState('')

  useEffect(() => {
    fetch('http://localhost:8000/api/provinces').then(r => r.json()).then(setProvinces).catch(console.error)
    fetch('http://localhost:8000/api/colors').then(r => r.json()).then(setColors).catch(console.error)
    fetch('http://localhost:8000/api/cats')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const available = data.filter(c => c.status === 'หาบ้าน')
          for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]]
          }
          setRecommendedCats(available.slice(0, 4))
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  // แก้ข้อ 5: ส่ง filter ไปพร้อมกับ navigate ไปหน้า /adopt
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (filterGender) params.set('gender', filterGender)
    if (filterColor) params.set('color', filterColor)
    if (filterProvince) params.set('province', filterProvince)
    navigate(`/adopt?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-20">
      {/* แบนเนอร์ */}
      <div className="relative w-full h-[450px] bg-[#D1B894] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10 pl-20 text-white w-1/2">
          <h2 className="text-6xl font-black mb-6 drop-shadow-md leading-tight">ให้ PAWJAI <br/> เชื่อมสายใยรัก</h2>
          <p className="text-2xl font-medium drop-shadow-md">จากแมวไร้บ้าน...สู่อ้อมกอดของคุณ 🐾</p>
        </div>

        {/* กล่องค้นหา — แก้ข้อ 5: ผูก state และส่ง query */}
        <div className="absolute bottom-10 left-20 z-20 flex bg-white rounded-full px-8 py-4 gap-6 items-center shadow-xl border border-gray-100">
          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
            className="bg-transparent text-gray-700 outline-none text-lg font-medium cursor-pointer w-24"
          >
            <option value="">เพศ</option>
            <option value="ตัวผู้">ตัวผู้</option>
            <option value="ตัวเมีย">ตัวเมีย</option>
          </select>

          <div className="w-px h-8 bg-gray-300"/>

          <select
            value={filterColor}
            onChange={e => setFilterColor(e.target.value)}
            className="bg-transparent text-gray-700 outline-none text-lg font-medium cursor-pointer w-32"
          >
            <option value="">สี</option>
            {colors.map(c => <option key={c.color_id} value={c.color_name}>{c.color_name}</option>)}
          </select>

          <div className="w-px h-8 bg-gray-300"/>

          <select
            value={filterProvince}
            onChange={e => setFilterProvince(e.target.value)}
            className="bg-transparent text-gray-700 outline-none text-lg font-medium cursor-pointer w-36"
          >
            <option value="">จังหวัด</option>
            {provinces.map(p => <option key={p.province_id} value={p.province_name}>{p.province_name}</option>)}
          </select>

          <button
            onClick={handleSearch}
            className="px-10 py-3 bg-[#A07D5A] text-white font-bold rounded-full ml-2 hover:bg-[#8E6B53] transition shadow-md"
          >
            ค้นหาเลย
          </button>
        </div>
      </div>

      {/* แนะนำแมว */}
      <div className="max-w-7xl mx-auto px-10 mt-20">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-3xl font-black text-[#8E6B53]">น้องแมวแนะนำสำหรับคุณ 😻</h3>
          <Link to="/adopt" className="text-[#698474] font-bold hover:underline">ดูน้องแมวทั้งหมด →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            <div className="col-span-4 text-center text-gray-400 py-20 text-xl font-bold">กำลังโหลดข้อมูลน้องแมว... 🐾</div>
          ) : recommendedCats.length > 0 ? (
            recommendedCats.map(cat => (
              <div key={cat.cat_id} className="bg-[#FCF5EB] rounded-[30px] overflow-hidden shadow-sm hover:shadow-md transition duration-300 border border-[#F0E6D8] flex flex-col group">
                <div className="relative h-56 overflow-hidden bg-gray-200 m-3 rounded-[20px]">
                  {cat.image_path ? (
                    <img src={cat.image_path} alt="cat" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">ไม่มีรูปภาพ</div>
                  )}
                </div>
                <div className="p-5 pt-2 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-[#8E6B53] text-2xl mb-2">{cat.cat_name}</h3>
                    <p className="font-bold text-gray-800 mb-1 text-sm">เพศ : <span className="font-normal text-gray-600">{cat.gender || '-'}</span></p>
                    <p className="font-bold text-gray-800 text-sm">จังหวัด : <span className="font-normal text-gray-600">{cat.province_name || '-'}</span></p>
                  </div>
                  <div className="mt-6">
                    <Link to={`/adopt/cats/${cat.cat_id}`}
                      className="block w-full text-center py-3 bg-white text-[#A07D5A] border-2 border-[#A07D5A] font-bold rounded-full hover:bg-[#A07D5A] hover:text-white transition shadow-sm">
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