import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false) // State สำหรับสลับหน้า Login/Register
  
  // State สำหรับเก็บข้อมูลฟอร์ม
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  
  const navigate = useNavigate()

  // ฟังก์ชันจัดการเมื่อกดปุ่ม Submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isRegister) {
      // ==========================================
      // 🚀 โหมดลงทะเบียน (Register)
      // ==========================================
      if (!email || !password || !fullName || !phone) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วนครับ')
        return
      }

      try {
        const response = await fetch('http://localhost:8000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            full_name: fullName, 
            email: email, 
            password: password, 
            phone: phone 
          })
        })
        const data = await response.json()

        if (data.status === 'success') {
          alert('ลงทะเบียนสำเร็จ! เข้าสู่ระบบอัตโนมัติ 🎉')
          localStorage.setItem('pawjai_user', JSON.stringify(data.user)) // บันทึก Session ลงเครื่อง
          window.location.href = '/' // กลับไปหน้าโฮม
        } else {
          alert('เกิดข้อผิดพลาด: ' + data.message)
        }
      } catch (error) {
        console.error('Register error:', error)
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
      }

    } else {
      // ==========================================
      // 🚀 โหมดเข้าสู่ระบบ (Login)
      // ==========================================
      if (!email || !password) {
        alert('กรุณากรอกอีเมลและรหัสผ่านครับ')
        return
      }

      try {
        const response = await fetch('http://localhost:8000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email, 
            password: password 
          })
        })
        const data = await response.json()

        if (data.status === 'success') {
          alert(`ยินดีต้อนรับคุณ ${data.user.name} 🐾`)
          localStorage.setItem('pawjai_user', JSON.stringify(data.user)) // บันทึก Session ลงเครื่อง
          window.location.href = '/' // กลับไปหน้าโฮม
        } else {
          alert('เกิดข้อผิดพลาด: ' + data.message) // เช่น รหัสผ่านผิด
        }
      } catch (error) {
        console.error('Login error:', error)
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans flex items-center justify-center pb-20 pt-10">
      <div className="bg-[#FCF5EB] p-10 rounded-[40px] shadow-sm w-[500px] border border-[#F0E6D8]">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-[#8E6B53] mb-2 tracking-widest">PAWJAI</h2>
          <p className="text-gray-500 font-medium">
            {isRegister ? 'สร้างบัญชีเพื่อหาบ้านให้แมวและรับเลี้ยง' : 'เข้าสู่ระบบเพื่อเชื่อมสายใยรัก'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* 📌 ช่องที่แสดงเฉพาะตอน "ลงทะเบียน" */}
          {isRegister && (
            <>
              <div>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="ชื่อ-นามสกุล" 
                  className="w-full border border-gray-300 rounded-full px-6 py-3 bg-white outline-none focus:border-[#A07D5A] shadow-inner" 
                />
              </div>
              <div>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="เบอร์โทรศัพท์ (สำหรับยืนยันรับเลี้ยง)" 
                  className="w-full border border-gray-300 rounded-full px-6 py-3 bg-white outline-none focus:border-[#A07D5A] shadow-inner" 
                />
              </div>
            </>
          )}

          {/* 📌 ช่องอีเมลและรหัสผ่าน (แสดงทั้ง Login และ Register) */}
          <div>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="อีเมล" 
              className="w-full border border-gray-300 rounded-full px-6 py-3 bg-white outline-none focus:border-[#A07D5A] shadow-inner" 
            />
          </div>
          <div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="รหัสผ่าน" 
              className="w-full border border-gray-300 rounded-full px-6 py-3 bg-white outline-none focus:border-[#A07D5A] shadow-inner" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 mt-2 bg-[#A07D5A] text-white text-xl font-bold rounded-full hover:bg-[#8E6B53] transition shadow-md"
          >
            {isRegister ? 'ลงทะเบียนเลย' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* 📌 ส่วนสลับหน้า (สลับโหมด Login <-> Register) */}
        <div className="text-center mt-6">
          <p className="text-gray-500 font-medium">
            {isRegister ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}
            <button 
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                // เคลียร์ค่าในช่องเมื่อสลับโหมด
                setEmail('')
                setPassword('')
                setFullName('')
                setPhone('')
              }} 
              className="ml-2 text-[#C87E82] font-bold hover:underline"
            >
              {isRegister ? 'เข้าสู่ระบบที่นี่' : 'ลงทะเบียนที่นี่'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}