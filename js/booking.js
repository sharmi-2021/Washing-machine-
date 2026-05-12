const WA_NUMBER = '919445237143';
const STORAGE_KEY = 'machine_bookings';

function getBookings() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
function saveBookings(b) { localStorage.setItem(STORAGE_KEY, JSON.stringify(b)); }

function generateBookingId() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `SLR-${date}-${Math.floor(Math.random()*9000)+1000}`;
}

function validateForm(data) {
  const errors = {};
  if (!data.name.trim() || data.name.trim().length < 2) errors.name = 'Please enter your full name';
  if (!/^[6-9]\d{9}$/.test(data.mobile)) errors.mobile = 'Enter valid 10-digit Indian mobile number';
  if (!data.address.trim() || data.address.trim().length < 8) errors.address = 'Please enter your full address';
  if (!data.machineType) errors.machineType = 'Please select machine type';
  if (!data.problem.trim() || data.problem.trim().length < 5) errors.problem = 'Please describe the problem';
  if (!data.preferredDate) errors.preferredDate = 'Please select preferred date';
  if (!data.preferredTime) errors.preferredTime = 'Please select preferred time';
  return errors;
}

function showFieldError(id, msg) {
  const field = document.getElementById(id);
  if (!field) return;
  field.style.borderColor = '#FF5252';
  let err = field.parentElement.querySelector('.field-error');
  if (!err) { err = document.createElement('span'); err.className = 'field-error'; err.style.cssText = 'color:#FF5252;font-size:0.8rem;margin-top:4px;display:block;'; field.parentElement.appendChild(err); }
  err.textContent = msg;
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(e => e.remove());
  document.querySelectorAll('input,select,textarea').forEach(f => { f.style.borderColor = ''; });
}

function submitBooking(e) {
  e.preventDefault();
  clearErrors();
  const data = {
    name: document.getElementById('bookName')?.value || '',
    mobile: document.getElementById('bookMobile')?.value || '',
    address: document.getElementById('bookAddress')?.value || '',
    machineType: document.getElementById('bookMachineType')?.value || '',
    problem: document.getElementById('bookProblem')?.value || '',
    preferredDate: document.getElementById('bookDate')?.value || '',
    preferredTime: document.getElementById('bookTime')?.value || '',
  };
  const errors = validateForm(data);
  const fieldMap = { name:'bookName', mobile:'bookMobile', address:'bookAddress', machineType:'bookMachineType', problem:'bookProblem', preferredDate:'bookDate', preferredTime:'bookTime' };
  if (Object.keys(errors).length > 0) { Object.entries(errors).forEach(([k,msg]) => showFieldError(fieldMap[k], msg)); return; }

  const booking = { id: generateBookingId(), ...data, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const bookings = getBookings();
  bookings.unshift(booking);
  saveBookings(bookings);

  // Show success modal
  const overlay = document.getElementById('successModal');
  if (overlay) overlay.classList.add('active');
  const bidEl = document.getElementById('modalBookingId');
  const nameEl = document.getElementById('modalName');
  if (bidEl) bidEl.textContent = booking.id;
  if (nameEl) nameEl.textContent = booking.name;

  // Send WhatsApp after 1.5s
  setTimeout(() => {
    const msg = `🔧 *New Booking - Machine Service*\n\n📋 *ID:* ${booking.id}\n👤 *Name:* ${booking.name}\n📱 *Mobile:* ${booking.mobile}\n📍 *Address:* ${booking.address}\n🫧 *Machine:* ${booking.machineType}\n⚠️ *Problem:* ${booking.problem}\n📅 *Date:* ${booking.preferredDate}\n⏰ *Time:* ${booking.preferredTime}\n🕐 *Booked:* ${new Date(booking.createdAt).toLocaleString('en-IN')}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }, 1500);
}

document.getElementById('modalClose')?.addEventListener('click', () => {
  document.getElementById('successModal')?.classList.remove('active');
  window.location.href = 'tracking.html';
});
document.getElementById('successModal')?.addEventListener('click', function(e) {
  if (e.target === this) { this.classList.remove('active'); window.location.href = 'tracking.html'; }
});

// Date minimum = tomorrow
const dateInput = document.getElementById('bookDate');
if (dateInput) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}

document.getElementById('bookingForm')?.addEventListener('submit', submitBooking);
