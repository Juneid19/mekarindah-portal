"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Bike,
  Building2,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  FileText,
  Flame,
  DoorOpen,
  Headphones,
  Home,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  Pencil,
  Phone,
  Plus,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  Siren,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { initialPortalState, type PortalState, type Vehicle } from "@/lib/portal-data";

type View = "dashboard" | "profile" | "property" | "ipl" | "access" | "finance" | "vehicles" | "documents" | "arrears" | "complaints" | "residents";
type Modal = "vehicle" | "document" | "complaint" | "profile" | null;

type NavItem = { id: View; label: string; icon: LucideIcon };

const navItems: NavItem[] = [
  { id: "dashboard", label: "Beranda", icon: LayoutDashboard },
  { id: "profile", label: "Profil Saya", icon: UserRound },
  { id: "property", label: "Properti", icon: Home },
  { id: "ipl", label: "Tagihan IPL", icon: ReceiptText },
  { id: "access", label: "Kartu Akses", icon: CreditCard },
  { id: "finance", label: "Laporan Keuangan", icon: CircleDollarSign },
  { id: "vehicles", label: "Kendaraan", icon: Car },
  { id: "documents", label: "Permintaan Dokumen", icon: FileText },
  { id: "arrears", label: "Penunggak IPL", icon: WalletCards },
  { id: "complaints", label: "Aduan & SOS", icon: Siren },
];

const modules = navItems.slice(1).map((item, index) => ({
  ...item,
  color: ["blue", "emerald", "amber", "violet", "cyan", "indigo", "rose", "orange", "red"][index],
  description: [
    "Kelola data diri & kontak darurat",
    "Informasi rumah dan kepemilikan",
    "Cek dan bayar tagihan bulanan",
    "Kelola kartu RFID & akses gerbang",
    "Transparansi dana lingkungan",
    "Daftar kendaraan penghuni",
    "Ajukan surat secara online",
    "Pantau tunggakan pembayaran",
    "Sampaikan laporan & kondisi darurat",
  ][index],
}));

const rupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const statusLabel: Record<string, string> = { paid: "Lunas", unpaid: "Belum bayar", pending: "Menunggu", processing: "Diproses", ready: "Siap diambil", completed: "Selesai" };

function StatusBadge({ status }: { status: string }) {
  const good = ["paid", "completed", "Selesai", "active"].includes(status);
  const warn = ["processing", "ready", "Diproses"].includes(status);
  return <span className={`status-badge ${good ? "status-good" : warn ? "status-warn" : "status-bad"}`}>{statusLabel[status] ?? status}</span>;
}

function PageTitle({ title, subtitle, onBack, action }: { title: string; subtitle: string; onBack: () => void; action?: React.ReactNode }) {
  return (
    <div className="page-title">
      <div className="title-wrap">
        <button className="back-button" onClick={onBack} aria-label="Kembali"><ArrowLeft size={19} /></button>
        <div><h1>{title}</h1><p>{subtitle}</p></div>
      </div>
      {action}
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return <div className="empty"><Icon size={28} /><p>{text}</p></div>;
}

export default function PortalApp() {
  const [data, setData] = useState<PortalState>(initialPortalState);
  const [view, setView] = useState<View>("dashboard");
  const [modal, setModal] = useState<Modal>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetch("/api/portal").then((res) => res.ok ? res.json() : Promise.reject()).then(setData).catch(() => setToast("Mode lokal aktif — data server belum tersedia")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  async function persist(next: PortalState, message: string) {
    setData(next);
    setSaving(true);
    try {
      const response = await fetch("/api/portal", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      if (!response.ok) throw new Error();
      setToast(message);
    } catch {
      setToast("Perubahan tersimpan sementara di perangkat");
    } finally {
      setSaving(false);
    }
  }

  function go(id: View) {
    setView(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const unpaid = data.invoices.filter((invoice) => invoice.status === "unpaid");
  const totalUnpaid = unpaid.reduce((sum, invoice) => sum + invoice.amount, 0);
  const pageName = navItems.find((item) => item.id === view)?.label ?? "Portal";

  if (loading) return <div className="loading-screen"><div className="brand-mark"><Building2 size={26} /></div><Loader2 className="spin" /><p>Menyiapkan portal warga…</p></div>;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><img src="https://res.cloudinary.com/ddngqwcz/image/upload/v1786758568/logo.jpg" alt="Logo RW Mekarindah" style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #cbd5e1", display: "inline-block", flexShrink: 0 }} /><div><strong>MEKARINDAH</strong><span>PORTAL WARGA</span></div></div>
        <button className="close-sidebar" onClick={() => setMobileOpen(false)}><X size={22} /></button>
        <nav>
          <p className="nav-label">MENU UTAMA</p>
          {navItems.slice(0, 7).map((item) => <NavButton key={item.id} item={item} active={view === item.id} onClick={() => go(item.id)} />)}
          <p className="nav-label nav-label-spaced">LAYANAN</p>
          {navItems.slice(7).map((item) => <NavButton key={item.id} item={item} active={view === item.id} onClick={() => go(item.id)} />)}
          <p className="nav-label nav-label-spaced">ADMINISTRATOR</p>
          <NavButton item={{ id: "residents", label: "Data Warga", icon: UsersRound }} active={view === "residents"} onClick={() => go("residents")} />
        </nav>
        <div className="sidebar-help"><div className="help-icon"><Headphones size={18} /></div><div><strong>Butuh bantuan?</strong><span>Hubungi pengelola</span></div><button onClick={() => setToast("Pengelola: 021-555-0147")}><Phone size={15} /></button></div>
        <div className="sidebar-user"><div className="avatar">BS</div><div><strong>{data.profile.name}</strong><span>Penghuni • {data.profile.unit}</span></div><LogOut size={17} /></div>
      </aside>
      {mobileOpen && <button className="backdrop" onClick={() => setMobileOpen(false)} aria-label="Tutup menu" />}

      <main className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          <div className="crumb"><span>Portal Warga</span><ChevronRight size={14} /><strong>{pageName}</strong></div>
          <div className="top-actions">
            {saving && <span className="saving"><Loader2 className="spin" size={14} /> Menyimpan</span>}
            <button className="icon-button"><Bell size={19} /><i /></button>
            <div className="profile-menu-wrap">
              <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><div className="avatar">BS</div><div><strong>{data.profile.name}</strong><span>{data.profile.unit}</span></div><ChevronDown size={15} /></button>
              {profileOpen && <div className="profile-dropdown"><button onClick={() => { go("profile"); setProfileOpen(false); }}><UserRound size={16} /> Profil saya</button><button><LogOut size={16} /> Keluar</button></div>}
            </div>
          </div>
        </header>

        <div className="content">
          {view === "dashboard" && <Dashboard data={data} totalUnpaid={totalUnpaid} go={go} />}
          {view === "profile" && <ProfileView data={data} onBack={() => go("dashboard")} onEdit={() => setModal("profile")} />}
          {view === "property" && <PropertyView data={data} onBack={() => go("dashboard")} />}
          {view === "ipl" && <IplView data={data} onBack={() => go("dashboard")} onPay={(id) => persist({ ...data, invoices: data.invoices.map((item) => item.id === id ? { ...item, status: "paid" } : item) }, "Pembayaran berhasil dikonfirmasi")} />}
          {view === "access" && <AccessView data={data} onBack={() => go("dashboard")} onGate={() => persist({ ...data, gateOpenedAt: new Date().toISOString() }, "Gerbang utama berhasil dibuka")} onToggle={(id) => persist({ ...data, accessCards: data.accessCards.map((card) => card.id === id ? { ...card, active: !card.active } : card) }, "Status kartu berhasil diperbarui")} />}
          {view === "finance" && <FinanceView onBack={() => go("dashboard")} />}
          {view === "vehicles" && <VehiclesView data={data} onBack={() => go("dashboard")} onAdd={() => { setEditingVehicle(null); setModal("vehicle"); }} onEdit={(vehicle) => { setEditingVehicle(vehicle); setModal("vehicle"); }} onDelete={(id) => persist({ ...data, vehicles: data.vehicles.filter((item) => item.id !== id) }, "Kendaraan berhasil dihapus")} />}
          {view === "documents" && <DocumentsView data={data} onBack={() => go("dashboard")} onAdd={() => setModal("document")} onProcess={(id) => persist({ ...data, documents: data.documents.map((doc) => doc.id === id ? { ...doc, status: doc.status === "pending" ? "processing" : doc.status === "processing" ? "ready" : "completed" } : doc) }, "Status dokumen diperbarui")} />}
          {view === "arrears" && <ArrearsView onBack={() => go("dashboard")} onSend={(name) => setToast(`Surat peringatan dikirim kepada ${name}`)} />}
          {view === "complaints" && <ComplaintsView data={data} onBack={() => go("dashboard")} onAdd={() => setModal("complaint")} onSos={(kind) => triggerSos(kind, setToast)} />}
          {view === "residents" && <ResidentsView onBack={() => go("dashboard")} onReset={(name) => setToast(`Password ${name} telah direset`)} />}
        </div>
      </main>

      {modal && <PortalModal type={modal} data={data} editingVehicle={editingVehicle} close={() => setModal(null)} save={(next, message) => { persist(next, message); setModal(null); }} />}
      {toast && <div className="toast"><Check size={18} /><span>{toast}</span></div>}
    </div>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><Icon size={18} /><span>{item.label}</span>{active && <i />}</button>;
}

function Dashboard({ data, totalUnpaid, go }: { data: PortalState; totalUnpaid: number; go: (view: View) => void }) {
  return <>
    <section className="welcome"><div><span className="eyebrow">SELAMAT DATANG KEMBALI</span><h1>Halo, {data.profile.name.split(" ")[0]}! <span>👋</span></h1><p>Semua kebutuhan hunian Anda dalam satu portal.</p></div><div className="date-card"><span>HARI INI</span><strong>Senin, 8 Juni</strong><small>2026</small></div><div className="welcome-shape shape-one" /><div className="welcome-shape shape-two" /></section>
    <section className="stats-grid">
      <button className="stat-card" onClick={() => go("ipl")}><div className="stat-icon amber"><ReceiptText size={22} /></div><div><span>Tagihan bulan ini</span><strong>{totalUnpaid ? rupiah(totalUnpaid) : "Lunas"}</strong><small className={totalUnpaid ? "negative" : "positive"}>{totalUnpaid ? "Jatuh tempo 10 Juni" : "Semua sudah dibayar"}</small></div><ChevronRight size={18} /></button>
      <button className="stat-card" onClick={() => go("documents")}><div className="stat-icon blue"><FileCheck2 size={22} /></div><div><span>Dokumen aktif</span><strong>{data.documents.filter((doc) => doc.status !== "completed").length} Permintaan</strong><small className="positive">Sedang diproses</small></div><ChevronRight size={18} /></button>
      <button className="stat-card" onClick={() => go("complaints")}><div className="stat-icon green"><ShieldCheck size={22} /></div><div><span>Status lingkungan</span><strong>Aman & Kondusif</strong><small className="positive">Diperbarui 5 menit lalu</small></div><ChevronRight size={18} /></button>
    </section>
    <div className="section-heading"><div><h2>Layanan Warga</h2><p>Akses cepat semua kebutuhan hunian Anda</p></div><span>9 layanan tersedia</span></div>
    <section className="module-grid">{modules.map((module) => { const Icon = module.icon; return <button key={module.id} className="module-card" onClick={() => go(module.id)}><div className={`module-icon ${module.color}`}><Icon size={23} /></div><div><h3>{module.label}</h3><p>{module.description}</p></div><ChevronRight className="module-arrow" size={18} /></button>; })}</section>
    <section className="activity-panel"><div className="section-heading compact"><div><h2>Aktivitas Terbaru</h2><p>Pembaruan dari akun dan lingkungan Anda</p></div><button onClick={() => go("documents")}>Lihat semua <ChevronRight size={14} /></button></div><div className="activity-list"><Activity icon={Check} color="green" title="Pembayaran IPL berhasil" detail="IPL Mei 2026 • Rp350.000" time="20 Mei" /><Activity icon={FileText} color="blue" title="Dokumen sedang diproses" detail="Surat Pengantar Domisili" time="2 Jun" /><Activity icon={AlertTriangle} color="amber" title="Aduan telah ditindaklanjuti" detail="Lampu jalan Blok A padam" time="3 Jun" /></div></section>
  </>;
}

function Activity({ icon: Icon, color, title, detail, time }: { icon: LucideIcon; color: string; title: string; detail: string; time: string }) {
  return <div className="activity"><div className={`activity-icon ${color}`}><Icon size={17} /></div><div><strong>{title}</strong><span>{detail}</span></div><time>{time}</time></div>;
}

function ProfileView({ data, onBack, onEdit }: { data: PortalState; onBack: () => void; onEdit: () => void }) {
  return <><PageTitle title="Profil Saya" subtitle="Kelola informasi pribadi dan kontak Anda" onBack={onBack} action={<button className="primary-button" onClick={onEdit}><Pencil size={16} /> Edit profil</button>} /><div className="two-column"><section className="panel profile-card"><div className="large-avatar">BS</div><h2>{data.profile.name}</h2><p>Penghuni tetap</p><span className="unit-pill"><Home size={14} /> Blok {data.profile.unit}</span><div className="verified"><ShieldCheck size={17} /> Akun terverifikasi</div></section><section className="panel"><PanelHeader title="Informasi Kontak" subtitle="Data utama penghuni" /><InfoRows rows={[["Nama lengkap", data.profile.name], ["Email", data.profile.email], ["Nomor telepon", data.profile.phone], ["Kode unit", data.profile.unit]]} /><PanelHeader title="Kontak Darurat" subtitle="Dihubungi dalam keadaan mendesak" /><InfoRows rows={[["Nama", data.profile.emergencyName], ["Nomor telepon", data.profile.emergencyPhone]]} /></section></div></>;
}

function PropertyView({ data, onBack }: { data: PortalState; onBack: () => void }) {
  const p = data.property;
  return <><PageTitle title="Properti Saya" subtitle="Detail unit hunian yang terdaftar" onBack={onBack} /><section className="property-hero"><div className="house-art"><Home size={58} /><span>{p.block}</span></div><div><span className="eyebrow">UNIT HUNIAN</span><h2>{p.type}</h2><p>Cluster Mekar Asri • Blok {p.block}</p><span className="status-badge status-good">Aktif dihuni</span></div></section><section className="panel"><PanelHeader title="Detail Properti" subtitle="Informasi berdasarkan data pengelola" /><div className="property-specs"><Spec label="Luas tanah" value={`${p.landArea} m²`} /><Spec label="Luas bangunan" value={`${p.buildingArea} m²`} /><Spec label="Status kepemilikan" value={p.ownership} /><Spec label="Mulai menghuni" value={p.moveIn} /></div></section></>;
}

function IplView({ data, onBack, onPay }: { data: PortalState; onBack: () => void; onPay: (id: string) => void }) {
  return <><PageTitle title="Tagihan IPL" subtitle="Iuran Pengelolaan Lingkungan" onBack={onBack} /><section className="bill-summary"><div><span>Tagihan belum dibayar</span><strong>{rupiah(data.invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + i.amount, 0))}</strong><small>Bayar sebelum jatuh tempo agar layanan tetap aktif.</small></div><div className="bill-icon"><ReceiptText size={34} /></div></section><section className="panel"><PanelHeader title="Riwayat Tagihan" subtitle="Daftar tagihan IPL unit Anda" /><div className="table-wrap"><table><thead><tr><th>Periode</th><th>Jatuh tempo</th><th>Nominal</th><th>Status</th><th></th></tr></thead><tbody>{data.invoices.map((invoice) => <tr key={invoice.id}><td><strong>{invoice.month} {invoice.year}</strong></td><td>{invoice.dueDate}</td><td>{rupiah(invoice.amount)}</td><td><StatusBadge status={invoice.status} /></td><td>{invoice.status === "unpaid" && <button className="small-button" onClick={() => onPay(invoice.id)}>Bayar sekarang</button>}</td></tr>)}</tbody></table></div></section></>;
}

function AccessView({ data, onBack, onGate, onToggle }: { data: PortalState; onBack: () => void; onGate: () => void; onToggle: (id: string) => void }) {
  return <><PageTitle title="Kartu Akses" subtitle="Kelola akses gerbang perumahan" onBack={onBack} action={<button className="primary-button" onClick={onGate}><DoorOpen size={17} /> Buka gerbang</button>} /><section className="gate-card"><div className="gate-visual"><DoorOpen size={48} /></div><div><span className="eyebrow">GERBANG UTAMA</span><h2>Siap menerima perintah</h2><p>Gunakan tombol buka gerbang ketika Anda berada di dekat pintu masuk.</p>{data.gateOpenedAt && <small>Terakhir dibuka {new Date(data.gateOpenedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</small>}</div><div className="live-dot"><i /> ONLINE</div></section><div className="cards-grid">{data.accessCards.map((card) => <section className="panel access-card" key={card.id}><div className="rfid-top"><CreditCard size={24} /><StatusBadge status={card.active ? "active" : "blocked"} /></div><h3>{card.label}</h3><strong>{card.number}</strong><p>{card.holder}</p><button className={card.active ? "danger-outline" : "small-button"} onClick={() => onToggle(card.id)}>{card.active ? <><LockKeyhole size={15} /> Blokir kartu</> : "Aktifkan kartu"}</button></section>)}</div></>;
}

function FinanceView({ onBack }: { onBack: () => void }) {
  return <><PageTitle title="Laporan Keuangan" subtitle="Transparansi pengelolaan dana IPL" onBack={onBack} /><div className="finance-stats"><Metric icon={TrendingUp} color="green" label="Total pemasukan" value="Rp87.500.000" note="Juni 2026" /><Metric icon={TrendingDown} color="red" label="Total pengeluaran" value="Rp54.275.000" note="Juni 2026" /><Metric icon={WalletCards} color="blue" label="Saldo berjalan" value="Rp33.225.000" note="Per 8 Juni 2026" /></div><section className="panel"><PanelHeader title="Ringkasan Pengeluaran" subtitle="Distribusi dana lingkungan bulan ini" /><div className="budget-list"><Budget name="Keamanan & petugas" value="Rp22.500.000" width="82%" color="#2563eb" /><Budget name="Kebersihan lingkungan" value="Rp14.750.000" width="64%" color="#10b981" /><Budget name="Perawatan fasilitas" value="Rp10.225.000" width="47%" color="#f59e0b" /><Budget name="Utilitas & operasional" value="Rp6.800.000" width="31%" color="#8b5cf6" /></div></section></>;
}

function VehiclesView({ data, onBack, onAdd, onEdit, onDelete }: { data: PortalState; onBack: () => void; onAdd: () => void; onEdit: (v: Vehicle) => void; onDelete: (id: string) => void }) {
  return <><PageTitle title="Kendaraan" subtitle="Daftar kendaraan yang memiliki akses masuk" onBack={onBack} action={<button className="primary-button" onClick={onAdd}><Plus size={17} /> Tambah kendaraan</button>} /><div className="cards-grid">{data.vehicles.map((vehicle) => <section className="panel vehicle-card" key={vehicle.id}><div className={`vehicle-icon ${vehicle.type === "Mobil" ? "blue" : "violet"}`}>{vehicle.type === "Mobil" ? <Car size={27} /> : <Bike size={27} />}</div><div className="vehicle-info"><span>{vehicle.type}</span><h3>{vehicle.plate}</h3><p>{vehicle.brand} • {vehicle.color}</p></div><div className="row-actions"><button onClick={() => onEdit(vehicle)}><Pencil size={16} /></button><button className="danger" onClick={() => onDelete(vehicle.id)}><Trash2 size={16} /></button></div></section>)}</div>{!data.vehicles.length && <Empty icon={Car} text="Belum ada kendaraan terdaftar" />}</>;
}

function DocumentsView({ data, onBack, onAdd, onProcess }: { data: PortalState; onBack: () => void; onAdd: () => void; onProcess: (id: string) => void }) {
  return <><PageTitle title="Permintaan Dokumen" subtitle="Ajukan dan pantau surat pengantar Anda" onBack={onBack} action={<button className="primary-button" onClick={onAdd}><Plus size={17} /> Ajukan dokumen</button>} /><section className="panel"><div className="table-wrap"><table><thead><tr><th>Jenis dokumen</th><th>Tanggal pengajuan</th><th>Status</th><th>Tindakan</th></tr></thead><tbody>{data.documents.map((doc) => <tr key={doc.id}><td><div className="table-title"><FileText size={18} /><strong>{doc.type}</strong></div></td><td>{doc.submitted}</td><td><StatusBadge status={doc.status} /></td><td>{doc.status !== "completed" ? <button className="small-button" onClick={() => onProcess(doc.id)}>{doc.status === "ready" ? "Selesaikan" : "Proses berikutnya"}</button> : <span className="muted">Tuntas</span>}</td></tr>)}</tbody></table></div></section></>;
}

const arrears = [{ name: "Agus Pranoto", unit: "C-07", months: 3, total: 1050000 }, { name: "Rina Kartika", unit: "D-12", months: 2, total: 700000 }, { name: "Fajar Nugraha", unit: "B-04", months: 1, total: 350000 }];
function ArrearsView({ onBack, onSend }: { onBack: () => void; onSend: (name: string) => void }) {
  return <><PageTitle title="Penunggak IPL" subtitle="Monitoring pembayaran warga • Akses administrator" onBack={onBack} /><div className="admin-notice"><ShieldCheck size={20} /><div><strong>Mode Administrator</strong><span>Data bersifat terbatas dan hanya digunakan untuk kepentingan pengelolaan.</span></div></div><section className="panel"><div className="table-tools"><div className="search"><Search size={17} /><input placeholder="Cari nama atau unit…" /></div><span>{arrears.length} warga ditemukan</span></div><div className="table-wrap"><table><thead><tr><th>Nama penghuni</th><th>Unit</th><th>Tunggakan</th><th>Total</th><th></th></tr></thead><tbody>{arrears.map((row) => <tr key={row.unit}><td><strong>{row.name}</strong></td><td><span className="unit-code">{row.unit}</span></td><td>{row.months} bulan</td><td><strong className="red-text">{rupiah(row.total)}</strong></td><td><button className="danger-outline" onClick={() => onSend(row.name)}><Send size={14} /> Kirim SP</button></td></tr>)}</tbody></table></div></section></>;
}

function ComplaintsView({ data, onBack, onAdd, onSos }: { data: PortalState; onBack: () => void; onAdd: () => void; onSos: (kind: string) => void }) {
  return <><PageTitle title="Aduan & SOS" subtitle="Laporkan masalah lingkungan atau kondisi darurat" onBack={onBack} action={<button className="primary-button" onClick={onAdd}><Plus size={17} /> Buat aduan</button>} /><section className="sos-panel"><div><span className="eyebrow">LAYANAN DARURAT 24 JAM</span><h2>Butuh bantuan segera?</h2><p>Tekan tombol sesuai kondisi. Sirene pos keamanan akan diaktifkan.</p></div><div className="sos-buttons"><button onClick={() => onSos("Kebakaran")}><Flame size={24} /><span><strong>KEBAKARAN</strong><small>Aktifkan alarm api</small></span></button><button onClick={() => onSos("Pencurian")}><Siren size={24} /><span><strong>PENCURIAN</strong><small>Panggil keamanan</small></span></button></div></section><section className="panel"><PanelHeader title="Riwayat Aduan" subtitle="Laporan yang pernah Anda kirim" />{data.complaints.map((item) => <div className="complaint-row" key={item.id}><div className="complaint-icon"><AlertTriangle size={19} /></div><div><span>{item.category}</span><strong>{item.title}</strong><small>{item.date}</small></div><StatusBadge status={item.status} /></div>)}</section></>;
}

const residents = [{ name: "Budi Santoso", unit: "A-01", phone: "0812 3456 7890", status: "Aktif" }, { name: "Nadia Putri", unit: "A-02", phone: "0817 2244 9031", status: "Aktif" }, { name: "Rangga Wijaya", unit: "B-03", phone: "0857 4452 1020", status: "Aktif" }, { name: "Fajar Nugraha", unit: "B-04", phone: "0821 3388 0712", status: "Perlu verifikasi" }];
function ResidentsView({ onBack, onReset }: { onBack: () => void; onReset: (name: string) => void }) {
  return <><PageTitle title="Data Warga" subtitle="Kelola akun penghuni yang terdaftar" onBack={onBack} /><section className="panel"><div className="table-tools"><div className="search"><Search size={17} /><input placeholder="Cari nama, telepon, atau unit…" /></div><button className="filter-button">Semua status <ChevronDown size={14} /></button></div><div className="table-wrap"><table><thead><tr><th>Penghuni</th><th>Unit</th><th>Nomor telepon</th><th>Status</th><th></th></tr></thead><tbody>{residents.map((resident) => <tr key={resident.unit}><td><div className="resident-cell"><div className="mini-avatar">{resident.name.split(" ").map((n) => n[0]).join("")}</div><strong>{resident.name}</strong></div></td><td><span className="unit-code">{resident.unit}</span></td><td>{resident.phone}</td><td><StatusBadge status={resident.status === "Aktif" ? "active" : "pending"} /></td><td><button className="small-button subtle" onClick={() => onReset(resident.name)}><LockKeyhole size={14} /> Reset password</button></td></tr>)}</tbody></table></div></section></>;
}

function PortalModal({ type, data, editingVehicle, close, save }: { type: Exclude<Modal, null>; data: PortalState; editingVehicle: Vehicle | null; close: () => void; save: (next: PortalState, message: string) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (type === "vehicle") {
      const vehicle: Vehicle = { id: editingVehicle?.id ?? `veh-${Date.now()}`, plate: String(form.get("plate")), type: String(form.get("type")) as Vehicle["type"], brand: String(form.get("brand")), color: String(form.get("color")) };
      const vehicles = editingVehicle ? data.vehicles.map((v) => v.id === vehicle.id ? vehicle : v) : [...data.vehicles, vehicle];
      save({ ...data, vehicles }, editingVehicle ? "Data kendaraan diperbarui" : "Kendaraan berhasil ditambahkan");
    } else if (type === "document") {
      save({ ...data, documents: [{ id: `doc-${Date.now()}`, type: String(form.get("documentType")), submitted: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }), status: "pending" }, ...data.documents] }, "Permintaan dokumen berhasil diajukan");
    } else if (type === "complaint") {
      save({ ...data, complaints: [{ id: `cmp-${Date.now()}`, category: String(form.get("category")), title: String(form.get("title")), date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }), status: "Diterima" }, ...data.complaints] }, "Aduan berhasil dikirim");
    } else {
      save({ ...data, profile: { ...data.profile, name: String(form.get("name")), email: String(form.get("email")), phone: String(form.get("phone")), emergencyName: String(form.get("emergencyName")), emergencyPhone: String(form.get("emergencyPhone")) } }, "Profil berhasil diperbarui");
    }
  }
  const titles = { vehicle: editingVehicle ? "Edit Kendaraan" : "Tambah Kendaraan", document: "Ajukan Dokumen", complaint: "Buat Aduan", profile: "Edit Profil" };
  return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><div><h2>{titles[type]}</h2><p>Lengkapi data di bawah ini</p></div><button onClick={close}><X size={20} /></button></div><form onSubmit={submit}>
    {type === "vehicle" && <><Field label="Nomor polisi" name="plate" defaultValue={editingVehicle?.plate} placeholder="B 1234 XYZ" /><div className="form-row"><SelectField label="Jenis" name="type" defaultValue={editingVehicle?.type} options={["Mobil", "Motor"]} /><Field label="Warna" name="color" defaultValue={editingVehicle?.color} placeholder="Putih" /></div><Field label="Merek & tipe" name="brand" defaultValue={editingVehicle?.brand} placeholder="Toyota Avanza" /></>}
    {type === "document" && <><SelectField label="Jenis dokumen" name="documentType" options={["Surat Pengantar Domisili", "Surat Pengantar SKCK", "Surat Keterangan Usaha", "Surat Pengantar Nikah"]} /><label className="field"><span>Keperluan</span><textarea required name="purpose" placeholder="Jelaskan keperluan pengajuan…" /></label></>}
    {type === "complaint" && <><SelectField label="Kategori" name="category" options={["Lingkungan", "Fasilitas", "Keamanan", "Kebersihan", "Lainnya"]} /><Field label="Judul laporan" name="title" placeholder="Tuliskan masalah secara singkat" /><label className="field"><span>Detail laporan</span><textarea required name="detail" placeholder="Jelaskan lokasi dan kondisi yang ditemukan…" /></label></>}
    {type === "profile" && <><Field label="Nama lengkap" name="name" defaultValue={data.profile.name} /><Field label="Email" name="email" type="email" defaultValue={data.profile.email} /><Field label="Nomor telepon" name="phone" defaultValue={data.profile.phone} /><div className="form-divider">Kontak darurat</div><Field label="Nama kontak" name="emergencyName" defaultValue={data.profile.emergencyName} /><Field label="Nomor kontak" name="emergencyPhone" defaultValue={data.profile.emergencyPhone} /></>}
    <div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Batal</button><button type="submit" className="primary-button">Simpan perubahan</button></div>
  </form></div></div>;
}

function Field({ label, name, defaultValue, placeholder, type = "text" }: { label: string; name: string; defaultValue?: string; placeholder?: string; type?: string }) { return <label className="field"><span>{label}</span><input required name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} /></label>; }
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: string[] }) { return <label className="field"><span>{label}</span><select required name={name} defaultValue={defaultValue}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) { return <div className="panel-header"><div><h2>{title}</h2><p>{subtitle}</p></div></div>; }
function InfoRows({ rows }: { rows: string[][] }) { return <div className="info-rows">{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>; }
function Spec({ label, value }: { label: string; value: string }) { return <div className="spec"><span>{label}</span><strong>{value}</strong></div>; }
function Metric({ icon: Icon, color, label, value, note }: { icon: LucideIcon; color: string; label: string; value: string; note: string }) { return <div className="metric panel"><div className={`stat-icon ${color}`}><Icon size={22} /></div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>; }
function Budget({ name, value, width, color }: { name: string; value: string; width: string; color: string }) { return <div className="budget"><div><strong>{name}</strong><span>{value}</span></div><div className="bar"><i style={{ width, background: color }} /></div></div>; }

function triggerSos(kind: string, notify: (message: string) => void) {
  try {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain); gain.connect(context.destination); oscillator.type = "sawtooth"; oscillator.frequency.setValueAtTime(620, context.currentTime); oscillator.frequency.linearRampToValueAtTime(920, context.currentTime + 0.7); gain.gain.setValueAtTime(0.12, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.5); oscillator.start(); oscillator.stop(context.currentTime + 1.5);
  } catch { /* Audio is optional. */ }
  notify(`SOS ${kind} aktif — petugas keamanan telah diberi tahu`);
}
