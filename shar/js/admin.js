const ADMIN_USER = 'admin';
const ADMIN_PASS = 'machine2024';
const STORAGE_KEY = 'machine_bookings';
const SESSION_KEY = 'machine_admin_session';

function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === 'true'; }
function logout() { sessionStorage.removeItem(SESSION_KEY); window.location.href = 'index.html'; }

// ===== LOGIN PAGE =====
const loginForm = document.getElementById('adminLoginForm');
if (loginForm) {
  if (isLoggedIn()) window.location.href = 'dashboard.html';
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('adminUser')?.value;
    const pass = document.getElementById('adminPass')?.value;
    const errEl = document.getElementById('loginError');
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      window.location.href = 'dashboard.html';
    } else {
      if (errEl) { errEl.textContent = 'Invalid username or password.'; errEl.style.display = 'block'; }
    }
  });
}

// ===== DASHBOARD =====
const dashboardEl = document.getElementById('adminDashboard');
if (dashboardEl) {
  if (!isLoggedIn()) { window.location.href = 'index.html'; }

  let allBookings = [];
  let currentFilter = { status: '', machineType: '', search: '' };

  const STATUS_LABELS = { pending:'Pending', confirmed:'Confirmed', assigned:'Technician Assigned', inprogress:'In Progress', completed:'Completed', cancelled:'Cancelled' };

  function getBookings() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  function saveBookings(b) { localStorage.setItem(STORAGE_KEY, JSON.stringify(b)); }

  function addDemoData() {
    const demos = [
      { id:'SLR-20260509-1001', name:'Rajesh Kumar', mobile:'9876543210', address:'12/3 Anna Nagar, Chennai - 600040', machineType:'Front Load', problem:'Drum not spinning, showing error E3', preferredDate:'2026-05-10', preferredTime:'Morning (9-12)', status:'completed', createdAt:'2026-05-07T10:30:00Z', updatedAt:'2026-05-09T08:00:00Z', technicianName:'Arjun', notes:'Motor belt replaced' },
      { id:'SLR-20260509-1002', name:'Priya Sharma', mobile:'9845678901', address:'45 T Nagar, Chennai - 600017', machineType:'Top Load', problem:'Water not draining properly', preferredDate:'2026-05-10', preferredTime:'Afternoon (12-5)', status:'confirmed', createdAt:'2026-05-08T14:20:00Z', updatedAt:'2026-05-08T15:00:00Z', technicianName:'', notes:'' },
      { id:'SLR-20260509-1003', name:'Mohammed Ali', mobile:'9988776655', address:'78 Velachery Road, Chennai - 600042', machineType:'Front Load', problem:'Machine makes loud noise during spin', preferredDate:'2026-05-11', preferredTime:'Evening (5-8)', status:'pending', createdAt:'2026-05-09T09:00:00Z', updatedAt:'2026-05-09T09:00:00Z', technicianName:'', notes:'' },
      { id:'SLR-20260509-1004', name:'Kavitha Nair', mobile:'9123456780', address:'22 Adyar, Chennai - 600020', machineType:'Top Load', problem:'Door lock not working', preferredDate:'2026-05-09', preferredTime:'Morning (9-12)', status:'inprogress', createdAt:'2026-05-09T07:00:00Z', updatedAt:'2026-05-09T10:00:00Z', technicianName:'Ramesh', notes:'Checking door sensor' },
    ];
    saveBookings(demos);
  }

  function updateStats(bookings) {
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('statTotal').textContent = bookings.length;
    document.getElementById('statPending').textContent = bookings.filter(b => b.status === 'pending').length;
    document.getElementById('statCompleted').textContent = bookings.filter(b => b.status === 'completed').length;
    document.getElementById('statToday').textContent = bookings.filter(b => b.createdAt?.startsWith(todayStr)).length;
  }

  function filterBookings(bookings) {
    return bookings.filter(b => {
      const matchStatus = !currentFilter.status || b.status === currentFilter.status;
      const matchType = !currentFilter.machineType || b.machineType === currentFilter.machineType;
      const q = currentFilter.search.toLowerCase();
      const matchSearch = !q || b.id.toLowerCase().includes(q) || b.name.toLowerCase().includes(q) || b.mobile.includes(q);
      return matchStatus && matchType && matchSearch;
    });
  }

  function renderTable(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;
    if (!bookings.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="emoji">📭</div><p>No bookings found</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><code style="font-size:0.8rem;background:#F3F4F6;padding:3px 8px;border-radius:4px">${b.id}</code></td>
        <td><strong>${b.name}</strong></td>
        <td>${b.mobile}</td>
        <td>${b.machineType}</td>
        <td><span class="status-badge ${b.status}">${STATUS_LABELS[b.status] || b.status}</span></td>
        <td>${new Date(b.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
        <td><button class="action-btn action-view" onclick="openModal('${b.id}')">👁 View</button></td>
      </tr>`).join('');
  }

  window.openModal = function(id) {
    const b = allBookings.find(x => x.id === id);
    if (!b) return;
    document.getElementById('dId').textContent = b.id;
    document.getElementById('dName').textContent = b.name;
    document.getElementById('dMobile').innerHTML = `<a href="https://wa.me/91${b.mobile}?text=Hello%20${encodeURIComponent(b.name)}%2C%20regarding%20booking%20${b.id}" class="wa-contact" target="_blank">💬 ${b.mobile}</a>`;
    document.getElementById('dAddress').textContent = b.address;
    document.getElementById('dMachine').textContent = b.machineType;
    document.getElementById('dProblem').textContent = b.problem;
    document.getElementById('dDate').textContent = `${b.preferredDate} · ${b.preferredTime}`;
    document.getElementById('dBooked').textContent = new Date(b.createdAt).toLocaleString('en-IN');
    document.getElementById('dStatusSelect').value = b.status;
    document.getElementById('dTech').value = b.technicianName || '';
    document.getElementById('dNotes').value = b.notes || '';
    document.getElementById('detailModal').dataset.currentId = id;
    document.getElementById('detailModal').classList.add('active');
  };

  document.getElementById('modalUpdateBtn')?.addEventListener('click', () => {
    const id = document.getElementById('detailModal')?.dataset.currentId;
    if (!id) return;
    const idx = allBookings.findIndex(b => b.id === id);
    if (idx === -1) return;
    allBookings[idx].status = document.getElementById('dStatusSelect').value;
    allBookings[idx].technicianName = document.getElementById('dTech').value;
    allBookings[idx].notes = document.getElementById('dNotes').value;
    allBookings[idx].updatedAt = new Date().toISOString();
    saveBookings(allBookings);
    document.getElementById('detailModal').classList.remove('active');
    refresh();
  });

  document.getElementById('modalCancelBtn')?.addEventListener('click', () => document.getElementById('detailModal').classList.remove('active'));
  document.getElementById('detailModal')?.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('active'); });

  document.getElementById('filterStatus')?.addEventListener('change', function() { currentFilter.status = this.value; renderTable(filterBookings(allBookings)); });
  document.getElementById('filterMachine')?.addEventListener('change', function() { currentFilter.machineType = this.value; renderTable(filterBookings(allBookings)); });
  document.getElementById('searchInput')?.addEventListener('input', function() { currentFilter.search = this.value; renderTable(filterBookings(allBookings)); });

  document.getElementById('exportBtn')?.addEventListener('click', () => {
    const rows = [['Booking ID','Name','Mobile','Address','Machine','Problem','Date','Time','Status','Booked At']];
    allBookings.forEach(b => rows.push([b.id, b.name, b.mobile, b.address, b.machineType, b.problem, b.preferredDate, b.preferredTime, b.status, new Date(b.createdAt).toLocaleString('en-IN')]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
    a.download = `machine-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  });

  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  function refresh() {
    allBookings = getBookings();
    if (!allBookings.length) { addDemoData(); allBookings = getBookings(); }
    updateStats(allBookings);
    renderTable(filterBookings(allBookings));
  }

  refresh();
  setInterval(refresh, 30000);
}
