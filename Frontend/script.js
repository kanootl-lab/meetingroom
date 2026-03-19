const API_BASE = 'http://localhost:3000/api/bookings';

document.addEventListener('DOMContentLoaded', fetchBookings);

async function fetchBookings() {
    const container = document.getElementById('bookingContainer');
    container.innerHTML = '<p style="text-align:center; color: #64748b;">กำลังดึงข้อมูล...</p>';

    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error();
        
        const bookings = await response.json();
        renderBookings(bookings);
    } catch (error) {
        showStatus('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
        container.innerHTML = '<p style="text-align:center; color: #ef4444;">เกิดข้อผิดพลาด</p>';
    }
}

function renderBookings(bookings) {
    const container = document.getElementById('bookingContainer');
    container.innerHTML = '';

    if (bookings.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 2rem; color: #94a3b8;">
                <i class="fa-solid fa-calendar-check" style="font-size: 2rem; margin-bottom: 0.5rem; display:block;"></i>
                ไม่มีการจองในวันนี้
            </div>`;
        return;
    }

    bookings.forEach(item => {
        const div = document.createElement('div');
        div.className = 'booking-item';
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="time-badge">${item.start}</div>
                <div>
                    <strong style="display:block; color: #1e293b;">${item.title}</strong>
                    <span style="font-size: 0.8rem; color: #64748b;">ถึงเวลา ${item.end}</span>
                </div>
            </div>
            <button class="btn-delete" onclick="deleteBooking(${item.id})">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('title');
    const startInput = document.getElementById('startTime');
    const endInput = document.getElementById('endTime');

    if (startInput.value >= endInput.value) {
        showStatus('เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด', 'error');
        return;
    }

    const payload = {
        title: titleInput.value,
        start: startInput.value,
        end: endInput.value
    };

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            showStatus('✅ จองสำเร็จ!', 'success');
            e.target.reset();
            fetchBookings();
        } else {
            showStatus(`❌ ${result.message}`, 'error');
        }
    } catch (error) {
        showStatus('เกิดข้อผิดพลาดในการส่งข้อมูล', 'error');
    }
});

async function deleteBooking(id) {
    if (!confirm('ยืนยันการยกเลิก?')) return;

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showStatus('ยกเลิกรายการเรียบร้อย', 'success');
            fetchBookings();
        } else {
            showStatus('ไม่สามารถลบรายการได้', 'error');
        }
    } catch (error) {
        showStatus('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
}

function showStatus(msg, type) {
    const el = document.getElementById('statusMsg');
    el.textContent = msg;
    el.className = `status-msg ${type === 'error' ? 'status-error' : 'status-success'}`;
    
    setTimeout(() => {
        el.className = 'status-msg';
    }, 4000);
}