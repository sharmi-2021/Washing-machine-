const STORAGE_KEY = 'machine_bookings';
const STATUS_LABELS = { pending:'Pending', confirmed:'Confirmed', assigned:'Technician Assigned', inprogress:'In Progress', completed:'Completed', cancelled:'Cancelled' };
const STATUS_ICONS  = { pending:'⏳', confirmed:'✅', assigned:'👨‍🔧', inprogress:'🔧', completed:'🎉', cancelled:'❌' };
const STATUS_STEPS  = ['pending','confirmed','assigned','inprogress','completed'];

function getBookings() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }

function findBooking(q) {
  q = q.trim().toLowerCase();
  return getBookings().find(b => b.id.toLowerCase() === q || b.mobile === q);
}

function renderTracking(booking) {
  const result = document.getElementById('trackResult');
  const notFound = document.getElementById('notFound');
  if (!result) return;
  if (!booking) {
    result.style.display = 'none'; result.innerHTML = '';
    if (notFound) notFound.style.display = 'block';
    return;
  }
  if (notFound) notFound.style.display = 'none';
  result.style.display = 'block';

  const stepIdx = STATUS_STEPS.indexOf(booking.status);
  const isCancelled = booking.status === 'cancelled';

  const stepsHtml = STATUS_STEPS.map((s, i) => {
    const done = !isCancelled && i <= stepIdx;
    const active = !isCancelled && i === stepIdx;
    return `<div class="track-step ${done?'done':''} ${active?'active':''}">
      <div class="step-circle">${done||active ? STATUS_ICONS[s] : i+1}</div>
      <p>${STATUS_LABELS[s]}</p>
    </div>`;
  }).join('');

  result.innerHTML = `
    <div class="track-card">
      <div class="track-header">
        <div>
          <div class="track-booking-id">${booking.id}</div>
          <p class="track-date">Booked on ${new Date(booking.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</p>
        </div>
        <span class="status-badge ${booking.status}">${STATUS_ICONS[booking.status]} ${STATUS_LABELS[booking.status]||booking.status}</span>
      </div>
      <div class="track-steps-bar">${stepsHtml}</div>
      <div class="track-details">
        <div class="track-detail-row"><span>👤 Customer</span><strong>${booking.name}</strong></div>
        <div class="track-detail-row"><span>📱 Mobile</span><strong>${booking.mobile}</strong></div>
        <div class="track-detail-row"><span>📍 Address</span><strong>${booking.address}</strong></div>
        <div class="track-detail-row"><span>🫧 Machine</span><strong>${booking.machineType}</strong></div>
        <div class="track-detail-row"><span>⚠️ Problem</span><strong>${booking.problem}</strong></div>
        <div class="track-detail-row"><span>📅 Preferred</span><strong>${booking.preferredDate} · ${booking.preferredTime}</strong></div>
        ${booking.technicianName?`<div class="track-detail-row"><span>👨‍🔧 Technician</span><strong>${booking.technicianName}</strong></div>`:''}
        ${booking.notes?`<div class="track-detail-row"><span>📝 Notes</span><strong>${booking.notes}</strong></div>`:''}
      </div>
      <div class="track-actions">
        <a href="https://wa.me/919445237143?text=My%20booking%20ID%20is%20${booking.id}" target="_blank" class="btn btn-accent btn-sm">💬 WhatsApp Support</a>
        <a href="tel:+919445237143" class="btn btn-primary btn-sm">📞 Call Now</a>
      </div>
    </div>`;
}

document.getElementById('trackForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = document.getElementById('trackQuery')?.value || '';
  if (!q.trim()) return;
  renderTracking(findBooking(q));
});

// Auto-fill from URL param
const bid = new URLSearchParams(window.location.search).get('id');
if (bid) {
  const inp = document.getElementById('trackQuery');
  if (inp) inp.value = bid;
  renderTracking(findBooking(bid));
}
