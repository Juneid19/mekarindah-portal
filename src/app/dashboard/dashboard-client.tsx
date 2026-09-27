"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PropertyTab, InvoicesTab, FinanceTab, CardsTab, BulkUnitsTab } from "@/components/admin-tabs";

type Role = "resident" | "admin";

type User = { id: string; name: string; email: string; unit: string; role: Role };
type Profile = User & { phone: string; block: string; emergencyName: string; emergencyPhone: string };
type Invoice = { id: string; month: string; year: number; amount: number; status: "paid" | "unpaid"; dueDate: string };
type Vehicle = { id: string; plate: string; type: "Mobil" | "Motor"; brand: string; color: string };
type DocumentItem = { id: string; type: string; submitted: string; status: "pending" | "processing" | "ready" | "completed" };
type Complaint = { id: string; category: string; title: string; date: string; status: "Diterima" | "Diproses" | "Selesai" };
type Card = { id: string; label: string; number: string; holder: string; active: boolean };
type AdminResident = { id: string; name: string; email: string; unit: string; phone: string; role: Role };

type Snapshot = {
  profile: Profile;
  invoices: Invoice[];
  vehicles: Vehicle[];
  documents: DocumentItem[];
  complaints: Complaint[];
  accessCards: Card[];
  gateOpenedAt: string | null;
};

type View = "dashboard" | "profile" | "property" | "ipl" | "access" | "finance" | "vehicles" | "documents" | "arrears" | "complaints" | "residents" | "adminProperty" | "adminIpl" | "adminFinance" | "adminCards" | "adminBulkUnits";
type Modal = "profile" | "vehicle" | "document" | "complaint" | null;

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");
const todayLabel = () => new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const formatDateTime = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
const initials = (name: string) => name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

const navItems: { id: View; label: string; adminOnly?: boolean }[] = [
  { id: "dashboard", label: "Beranda" },
  { id: "profile", label: "Profil Saya" },
  { id: "property", label: "Properti" },
  { id: "ipl", label: "Tagihan IPL" },
  { id: "access", label: "Kartu Akses" },
  { id: "finance", label: "Laporan Keuangan" },
  { id: "vehicles", label: "Kendaraan" },
  { id: "documents", label: "Permintaan Dokumen" },
  { id: "arrears", label: "Penunggak IPL", adminOnly: true },
  { id: "complaints", label: "Aduan & SOS" },
  { id: "residents", label: "Data Warga", adminOnly: true },
  { id: "adminProperty", label: "Properti Unit", adminOnly: true },
  { id: "adminIpl", label: "Buat Tagihan IPL", adminOnly: true },
  { id: "adminFinance", label: "Kelola Keuangan", adminOnly: true },
  { id: "adminCards", label: "Kelola Kartu Akses", adminOnly: true },
  { id: "adminBulkUnits", label: "Generator Unit Massal", adminOnly: true },
];

const moduleCards = [
  { id: "profile" as View, label: "Profil Saya", color: "blue", glyph: "👤", desc: "Kelola data diri & kontak darurat" },
  { id: "property" as View, label: "Properti", color: "emerald", glyph: "🏠", desc: "Informasi rumah dan kepemilikan" },
  { id: "ipl" as View, label: "Tagihan IPL", color: "amber", glyph: "🧾", desc: "Cek dan bayar tagihan bulanan" },
  { id: "access" as View, label: "Kartu Akses", color: "violet", glyph: "💳", desc: "Kelola kartu RFID & akses gerbang" },
  { id: "finance" as View, label: "Laporan Keuangan", color: "cyan", glyph: "💰", desc: "Transparansi dana lingkungan" },
  { id: "vehicles" as View, label: "Kendaraan", color: "indigo", glyph: "🚗", desc: "Daftar kendaraan penghuni" },
  { id: "documents" as View, label: "Permintaan Dokumen", color: "rose", glyph: "📄", desc: "Ajukan surat secara online" },
  { id: "arrears" as View, label: "Penunggak IPL", color: "orange", glyph: "📋", desc: "Pantau tunggakan pembayaran" },
  { id: "complaints" as View, label: "Aduan & SOS", color: "red", glyph: "🚨", desc: "Sampaikan laporan & kondisi darurat" },
];

const statusLabels: Record<string, string> = { paid: "Lunas", unpaid: "Belum bayar", pending: "Menunggu", processing: "Diproses", ready: "Siap diambil", completed: "Selesai", active: "Aktif", blocked: "Diblokir", Diterima: "Diterima", Diproses: "Diproses", Selesai: "Selesai" };

export default function DashboardClient({ initialUser }: { initialUser: User }) {
  const router = useRouter();
  const [data, setData] = useState<Snapshot | null>(null);
  const [adminResidents, setAdminResidents] = useState<AdminResident[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/data", { cache: "no-store" });
      if (!response.ok) throw new Error("fetch failed");
      const next = (await response.json()) as Snapshot;
      setData(next);
    } catch {
      showToast("Tidak dapat memuat data, coba lagi");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchAdminResidents = useCallback(async () => {
    if (initialUser.role !== "admin") return;
    try {
      const response = await fetch("/api/admin/residents", { cache: "no-store" });
      if (response.ok) setAdminResidents((await response.json()) as AdminResident[]);
    } catch { /* ignore */ }
  }, [initialUser.role]);

  useEffect(() => { fetchData(); fetchAdminResidents(); }, [fetchData, fetchAdminResidents]);

  const go = useCallback((next: View) => {
    setView(next);
    setSidebarOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function apiCall(input: string, init?: RequestInit, successMessage?: string) {
    try {
      const response = await fetch(input, init);
      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { message?: string };
        showToast(err.message ?? "Aksi gagal");
        return null;
      }
      const result = (await response.json().catch(() => ({}))) as Record<string, unknown> | null;
      if (successMessage) showToast(successMessage);
      await fetchData();
      if (initialUser.role === "admin" && input.startsWith("/api/admin/")) await fetchAdminResidents();
      return result;
    } catch {
      showToast("Tidak dapat terhubung ke server");
      return null;
    }
  }

  if (loading || !data) {
    return (
      <main className="dash-loading">
        <div className="dash-loading-card">Memuat data portal…</div>
        <style>{`html,body{background:#f5f7fb}.dash-loading{min-height:100vh;display:grid;place-items:center;font-family:'Segoe UI',Arial,sans-serif;color:#718096}.dash-loading-card{padding:30px 40px;border-radius:14px;background:white;box-shadow:0 12px 30px rgba(20,35,60,.06);font-size:13px}`}</style>
      </main>
    );
  }

  const visibleNav = navItems.filter((item) => !item.adminOnly || initialUser.role === "admin");
  const totalUnpaid = data.invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + i.amount, 0);
  const pageTitle = navItems.find((item) => item.id === view)?.label ?? "Portal";

  return (
    <div className="dash-shell">
      <aside className={`dash-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="dash-brand">
          <div className="dash-brand-mark">🏘</div>
          <div><strong>MEKARINDAH</strong><span>PORTAL WARGA</span></div>
          <button className="dash-close" onClick={() => setSidebarOpen(false)} aria-label="Tutup">✕</button>
        </div>
        <nav className="dash-nav">
          <p className="dash-nav-label">MENU UTAMA</p>
          {visibleNav.slice(0, 7).map((item) => (
            <button key={item.id} className={`dash-nav-item ${view === item.id ? "active" : ""}`} onClick={() => go(item.id)}>{item.label}</button>
          ))}
          <p className="dash-nav-label spaced">LAYANAN</p>
          {visibleNav.filter((i) => ["documents", "arrears", "complaints"].includes(i.id)).map((item) => (
            <button key={item.id} className={`dash-nav-item ${view === item.id ? "active" : ""}`} onClick={() => go(item.id)}>{item.label}</button>
          ))}
          {initialUser.role === "admin" && (
            <>
              <p className="dash-nav-label spaced">ADMINISTRATOR</p>
              <button className={`dash-nav-item ${view === "residents" ? "active" : ""}`} onClick={() => go("residents")}>Data Warga</button>
              <button className={`dash-nav-item ${view === "adminProperty" ? "active" : ""}`} onClick={() => go("adminProperty")}>Properti Unit</button>
              <button className={`dash-nav-item ${view === "adminIpl" ? "active" : ""}`} onClick={() => go("adminIpl")}>Buat Tagihan IPL</button>
              <button className={`dash-nav-item ${view === "adminFinance" ? "active" : ""}`} onClick={() => go("adminFinance")}>Kelola Keuangan</button>
              <button className={`dash-nav-item ${view === "adminCards" ? "active" : ""}`} onClick={() => go("adminCards")}>Kelola Kartu Akses</button>
              <button className={`dash-nav-item ${view === "adminBulkUnits" ? "active" : ""}`} onClick={() => go("adminBulkUnits")}>Generator Unit</button>
            </>
          )}
        </nav>
        <div className="dash-user">
          <div className="dash-avatar">{initials(data.profile.name)}</div>
          <div>
            <strong>{data.profile.name}</strong>
            <span>{initialUser.role === "admin" ? "Administrator" : `Penghuni • ${data.profile.unit}`}</span>
          </div>
          <button className="dash-logout" onClick={logout} aria-label="Keluar">⏻</button>
        </div>
      </aside>
      {sidebarOpen && <button className="dash-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu" />}

      <main className="dash-main">
        <header className="dash-topbar">
          <button className="dash-menu" onClick={() => setSidebarOpen(true)} aria-label="Menu">☰</button>
          <div className="dash-crumb"><span>Portal Warga</span><span className="dash-crumb-sep">›</span><strong>{pageTitle}</strong></div>
          <div className="dash-top-meta">
            <span className="dash-pill">{initialUser.role === "admin" ? "ADMIN" : `UNIT ${data.profile.unit}`}</span>
            <div className="dash-avatar small">{initials(data.profile.name)}</div>
          </div>
        </header>

        <div className="dash-content">
          {view === "dashboard" && <DashboardView data={data} totalUnpaid={totalUnpaid} go={go} isAdmin={initialUser.role === "admin"} />}
          {view === "profile" && <ProfileView data={data} onEdit={() => setModal("profile")} />}
          {view === "property" && <PropertyView data={data} />}
          {view === "ipl" && <IplView data={data} onPay={(id) => apiCall(`/api/invoices/${id}/pay`, { method: "POST" }, "Pembayaran berhasil dikonfirmasi")} />}
          {view === "access" && <AccessView data={data} onGate={() => apiCall("/api/access", { method: "POST" }, "Gerbang utama berhasil dibuka")} onToggle={(id) => apiCall("/api/access", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }, "Status kartu diperbarui")} />}
          {view === "finance" && <FinanceView />}
          {view === "vehicles" && <VehiclesView data={data} onAdd={() => { setEditingVehicle(null); setModal("vehicle"); }} onEdit={(v) => { setEditingVehicle(v); setModal("vehicle"); }} onDelete={(id) => apiCall(`/api/vehicles/${id}`, { method: "DELETE" }, "Kendaraan dihapus")} />}
          {view === "documents" && <DocumentsView data={data} onAdd={() => setModal("document")} onProcess={(id) => apiCall(`/api/documents/${id}/process`, { method: "POST" }, "Status dokumen diperbarui")} />}
          {view === "arrears" && <ArrearsView />}
          {view === "complaints" && <ComplaintsView data={data} onAdd={() => setModal("complaint")} onSos={(kind) => { apiCall("/api/complaints", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }) }, `SOS ${kind} aktif — petugas keamanan diberi tahu`); triggerSos(kind); }} />}
          {view === "adminProperty" && initialUser.role === "admin" && <PropertyTab residents={adminResidents} onSaved={fetchAdminResidents} />}
          {view === "adminIpl" && initialUser.role === "admin" && <InvoicesTab residents={adminResidents} />}
          {view === "adminFinance" && initialUser.role === "admin" && <FinanceTab />}
          {view === "adminCards" && initialUser.role === "admin" && <CardsTab residents={adminResidents} />}
          {view === "adminBulkUnits" && initialUser.role === "admin" && <BulkUnitsTab />}
          {view === "residents" && initialUser.role === "admin" && <ResidentsView residents={adminResidents} onReset={(id, name) => apiCall("/api/admin/residents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }, `Password ${name} direset ke default`)} />}
        </div>
      </main>

      {modal && (
        <Modal type={modal} data={data} editingVehicle={editingVehicle} onClose={() => setModal(null)} onSubmit={async (payload, message) => {
          if (modal === "profile") return apiCall("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, message);
          if (modal === "vehicle") {
            if (editingVehicle) return apiCall(`/api/vehicles/${editingVehicle.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, message);
            return apiCall("/api/vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, message);
          }
          if (modal === "document") return apiCall("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, message);
          if (modal === "complaint") return apiCall("/api/complaints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, message);
          return null;
        }} />
      )}

      {toast && <div className="dash-toast">{toast}</div>}

      <style>{styles}</style>
    </div>
  );
}

function statusBadge(status: string) {
  const good = ["paid", "completed", "Selesai", "active"].includes(status);
  const warn = ["processing", "ready", "Diproses"].includes(status);
  const cls = good ? "good" : warn ? "warn" : "bad";
  return <span className={`dash-badge ${cls}`}>{statusLabels[status] ?? status}</span>;
}

function PageTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="dash-page-title"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function Modal({ type, data, editingVehicle, onClose, onSubmit }: { type: NonNullable<Modal>; data: Snapshot; editingVehicle: Vehicle | null; onClose: () => void; onSubmit: (payload: Record<string, unknown>, message: string) => Promise<unknown> }) {
  const [submitting, setSubmitting] = useState(false);
  async function handle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};
    form.forEach((value, key) => { payload[key] = value; });
    const messageMap: Record<NonNullable<Modal>, string> = {
      profile: "Profil diperbarui",
      vehicle: editingVehicle ? "Data kendaraan diperbarui" : "Kendaraan ditambahkan",
      document: "Permintaan dokumen diajukan",
      complaint: "Aduan dikirim",
    };
    await onSubmit(payload, messageMap[type]);
    setSubmitting(false);
    onClose();
  }

  const titles: Record<NonNullable<Modal>, string> = { profile: "Edit Profil", vehicle: editingVehicle ? "Edit Kendaraan" : "Tambah Kendaraan", document: "Ajukan Dokumen", complaint: "Buat Aduan" };

  return (
    <div className="dash-modal-backdrop" onMouseDown={onClose}>
      <div className="dash-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="dash-modal-head"><h2>{titles[type]}</h2><button onClick={onClose} aria-label="Tutup">✕</button></div>
        <form onSubmit={handle}>
          {type === "profile" && (
            <>
              <Field label="Nama lengkap" name="name" defaultValue={data.profile.name} />
              <Field label="Nomor telepon" name="phone" defaultValue={data.profile.phone} />
              <div className="dash-divider">Kontak darurat</div>
              <Field label="Nama kontak" name="emergencyName" defaultValue={data.profile.emergencyName} />
              <Field label="Nomor kontak" name="emergencyPhone" defaultValue={data.profile.emergencyPhone} />
            </>
          )}
          {type === "vehicle" && (
            <>
              <Field label="Nomor polisi" name="plate" defaultValue={editingVehicle?.plate} placeholder="B 1234 XYZ" />
              <div className="dash-form-row">
                <SelectField label="Jenis" name="type" defaultValue={editingVehicle?.type ?? "Mobil"} options={["Mobil", "Motor"]} />
                <Field label="Warna" name="color" defaultValue={editingVehicle?.color} placeholder="Putih" />
              </div>
              <Field label="Merek & tipe" name="brand" defaultValue={editingVehicle?.brand} placeholder="Toyota Avanza" />
            </>
          )}
          {type === "document" && (
            <SelectField label="Jenis dokumen" name="type" options={["Surat Pengantar Domisili", "Surat Pengantar SKCK", "Surat Keterangan Usaha", "Surat Pengantar Nikah"]} />
          )}
          {type === "complaint" && (
            <>
              <SelectField label="Kategori" name="category" defaultValue="Lingkungan" options={["Lingkungan", "Fasilitas", "Keamanan", "Kebersihan", "Lainnya"]} />
              <Field label="Judul laporan" name="title" placeholder="Tuliskan masalah…" />
              <FieldArea label="Detail" name="detail" placeholder="Jelaskan lokasi dan kondisi…" />
            </>
          )}
          <div className="dash-modal-actions">
            <button type="button" className="dash-btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="dash-btn-primary" disabled={submitting}>{submitting ? "Menyimpan…" : "Simpan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, defaultValue, placeholder, type = "text" }: { label: string; name: string; defaultValue?: string; placeholder?: string; type?: string }) {
  return <label className="dash-field"><span>{label}</span><input required type={type} name={name} defaultValue={defaultValue} placeholder={placeholder} /></label>;
}
function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: string[] }) {
  return <label className="dash-field"><span>{label}</span><select required name={name} defaultValue={defaultValue}>{options.map((o) => <option key={o}>{o}</option>)}</select></label>;
}
function FieldArea({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return <label className="dash-field"><span>{label}</span><textarea required name={name} placeholder={placeholder} /></label>;
}

function triggerSos(kind: string) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(920, ctx.currentTime + 0.7);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.start(); osc.stop(ctx.currentTime + 1.5);
  } catch { /* ignore */ }
}

/* ---------- Views ---------- */
function DashboardView({ data, totalUnpaid, go, isAdmin }: { data: Snapshot; totalUnpaid: number; go: (v: View) => void; isAdmin: boolean }) {
  const docsActive = data.documents.filter((d) => d.status !== "completed").length;
  return (
    <>
      <section className="dash-welcome">
        <div>
          <span className="dash-eyebrow">SELAMAT DATANG KEMBALI</span>
          <h1>Halo, {data.profile.name.split(" ")[0]}! <span>👋</span></h1>
          <p>Semua kebutuhan hunian Anda dalam satu portal.</p>
        </div>
        <div className="dash-date-card"><span>HARI INI</span><strong>{todayLabel()}</strong></div>
      </section>
      <section className="dash-stats">
        <button className="dash-stat" onClick={() => go("ipl")}>
          <div className="dash-stat-icon amber">🧾</div>
          <div><span>Tagihan bulan ini</span><strong>{totalUnpaid ? rupiah(totalUnpaid) : "Lunas"}</strong><small className={totalUnpaid ? "negative" : "positive"}>{totalUnpaid ? "Bayar sebelum jatuh tempo" : "Semua sudah dibayar"}</small></div>
        </button>
        <button className="dash-stat" onClick={() => go("documents")}>
          <div className="dash-stat-icon blue">📄</div>
          <div><span>Dokumen aktif</span><strong>{docsActive} Permintaan</strong><small className="positive">Sedang diproses</small></div>
        </button>
        <button className="dash-stat" onClick={() => go("complaints")}>
          <div className="dash-stat-icon green">🛡</div>
          <div><span>Status lingkungan</span><strong>Aman & Kondusif</strong><small className="positive">Terhubung ke server</small></div>
        </button>
      </section>
      <div className="dash-section-head"><div><h2>Layanan Warga</h2><p>Akses cepat semua kebutuhan</p></div><span>9 modul tersedia</span></div>
      <section className="dash-modules">
        {moduleCards.filter((m) => !["arrears"].includes(m.id) || isAdmin).map((m) => (
          <button key={m.id} className="dash-module" onClick={() => go(m.id)}>
            <div className={`dash-module-icon ${m.color}`}>{m.glyph}</div>
            <div><h3>{m.label}</h3><p>{m.desc}</p></div>
          </button>
        ))}
      </section>
    </>
  );
}

function ProfileView({ data, onEdit }: { data: Snapshot; onEdit: () => void }) {
  return (
    <>
      <PageTitle title="Profil Saya" subtitle="Kelola informasi pribadi dan kontak Anda" action={<button className="dash-btn-primary" onClick={onEdit}>✎ Edit profil</button>} />
      <div className="dash-two-col">
        <section className="dash-panel profile-card">
          <div className="dash-big-avatar">{initials(data.profile.name)}</div>
          <h2>{data.profile.name}</h2>
          <p>{data.profile.role === "admin" ? "Administrator" : "Penghuni tetap"}</p>
          <span className="dash-pill">UNIT {data.profile.unit}</span>
          <div className="dash-verified">✓ Akun terverifikasi • Disimpan di server</div>
        </section>
        <section className="dash-panel">
          <div className="dash-panel-head"><h2>Informasi Kontak</h2><p>Data utama akun Anda</p></div>
          <InfoGrid rows={[["Nama lengkap", data.profile.name], ["Email", data.profile.email], ["Nomor telepon", data.profile.phone || "—"], ["Kode unit", data.profile.unit]]} />
          <div className="dash-panel-head" style={{ marginTop: 22 }}><h2>Kontak Darurat</h2><p>Dihubungi dalam keadaan mendesak</p></div>
          <InfoGrid rows={[["Nama", data.profile.emergencyName || "—"], ["Nomor telepon", data.profile.emergencyPhone || "—"]]} />
        </section>
      </div>
    </>
  );
}

function PropertyView({ data }: { data: Snapshot }) {
  return (
    <>
      <PageTitle title="Properti Saya" subtitle="Detail unit hunian yang terdaftar" />
      <section className="dash-property-hero">
        <div className="dash-house-art"><span style={{ fontSize: 48 }}>🏠</span><span>Blok {data.profile.block}</span></div>
        <div>
          <span className="dash-eyebrow">UNIT HUNIAN</span>
          <h2>Tipe Asri 72/120</h2>
          <p>Cluster Mekar Asri • Blok {data.profile.block}</p>
          <span className="dash-badge good">Aktif dihuni</span>
        </div>
      </section>
      <section className="dash-panel">
        <div className="dash-panel-head"><h2>Detail Properti</h2><p>Informasi berdasarkan data pengelola</p></div>
        <div className="dash-specs">
          <Spec label="Luas tanah" value="120 m²" />
          <Spec label="Luas bangunan" value="72 m²" />
          <Spec label="Status kepemilikan" value="Hak Milik" />
          <Spec label="Mulai menghuni" value="12 Agustus 2022" />
        </div>
      </section>
    </>
  );
}

function IplView({ data, onPay }: { data: Snapshot; onPay: (id: string) => void }) {
  const unpaid = data.invoices.filter((i) => i.status === "unpaid");
  const total = unpaid.reduce((s, i) => s + i.amount, 0);
  return (
    <>
      <PageTitle title="Tagihan IPL" subtitle="Iuran Pengelolaan Lingkungan" />
      <section className="dash-bill">
        <div>
          <span>Tagihan belum dibayar</span>
          <strong>{rupiah(total)}</strong>
          <small>Bayar sebelum jatuh tempo agar layanan tetap aktif.</small>
        </div>
        <div className="dash-bill-icon">🧾</div>
      </section>
      <section className="dash-panel">
        <div className="dash-panel-head"><h2>Riwayat Tagihan</h2><p>Data tersimpan di server</p></div>
        <div className="dash-table-wrap"><table>
          <thead><tr><th>Periode</th><th>Jatuh tempo</th><th>Nominal</th><th>Status</th><th></th></tr></thead>
          <tbody>{data.invoices.map((i) => <tr key={i.id}><td><strong>{i.month} {i.year}</strong></td><td>{i.dueDate}</td><td>{rupiah(i.amount)}</td><td>{statusBadge(i.status)}</td><td>{i.status === "unpaid" && <button className="dash-btn-small" onClick={() => onPay(i.id)}>Bayar sekarang</button>}</td></tr>)}</tbody>
        </table></div>
      </section>
    </>
  );
}

function AccessView({ data, onGate, onToggle }: { data: Snapshot; onGate: () => void; onToggle: (id: string) => void }) {
  return (
    <>
      <PageTitle title="Kartu Akses" subtitle="Kelola akses gerbang perumahan" action={<button className="dash-btn-primary" onClick={onGate}>🚪 Buka gerbang</button>} />
      <section className="dash-gate-card">
        <div className="dash-gate-visual">🚪</div>
        <div>
          <span className="dash-eyebrow">GERBANG UTAMA</span>
          <h2>Siap menerima perintah</h2>
          <p>Setiap pembukaan tercatat di server untuk audit.</p>
          {data.gateOpenedAt && <small>Terakhir dibuka {formatDateTime(data.gateOpenedAt)}</small>}
        </div>
        <div className="dash-live-dot"><i /> ONLINE</div>
      </section>
      <div className="dash-cards-grid">
        {data.accessCards.map((c) => (
          <section key={c.id} className="dash-panel dash-access-card">
            <div className="dash-rfid-top"><span style={{ fontSize: 22 }}>💳</span>{statusBadge(c.active ? "active" : "blocked")}</div>
            <h3>{c.label}</h3>
            <strong>{c.number}</strong>
            <p>{c.holder || data.profile.name}</p>
            <button className={c.active ? "dash-btn-danger-outline" : "dash-btn-small"} onClick={() => onToggle(c.id)}>{c.active ? "🔒 Blokir kartu" : "Aktifkan kartu"}</button>
          </section>
        ))}
      </div>
    </>
  );
}

function FinanceView() {
  return (
    <>
      <PageTitle title="Laporan Keuangan" subtitle="Transparansi pengelolaan dana IPL" />
      <div className="dash-finance-stats">
        <Metric icon="📈" color="green" label="Total pemasukan" value="Rp87.500.000" note="Juni 2026" />
        <Metric icon="📉" color="red" label="Total pengeluaran" value="Rp54.275.000" note="Juni 2026" />
        <Metric icon="💰" color="blue" label="Saldo berjalan" value="Rp33.225.000" note="Per 8 Juni 2026" />
      </div>
      <section className="dash-panel">
        <div className="dash-panel-head"><h2>Ringkasan Pengeluaran</h2><p>Distribusi dana lingkungan bulan ini</p></div>
        <div className="dash-budget-list">
          <BudgetRow name="Keamanan & petugas" value="Rp22.500.000" width="82%" color="#2563eb" />
          <BudgetRow name="Kebersihan lingkungan" value="Rp14.750.000" width="64%" color="#10b981" />
          <BudgetRow name="Perawatan fasilitas" value="Rp10.225.000" width="47%" color="#f59e0b" />
          <BudgetRow name="Utilitas & operasional" value="Rp6.800.000" width="31%" color="#8b5cf6" />
        </div>
      </section>
    </>
  );
}

function VehiclesView({ data, onAdd, onEdit, onDelete }: { data: Snapshot; onAdd: () => void; onEdit: (v: Vehicle) => void; onDelete: (id: string) => void }) {
  return (
    <>
      <PageTitle title="Kendaraan" subtitle="Daftar kendaraan yang memiliki akses masuk" action={<button className="dash-btn-primary" onClick={onAdd}>＋ Tambah</button>} />
      {data.vehicles.length === 0 ? (
        <div className="dash-empty"><p>Belum ada kendaraan terdaftar</p></div>
      ) : (
        <div className="dash-cards-grid">{data.vehicles.map((v) => (
          <section key={v.id} className="dash-panel dash-vehicle">
            <div className={`dash-vehicle-icon ${v.type === "Mobil" ? "blue" : "violet"}`}>{v.type === "Mobil" ? "🚗" : "🛵"}</div>
            <div className="dash-vehicle-info"><span>{v.type}</span><h3>{v.plate}</h3><p>{v.brand} • {v.color}</p></div>
            <div className="dash-row-actions"><button onClick={() => onEdit(v)}>✎</button><button className="danger" onClick={() => { if (confirm("Hapus kendaraan ini?")) onDelete(v.id); }}>🗑</button></div>
          </section>
        ))}</div>
      )}
    </>
  );
}

function DocumentsView({ data, onAdd, onProcess }: { data: Snapshot; onAdd: () => void; onProcess: (id: string) => void }) {
  return (
    <>
      <PageTitle title="Permintaan Dokumen" subtitle="Ajukan dan pantau surat pengantar Anda" action={<button className="dash-btn-primary" onClick={onAdd}>＋ Ajukan</button>} />
      <section className="dash-panel">
        <div className="dash-table-wrap"><table>
          <thead><tr><th>Jenis dokumen</th><th>Tanggal pengajuan</th><th>Status</th><th>Tindakan</th></tr></thead>
          <tbody>{data.documents.map((d) => <tr key={d.id}><td><strong>{d.type}</strong></td><td>{d.submitted}</td><td>{statusBadge(d.status)}</td><td>{d.status !== "completed" ? <button className="dash-btn-small" onClick={() => onProcess(d.id)}>{d.status === "ready" ? "Selesaikan" : "Proses"}</button> : <span className="dash-muted">Tuntas</span>}</td></tr>)}</tbody>
        </table></div>
      </section>
    </>
  );
}

function ArrearsView() {
  const arrears = [
    { name: "Agus Pranoto", unit: "C-07", months: 3, total: 1050000 },
    { name: "Rina Kartika", unit: "D-12", months: 2, total: 700000 },
    { name: "Fajar Nugraha", unit: "B-04", months: 1, total: 350000 },
  ];
  return (
    <>
      <PageTitle title="Penunggak IPL" subtitle="Monitoring pembayaran warga • Akses administrator" />
      <div className="dash-admin-notice">🛡<div><strong>Mode Administrator</strong><span>Hanya admin yang dapat melihat halaman ini.</span></div></div>
      <section className="dash-panel">
        <div className="dash-table-wrap"><table>
          <thead><tr><th>Nama penghuni</th><th>Unit</th><th>Tunggakan</th><th>Total</th><th></th></tr></thead>
          <tbody>{arrears.map((r) => <tr key={r.unit}><td><strong>{r.name}</strong></td><td><span className="dash-unit-code">{r.unit}</span></td><td>{r.months} bulan</td><td><strong className="red">{rupiah(r.total)}</strong></td><td><button className="dash-btn-danger-outline">📨 Kirim SP</button></td></tr>)}</tbody>
        </table></div>
      </section>
    </>
  );
}

function ComplaintsView({ data, onAdd, onSos }: { data: Snapshot; onAdd: () => void; onSos: (kind: "Kebakaran" | "Pencurian") => void }) {
  return (
    <>
      <PageTitle title="Aduan & SOS" subtitle="Laporkan masalah lingkungan atau kondisi darurat" action={<button className="dash-btn-primary" onClick={onAdd}>＋ Buat aduan</button>} />
      <section className="dash-sos-panel">
        <div><span className="dash-eyebrow" style={{ color: "#f5cbd0" }}>LAYANAN DARURAT 24 JAM</span><h2>Butuh bantuan segera?</h2><p>Tekan tombol sesuai kondisi. Sirene akan berbunyi dan petugas keamanan menerima notifikasi.</p></div>
        <div className="dash-sos-buttons">
          <button onClick={() => onSos("Kebakaran")}>🔥<span><strong>KEBAKARAN</strong><small>Aktifkan alarm api</small></span></button>
          <button onClick={() => onSos("Pencurian")}>🚨<span><strong>PENCURIAN</strong><small>Panggil keamanan</small></span></button>
        </div>
      </section>
      <section className="dash-panel">
        <div className="dash-panel-head"><h2>Riwayat Aduan</h2><p>Laporan yang pernah Anda kirim</p></div>
        {data.complaints.map((c) => <div key={c.id} className="dash-complaint"><span className="dash-complaint-icon">⚠</span><div><span>{c.category}</span><strong>{c.title}</strong><small>{c.date}</small></div>{statusBadge(c.status)}</div>)}
      </section>
    </>
  );
}

function ResidentsView({ residents, onReset }: { residents: AdminResident[]; onReset: (id: string, name: string) => void }) {
  return (
    <>
      <PageTitle title="Data Warga" subtitle="Kelola akun penghuni yang terdaftar" />
      <section className="dash-panel">
        <div className="dash-table-wrap"><table>
          <thead><tr><th>Penghuni</th><th>Unit</th><th>Email</th><th>Telepon</th><th></th></tr></thead>
          <tbody>{residents.map((r) => <tr key={r.id}><td><div className="dash-resident-cell"><div className="dash-avatar mini">{initials(r.name)}</div><strong>{r.name}</strong></div></td><td><span className="dash-unit-code">{r.unit}</span></td><td>{r.email}</td><td>{r.phone || "—"}</td><td><button className="dash-btn-small subtle" onClick={() => onReset(r.id, r.name)}>🔑 Reset password</button></td></tr>)}</tbody>
        </table></div>
      </section>
    </>
  );
}

function InfoGrid({ rows }: { rows: string[][] }) {
  return <div className="dash-info-grid">{rows.map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div>;
}
function Spec({ label, value }: { label: string; value: string }) {
  return <div className="dash-spec"><span>{label}</span><strong>{value}</strong></div>;
}
function Metric({ icon, color, label, value, note }: { icon: string; color: string; label: string; value: string; note: string }) {
  return <div className="dash-panel dash-metric"><div className={`dash-stat-icon ${color}`}>{icon}</div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}
function BudgetRow({ name, value, width, color }: { name: string; value: string; width: string; color: string }) {
  return <div className="dash-budget"><div><strong>{name}</strong><span>{value}</span></div><div className="dash-bar"><i style={{ width, background: color }} /></div></div>;
}

const styles = `
  :root { --blue: #1557d8; }
  html, body { background: #f5f7fb; }
  .dash-shell { min-height: 100vh; display: flex; font-family: 'Segoe UI', Arial, sans-serif; color: #18263e; }
  .dash-sidebar { position: fixed; inset: 0 auto 0 0; width: 252px; z-index: 40; padding: 22px 16px; background: linear-gradient(180deg,#0b1d38 0%,#102b52 100%); color: #d9e4f8; display: flex; flex-direction: column; overflow-y: auto; }
  .dash-brand { display: flex; align-items: center; gap: 11px; padding: 0 7px 22px; border-bottom: 1px solid rgba(255,255,255,.1); position: relative; }
  .dash-brand-mark { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 12px; background: linear-gradient(145deg,#3182ff,#1557d8); font-size: 18px; }
  .dash-brand strong { display: block; color: white; font-size: 14px; letter-spacing: .055em; }
  .dash-brand span { display: block; color: #93acd0; font-size: 9px; letter-spacing: .22em; margin-top: 3px; }
  .dash-close { display: none; }
  .dash-nav { padding-top: 18px; flex: 1; }
  .dash-nav-label { margin: 0 11px 8px; color: #718caf; font-size: 9px; font-weight: 700; letter-spacing: .16em; }
  .dash-nav-label.spaced { margin-top: 18px; }
  .dash-nav-item { display: block; width: 100%; height: 38px; padding: 0 12px; border-radius: 9px; color: #aebed5; background: transparent; text-align: left; font-size: 12px; transition: .18s; }
  .dash-nav-item:hover { color: white; background: rgba(255,255,255,.06); }
  .dash-nav-item.active { color: white; background: linear-gradient(90deg,rgba(45,121,255,.28),rgba(45,121,255,.10)); }
  .dash-user { display: flex; align-items: center; gap: 10px; padding: 14px 7px 0; border-top: 1px solid rgba(255,255,255,.09); margin-top: 14px; }
  .dash-user div { flex: 1; min-width: 0; }
  .dash-user strong { display: block; color: white; font-size: 11px; }
  .dash-user span { display: block; color: #8198ba; font-size: 9px; margin-top: 2px; }
  .dash-logout { width: 28px; height: 28px; display: grid; place-items: center; border: 0; border-radius: 7px; background: rgba(255,255,255,.07); color: #d0dbef; }
  .dash-avatar { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #dfebff; color: #1a57b9; font-weight: 800; font-size: 11px; flex: none; }
  .dash-avatar.small { width: 30px; height: 30px; font-size: 10px; }
  .dash-avatar.mini { width: 26px; height: 26px; font-size: 9px; }
  .dash-backdrop { display: none; }
  .dash-main { margin-left: 252px; flex: 1; min-width: 0; }
  .dash-topbar { position: sticky; top: 0; z-index: 25; height: 64px; padding: 0 28px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e9edf3; background: rgba(255,255,255,.93); backdrop-filter: blur(8px); }
  .dash-menu { display: none; width: 36px; height: 36px; border: 1px solid #e6ebf2; border-radius: 9px; background: white; }
  .dash-crumb { display: flex; align-items: center; gap: 6px; color: #9aa5b5; font-size: 11px; }
  .dash-crumb strong { color: #273449; font-weight: 700; }
  .dash-crumb-sep { color: #c5ccd7; }
  .dash-top-meta { display: flex; align-items: center; gap: 10px; }
  .dash-pill { padding: 5px 9px; border-radius: 6px; background: #eef4ff; color: #1557d8; font-size: 9px; font-weight: 800; letter-spacing: .05em; }
  .dash-content { max-width: 1180px; margin: 0 auto; padding: 24px 28px 50px; }
  .dash-welcome { position: relative; padding: 30px 32px; display: flex; align-items: center; justify-content: space-between; gap: 18px; color: white; border-radius: 16px; background: linear-gradient(115deg,#1558d9 0%,#2879ea 100%); box-shadow: 0 14px 32px rgba(21,87,216,.18); overflow: hidden; }
  .dash-eyebrow { display: block; margin-bottom: 7px; color: #bcd4ff; font-size: 9px; font-weight: 800; letter-spacing: .16em; }
  .dash-welcome h1 { position: relative; z-index: 2; margin: 0; font-size: 26px; letter-spacing: -.02em; }
  .dash-welcome p { position: relative; z-index: 2; margin: 8px 0 0; color: #dce8ff; font-size: 12px; }
  .dash-date-card { padding: 13px 16px; border: 1px solid rgba(255,255,255,.18); border-radius: 12px; background: rgba(255,255,255,.1); }
  .dash-date-card span, .dash-date-card strong { display: block; }
  .dash-date-card span { font-size: 8px; color: #bcd2fa; font-weight: 700; letter-spacing: .14em; margin-bottom: 5px; }
  .dash-date-card strong { font-size: 12px; }
  .dash-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin: 16px 0 22px; }
  .dash-stat { display: flex; align-items: center; gap: 11px; padding: 14px 15px; border: 1px solid #e6eaf0; border-radius: 13px; text-align: left; background: white; transition: .18s; }
  .dash-stat:hover { border-color: #ccdaf2; transform: translateY(-1px); }
  .dash-stat > div { flex: 1; }
  .dash-stat span { display: block; color: #8792a3; font-size: 9px; }
  .dash-stat strong { display: block; margin-top: 4px; color: #26334a; font-size: 14px; }
  .dash-stat small { display: block; margin-top: 4px; font-size: 8px; }
  .dash-stat-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 10px; font-size: 18px; flex: none; }
  .dash-stat-icon.amber { color: #d88a0b; background: #fff4d8; }
  .dash-stat-icon.blue { color: #2563eb; background: #eaf1ff; }
  .dash-stat-icon.green { color: #07976b; background: #e3f8ef; }
  .dash-stat-icon.red { color: #dc3f48; background: #ffecef; }
  .positive { color: #0e9b70 !important; }
  .negative { color: #dc4a52 !important; }
  .red { color: #d64750; }
  .dash-section-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: 12px; }
  .dash-section-head h2 { margin: 0; font-size: 15px; color: #1d2b43; }
  .dash-section-head p { margin: 4px 0 0; color: #8b96a7; font-size: 10px; }
  .dash-section-head span { padding: 5px 8px; border-radius: 6px; background: #edf3fd; color: #5272a7; font-size: 8px; font-weight: 700; }
  .dash-modules { display: grid; grid-template-columns: repeat(3,1fr); gap: 11px; }
  .dash-module { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid #e6eaf0; border-radius: 13px; background: white; text-align: left; transition: .18s; }
  .dash-module:hover { border-color: #ccdaf2; transform: translateY(-2px); }
  .dash-module-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 10px; font-size: 18px; }
  .dash-module-icon.blue { background: #eaf1ff; }
  .dash-module-icon.emerald { background: #e5f8f1; }
  .dash-module-icon.amber { background: #fff4d8; }
  .dash-module-icon.violet { background: #f0eafe; }
  .dash-module-icon.cyan { background: #e7f8fb; }
  .dash-module-icon.indigo { background: #ececfe; }
  .dash-module-icon.rose { background: #ffedf1; }
  .dash-module-icon.orange { background: #fff0e5; }
  .dash-module-icon.red { background: #ffecef; }
  .dash-module h3 { margin: 0 0 5px; font-size: 12px; }
  .dash-module p { margin: 0; color: #8b96a8; font-size: 9px; line-height: 1.55; }
  .dash-page-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 2px 0 20px; flex-wrap: wrap; }
  .dash-page-title h1 { margin: 0; font-size: 21px; letter-spacing: -.02em; }
  .dash-page-title p { margin: 4px 0 0; color: #8793a6; font-size: 11px; }
  .dash-btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border: 0; border-radius: 9px; background: var(--blue); color: white; font-size: 11px; font-weight: 700; box-shadow: 0 5px 12px rgba(21,87,216,.16); cursor: pointer; }
  .dash-btn-primary:hover { background: #0d3f9f; }
  .dash-btn-secondary { padding: 9px 16px; border: 1px solid #dfe4ec; border-radius: 9px; background: white; color: #58667a; font-size: 11px; font-weight: 600; cursor: pointer; }
  .dash-btn-small { padding: 6px 11px; border: 1px solid #cbdafa; border-radius: 7px; background: #f2f6fe; color: #1b5bc4; font-size: 9px; font-weight: 700; cursor: pointer; }
  .dash-btn-small.subtle { border-color: #e2e7ef; color: #59677c; background: white; }
  .dash-btn-danger-outline { padding: 6px 11px; border: 1px solid #f1c9cc; border-radius: 7px; background: #fff7f7; color: #d94750; font-size: 9px; font-weight: 700; cursor: pointer; }
  .dash-two-col { display: grid; grid-template-columns: 280px 1fr; gap: 14px; }
  .dash-panel { padding: 18px; border: 1px solid #e6eaf0; border-radius: 13px; background: white; }
  .dash-panel-head { padding-bottom: 12px; margin-bottom: 4px; border-bottom: 1px solid #eef1f5; }
  .dash-panel-head h2 { margin: 0; font-size: 13px; color: #1d2b43; }
  .dash-panel-head p { margin: 4px 0 0; color: #8b96a7; font-size: 9px; }
  .profile-card { text-align: center; }
  .dash-big-avatar { width: 70px; height: 70px; margin: 0 auto 12px; display: grid; place-items: center; border: 5px solid #eef4ff; border-radius: 50%; color: #1a5bc7; background: #dbe9ff; font-size: 20px; font-weight: 800; }
  .profile-card h2 { margin: 0; font-size: 16px; }
  .profile-card > p { margin: 4px 0 12px; color: #8a96a8; font-size: 10px; }
  .dash-verified { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 22px -18px -18px; padding: 12px; border-top: 1px solid #eef1f5; color: #078661; font-size: 9px; }
  .dash-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
  .dash-info-grid > div { padding: 12px 0; border-bottom: 1px solid #f0f2f6; }
  .dash-info-grid span { display: block; color: #8b96a8; font-size: 9px; }
  .dash-info-grid strong { display: block; margin-top: 4px; color: #344158; font-size: 11px; }
  .dash-property-hero { display: flex; align-items: center; gap: 24px; padding: 26px; color: white; border-radius: 14px; background: linear-gradient(120deg,#123e88,#1866d4); margin-bottom: 14px; }
  .dash-house-art { width: 130px; height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,.15); border-radius: 12px; background: rgba(255,255,255,.09); gap: 6px; }
  .dash-house-art span:last-child { font-size: 11px; font-weight: 800; letter-spacing: .1em; }
  .dash-property-hero h2 { margin: 0; font-size: 22px; }
  .dash-property-hero p { color: #cbdcf6; font-size: 11px; margin: 4px 0; }
  .dash-specs { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; padding-top: 14px; }
  .dash-spec { padding: 14px; border-radius: 9px; background: #f7f9fc; }
  .dash-spec span, .dash-spec strong { display: block; }
  .dash-spec span { color: #8c97a8; font-size: 9px; }
  .dash-spec strong { margin-top: 6px; color: #2e3b51; font-size: 12px; }
  .dash-bill { display: flex; align-items: center; justify-content: space-between; padding: 24px 30px; color: white; border-radius: 14px; background: linear-gradient(115deg,#132b53,#194c99); margin-bottom: 14px; }
  .dash-bill span, .dash-bill strong, .dash-bill small { display: block; }
  .dash-bill span { color: #b7c8e5; font-size: 10px; }
  .dash-bill strong { margin: 7px 0; font-size: 24px; }
  .dash-bill small { color: #c3d1e8; font-size: 9px; }
  .dash-bill-icon { width: 64px; height: 64px; display: grid; place-items: center; border-radius: 16px; background: rgba(255,255,255,.1); font-size: 26px; }
  .dash-table-wrap { overflow-x: auto; }
  .dash-table-wrap table { width: 100%; border-collapse: collapse; min-width: 600px; }
  .dash-table-wrap th { padding: 11px 12px; color: #8c97a8; background: #f7f9fc; font-size: 8px; letter-spacing: .04em; text-align: left; text-transform: uppercase; }
  .dash-table-wrap td { padding: 13px 12px; border-bottom: 1px solid #edf0f4; color: #687589; font-size: 10px; }
  .dash-table-wrap td strong { color: #344158; }
  .dash-badge { display: inline-flex; padding: 4px 8px; border-radius: 999px; font-size: 8px; font-weight: 700; }
  .dash-badge.good { color: #078361; background: #e6f8f1; }
  .dash-badge.warn { color: #b57409; background: #fff4d9; }
  .dash-badge.bad { color: #d0464f; background: #ffeded; }
  .dash-gate-card { position: relative; display: flex; align-items: center; gap: 20px; padding: 22px; border: 1px solid #cfe0f9; border-radius: 14px; background: linear-gradient(110deg,#eff5ff,#f9fbff); margin-bottom: 14px; }
  .dash-gate-visual { width: 76px; height: 76px; display: grid; place-items: center; border-radius: 18px; background: white; color: #2265d3; font-size: 30px; box-shadow: 0 6px 16px rgba(32,88,177,.1); }
  .dash-gate-card h2 { margin: 0 0 6px; font-size: 16px; }
  .dash-gate-card p { margin: 0 0 6px; color: #708098; font-size: 10px; }
  .dash-gate-card small { color: #2a65c5; font-size: 8px; }
  .dash-live-dot { position: absolute; right: 18px; top: 18px; display: flex; align-items: center; gap: 5px; color: #07865f; font-size: 8px; font-weight: 800; }
  .dash-live-dot i { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 4px #dff7ee; }
  .dash-cards-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
  .dash-access-card h3 { margin: 16px 0 4px; font-size: 13px; }
  .dash-access-card > strong { display: block; color: #65738b; font-size: 11px; letter-spacing: .08em; }
  .dash-access-card > p { margin: 5px 0 14px; color: #8d98a9; font-size: 9px; }
  .dash-rfid-top { display: flex; justify-content: space-between; align-items: center; }
  .dash-finance-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 14px; }
  .dash-metric { display: grid; grid-template-columns: 48px 1fr; align-items: center; }
  .dash-metric > .dash-stat-icon { grid-row: 1/4; }
  .dash-metric > span { color: #8793a5; font-size: 9px; }
  .dash-metric > strong { color: #26344a; font-size: 15px; }
  .dash-metric > small { color: #99a3b2; font-size: 8px; }
  .dash-budget-list { padding-top: 12px; }
  .dash-budget { margin: 14px 0; }
  .dash-budget > div:first-child { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .dash-budget strong { color: #3a475c; font-size: 10px; }
  .dash-budget span { color: #6e7a8d; font-size: 9px; }
  .dash-bar { height: 7px; border-radius: 10px; background: #eef1f5; overflow: hidden; }
  .dash-bar i { display: block; height: 100%; border-radius: 10px; }
  .dash-vehicle { display: flex; align-items: center; gap: 14px; }
  .dash-vehicle-icon { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 12px; font-size: 22px; }
  .dash-vehicle-icon.blue { background: #eaf1ff; color: #2563eb; }
  .dash-vehicle-icon.violet { background: #f0eafe; color: #7c3aed; }
  .dash-vehicle-info { flex: 1; }
  .dash-vehicle-info span { color: #8995a7; font-size: 8px; text-transform: uppercase; }
  .dash-vehicle-info h3 { margin: 3px 0; color: #28364c; font-size: 15px; letter-spacing: .05em; }
  .dash-vehicle-info p { margin: 0; color: #8995a6; font-size: 9px; }
  .dash-row-actions { display: flex; gap: 6px; }
  .dash-row-actions button { width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid #e1e6ee; border-radius: 7px; background: white; color: #66758a; cursor: pointer; }
  .dash-row-actions button.danger { color: #d54b53; }
  .dash-empty { padding: 40px; text-align: center; color: #9aa5b5; }
  .dash-sos-panel { display: flex; align-items: center; justify-content: space-between; padding: 24px 26px; color: white; border-radius: 14px; background: linear-gradient(115deg,#961f2a,#d13943); margin-bottom: 14px; gap: 18px; }
  .dash-sos-panel h2 { margin: 0; font-size: 18px; }
  .dash-sos-panel p { margin: 6px 0 0; color: #f5cbd0; font-size: 10px; }
  .dash-sos-buttons { display: flex; gap: 9px; }
  .dash-sos-buttons button { min-width: 150px; display: flex; align-items: center; gap: 11px; padding: 12px 14px; border: 1px solid rgba(255,255,255,.25); border-radius: 10px; background: rgba(255,255,255,.1); color: white; text-align: left; cursor: pointer; }
  .dash-sos-buttons button:hover { background: rgba(255,255,255,.18); }
  .dash-sos-buttons strong, .dash-sos-buttons small { display: block; }
  .dash-sos-buttons strong { font-size: 9px; }
  .dash-sos-buttons small { margin-top: 2px; color: #f6ccd0; font-size: 7px; }
  .dash-complaint { display: flex; align-items: center; gap: 11px; padding: 13px 0; border-bottom: 1px solid #edf0f4; }
  .dash-complaint:last-child { border-bottom: 0; }
  .dash-complaint > div { flex: 1; }
  .dash-complaint span, .dash-complaint strong, .dash-complaint small { display: block; }
  .dash-complaint span { color: #8d98a9; font-size: 8px; }
  .dash-complaint strong { margin: 3px 0; color: #354258; font-size: 10px; }
  .dash-complaint small { color: #9ca6b4; font-size: 8px; }
  .dash-complaint-icon { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 8px; color: #d78a0a; background: #fff4d8; font-size: 14px; }
  .dash-admin-notice { display: flex; align-items: center; gap: 11px; padding: 12px 14px; border: 1px solid #cddffc; border-radius: 11px; color: #215cbf; background: #eff5ff; margin-bottom: 14px; }
  .dash-admin-notice strong, .dash-admin-notice span { display: block; }
  .dash-admin-notice strong { font-size: 10px; }
  .dash-admin-notice span { margin-top: 2px; color: #6682af; font-size: 8px; }
  .dash-resident-cell { display: flex; align-items: center; gap: 9px; }
  .dash-unit-code { display: inline-block; padding: 4px 8px; border-radius: 6px; background: #eef4ff; color: #245ebc; font-size: 9px; font-weight: 800; }
  .dash-muted { color: #a0a9b6; font-size: 9px; }
  .dash-modal-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 20px; background: rgba(7,19,38,.54); backdrop-filter: blur(3px); }
  .dash-modal { width: min(480px, 100%); max-height: 90vh; overflow-y: auto; border-radius: 14px; background: white; box-shadow: 0 30px 80px rgba(0,0,0,.24); }
  .dash-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #eef1f5; }
  .dash-modal-head h2 { margin: 0; font-size: 16px; }
  .dash-modal-head button { width: 28px; height: 28px; display: grid; place-items: center; border: 0; border-radius: 7px; background: #f4f6f9; color: #748195; cursor: pointer; }
  .dash-modal form { padding: 18px 22px; }
  .dash-field { display: block; margin-bottom: 12px; }
  .dash-field > span { display: block; margin-bottom: 5px; color: #536177; font-size: 9px; font-weight: 700; }
  .dash-field input, .dash-field select, .dash-field textarea { width: 100%; border: 1px solid #dfe4ec; border-radius: 8px; outline: 0; color: #364359; background: white; font-size: 11px; }
  .dash-field input, .dash-field select { height: 38px; padding: 0 11px; }
  .dash-field textarea { min-height: 78px; padding: 9px 11px; resize: vertical; font-family: inherit; }
  .dash-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .dash-divider { margin: 16px 0 12px; padding-top: 14px; border-top: 1px solid #eef1f5; color: #304057; font-size: 10px; font-weight: 800; }
  .dash-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #eef1f5; }
  .dash-toast { position: fixed; right: 20px; bottom: 20px; z-index: 110; padding: 12px 16px; border-radius: 10px; color: white; background: #133768; box-shadow: 0 12px 30px rgba(11,32,64,.3); font-size: 11px; }
  @media (max-width: 960px) {
    .dash-sidebar { transform: translateX(-100%); transition: .25s; }
    .dash-sidebar.open { transform: translateX(0); }
    .dash-main { margin-left: 0; }
    .dash-menu { display: grid; }
    .dash-close { display: grid; position: absolute; right: 12px; top: 18px; width: 30px; height: 30px; place-items: center; border: 0; border-radius: 7px; background: rgba(255,255,255,.07); color: #9eb1cd; }
    .dash-backdrop { display: block; position: fixed; inset: 0; z-index: 35; border: 0; background: rgba(7,18,36,.48); }
    .dash-modules { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 700px) {
    .dash-topbar { padding: 0 16px; height: 56px; }
    .dash-content { padding: 18px 16px 36px; }
    .dash-welcome { flex-direction: column; align-items: flex-start; }
    .dash-stats, .dash-modules, .dash-finance-stats, .dash-cards-grid, .dash-two-col { grid-template-columns: 1fr; }
    .dash-info-grid { grid-template-columns: 1fr; }
    .dash-specs { grid-template-columns: 1fr 1fr; }
    .dash-form-row { grid-template-columns: 1fr; gap: 0; }
    .dash-sos-panel { flex-direction: column; align-items: flex-start; }
    .dash-sos-buttons { flex-direction: column; width: 100%; }
    .dash-sos-buttons button { width: 100%; }
  }
`;
