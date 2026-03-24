import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './Home'
import CreatePost from './CreatePost'
import AdoptFeed from './AdoptFeed'
import CatDetail from './CatDetail'
import Login from './Login'
import MyPosts from './MyPosts'

function NavBar() {
  const loggedInUser = JSON.parse(localStorage.getItem('pawjai_user'))

  const handleLogout = () => {
    localStorage.removeItem('pawjai_user')
    localStorage.removeItem('pawjai_token') // แก้: ล้าง token ด้วย
    window.location.href = '/'
  }

  // แก้ข้อ 4: ถ้ายังไม่ login ปุ่ม "หาบ้าน" ไปหน้า login พร้อม message ชัดเจน
  const handlePostClick = (e) => {
    if (!loggedInUser) {
      e.preventDefault()
      alert('กรุณาเข้าสู่ระบบก่อนเพื่อโพสต์หาบ้านให้น้องแมวครับ 🐾')
      window.location.href = '/login'
    }
  }

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-[#FCF5EB] shadow-sm sticky top-0 z-50">
      <Link to="/" className="text-3xl font-black text-[#8E6B53] tracking-widest hover:opacity-80 transition">
        PAWJAI
      </Link>
      <div className="flex gap-4 font-medium items-center">
        <Link to="/adopt"
          className="px-6 py-2 bg-[#C87E82] text-white rounded-full hover:opacity-90 transition shadow-sm">
          รับเลี้ยง
        </Link>

        {/* แก้ข้อ 4: แยกปุ่มตาม login state */}
        {loggedInUser ? (
          <Link to="/my-posts"
            className="px-6 py-2 bg-[#698474] text-white rounded-full hover:opacity-90 transition shadow-sm">
            โพสต์ของฉัน (หาบ้าน)
          </Link>
        ) : (
          <Link to="/login" onClick={handlePostClick}
            className="px-6 py-2 bg-[#698474] text-white rounded-full hover:opacity-90 transition shadow-sm"
            title="ต้องเข้าสู่ระบบก่อนเพื่อโพสต์หาบ้าน">
            หาบ้าน
          </Link>
        )}

        <button className="px-6 py-2 bg-[#B89B62] text-white rounded-full hover:opacity-90 transition shadow-sm">
          บริจาค
        </button>

        {loggedInUser ? (
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
            <span className="text-[#8E6B53] font-bold">คุณ {loggedInUser.name}</span>
            <button onClick={handleLogout}
              className="px-6 py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition shadow-md text-sm">
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <Link to="/login"
            className="px-8 py-2 bg-[#A07D5A] text-white rounded-full hover:bg-[#8E6B53] transition shadow-md ml-4">
            sign in
          </Link>
        )}
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#FFFDF9] font-sans">
        <NavBar />
        <div className="pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/adopt" element={<AdoptFeed />} />
            <Route path="/adopt/cats/:id" element={<CatDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-posts" element={<MyPosts />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App