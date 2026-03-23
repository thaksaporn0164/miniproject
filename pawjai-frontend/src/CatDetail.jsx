import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

export default function CatDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cat, setCat] = useState(null)
  
  // ดึงข้อมูลคนล็อกอิน
  const loggedInUser = JSON.parse(localStorage.getItem('pawjai_user'))

  const [comments, setComments] = useState([]) 
  const [commentText, setCommentText] = useState('') 

  useEffect(() => {
    fetch('http://localhost:8000/api/cats')
      .then(res => res.json())
      .then(data => {
        const foundCat = data.find(c => c.cat_id === Number(id));
        setCat(foundCat);
      })
      .catch(err => console.error(err));
  }, [id])

  const handleSendComment = () => {
    if (!loggedInUser) {
      alert("กรุณาเข้าสู่ระบบก่อนพิมพ์คอมเมนต์ครับ");
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return; 

    const newComment = {
      id: Date.now(),
      user: loggedInUser.name,
      message: commentText,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };
    setComments([...comments, newComment]);
    setCommentText('');
  }

  const handleAdoptClick = () => {
    if (!loggedInUser) {
      alert("กรุณาเข้าสู่ระบบก่อนขอรับเลี้ยงน้องแมวครับ");
      navigate('/login');
      return;
    }
    if (loggedInUser.id === cat.owner_id) {
      alert(`คุณ ${loggedInUser.name} เป็นเจ้าของโพสต์น้องแมวตัวนี้นะครับ ไม่สามารถรับเลี้ยงแมวตัวเองได้! 😅`);
      return;
    }
    alert(`ส่งคำขอรับเลี้ยงน้อง ${cat.cat_name} ในชื่อคุณ ${loggedInUser.name} เรียบร้อยแล้ว! 💖 ระบบจะส่งข้อความไปหาเจ้าของแมวให้ครับ`);
  }

  // ================= 📌 ฟังก์ชันลบโพสต์ =================
  const handleDeletePost = async () => {
    // 🔥 เช็คสิทธิ์: เป็นเจ้าของโพสต์ หรือ เป็นคุณสมชาย (ID: 1 ให้สิทธิ์แอดมินไปเลยเพื่อลบขยะ)
    const canDelete = loggedInUser && (loggedInUser.id === cat.owner_id || loggedInUser.id === 1);
    
    if (!canDelete) {
      alert("คุณไม่มีสิทธิ์ลบโพสต์นี้ครับ!");
      return;
    }

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
      } else {
        alert('เกิดข้อผิดพลาดในการลบโพสต์: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  }

  if (!cat) return <div className="min-h-screen flex items-center justify-center text-2xl text-[#8E6B53] font-bold">กำลังโหลดข้อมูลน้องแมว... 🐾</div>

  // 📌 ตัวแปรเช็คสิทธิ์สำหรับโชว์ปุ่มลบ
  const showDeleteButton = loggedInUser && (loggedInUser.id === cat.owner_id || loggedInUser.id === 1 || !cat.owner_id);

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans pb-20 pt-10 px-10">
      <div className="max-w-5xl mx-auto">
        <Link to="/adopt" className="inline-block mb-6 text-[#A07D5A] font-bold hover:underline">
          &larr; ย้อนกลับไปหน้าหาบ้าน
        </Link>

        <div className="bg-[#FCF5EB] rounded-[40px] p-10 shadow-sm border border-[#F0E6D8] flex gap-10">
          <div className="w-1/2 h-[400px] bg-gray-200 rounded-[30px] overflow-hidden shadow-inner border border-gray-100">
            {cat.image_path ? <img src={cat.image_path} alt={cat.cat_name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400">ไม่มีรูปภาพ</div>}
          </div>

          <div className="w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-5xl font-black text-[#8E6B53] mb-6">{cat.cat_name}</h1>
              <div className="grid grid-cols-2 gap-y-4 text-lg text-gray-700 font-medium">
                <p><strong>เพศ:</strong> {cat.gender || '-'}</p>
                <p><strong>อายุ:</strong> {cat.age_range || '-'}</p>
                <p><strong>สี:</strong> {cat.color_name || '-'}</p>
                <p><strong>จังหวัด:</strong> {cat.province_name || '-'}</p>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-2">คำอธิบาย/นิสัย:</h3>
                <p className="bg-white p-4 rounded-2xl border border-gray-200 text-gray-600 min-h-[100px] shadow-inner">{cat.description || '-'}</p>
              </div>
            </div>

            <div className="mt-8 flex gap-4 items-center">
              <button onClick={handleAdoptClick} className="flex-1 py-4 bg-[#698474] text-white text-xl font-bold rounded-full hover:bg-[#526a5b] transition shadow-md">
                ขอรับเลี้ยงน้องแมว
              </button>

              {/* 📌 ปุ่มลบโพสต์มาแล้ว! */}
              {showDeleteButton && (
                <button onClick={handleDeletePost} className="px-6 py-4 bg-[#C87E82] text-white text-lg font-bold rounded-full hover:bg-[#b56e72] transition shadow-md flex items-center gap-2">
                  🗑️ ลบโพสต์
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ส่วนคอมเมนต์ */}
        <div className="mt-12 bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-[#8E6B53] mb-6 border-b pb-4 border-gray-100">คอมเมนต์สอบถามรายละเอียด</h2>
          <div className="flex gap-4 mb-8 items-center">
            <div className="w-12 h-12 bg-[#D1B894] text-white rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
              {loggedInUser ? loggedInUser.name.charAt(4) || loggedInUser.name.charAt(0) : '?'}
            </div>
            <input 
              type="text" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              placeholder={loggedInUser ? "พิมพ์คำถามของคุณที่นี่..." : "กรุณาเข้าสู่ระบบก่อนคอมเมนต์"}
              disabled={!loggedInUser} 
              className="flex-1 bg-[#FCF5EB] border border-gray-200 rounded-full px-6 py-3 outline-none focus:border-[#A07D5A] shadow-inner disabled:opacity-50"
            />
            <button onClick={handleSendComment} className="px-8 py-3 bg-[#A07D5A] text-white font-bold rounded-full hover:bg-[#8E6B53] transition shadow-md">
              ส่ง
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}