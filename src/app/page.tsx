import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return (
    <main className="landing">
      <header className="hero">
        <div className="badge">MEKARINDAH PORTAL • v2</div>
        <h1>Sistem Informasi Penghuni Perumahan</h1>
        <p>Kelola IPL, kendaraan, dokumen, dan akses gerbang dalam satu portal. Data tersimpan aman di server dan dapat diakses banyak warga sekaligus.</p>
        <div className="cta-row">
          <Link className="cta-primary" href="/login">Masuk Portal</Link>
          <Link className="cta-secondary" href="/register">Daftar Akun Baru</Link>
        </div>
        <div className="credentials">
          <span>Akun demo:</span>
          <code>admin@mekarindah.com</code> / <code>adminmekarindah</code> &nbsp;·&nbsp;
          <code>budi.santoso@email.com</code> / <code>mekarindah123</code>
        </div>
      </header>

      <section className="features">
        {features.map((feature) => (
          <article key={feature.title} className="feature-card">
            <div className="feature-icon" aria-hidden>{feature.glyph}</div>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </section>

      <footer className="landing-footer">
        <p>Mekarindah Portal · Next.js + PostgreSQL · Data tersimpan di server · Dapat diakses banyak warga.</p>
      </footer>

      <style>{`
        .landing { max-width: 1100px; margin: 0 auto; padding: 70px 24px 80px; color: #18263e; font-family: 'Segoe UI', Arial, sans-serif; }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; background: #edf3fd; color: #1557d8; font-size: 11px; font-weight: 700; letter-spacing: .12em; }
        .hero h1 { margin: 16px 0 14px; font-size: clamp(30px, 5vw, 46px); letter-spacing: -.02em; line-height: 1.1; }
        .hero p { max-width: 680px; color: #4b5b75; font-size: 15px; line-height: 1.65; }
        .cta-row { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .cta-primary, .cta-secondary { padding: 13px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; transition: transform .15s; }
        .cta-primary { background: #1557d8; color: white; box-shadow: 0 8px 22px rgba(21,87,216,.22); }
        .cta-primary:hover { transform: translateY(-1px); background: #0d3f9f; }
        .cta-secondary { background: white; color: #1557d8; border: 1px solid #cbdafa; }
        .cta-secondary:hover { transform: translateY(-1px); background: #f2f6fe; }
        .credentials { margin-top: 22px; padding: 12px 14px; border-radius: 10px; background: #f4f7fb; color: #5b687c; font-size: 12px; line-height: 1.7; }
        .credentials code { background: white; padding: 2px 7px; border-radius: 5px; color: #1557d8; font-size: 12px; border: 1px solid #e2e6ed; }
        .features { margin-top: 60px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .feature-card { padding: 22px; border: 1px solid #e6eaf0; border-radius: 14px; background: white; }
        .feature-icon { width: 44px; height: 44px; border-radius: 11px; display: grid; place-items: center; font-size: 20px; background: #eef3fb; }
        .feature-card h3 { margin: 14px 0 6px; font-size: 14px; }
        .feature-card p { margin: 0; color: #5b687c; font-size: 12px; line-height: 1.65; }
        .landing-footer { margin-top: 60px; padding: 22px; background: #f4f7fb; border-radius: 14px; text-align: center; color: #5b687c; font-size: 12px; line-height: 1.6; }
        @media (max-width: 800px) { .features { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}

const features = [
  { glyph: "🔐", title: "Login Aman", body: "Sesi tersimpan dengan token terenkripsi. Setiap warga punya akun sendiri yang dilindungi password." },
  { glyph: "💳", title: "Bayar IPL Online", body: "Cek tagihan, bayar, dan unduh bukti. Status IPL real-time di database server." },
  { glyph: "🚗", title: "CRUD Kendaraan", body: "Tambah, edit, dan hapus plat kendaraan. Hanya terlihat oleh pemilik akun." },
  { glyph: "📄", title: "Pengajuan Dokumen", body: "Ajukan surat domisili, SKCK, dan lainnya. Pantau status dari pending hingga selesai." },
  { glyph: "🚨", title: "SOS & Sirene", body: "Tombol darurat aktif di setiap akun. Peristiwa tersimpan untuk audit." },
  { glyph: "👥", title: "Panel Admin", body: "Administrator dapat memantau semua warga dan reset password jika ada yang lupa." },
];
