import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function AdoptFeed() {
  const [cats, setCats] = useState([])
  const [provinces, setProvinces] = useState([])
  const [colors, setColors] = useState([])

  // แก้ข้อ 5: อ่านค่า filter จาก URL query params
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterGender, setFilterGender] = useState(searchParams.get('gender') || '')
  const [filterColor, setFilterColor] = useState(searchParams.get('color') || '')
  const [filterProvince, setFilterProvince] = useState(searchParams.get('province') || '')

  useEffect(() => {
    fetch('http://localhost:8000/api/cats').then(r => r.json()).then(setCats).catch(console.error)
    fetch('http://localhost:8000/api/provinces').then(r => r.json()).then(setProvinces).catch(console.error)
    fetch('http://localhost:8000/api/colors').then(r => r.json()).then(setColors).catch(console.error)
  }, [])

  // sync state ถ้า URL เปลี่ยน (เช่นกดปุ่มค้นหาจากหน้า Home)
  useEffect(() => {
    setFilterGender(searchParams.get('gender') || '')
    setFilterColor(searchParams.get('color') || '')
    setFilterProvince(searchParams.get('province') || '')
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (filterGender) params.set('gender', filterGender)
    if (filterColor) params.set('color', filterColor)
    if (filterProvince) params.set('province', filterProvince)
    setSearchParams(params)
  }

  const handleReset = () => {
    setFilterGender(''); setFilterColor(''); setFilterProvince('')
    setSearchParams({})
  }

  const filteredCats = cats.filter(cat => {
    const matchGender = filterGender ? cat.gender === filterGender : true
    const matchColor = filterColor ? cat.color_name === filterColor : true
    const matchProvince = filterProvince ? cat.province_name === filterProvince : true
    return matchGender && matchColor && matchProvince
  })

  const hasFilter = filterGender || filterColor || filterProvince

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-20 pt-10">
      {/* แถบ filter */}
      <div className="flex justify-center mb-12">
        <div className="flex bg-white shadow-md rounded-full px-8 py-3 gap-6 items-center border border-gray-100">
          <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
            className="bg-transparent text-gray-700 outline-none cursor-pointer text-lg font-medium w-24">
            <option value="">เพศ</option>
            <option value="ตัวผู้">ตัวผู้</option>
            <option value="ตัวเมีย">ตัวเมีย</option>
          </select>

          <div className="w-px h-6 bg-gray-300"/>

          <select value={filterColor} onChange={e => setFilterColor(e.target.value)}
            className="bg-transparent text-gray-700 outline-none cursor-pointer text-lg font-medium w-32">
            <option value="">สี</option>
            {colors.map(c => <option key={c.color_id} value={c.color_name}>{c.color_name}</option>)}
          </select>

          <div className="w-px h-6 bg-gray-300"/>

          <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)}
            className="bg-transparent text-gray-700 outline-none cursor-pointer text-lg font-medium w-36">
            <option value="">จังหวัด</option>
            {provinces.map(p => <option key={p.province_id} value={p.province_name}>{p.province_name}</option>)}
          </select>

          <button onClick={handleSearch}
            className="px-10 py-2 bg-[#A07D5A] text-white font-bold rounded-full ml-2 hover:bg-[#8E6B53] transition shadow-md">
            ค้นหา
          </button>

          {/* ปุ่ม reset filter */}
          {hasFilter && (
            <button onClick={handleReset}
              className="px-4 py-2 text-gray-500 font-medium rounded-full hover:bg-gray-100 transition text-sm">
              ล้าง ✕
            </button>
          )}
        </div>
      </div>

      {/* แสดงว่ากำลัง filter อะไรอยู่ */}
      {hasFilter && (
        <div className="flex justify-center mb-6 gap-2 flex-wrap">
          {filterGender && (
            <span className="px-4 py-1 bg-[#D1B894] text-white text-sm font-bold rounded-full">
              เพศ: {filterGender}
            </span>
          )}
          {filterColor && (
            <span className="px-4 py-1 bg-[#D1B894] text-white text-sm font-bold rounded-full">
              สี: {filterColor}
            </span>
          )}
          {filterProvince && (
            <span className="px-4 py-1 bg-[#D1B894] text-white text-sm font-bold rounded-full">
              จังหวัด: {filterProvince}
            </span>
          )}
        </div>
      )}

      {/* การ์ดแมว */}
      <div className="max-w-7xl mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredCats.length > 0 ? (
            filteredCats.map(cat => (
              <div key={cat.cat_id}
                className="bg-[#FCF5EB] rounded-[30px] overflow-hidden shadow-sm hover:shadow-md transition duration-300 border border-[#F0E6D8] flex flex-col">

                <div className="relative h-48 overflow-hidden bg-gray-200 m-3 rounded-[20px]">
                  {/* badge สถานะ */}
                  <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full shadow-sm z-10 ${
                    cat.status === 'หาบ้าน' ? 'bg-green-100 text-green-700' :
                    cat.status === 'กำลังเจรจา' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {cat.status || 'หาบ้าน'}
                  </div>

                  {/* แก้ข้อ 9: badge วัคซีนมุมซ้ายบน */}
                  {cat.vaccine_status && (
                    <div className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded-full shadow-sm z-10 ${
                      cat.vaccine_status === 'ฉีดแล้ว' ? 'bg-emerald-500 text-white' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {cat.vaccine_status === 'ฉีดแล้ว' ? '💉 ฉีดแล้ว' : '⚠️ ยังไม่ฉีด'}
                    </div>
                  )}

                  {cat.image_path ? (
                    <img src={cat.image_path} alt="cat" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">ไม่มีรูปภาพ</div>
                  )}
                </div>

                <div className="p-5 pt-2 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-[#8E6B53] text-xl mb-2">{cat.cat_name}</h3>
                    <p className="font-bold text-gray-800 mb-1 text-sm">เพศ : <span className="font-normal text-gray-600">{cat.gender || '-'}</span></p>
                    <p className="font-bold text-gray-800 mb-1 text-sm">สี : <span className="font-normal text-gray-600">{cat.color_name || '-'}</span></p>
                    {/* แก้ข้อ 9: แสดงน้ำหนัก */}
                    {cat.weight && (
                      <p className="font-bold text-gray-800 mb-1 text-sm">น้ำหนัก : <span className="font-normal text-gray-600">{cat.weight} กก.</span></p>
                    )}
                    <p className="font-bold text-gray-800 text-sm">จังหวัด : <span className="font-normal text-gray-600">{cat.province_name || '-'}</span></p>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Link to={`/adopt/cats/${cat.cat_id}`}
                      className="px-6 py-2 bg-[#D1B894] text-white font-bold rounded-full hover:bg-[#A07D5A] transition shadow-sm text-sm">
                      ดูโปรไฟล์
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center text-gray-400 py-20 text-xl font-bold">
              {hasFilter ? 'ไม่พบน้องแมวที่ตรงกับเงื่อนไขการค้นหาครับ 😿' : 'ยังไม่มีน้องแมวในระบบครับ 😿'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}