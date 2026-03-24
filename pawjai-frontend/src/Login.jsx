import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (isRegister) {
      if (!fullName.trim()) e.fullName = 'กรุณากรอกชื่อ-นามสกุล'
      if (!phone.trim()) e.phone = 'กรุณากรอกเบอร์โทรศัพท์'
    }
    if (!email.trim()) e.email = 'กรุณากรอกอีเมล'
    if (!password.trim()) e.password = 'กรุณากรอกรหัสผ่าน'
    else if (isRegister && password.length < 6) e.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    if (isRegister) {
      try {
        const response = await fetch('http://localhost:8000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: fullName, email, password, phone }),
        })
        const data = await response.json()
        if (data.status === 'success') {
          // เก็บทั้ง user info และ JWT token
          localStorage.setItem('pawjai_user', JSON.stringify(data.user))
          localStorage.setItem('pawjai_token', data.token)
          alert('ลงทะเบียนสำเร็จ! เข้าสู่ระบบอัตโนมัติ 🎉')
          window.location.href = '/'
        } else {
          alert('เกิดข้อผิดพลาด: ' + data.message)
        }
      } catch {
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
      }
    } else {
      try {
        const response = await fetch('http://localhost:8000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await response.json()
        if (data.status === 'success') {
          localStorage.setItem('pawjai_user', JSON.stringify(data.user))
          localStorage.setItem('pawjai_token', data.token)
          alert(`ยินดีต้อนรับคุณ ${data.user.name} 🐾`)
          window.location.href = '/'
        } else {
          alert('เกิดข้อผิดพลาด: ' + data.message)
        }
      } catch {
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
      }
    }
  }

  const inputCls = (field) =>
    `w-full border rounded-full px-6 py-3 bg-white outline-none shadow-inner transition ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-[#A07D5A]'
    }`

  const switchMode = () => {
    setIsRegister(!isRegister)
    setErrors({})
    setEmail(''); setPassword(''); setFullName(''); setPhone('')
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
          {isRegister && (
            <>
              <div>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="ชื่อ-นามสกุล" className={inputCls('fullName')} />
                {errors.fullName && <p className="text-red-500 text-sm mt-1 pl-4">{errors.fullName}</p>}
              </div>
              <div>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="เบอร์โทรศัพท์" className={inputCls('phone')} />
                {errors.phone && <p className="text-red-500 text-sm mt-1 pl-4">{errors.phone}</p>}
              </div>
            </>
          )}

          <div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="อีเมล" className={inputCls('email')} />
            {errors.email && <p className="text-red-500 text-sm mt-1 pl-4">{errors.email}</p>}
          </div>
          <div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={isRegister ? 'รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)' : 'รหัสผ่าน'}
              className={inputCls('password')} />
            {errors.password && <p className="text-red-500 text-sm mt-1 pl-4">{errors.password}</p>}
          </div>

          <button type="submit"
            className="w-full py-4 mt-2 bg-[#A07D5A] text-white text-xl font-bold rounded-full hover:bg-[#8E6B53] transition shadow-md">
            {isRegister ? 'ลงทะเบียนเลย' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-500 font-medium">
            {isRegister ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}
            <button type="button" onClick={switchMode} className="ml-2 text-[#C87E82] font-bold hover:underline">
              {isRegister ? 'เข้าสู่ระบบที่นี่' : 'ลงทะเบียนที่นี่'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}