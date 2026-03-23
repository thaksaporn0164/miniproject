import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) {
      alert('กรุณากรอกข้อมูลให้ครบครับ')
      return
    }
    // ถ้าพิมพ์เข้ามาเอง จำลองเป็น ID 3
    loginAs({ id: 3, email: email, name: email.split('@')[0] }) 
  }

  // 📌 ฟังก์ชันล็อกอินด่วน (เทสต์ระบบ)
  const loginAs = (userObj) => {
    localStorage.setItem('pawjai_user', JSON.stringify(userObj))
    alert(`เข้าสู่ระบบในชื่อ: คุณ ${userObj.name} สำเร็จ! 🎉`)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans flex items-center justify-center pb-20">
      <div className="bg-[#FCF5EB] p-10 rounded-[40px] shadow-sm w-[500px] border border-[#F0E6D8]">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-[#8E6B53] mb-2 tracking-widest">PAWJAI</h2>
          <p className="text-gray-500 font-medium">เข้าสู่ระบบเพื่อเชื่อมสายใยรัก</p>
        </div>

        {/* 📌 เปลี่ยนปุ่มเทสต์เป็น ผู้ใช้ที่ 1 และ 2 แทน (ทั้งคู่มีสิทธิ์เท่ากัน) */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => loginAs({ id: 1, email: "somchai@email.com", name: "สมชาย" })}
            className="flex-1 py-3 bg-[#698474] text-white text-sm font-bold rounded-full hover:opacity-90 transition shadow-sm"
          >
            👤 ล็อกอินเป็น: คุณสมชาย (ID: 1)
          </button>
          <button 
            onClick={() => loginAs({ id: 2, email: "somying@email.com", name: "สมหญิง" })}
            className="flex-1 py-3 bg-[#C87E82] text-white text-sm font-bold rounded-full hover:opacity-90 transition shadow-sm"
          >
            👤 ล็อกอินเป็น: คุณสมหญิง (ID: 2)
          </button>
        </div>

        <div className="text-center text-gray-400 text-sm mb-6 border-b border-gray-300 pb-4">
          หรือเข้าสู่ระบบด้วยอีเมล
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" className="w-full border border-gray-300 rounded-full px-6 py-3 bg-white outline-none focus:border-[#A07D5A] shadow-inner" />
          </div>
          <div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" className="w-full border border-gray-300 rounded-full px-6 py-3 bg-white outline-none focus:border-[#A07D5A] shadow-inner" />
          </div>
          <button type="submit" className="w-full py-4 bg-[#A07D5A] text-white text-xl font-bold rounded-full hover:bg-[#8E6B53] transition shadow-md">
            เข้าสู่ระบบ
          </button>
        </form>

      </div>
    </div>
  )
}