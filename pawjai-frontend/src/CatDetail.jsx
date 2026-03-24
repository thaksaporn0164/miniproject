import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

export default function CatDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cat, setCat] = useState(null)
  const loggedInUser = JSON.parse(localStorage.getItem('pawjai_user'))
  const token = localStorage.getItem('pawjai_token')

  const [chatMessages, setChatMessages] = useState([])
  const [chatText, setChatText] = useState('')
  const chatBottomRef = useRef(null)
  const pollingRef = useRef(null) // แก้ข้อ 6: เก็บ interval ref

  useEffect(() => {
    fetch('http://localhost:8000/api/cats')
      .then(r => r.json())
      .then(data => {
        const found = data.find(c => c.cat_id === Number(id))
        setCat(found)
        if (found && found.status !== 'หาบ้าน') {
          fetchChatMessages()
          startPolling() // แก้ข้อ 6: เริ่ม polling
        }
      })
      .catch(console.error)

    return () => stopPolling() // cleanup เมื่อ unmount
  }, [id])

  // scroll ลงล่างสุดเมื่อมีข้อความใหม่
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // แก้ข้อ 6: polling ทุก 4 วินาที
  const startPolling = () => {
    stopPolling()
    pollingRef.current = setInterval(fetchChatMessages, 4000)
  }

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const fetchChatMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/cats/${id}/chat`)
      const data = await res.json()
      setChatMessages(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendChat = async () => {
    if (!chatText.trim() || !loggedInUser) return
    try {
      await fetch(`http://localhost:8000/api/cats/${id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: chatText }),
      })
      setChatText('')
      fetchChatMessages()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAdoptClick = async () => {
    if (!loggedInUser) {
      alert('กรุณาเข้าสู่ระบบก่อนขอรับเลี้ยงน้องแมวครับ')
      navigate('/login')
      return
    }
    const confirmed = window.confirm(`💖 ยืนยันการส่งคำขอรับเลี้ยงน้อง "${cat.cat_name}" ใช่หรือไม่?`)
    if (!confirmed) return

    try {
      const response = await fetch('http://localhost:8000/api/adoptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cat_id: cat.cat_id }),
      })
      const data = await response.json()
      if (data.status === 'success') {
        alert(`ส่งคำขอรับเลี้ยงน้อง ${cat.cat_name} สำเร็จ! 🎉`)
        setCat({ ...cat, status: 'กำลังเจรจา' })
        fetchChatMessages()
        startPolling()
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAsAdopted = async () => {
    const confirmed = window.confirm('🎉 ยืนยันว่าน้องแมวได้บ้านแล้วใช่หรือไม่?')
    if (!confirmed) return
    try {
      const response = await fetch(`http://localhost:8000/api/cats/${cat.cat_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'ได้บ้านแล้ว' }),
      })
      const data = await response.json()
      if (data.status === 'success') {
        alert('ยินดีด้วย! อัปเดตสถานะน้องแมวสำเร็จ 🎊')
        setCat({ ...cat, status: 'ได้บ้านแล้ว' })
        stopPolling()
      } else {
        alert(data.detail || data.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePost = async () => {
    const confirmed = window.confirm(`❗ คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์น้อง ${cat.cat_name}?`)
    if (!confirmed) return
    try {
      const response = await fetch(`http://localhost:8000/api/cats/${cat.cat_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const result = await response.json()
      if (result.status === 'success') {
        alert('🗑️ ลบโพสต์สำเร็จแล้ว!')
        navigate('/adopt')
      } else {
        alert(result.detail || result.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!cat) return (
    <div className="min-h-screen flex items-center justify-center text-2xl text-[#8E6B53] font-bold">
      กำลังโหลดข้อมูลน้องแมว... 🐾
    </div>
  )

  const isOwner = loggedInUser && loggedInUser.id === cat.owner_id

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-20 pt-10 px-10">
      <div className="max-w-5xl mx-auto">
        <Link to="/adopt" className="inline-block mb-6 text-[#A07D5A] font-bold hover:underline">
          ← ย้อนกลับไปหน้าหาบ้าน
        </Link>

        {/* ข้อมูลแมว */}
        <div className="bg-[#FCF5EB] rounded-[40px] p-10 shadow-sm border border-[#F0E6D8] flex gap-10">
          <div className="w-1/2 h-[400px] bg-gray-200 rounded-[30px] overflow-hidden shadow-inner border border-gray-100">
            {cat.image_path
              ? <img src={cat.image_path} alt={cat.cat_name} className="w-full h-full object-cover" />
              : <div className="flex items-center justify-center h-full text-gray-400">ไม่มีรูปภาพ</div>
            }
          </div>

          <div className="w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-5xl font-black text-[#8E6B53]">{cat.cat_name}</h1>
                <span className={`px-4 py-1 text-sm font-bold rounded-full ${
                  cat.status === 'หาบ้าน' ? 'bg-green-100 text-green-700' :
                  cat.status === 'กำลังเจรจา' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {cat.status || 'หาบ้าน'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 text-lg text-gray-700 font-medium mb-4">
                <p><strong>เพศ:</strong> {cat.gender || '-'}</p>
                <p><strong>อายุ:</strong> {cat.age_range || '-'}</p>
                <p><strong>สี:</strong> {cat.color_name || '-'}</p>
                <p><strong>จังหวัด:</strong> {cat.province_name || '-'}</p>
                {/* แสดงน้ำหนัก */}
                {cat.weight && <p><strong>น้ำหนัก:</strong> {cat.weight} กก.</p>}
              </div>

              {/* แก้ข้อ 9: badge วัคซีนในหน้า detail */}
              {cat.vaccine_status && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${
                  cat.vaccine_status === 'ฉีดแล้ว'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {cat.vaccine_status === 'ฉีดแล้ว' ? '💉' : '⚠️'} วัคซีน: {cat.vaccine_status}
                </div>
              )}

              {cat.description && (
                <p className="text-gray-600 text-base leading-relaxed bg-white rounded-2xl p-4 border border-gray-100">
                  {cat.description}
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3 items-center flex-wrap">
              {!isOwner && cat.status === 'หาบ้าน' && (
                <button onClick={handleAdoptClick}
                  className="flex-1 py-4 bg-[#698474] text-white text-xl font-bold rounded-full hover:bg-[#526a5b] transition shadow-md">
                  ขอรับเลี้ยงน้องแมว
                </button>
              )}
              {!isOwner && cat.status !== 'หาบ้าน' && (
                <button disabled
                  className="flex-1 py-4 bg-gray-300 text-gray-500 text-xl font-bold rounded-full cursor-not-allowed shadow-inner">
                  {cat.status === 'ได้บ้านแล้ว' ? 'น้องได้บ้านแล้ว 🎉' : 'มีการขอรับเลี้ยงแล้ว'}
                </button>
              )}

              {isOwner && cat.status === 'กำลังเจรจา' && (
                <button onClick={handleMarkAsAdopted}
                  className="flex-1 py-4 bg-[#A07D5A] text-white text-xl font-bold rounded-full hover:bg-[#8E6B53] transition shadow-md">
                  ✅ ยืนยันว่าน้องได้บ้านแล้ว
                </button>
              )}

              {isOwner && (
                <button onClick={handleDeletePost}
                  className="px-6 py-4 bg-[#C87E82] text-white text-lg font-bold rounded-full hover:bg-[#b56e72] transition shadow-md">
                  🗑️ ลบโพสต์
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ส่วนแชท / คอมเมนต์ */}
        {cat.status === 'หาบ้าน' ? (
          <div className="mt-12 bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-[#8E6B53] mb-4 border-b pb-4 border-gray-100">
              คอมเมนต์สอบถามรายละเอียด
            </h2>
            <p className="text-gray-400 text-center py-8">ส่งคำขอรับเลี้ยงก่อน จึงจะสามารถแชทกับเจ้าของได้ครับ 🐾</p>
          </div>
        ) : (
          <div className="mt-12 bg-blue-50/50 rounded-[40px] p-10 shadow-sm border border-blue-100">
            <h2 className="text-2xl font-bold text-[#698474] mb-6 border-b pb-4 border-blue-200">
              💬 ห้องแชทเจรจา
              {/* แก้ข้อ 6: แสดงสถานะ live */}
              <span className="ml-3 text-sm font-normal text-emerald-500 inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse"/>
                Live
              </span>
            </h2>

            {/* พื้นที่แชท */}
            <div className="bg-white h-[300px] rounded-2xl border border-gray-200 p-6 overflow-y-auto mb-6 shadow-inner flex flex-col gap-4">
              {chatMessages.length > 0 ? (
                chatMessages.map(msg => {
                  const isMe = loggedInUser && msg.sender_id === loggedInUser.id
                  return (
                    <div key={msg.message_id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-400 mb-1">{msg.full_name}</span>
                      <div className={`px-5 py-3 rounded-2xl max-w-[70%] ${
                        isMe ? 'bg-[#A07D5A] text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-400 mt-10">ยังไม่มีข้อความแชท ทักทายกันได้เลย! 👋</div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* ช่องพิมพ์ */}
            {loggedInUser ? (
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={chatText}
                  onChange={e => setChatText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  placeholder="พิมพ์ข้อความที่นี่..."
                  className="flex-1 bg-white border border-blue-200 rounded-full px-6 py-4 outline-none focus:border-[#698474] shadow-sm"
                />
                <button onClick={handleSendChat}
                  className="px-10 py-4 bg-[#698474] text-white font-bold rounded-full hover:bg-[#526a5b] transition shadow-md">
                  ส่ง
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Link to="/login" className="text-[#698474] font-bold hover:underline">
                  เข้าสู่ระบบเพื่อร่วมแชท →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}