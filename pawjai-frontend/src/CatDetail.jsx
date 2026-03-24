import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

export default function CatDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cat, setCat] = useState(null)
  
  const loggedInUser = JSON.parse(localStorage.getItem('pawjai_user'))
  
  // State สำหรับคอมเมนต์
  const [comments, setComments] = useState([]) 
  const [commentText, setCommentText] = useState('') 

  // 📌 State สำหรับแชทส่วนตัว
  const [chatMessages, setChatMessages] = useState([])
  const [chatText, setChatText] = useState('')

  useEffect(() => {
    // 1. ดึงข้อมูลแมว
    fetch('http://localhost:8000/api/cats')
      .then(res => res.json())
      .then(data => {
        const foundCat = data.find(c => c.cat_id === Number(id));
        setCat(foundCat);
        
        // 2. ถ้าสถานะไม่ใช่ "หาบ้าน" ให้ดึงข้อมูลแชทมาแสดงด้วย
        if (foundCat && foundCat.status !== 'หาบ้าน') {
          fetchChatMessages();
        }
      })
      .catch(err => console.error(err));
  }, [id])

  // ================= 📌 ฟังก์ชันจัดการแชท =================
  const fetchChatMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/cats/${id}/chat`);
      const data = await res.json();
      setChatMessages(data);
    } catch (error) {
      console.error(error);
    }
  }

  const handleSendChat = async () => {
    if (!chatText.trim() || !loggedInUser) return;
    try {
      await fetch(`http://localhost:8000/api/cats/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: loggedInUser.id, message: chatText })
      });
      setChatText('');
      fetchChatMessages(); // โหลดแชทใหม่หลังส่งข้อความเสร็จ
    } catch (error) {
      console.error(error);
    }
  }

  // ================= ปุ่มต่างๆ =================
  const handleAdoptClick = async () => {
    if (!loggedInUser) {
      alert("กรุณาเข้าสู่ระบบก่อนขอรับเลี้ยงน้องแมวครับ");
      navigate('/login');
      return;
    }
    if (loggedInUser.id === cat.owner_id) {
      alert(`คุณ ${loggedInUser.name} เป็นเจ้าของโพสต์น้องแมวตัวนี้นะครับ ไม่สามารถรับเลี้ยงแมวตัวเองได้! 😅`);
      return;
    }

    const isConfirmed = window.confirm(`💖 ยืนยันการส่งคำขอรับเลี้ยงน้อง "${cat.cat_name}" ใช่หรือไม่? \n(สถานะน้องจะเปลี่ยนเป็น "กำลังเจรจา")`);
    if (!isConfirmed) return;

    try {
      const response = await fetch('http://localhost:8000/api/adoptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cat_id: cat.cat_id, adopter_id: loggedInUser.id })
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert(`ส่งคำขอรับเลี้ยงน้อง ${cat.cat_name} สำเร็จ! 🎉`);
        setCat({ ...cat, status: 'กำลังเจรจา' }); 
        fetchChatMessages(); // เริ่มเปิดช่องแชท
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message);
      }
    } catch (error) {
      console.error('Adoption error:', error);
    }
  }

  const handleMarkAsAdopted = async () => {
    const isConfirmed = window.confirm('🎉 ยืนยันว่าน้องแมวได้บ้านแล้วใช่หรือไม่? (การ์ดจะยังอยู่แต่แสดงสถานะว่าได้บ้านแล้ว)');
    if (!isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:8000/api/cats/${cat.cat_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ได้บ้านแล้ว' })
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('ยินดีด้วย! อัปเดตสถานะน้องแมวสำเร็จ 🎊');
        setCat({ ...cat, status: 'ได้บ้านแล้ว' }); 
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleDeletePost = async () => {
    const canDelete = loggedInUser && (loggedInUser.id === cat.owner_id || loggedInUser.id === 1);
    if (!canDelete) return;

    const isConfirmed = window.confirm(`❗ คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์น้อง ${cat.cat_name} ทิ้ง?`);
    if (!isConfirmed) return; 

    try {
      const response = await fetch(`http://localhost:8000/api/cats/${cat.cat_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert(`🗑️ ลบโพสต์สำเร็จแล้ว!`);
        navigate('/adopt'); 
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!cat) return <div className="min-h-screen flex items-center justify-center text-2xl text-[#8E6B53] font-bold">กำลังโหลดข้อมูลน้องแมว... 🐾</div>

  const isOwner = loggedInUser && loggedInUser.id === cat.owner_id;
  const showDeleteButton = loggedInUser && (isOwner || loggedInUser.id === 1);

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-20 pt-10 px-10">
      <div className="max-w-5xl mx-auto">
        <Link to="/adopt" className="inline-block mb-6 text-[#A07D5A] font-bold hover:underline">
          &larr; ย้อนกลับไปหน้าหาบ้าน
        </Link>

        {/* ================= กล่องข้อมูลแมว ================= */}
        <div className="bg-[#FCF5EB] rounded-[40px] p-10 shadow-sm border border-[#F0E6D8] flex gap-10">
          <div className="w-1/2 h-[400px] bg-gray-200 rounded-[30px] overflow-hidden shadow-inner border border-gray-100">
            {cat.image_path ? <img src={cat.image_path} alt={cat.cat_name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400">ไม่มีรูปภาพ</div>}
          </div>

          <div className="w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                 <h1 className="text-5xl font-black text-[#8E6B53]">{cat.cat_name}</h1>
                 <span className={`px-4 py-1 text-sm font-bold rounded-full ${
                    cat.status === 'หาบ้าน' ? 'bg-green-100 text-green-700' : 
                    cat.status === 'กำลังเจรจา' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-blue-100 text-blue-700'
                 }`}>
                    {cat.status || 'หาบ้าน'}
                 </span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 text-lg text-gray-700 font-medium">
                <p><strong>เพศ:</strong> {cat.gender || '-'}</p>
                <p><strong>อายุ:</strong> {cat.age_range || '-'}</p>
                <p><strong>สี:</strong> {cat.color_name || '-'}</p>
                <p><strong>จังหวัด:</strong> {cat.province_name || '-'}</p>
              </div>
            </div>

            <div className="mt-8 flex gap-4 items-center">
              {!isOwner && cat.status === 'หาบ้าน' && (
                <button onClick={handleAdoptClick} className="flex-1 py-4 bg-[#698474] text-white text-xl font-bold rounded-full hover:bg-[#526a5b] transition shadow-md">
                  ขอรับเลี้ยงน้องแมว
                </button>
              )}
              {!isOwner && cat.status !== 'หาบ้าน' && (
                <button disabled className="flex-1 py-4 bg-gray-300 text-gray-500 text-xl font-bold rounded-full cursor-not-allowed shadow-inner">
                  {cat.status === 'ได้บ้านแล้ว' ? 'น้องได้บ้านแล้ว 🎉' : 'มีการขอรับเลี้ยงแล้ว'}
                </button>
              )}

              {/* 📌 เจ้าของแมว กดยืนยันว่าได้บ้านแล้ว */}
              {isOwner && cat.status === 'กำลังเจรจา' && (
                <button onClick={handleMarkAsAdopted} className="flex-1 py-4 bg-[#A07D5A] text-white text-xl font-bold rounded-full hover:bg-[#8E6B53] transition shadow-md">
                  ✅ ยืนยันว่าน้องได้บ้านแล้ว
                </button>
              )}

              {showDeleteButton && (
                <button onClick={handleDeletePost} className="px-6 py-4 bg-[#C87E82] text-white text-lg font-bold rounded-full hover:bg-[#b56e72] transition shadow-md flex items-center gap-2">
                  🗑️ ลบโพสต์
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= กล่องแสดง แชท/คอมเมนต์ ตามสถานะ ================= */}
        {cat.status === 'หาบ้าน' ? (
          // 🛑 1. แมวยังว่าง -> แสดงคอมเมนต์ปกติ (แบบยังไม่เปิดให้ใช้เต็มรูปแบบ)
          <div className="mt-12 bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-[#8E6B53] mb-6 border-b pb-4 border-gray-100">คอมเมนต์สอบถามรายละเอียด</h2>
            <div className="flex gap-4 mb-8 items-center">
              <input 
                type="text" 
                placeholder={loggedInUser ? "คอมเมนต์ยังอยู่ระหว่างพัฒนา..." : "กรุณาเข้าสู่ระบบก่อนคอมเมนต์"}
                disabled
                className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-6 py-3 outline-none shadow-inner disabled:opacity-50"
              />
              <button disabled className="px-8 py-3 bg-gray-400 text-white font-bold rounded-full">ส่ง</button>
            </div>
          </div>
        ) : (
          // 💬 2. มีคนขอรับเลี้ยงแล้ว -> แสดงห้องแชท
          <div className="mt-12 bg-blue-50/50 rounded-[40px] p-10 shadow-sm border border-blue-100">
            <h2 className="text-2xl font-bold text-[#698474] mb-6 border-b pb-4 border-blue-200">
              💬 ห้องแชทเจรจา / อัปเดตอาการน้องแมว
            </h2>
            
            {/* พื้นที่แสดงข้อความแชท */}
            <div className="bg-white h-[300px] rounded-2xl border border-gray-200 p-6 overflow-y-auto mb-6 shadow-inner flex flex-col gap-4">
              {chatMessages.length > 0 ? (
                chatMessages.map(msg => {
                  const isMe = loggedInUser && msg.sender_id === loggedInUser.id;
                  return (
                    <div key={msg.message_id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-400 mb-1">{msg.full_name}</span>
                      <div className={`px-5 py-3 rounded-2xl max-w-[70%] ${isMe ? 'bg-[#A07D5A] text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                        {msg.message}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-400 mt-10">ยังไม่มีข้อความแชท ทักทายกันได้เลย! 👋</div>
              )}
            </div>

            {/* ช่องพิมพ์ข้อความ */}
            <div className="flex gap-4 items-center">
              <input 
                type="text" 
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="พิมพ์ข้อความที่นี่..."
                disabled={!loggedInUser} 
                className="flex-1 bg-white border border-blue-200 rounded-full px-6 py-4 outline-none focus:border-[#698474] shadow-sm"
              />
              <button onClick={handleSendChat} className="px-10 py-4 bg-[#698474] text-white font-bold rounded-full hover:bg-[#526a5b] transition shadow-md">
                ส่งข้อความ
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}