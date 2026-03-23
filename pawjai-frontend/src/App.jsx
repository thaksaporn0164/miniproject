import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import CreatePost from './CreatePost'
import AdoptFeed from './AdoptFeed'
import CatDetail from './CatDetail'
import Login from './Login' // 📌 1. นำเข้าหน้า Login

function App() {
  
  // 📌 2. เช็คว่ามีข้อมูล User อยู่ในเครื่องไหม (แปลว่าล็อกอินอยู่)
  const loggedInUser = JSON.parse(localStorage.getItem('pawjai_user'))

  // ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    localStorage.removeItem('pawjai_user') // ลบความจำทิ้ง
    window.location.href = '/' // รีเฟรชหน้าเว็บ 1 รอบ
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#FFFDF9] font-sans">
        
        {/* ================= แถบเมนู Navbar ================= */}
        <nav className="flex justify-between items-center px-10 py-4 bg-[#FCF5EB] shadow-sm sticky top-0 z-50">
          <Link to="/" className="text-3xl font-black text-[#8E6B53] tracking-widest hover:opacity-80 transition">
            PAWJAI
          </Link>
          <div className="flex gap-4 font-medium items-center">
            <Link to="/adopt" className="px-6 py-2 bg-[#C87E82] text-white rounded-full hover:opacity-90 transition shadow-sm">รับเลี้ยง</Link>
            <Link to="/create-post" className="px-6 py-2 bg-[#698474] text-white rounded-full hover:opacity-90 transition shadow-sm">หาบ้าน</Link>
            <button className="px-6 py-2 bg-[#B89B62] text-white rounded-full hover:opacity-90 transition shadow-sm">บริจาค</button>
            
            {/* 📌 3. เช็คสถานะ: ถ้าล็อกอินแล้ว โชว์ปุ่มออกจากระบบ / ถ้ายกเลิก โชว์ sign in */}
            {loggedInUser ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
                <span className="text-[#8E6B53] font-bold">คุณ {loggedInUser.name}</span>
                <button 
                  onClick={handleLogout} 
                  className="px-6 py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition shadow-md text-sm"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-8 py-2 bg-[#A07D5A] text-white rounded-full hover:bg-[#8E6B53] transition shadow-md ml-4">
                sign in
              </Link>
            )}

          </div>
        </nav>

        {/* ================= พื้นที่สลับหน้าเว็บ ================= */}
        <div className="pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/adopt" element={<AdoptFeed />} />
            <Route path="/adopt/cats/:id" element={<CatDetail />} />
            {/* 📌 4. เพิ่ม Route สำหรับหน้า Login */}
            <Route path="/login" element={<Login />} /> 
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  )
}

export default App