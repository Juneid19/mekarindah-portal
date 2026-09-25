/* ==========================================================
   MEKARINDAH PORTAL — Single Page Application (vanilla JS)
   ========================================================== */

/* ---------- Storage ---------- */
const STORAGE_KEY = 'mekarindah_portal_data';
const initialData = {
  profile: { name: 'Budi Santoso', email: 'budi.santoso@email.com', phone: '0812 3456 7890', unit: 'A-01', emergencyName: 'Siti Santoso', emergencyPhone: '0813 9876 5432' },
  property: { block: 'A-01', type: 'Tipe Asri 72/120', landArea: 120, buildingArea: 72, ownership: 'Hak Milik', moveIn: '12 Agustus 2022' },
  invoices: [
    { id: 'ipl-1', month: 'Juni',  year: 2026, amount: 350000, status: 'unpaid', dueDate: '10 Jun 2026' },
    { id: 'ipl-2', month: 'Mei',   year: 2026, amount: 350000, status: 'paid',   dueDate: '10 Mei 2026' },
    { id: 'ipl-3', month: 'April', year: 2026, amount: 350000, status: 'paid',   dueDate: '10 Apr 2026' },
    { id: 'ipl-4', month: 'Maret', year: 2026, amount: 350000, status: 'paid',   dueDate: '10 Mar 2026' }
  ],
  vehicles: [
    { id: 'veh-1', plate: 'B 1234 KRS', type: 'Mobil', brand: 'Toyota Avanza', color: 'Putih' },
    { id: 'veh-2', plate: 'B 5678 UDA', type: 'Motor', brand: 'Honda Vario',   color: 'Hitam' }
  ],
  documents: [
    { id: 'doc-1', type: 'Surat Pengantar Domisili', submitted: '02 Jun 2026', status: 'processing' },
    { id: 'doc-2', type: 'Surat Pengantar SKCK',     submitted: '18 Mei 2026', status: 'completed' }
  ],
  complaints: [
    { id: 'cmp-1', category: 'Lingkungan', title: 'Lampu jalan Blok A padam', date: '03 Jun 2026', status: 'Diproses' },
    { id: 'cmp-2', category: 'Fasilitas',  title: 'Perbaikan ayunan taman',    date: '22 Mei 2026', status: 'Selesai'  }
  ],
  accessCards: [
    { id: 'card-1', label: 'Kartu Utama',   number: 'RFID •••• 4821', holder: 'Budi Santoso', active: true  },
    { id: 'card-2', label: 'Kartu Keluarga',number: 'RFID •••• 7734', holder: 'Siti Santoso', active: true  }
  ],
  gateOpenedAt: null
};

let state = loadState();
let currentView = 'dashboard';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(initialData));
    return { ...JSON.parse(JSON.stringify(initialData)), ...JSON.parse(raw) };
  } catch (e) {
    return JSON.parse(JSON.stringify(initialData));
  }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('Tidak bisa menyimpan ke localStorage', e); }
}

function resetState() {
  if (!confirm('Reset semua data ke kondisi awal? Tindakan ini tidak bisa dibatalkan.')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = JSON.parse(JSON.stringify(initialData));
  saveState();
  renderView();
  showToast('Data berhasil direset ke kondisi awal');
}

/* ---------- Helpers ---------- */
const rupiah = (v) => 'Rp' + Number(v).toLocaleString('id-ID');
const todayLabel = () => new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const getInitials = (name) => name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

const statusLabels = {
  paid: 'Lunas', unpaid: 'Belum bayar', pending: 'Menunggu', processing: 'Diproses',
  ready: 'Siap diambil', completed: 'Selesai', Diterima: 'Diterima', Diproses: 'Diproses', Selesai: 'Selesai'
};

function statusBadge(status) {
  const good = ['paid', 'completed', 'Selesai', 'active'].includes(status);
  const warn = ['processing', 'ready', 'Diproses'].includes(status);
  const cls = good ? 'status-good' : warn ? 'status-warn' : 'status-bad';
  const label = statusLabels[status] || status;
  return `<span class="status-badge ${cls}">${label}</span>`;
}

function icon(name, size = 18) {
  const icons = {
    user: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>',
    card: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    dollar: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h8M8 14h8"/></svg>',
    car: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14M3 11l2-6h14l2 6M5 17a2 2 0 104 0M15 17a2 2 0 104 0M3 11h18v4H3z"/></svg>',
    file: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    siren: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 18v3M12 13v8M17 8v13M22 12h-4l-3 9-6-18-3 9H2"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    alert: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    fileCheck: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 14 11 16 15 12"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
    flame: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>',
    trendUp: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    trendDown: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>',
    door: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 22h18M5 22V4a1 1 0 011-1h12a1 1 0 011 1v18M9 12h.01"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'
  };
  return icons[name] || '';
}

function moduleColor(name) {
  const map = { profile: 'blue', property: 'emerald', ipl: 'amber', access: 'violet', finance: 'cyan', vehicles: 'indigo', documents: 'rose', arrears: 'orange', complaints: 'red' };
  return map[name] || 'blue';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-text').textContent = message;
  toast.style.display = 'flex';
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.style.display = 'none'; }, 3200);
}

/* ---------- View Router ---------- */
const viewTitles = {
  dashboard: 'Beranda', profile: 'Profil Saya', property: 'Properti', ipl: 'Tagihan IPL',
  access: 'Kartu Akses', finance: 'Laporan Keuangan', vehicles: 'Kendaraan',
  documents: 'Permintaan Dokumen', arrears: 'Penunggak IPL', complaints: 'Aduan & SOS', residents: 'Data Warga'
};

function go(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  document.getElementById('crumb-title').textContent = viewTitles[view] || '';
  if (window.innerWidth <= 1000) document.getElementById('sidebar').classList.remove('sidebar-open');
  renderView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderView() {
  const content = document.getElementById('content');
  const fn = views[currentView] || views.dashboard;
  content.innerHTML = fn();
  attachViewEvents();
}

const views = {
  dashboard: () => {
    const unpaid = state.invoices.filter(i => i.status === 'unpaid');
    const totalUnpaid = unpaid.reduce((s, i) => s + i.amount, 0);
    const docs = state.documents.filter(d => d.status !== 'completed').length;
    return `
      <section class="welcome">
        <div>
          <span class="eyebrow">SELAMAT DATANG KEMBALI</span>
          <h1>Halo, ${state.profile.name.split(' ')[0]}! <span>👋</span></h1>
          <p>Semua kebutuhan hunian Anda dalam satu portal.</p>
        </div>
        <div class="date-card">
          <span>HARI INI</span>
          <strong>Senin, 8 Jun</strong>
          <small>2026</small>
        </div>
        <div class="welcome-shape shape-one"></div>
        <div class="welcome-shape shape-two"></div>
      </section>
      <section class="stats-grid">
        <button class="stat-card" data-goto="ipl">
          <div class="stat-icon amber">${icon('receipt', 22)}</div>
          <div><span>Tagihan bulan ini</span><strong>${totalUnpaid ? rupiah(totalUnpaid) : 'Lunas'}</strong><small class="${totalUnpaid ? 'negative' : 'positive'}">${totalUnpaid ? 'Jatuh tempo 10 Juni' : 'Semua sudah dibayar'}</small></div>
          ${icon('chevron', 18)}
        </button>
        <button class="stat-card" data-goto="documents">
          <div class="stat-icon blue">${icon('fileCheck', 22)}</div>
          <div><span>Dokumen aktif</span><strong>${docs} Permintaan</strong><small class="positive">Sedang diproses</small></div>
          ${icon('chevron', 18)}
        </button>
        <button class="stat-card" data-goto="complaints">
          <div class="stat-icon green">${icon('shield', 22)}</div>
          <div><span>Status lingkungan</span><strong>Aman & Kondusif</strong><small class="positive">Diperbarui 5 menit lalu</small></div>
          ${icon('chevron', 18)}
        </button>
      </section>
      <div class="section-heading">
        <div><h2>Layanan Warga</h2><p>Akses cepat semua kebutuhan hunian Anda</p></div>
        <span>9 layanan tersedia</span>
      </div>
      <section class="module-grid">
        ${modules.map(m => `
          <button class="module-card" data-goto="${m.id}">
            <div class="module-icon ${m.color}">${icon(m.icon, 23)}</div>
            <div><h3>${m.label}</h3><p>${m.desc}</p></div>
            ${icon('chevron', 18).replace('<svg', '<svg class="module-arrow"')}
          </button>
        `).join('')}
      </section>
      <section class="activity-panel">
        <div class="section-heading compact">
          <div><h2>Aktivitas Terbaru</h2><p>Pembaruan dari akun dan lingkungan Anda</p></div>
          <button data-goto="documents">Lihat semua ${icon('chevron', 14)}</button>
        </div>
        <div class="activity-list">
          <div class="activity"><div class="activity-icon green">${icon('check', 17)}</div><div><strong>Pembayaran IPL berhasil</strong><span>IPL Mei 2026 • Rp350.000</span></div><time>20 Mei</time></div>
          <div class="activity"><div class="activity-icon blue">${icon('file', 17)}</div><div><strong>Dokumen sedang diproses</strong><span>Surat Pengantar Domisili</span></div><time>2 Jun</time></div>
          <div class="activity"><div class="activity-icon amber">${icon('alert', 17)}</div><div><strong>Aduan telah ditindaklanjuti</strong><span>Lampu jalan Blok A padam</span></div><time>3 Jun</time></div>
        </div>
      </section>
    `;
  },

  profile: () => `
    <div class="page-title">
      <div class="title-wrap">
        <button class="back-button" data-goto="dashboard">${icon('arrow', 19)}</button>
        <div><h1>Profil Saya</h1><p>Kelola informasi pribadi dan kontak Anda</p></div>
      </div>
      <button class="primary-button" data-modal="profile">${icon('pencil', 16)} Edit profil</button>
    </div>
    <div class="two-column">
      <section class="panel profile-card">
        <div class="large-avatar">${getInitials(state.profile.name)}</div>
        <h2>${state.profile.name}</h2>
        <p>Penghuni tetap</p>
        <span class="unit-pill">${icon('home', 14)} Blok ${state.profile.unit}</span>
        <div class="verified">${icon('shield', 17)} Akun terverifikasi</div>
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>Informasi Kontak</h2><p>Data utama penghuni</p></div></div>
        <div class="info-rows">
          <div><span>Nama lengkap</span><strong>${state.profile.name}</strong></div>
          <div><span>Email</span><strong>${state.profile.email}</strong></div>
          <div><span>Nomor telepon</span><strong>${state.profile.phone}</strong></div>
          <div><span>Kode unit</span><strong>${state.profile.unit}</strong></div>
        </div>
        <div class="panel-header"><div><h2>Kontak Darurat</h2><p>Dihubungi dalam keadaan mendesak</p></div></div>
        <div class="info-rows" style="margin-bottom:0">
          <div><span>Nama</span><strong>${state.profile.emergencyName}</strong></div>
          <div><span>Nomor telepon</span><strong>${state.profile.emergencyPhone}</strong></div>
        </div>
      </section>
    </div>
  `,

  property: () => {
    const p = state.property;
    return `
      <div class="page-title">
        <div class="title-wrap">
          <button class="back-button" data-goto="dashboard">${icon('arrow', 19)}</button>
          <div><h1>Properti Saya</h1><p>Detail unit hunian yang terdaftar</p></div>
        </div>
      </div>
      <section class="property-hero">
        <div class="house-art">${icon('home', 58)}<span>${p.block}</span></div>
        <div>
          <span class="eyebrow">UNIT HUNIAN</span>
          <h2>${p.type}</h2>
          <p>Cluster Mekar Asri • Blok ${p.block}</p>
          <span class="status-badge status-good">Aktif dihuni</span>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>Detail Properti</h2><p>Informasi berdasarkan data pengelola</p></div></div>
        <div class="property-specs">
          <div class="spec"><span>Luas tanah</span><strong>${p.landArea} m²</strong></div>
          <div class="spec"><span>Luas bangunan</span><strong>${p.buildingArea} m²</strong></div>
          <div class="spec"><span>Status kepemilikan</span><strong>${p.ownership}</strong></div>
          <div class="spec"><span>Mulai menghuni</span><strong>${p.moveIn}</strong></div>
        </div>
      </section>
    `;
  },

  ipl: () => {
    const unpaid = state.invoices.filter(i => i.status === 'unpaid');
    const total = unpaid.reduce((s, i) => s + i.amount, 0);
    return `
      <div class="page-title">
        <div class="title-wrap">
          <button class="back-button" data-goto="dashboard">${icon('arrow', 19)}</button>
          <div><h1>Tagihan IPL</h1><p>Iuran Pengelolaan Lingkungan</p></div>
        </div>
      </div>
      <section class="bill-summary">
        <div>
          <span>Tagihan belum dibayar</span>
          <strong>${rupiah(total)}</strong>
          <small>Bayar sebelum jatuh tempo agar layanan tetap aktif.</small>
        </div>
        <div class="bill-icon">${icon('receipt', 34)}</div>
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>Riwayat Tagihan</h2><p>Daftar tagihan IPL unit Anda</p></div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Periode</th><th>Jatuh tempo</th><th>Nominal</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${state.invoices.map(inv => `
                <tr>
                  <td><strong>${inv.month} ${inv.year}</strong></td>
                  <td>${inv.dueDate}</td>
                  <td>${rupiah(inv.amount)}</td>
                  <td>${statusBadge(inv.status)}</td>
                  <td>${inv.status === 'unpaid' ? `<button class="small-button" data-pay="${inv.id}">Bayar sekarang</button>` : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  access: () => `
    <div class="page-title">
      <div class="title-wrap">
        <button class="back-button" data-goto="dashboard">${icon('arrow', 19)}</button>
        <div><h1>Kartu Akses</h1><p>Kelola akses gerbang perumahan</p></div>
      </div>
      <button class="primary-button" data-action="open-gate">${icon('door', 17)} Buka gerbang</button>
    </div>
    <section class="gate-card">
      <div class="gate-visual">${icon('door', 48)}</div>
      <div>
        <span class="eyebrow">GERBANG UTAMA</span>
        <h2>Siap menerima perintah</h2>
        <p>Gunakan tombol buka gerbang ketika Anda berada di dekat pintu masuk.</p>
        ${state.gateOpenedAt ? `<small>Terakhir dibuka ${formatDate(state.gateOpenedAt)}</small>` : ''}
      </div>
      <div class="live-dot"><i></i> ONLINE</div>
    </section>
    <div class="cards-grid">
      ${state.accessCards.map(card => `
        <section class="panel access-card">
          <div class="rfid-top">${icon('card', 24)}${statusBadge(card.active ? 'active' : 'blocked')}</div>
          <h3>${card.label}</h3>
          <strong>${card.number}</strong>
          <p>${card.holder}</p>
          <button class="${card.active ? 'danger-outline' : 'small-button'}" data-toggle-card="${card.id}">${card.active ? icon('lock', 15) + ' Blokir kartu' : 'Aktifkan kartu'}</button>
        </section>
      `).join('')}
    </div>
  `,

  finance: () => `
    <div class="page-title">
      <div class="title-wrap">
        <button class="back-button" data-goto="dashboard">${icon('arrow', 19)}</button>
        <div><h1>Laporan Keuangan</h1><p>Transparansi pengelolaan dana IPL</p></div>
      </div>
    </div>
    <div class="finance-stats">
      <div class="metric panel"><div class="stat-icon green">${icon('trendUp', 22)}</div><span>Total pemasukan</span><strong>Rp87.500.000</strong><small>Juni 2026</small></div>
      <div class="metric panel"><div class="stat-icon red">${icon('trendDown', 22)}</div><span>Total pengeluaran</span><strong>Rp54.275.000</strong><small>Juni 2026</small></div>
      <div class="metric panel"><div class="stat-icon blue">${icon('wallet', 22)}</div><span>Saldo berjalan</span><strong>Rp33.225.000</strong><small>Per 8 Juni 2026</small></div>
    </div>
    <section class="panel">
      <div class="panel-header"><div><h2>Ringkasan Pengeluaran</h2><p>Distribusi dana lingkungan bulan ini</p></div></div>
      <div class="budget-list">
        <div class="budget"><div><strong>Keamanan & petugas</strong><span>Rp22.500.000</span></div><div class="bar"><i style="width:82%;background:#2563eb"></i></div></div>
        <div class="budget"><div><strong>Kebersihan lingkungan</strong><span>Rp14.750.000</span></div><div class="bar"><i style="width:64%;background:#10b981"></i></div></div>
        <div class="budget"><div><strong>Perawatan fasilitas</strong><span>Rp10.225.000</span></div><div class="bar"><i style="width:47%;background:#f59e0b"></i></div></div>
        <div class="budget"><div><strong>Utilitas & operasional</strong><span>Rp6.800.000</span></div><div class="bar"><i style="width:31%;background:#8b5cf6"></i></div></div>
      </div>
    </section>
  `,

  vehicles: () => `
    <div class="page-title">
      <div class="title-wrap">
        <button class="back-button" data-goto="dashboard">${icon('arrow', 19)}</button>
        <div><h1>Kendaraan</h1><p>Daftar kendaraan yang memiliki akses masuk</p></div>
      </div>
      <button class="primary-button" data-modal="vehicle">${icon('plus', 17)} Tambah kendaraan</button>
    </div>
    <div class="cards-grid">
      ${state.vehicles.map(v => `
        <section class="panel vehicle-card">
          <div class="vehicle-icon ${v.type === 'Mobil' ? 'blue' : 'violet'}">${icon('car', 27)}</div>
          <div class="vehicle-info"><span>${v.type}</span><h3>${v.plate}</h3><p>${v.brand} • ${v.color}</p></div>
          <div class="row-actions">
            <button data-edit-vehicle="${v.id}">${icon('pencil', 16)}</button>
            <button class="danger" data-delete-vehicle="${v.id}">${icon('trash', 16)}</button>
          </div>
        </section>
      `).join('')}
    </div>
    ${state.vehicles.length === 0 ? '<div class="empty"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14M3 11l2-6h14l2 6M5 17a2 2 0 104 0M15 17a2 2 0 104 0M3 11h18v4H3z"/></svg><p>Belum ada kendaraan terdaftar</p></div>' : ''}
  `,

  documents: () => `
    <div class="page-title">
      <div class="title-wrap">
        <button class="back-button" data-goto="dashboard">${icon('arrow', 19)}</button>
        <div><h1>Permintaan Dokumen</h1><p>Ajukan dan pantau surat pengantar Anda</p></div>
      </div>
      <button class="primary-button" data-modal="document">${icon('plus', 17)} Ajukan dokumen</button>
    </div>
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Jenis dokumen</th><th>Tanggal pengajuan</th><th>Status</th><th>Tindakan</th></tr></thead>
          <tbody>
            ${state.documents.map(d => `
              <tr>
                <td><div class="table-title">${icon('file', 18)}<strong>${d.type}</strong></div></td>
                <td>${d.submitted}</td>
                <td>${statusBadge(d.status)}</td>
                <td>${d.status !== 'completed' ? `<button class="small-button" data-process-doc="${d.id}">${d.status === 'ready' ? 'Selesaikan' : 'Proses berikutnya'}</button>` : '<span class="muted">Tuntas</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `,

  arrears: () => `
    <div class="page-title">
      <div class="title-wrap">
        <button class="back-button" data-goto="dashboard">${icon('arrow', 19)}</button>
        <div><h1>Penunggak IPL</h1><p>Monitoring pembayaran warga • Akses administrator</p></div>
      </div>
    </div>
    <div class="admin-notice">${icon('shield', 20)}<div><strong>Mode Administrator</strong><span>Data bersifat terbatas dan hanya digunakan untuk kepentingan pengelolaan.</span></div></div>
    <section class="panel">
      <div class="table-tools"><div class="search">${icon('search', 17)}<input placeholder="Cari nama atau unit…"></div><span>${arrears.length} warga ditemukan</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nama penghuni</th><th>Unit</th><th>Tunggakan</th><th>Total</th><th></th></tr></thead>
          <tbody>
            ${arrears.map(r => `
              <tr>
                <td><strong>${r.name}</strong></td>
                <td><span class="unit-code">${r.unit}</span></td>
                <td>${r.months} bulan</td>
                <td><strong class="red-text">${rupiah(r.total)}</strong></td>
                <td><button class="danger-outline" data-send-sp="${r.name}">${icon('send', 14)} Kirim SP</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `,

  complaints: () => `
    <div class="page-title">
      <div class="title-wrap">
        <button class="back-button" data-goto="dashboard">${icon('arrow', 19)}</button>
        <div><h1>Aduan & SOS</h1><p>Laporkan masalah lingkungan atau kondisi darurat</p></div>
      </div>
      <button class="primary-button" data-modal="complaint">${icon('plus', 17)} Buat aduan</button>
    </div>
    <section class="sos-panel">
      <div>
        <span class="eyebrow">LAYANAN DARURAT 24 JAM</span>
        <h2>Butuh bantuan segera?</h2>
        <p>Tekan tombol sesuai kondisi. Sirene pos keamanan akan diaktifkan.</p>
      </div>
      <div class="sos-buttons">
        <button data-sos="Kebakaran">${icon('flame', 24)}<span><strong>KEBAKARAN</strong><small>Aktifkan alarm api</small></span></button>
        <button data-sos="Pencurian">${icon('siren', 24)}<span><strong>PENCURIAN</strong><small>Panggil keamanan</small></span></button>
      </div>
    </section>
    <section class="panel">
      <div class="panel-header"><div><h2>Riwayat Aduan</h2><p>Laporan yang pernah Anda kirim</p></div></div>
      ${state.complaints.map(c => `
        <div class="complaint-row">
          <div class="complaint-icon">${icon('alert', 19)}</div>
          <div><span>${c.category}</span><strong>${c.title}</strong><small>${c.date}</small></div>
          ${statusBadge(c.status)}
        </div>
      `).join('')}
    </section>
  `,

  residents: () => `
    <div class="page-title">
      <div class="title-wrap">
        <button class="back-button" data-goto="dashboard">${icon('arrow', 19)}</button>
        <div><h1>Data Warga</h1><p>Kelola akun penghuni yang terdaftar</p></div>
      </div>
    </div>
    <section class="panel">
      <div class="table-tools">
        <div class="search">${icon('search', 17)}<input placeholder="Cari nama, telepon, atau unit…"></div>
        <button class="filter-button">Semua status ${icon('chevron', 14)}</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Penghuni</th><th>Unit</th><th>Nomor telepon</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${residents.map(r => `
              <tr>
                <td><div class="resident-cell"><div class="mini-avatar">${getInitials(r.name)}</div><strong>${r.name}</strong></div></td>
                <td><span class="unit-code">${r.unit}</span></td>
                <td>${r.phone}</td>
                <td>${statusBadge(r.status === 'Aktif' ? 'active' : 'pending')}</td>
                <td><button class="small-button subtle" data-reset-pw="${r.name}">${icon('lock', 14)} Reset password</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `
};

const modules = [
  { id: 'profile', label: 'Profil Saya', icon: 'user', color: 'blue', desc: 'Kelola data diri & kontak darurat' },
  { id: 'property', label: 'Properti', icon: 'home', color: 'emerald', desc: 'Informasi rumah dan kepemilikan' },
  { id: 'ipl', label: 'Tagihan IPL', icon: 'receipt', color: 'amber', desc: 'Cek dan bayar tagihan bulanan' },
  { id: 'access', label: 'Kartu Akses', icon: 'card', color: 'violet', desc: 'Kelola kartu RFID & akses gerbang' },
  { id: 'finance', label: 'Laporan Keuangan', icon: 'dollar', color: 'cyan', desc: 'Transparansi dana lingkungan' },
  { id: 'vehicles', label: 'Kendaraan', icon: 'car', color: 'indigo', desc: 'Daftar kendaraan penghuni' },
  { id: 'documents', label: 'Permintaan Dokumen', icon: 'file', color: 'rose', desc: 'Ajukan surat secara online' },
  { id: 'arrears', label: 'Penunggak IPL', icon: 'wallet', color: 'orange', desc: 'Pantau tunggakan pembayaran' },
  { id: 'complaints', label: 'Aduan & SOS', icon: 'siren', color: 'red', desc: 'Sampaikan laporan & kondisi darurat' }
];

const arrears = [
  { name: 'Agus Pranoto', unit: 'C-07', months: 3, total: 1050000 },
  { name: 'Rina Kartika', unit: 'D-12', months: 2, total: 700000 },
  { name: 'Fajar Nugraha', unit: 'B-04', months: 1, total: 350000 }
];

const residents = [
  { name: 'Budi Santoso', unit: 'A-01', phone: '0812 3456 7890', status: 'Aktif' },
  { name: 'Nadia Putri', unit: 'A-02', phone: '0817 2244 9031', status: 'Aktif' },
  { name: 'Rangga Wijaya', unit: 'B-03', phone: '0857 4452 1020', status: 'Aktif' },
  { name: 'Fajar Nugraha', unit: 'B-04', phone: '0821 3388 0712', status: 'Perlu verifikasi' }
];

/* ---------- Event Delegation ---------- */
function attachViewEvents() {
  // Navigate via data-goto
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      go(el.dataset.goto);
    });
  });

  // Open modal
  document.querySelectorAll('[data-modal]').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.modal));
  });

  // Pay IPL
  document.querySelectorAll('[data-pay]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.pay;
      state.invoices = state.invoices.map(i => i.id === id ? { ...i, status: 'paid' } : i);
      saveState();
      renderView();
      showToast('Pembayaran berhasil dikonfirmasi');
    });
  });

  // Toggle access card
  document.querySelectorAll('[data-toggle-card]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.toggleCard;
      state.accessCards = state.accessCards.map(c => c.id === id ? { ...c, active: !c.active } : c);
      saveState();
      renderView();
      showToast('Status kartu berhasil diperbarui');
    });
  });

  // Open gate
  document.querySelectorAll('[data-action="open-gate"]').forEach(el => {
    el.addEventListener('click', () => {
      state.gateOpenedAt = new Date().toISOString();
      saveState();
      showToast('Gerbang utama berhasil dibuka');
      renderView();
    });
  });

  // Edit vehicle
  document.querySelectorAll('[data-edit-vehicle]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.editVehicle;
      const vehicle = state.vehicles.find(v => v.id === id);
      if (vehicle) openModal('vehicle', vehicle);
    });
  });

  // Delete vehicle
  document.querySelectorAll('[data-delete-vehicle]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.deleteVehicle;
      if (!confirm('Hapus kendaraan ini?')) return;
      state.vehicles = state.vehicles.filter(v => v.id !== id);
      saveState();
      renderView();
      showToast('Kendaraan berhasil dihapus');
    });
  });

  // Process document
  document.querySelectorAll('[data-process-doc]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.processDoc;
      state.documents = state.documents.map(d => {
        if (d.id !== id) return d;
        const next = d.status === 'pending' ? 'processing' : d.status === 'processing' ? 'ready' : 'completed';
        return { ...d, status: next };
      });
      saveState();
      renderView();
      showToast('Status dokumen diperbarui');
    });
  });

  // Send SP
  document.querySelectorAll('[data-send-sp]').forEach(el => {
    el.addEventListener('click', () => showToast(`Surat peringatan dikirim kepada ${el.dataset.sendSp}`));
  });

  // Reset password
  document.querySelectorAll('[data-reset-pw]').forEach(el => {
    el.addEventListener('click', () => showToast(`Password ${el.dataset.resetPw} telah direset ke default`));
  });

  // SOS
  document.querySelectorAll('[data-sos]').forEach(el => {
    el.addEventListener('click', () => triggerSos(el.dataset.sos));
  });
}

/* ---------- Modal ---------- */
let editingVehicle = null;
let currentModalType = null;

function openModal(type, payload) {
  currentModalType = type;
  editingVehicle = payload || null;
  const titles = {
    vehicle: editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan',
    document: 'Ajukan Dokumen',
    complaint: 'Buat Aduan',
    profile: 'Edit Profil'
  };
  const subtitles = {
    vehicle: 'Lengkapi data kendaraan Anda',
    document: 'Pilih jenis dokumen yang dibutuhkan',
    complaint: 'Sampaikan laporan untuk ditindaklanjuti',
    profile: 'Perbarui data pribadi dan kontak darurat'
  };
  document.getElementById('modal-title').textContent = titles[type];
  document.getElementById('modal-subtitle').textContent = subtitles[type];
  document.getElementById('modal-form').innerHTML = modalForms[type]();
  document.getElementById('modal-backdrop').classList.add('show');

  // Submit handler
  document.getElementById('modal-form').onsubmit = handleModalSubmit;
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.remove('show');
  editingVehicle = null;
  currentModalType = null;
}

function handleModalSubmit(e) {
  e.preventDefault();
  const form = new FormData(e.target);

  if (currentModalType === 'vehicle') {
    const vehicle = {
      id: editingVehicle ? editingVehicle.id : 'veh-' + Date.now(),
      plate: form.get('plate'),
      type: form.get('type'),
      brand: form.get('brand'),
      color: form.get('color')
    };
    if (editingVehicle) {
      state.vehicles = state.vehicles.map(v => v.id === vehicle.id ? vehicle : v);
      showToast('Data kendaraan diperbarui');
    } else {
      state.vehicles = [...state.vehicles, vehicle];
      showToast('Kendaraan berhasil ditambahkan');
    }
  } else if (currentModalType === 'document') {
    state.documents = [{
      id: 'doc-' + Date.now(),
      type: form.get('documentType'),
      submitted: todayLabel(),
      status: 'pending'
    }, ...state.documents];
    showToast('Permintaan dokumen berhasil diajukan');
  } else if (currentModalType === 'complaint') {
    state.complaints = [{
      id: 'cmp-' + Date.now(),
      category: form.get('category'),
      title: form.get('title'),
      date: todayLabel(),
      status: 'Diterima'
    }, ...state.complaints];
    showToast('Aduan berhasil dikirim');
  } else if (currentModalType === 'profile') {
    state.profile = {
      ...state.profile,
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone'),
      emergencyName: form.get('emergencyName'),
      emergencyPhone: form.get('emergencyPhone')
    };
    document.getElementById('user-name').textContent = state.profile.name;
    document.getElementById('user-unit').textContent = state.profile.unit;
    document.getElementById('top-name').textContent = state.profile.name;
    document.getElementById('top-unit').textContent = state.profile.unit;
    document.getElementById('user-avatar').textContent = getInitials(state.profile.name);
    document.getElementById('top-avatar').textContent = getInitials(state.profile.name);
    showToast('Profil berhasil diperbarui');
  }

  saveState();
  renderView();
  closeModal();
}

const modalForms = {
  vehicle: () => `
    <label class="field"><span>Nomor polisi</span><input required name="plate" value="${editingVehicle ? editingVehicle.plate : ''}" placeholder="B 1234 XYZ"></label>
    <div class="form-row">
      <label class="field"><span>Jenis</span><select required name="type"><option ${editingVehicle && editingVehicle.type === 'Mobil' ? 'selected' : ''}>Mobil</option><option ${editingVehicle && editingVehicle.type === 'Motor' ? 'selected' : ''}>Motor</option></select></label>
      <label class="field"><span>Warna</span><input required name="color" value="${editingVehicle ? editingVehicle.color : ''}" placeholder="Putih"></label>
    </div>
    <label class="field"><span>Merek & tipe</span><input required name="brand" value="${editingVehicle ? editingVehicle.brand : ''}" placeholder="Toyota Avanza"></label>
    <div class="modal-actions"><button type="button" class="secondary-button" id="modal-cancel">Batal</button><button type="submit" class="primary-button">Simpan perubahan</button></div>
  `,
  document: () => `
    <label class="field"><span>Jenis dokumen</span><select required name="documentType"><option>Surat Pengantar Domisili</option><option>Surat Pengantar SKCK</option><option>Surat Keterangan Usaha</option><option>Surat Pengantar Nikah</option></select></label>
    <label class="field"><span>Keperluan</span><textarea required name="purpose" placeholder="Jelaskan keperluan pengajuan…"></textarea></label>
    <div class="modal-actions"><button type="button" class="secondary-button" id="modal-cancel">Batal</button><button type="submit" class="primary-button">Simpan perubahan</button></div>
  `,
  complaint: () => `
    <label class="field"><span>Kategori</span><select required name="category"><option>Lingkungan</option><option>Fasilitas</option><option>Keamanan</option><option>Kebersihan</option><option>Lainnya</option></select></label>
    <label class="field"><span>Judul laporan</span><input required name="title" placeholder="Tuliskan masalah secara singkat"></label>
    <label class="field"><span>Detail laporan</span><textarea required name="detail" placeholder="Jelaskan lokasi dan kondisi yang ditemukan…"></textarea></label>
    <div class="modal-actions"><button type="button" class="secondary-button" id="modal-cancel">Batal</button><button type="submit" class="primary-button">Simpan perubahan</button></div>
  `,
  profile: () => `
    <label class="field"><span>Nama lengkap</span><input required name="name" value="${state.profile.name}"></label>
    <label class="field"><span>Email</span><input required type="email" name="email" value="${state.profile.email}"></label>
    <label class="field"><span>Nomor telepon</span><input required name="phone" value="${state.profile.phone}"></label>
    <div class="form-divider">Kontak darurat</div>
    <label class="field"><span>Nama kontak</span><input required name="emergencyName" value="${state.profile.emergencyName}"></label>
    <label class="field"><span>Nomor kontak</span><input required name="emergencyPhone" value="${state.profile.emergencyPhone}"></label>
    <div class="modal-actions"><button type="button" class="secondary-button" id="modal-cancel">Batal</button><button type="submit" class="primary-button">Simpan perubahan</button></div>
  `
};

// Delegated cancel button
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'modal-cancel') closeModal();
});

/* ---------- SOS Sirene ---------- */
function triggerSos(kind) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) throw new Error('no audio');
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(920, ctx.currentTime + 0.7);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  } catch (e) { /* audio optional */ }
  showToast(`SOS ${kind} aktif — petugas keamanan telah diberi tahu`);
}

/* ---------- Sidebar Toggle ---------- */
document.getElementById('menu-button').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('sidebar-open');
  document.getElementById('backdrop').classList.add('show');
});
document.getElementById('close-sidebar').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('sidebar-open');
  document.getElementById('backdrop').classList.remove('show');
});
document.getElementById('backdrop').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('sidebar-open');
  document.getElementById('backdrop').classList.remove('show');
});

/* ---------- Other Listeners ---------- */
document.querySelectorAll('.nav-item').forEach(el => el.addEventListener('click', () => go(el.dataset.view)));
document.getElementById('call-help').addEventListener('click', () => showToast('Pengelola: 021-555-0147'));
document.getElementById('reset-data').addEventListener('click', resetState);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', (e) => {
  if (e.target.id === 'modal-backdrop') closeModal();
});

/* ---------- Init ---------- */
function init() {
  document.getElementById('user-name').textContent = state.profile.name;
  document.getElementById('user-unit').textContent = state.profile.unit;
  document.getElementById('top-name').textContent = state.profile.name;
  document.getElementById('top-unit').textContent = state.profile.unit;
  document.getElementById('user-avatar').textContent = getInitials(state.profile.name);
  document.getElementById('top-avatar').textContent = getInitials(state.profile.name);

  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.querySelector('.nav-item[data-view="dashboard"]').classList.add('active');
    renderView();
  }, 700);
}

init();
