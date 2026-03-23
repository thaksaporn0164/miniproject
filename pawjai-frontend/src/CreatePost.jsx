const handleSubmit = async () => {
    if (!catImage) {
      alert("กรุณาอัปโหลดรูปภาพน้องแมวก่อนครับ!")
      return
    }

    try {
      const payload = new FormData()
      payload.append('image', catImage)
      
      // 🔥 ดักบั๊กตรงนี้! ถ้าผู้ใช้ปล่อยช่องว่าง ให้แอบส่งคำว่า "-" หรือค่าเริ่มต้นไปแทน
      payload.append('cat_name', formData.cat_name || 'ไม่ระบุชื่อ')
      payload.append('gender', formData.gender || 'ไม่ทราบ')
      payload.append('age_range', formData.age_range || 'ไม่ทราบอายุ')
      payload.append('weight', formData.weight || 'ไม่ทราบน้ำหนัก')
      payload.append('vaccine_status', formData.vaccine_status || 'ไม่ทราบประวัติ')
      
      // 📌 ตัวการของ Error เมื่อกี้คือบรรทัดนี้ครับ!
      payload.append('description', formData.description || 'ไม่ได้ระบุคำอธิบายเพิ่มเติม') 
      
      payload.append('owner_id', currentOwnerId)

      // ส่วนของ Dropdown ที่เป็นตัวเลข (ID)
      if (formData.breed_id) payload.append('breed_id', formData.breed_id)
      if (formData.color_id) payload.append('color_id', formData.color_id)
      if (formData.province_id) payload.append('province_id', formData.province_id)

      const response = await fetch('http://localhost:8000/api/cats', {
        method: 'POST',
        body: payload,
      })
      
      const result = await response.json()

      if (response.ok || result.status === 'success') {
        fetch('http://localhost:8000/api/cats')
          .then(res => res.json())
          .then(data => {
            const updatedCats = data.filter(cat => Number(cat.owner_id) === Number(currentOwnerId));
            setMyCats(updatedCats);
            setStep(3); 
          });
      } else {
        const errorMessage = result.message || (result.detail && JSON.stringify(result.detail)) || 'ข้อมูลไม่ครบถ้วน';
        alert('เกิดข้อผิดพลาด: ' + errorMessage)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์หลังบ้านครับ')
    }
  }