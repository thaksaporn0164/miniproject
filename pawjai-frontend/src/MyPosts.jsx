import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function MyPosts() {
  const [myCats, setMyCats] = useState([])
  const navigate = useNavigate()
  const loggedInUser = JSON.parse(localStorage.getItem('pawjai_user'))

  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login') // ถ้ายังไม่ล็อกอิน เด้งไปหน้า login
      return
    }

    // ดึงข้อมูลแมวทั้งหมด แล้วกรองเอาเฉพาะของ user คนนี้
    fetch('http://localhost:8000/api/cats')
      .then(res => res.json())
      .then(data => {
        const myOwnCats = data.filter(cat => Number(cat.owner_id) === Number(loggedInUser.id));
        setMyCats(myOwnCats);
      })
      .catch(err => console.error(err));
  }, [loggedInUser, navigate])

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-20 pt-10 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-6">
          <h2 className="text-3xl font-bold text-[#8E6B53]">จัดการโพสต์หาบ้านของฉัน</h2>
          <Link to="/create-post" className="px-6 py-3 bg-[#A07D5A] text-white font-bold rounded-full hover:bg-[#8E6B53] shadow-md transition">
            + สร้างโพสต์หาบ้านใหม่
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {myCats.length > 0 ? (
            myCats.map(cat => (
              <div key={cat.cat_id} className="bg-[#FCF5EB] rounded-[30px] p-4 shadow-sm border border-[#F0E6D8] flex flex-col hover:shadow-md transition">
                <div className="h-48 bg-gray-200 rounded-[20px] overflow-hidden mb-4 border border-gray-100">
                  {cat.image_path ? (
                    <img src={cat.image_path} alt="cat" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">ไม่มีรูป</div>
                  )}
                </div>
                <h3 className="font-bold text-xl text-[#8E6B53] mb-2 px-2">{cat.cat_name}</h3>
                <p className="text-gray-600 mb-4 px-2 flex-grow">สถานะ: <span className="font-bold">{cat.status || 'หาบ้าน'}</span></p>
                <Link to={`/adopt/cats/${cat.cat_id}`} className="block text-center w-full py-3 bg-[#D1B894] text-white font-bold rounded-full hover:bg-[#A07D5A] transition shadow-sm">
                  ดูโพสต์ / ตอบแชท
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center text-gray-400 py-20 text-xl font-bold bg-white rounded-[30px] border border-gray-100 shadow-sm">
              คุณยังไม่ได้ลงประกาศหาบ้านให้น้องแมวครับ 😿
            </div>
          )}
        </div>
      </div>
    </div>
  )
}