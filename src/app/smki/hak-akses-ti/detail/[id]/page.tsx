"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Printer,
  Download,
  MoreVertical,
  User,
  ShieldCheck,
  Calendar,
  Clock,
  Layers,
  Mail,
  Phone,
  Hash,
  KeyRound,
  Loader2,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { getHakAksesTiDetail, HakAksesTiItem } from "@/services/api";

function statusStyle(status?: string) {
  const v = (status || "").toLowerCase();
  if (v.includes("disetujui")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
  if (v.includes("tolak")) return "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300";
  if (v.includes("proses")) return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
  return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
}

function Field({ label, value, icon }: { label: string; value?: ReactNode; icon?: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
        {icon} {label}
      </div>
      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{value || "-"}</div>
    </div>
  );
}

export default function DetailHakAksesTiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<HakAksesTiItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getHakAksesTiDetail(id);
        if (res?.success) setItem(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Gagal memuat detail formulir");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const durasi = item?.masa_berlaku_mulai
    ? `${new Date(item.masa_berlaku_mulai).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}${
        item.masa_berlaku_selesai ? ` - ${new Date(item.masa_berlaku_selesai).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}` : " (selama masa tugas)"
      }`
    : "-";

  if (loading) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 size={28} className="animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-slate-500">Memuat detail permohonan...</p>
        </div>
      </ServiceRouteGuard>
    );
  }

  if (!item) {
    return (
      <ServiceRouteGuard requiredService="SMKI">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <FileText size={32} className="text-slate-300" />
          <p className="text-sm font-bold text-slate-600">Data tidak ditemukan</p>
          <button onClick={() => router.push("/smki/hak-akses-ti")} className="text-xs font-bold text-emerald-600 hover:underline">Kembali ke daftar</button>
        </div>
      </ServiceRouteGuard>
    );
  }

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        {/* Header card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <button
                onClick={() => router.push("/smki/hak-akses-ti")}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 flex-shrink-0"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2 text-[10.5px] font-extrabold tracking-widest uppercase text-slate-400 mb-1">
                  <span>Aksesi</span>
                  <span>&gt;</span>
                  <span>Detail Permohonan</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] ${statusStyle(item.status_permohonan)}`}>
                    {item.status_permohonan}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  Permohonan Hak Akses <span className="text-emerald-600">#{item.nomor_request?.split("/").pop()}</span>
                </h1>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">
                  Ticket Number: {item.nomor_request}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => router.push(`/smki/hak-akses-ti/print/${item.id_hak_akses}`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition-all"
              >
                <Printer size={15} /> Cetak Dokumen
              </button>
              <button
                onClick={() => router.push(`/smki/hak-akses-ti/print/${item.id_hak_akses}`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <Download size={15} /> Unduh Versi PDF
              </button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Data Diri Pemohon */}
            <section className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Data Diri Pemohon</h2>
                  <p className="text-[11px] text-slate-400">Identitas lengkap pegawai yang mengajukan akses logis.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Nama Lengkap" value={item.nama_pemohon} icon={<User size={12} />} />
                <Field label="NIP / ID Pegawai" value={item.nip_id_pegawai} icon={<Hash size={12} />} />
                <Field label="Unit Kerja / Bidang" value={item.unit_kerja?.nama_unit || item.nama_unit_kerja} icon={<Layers size={12} />} />
                <Field label="Jabatan Struktural" value={item.jabatan} icon={<ShieldCheck size={12} />} />
                <Field label="Email Kedinasan" value={item.email} icon={<Mail size={12} />} />
                <Field label="Kontak Person" value={item.kontak_person} icon={<Phone size={12} />} />
              </div>
            </section>

            {/* Spesifikasi Hak Akses */}
            <section className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Spesifikasi Hak Akses TI</h2>
                  <p className="text-[11px] text-slate-400">Parameter teknis dan lingkup sistem yang akan diakses.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Nama Sistem / Aplikasi" value={item.sistem_aplikasi?.nama_sistem || item.sistem_lainnya} icon={<FileText size={12} />} />
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <Layers size={12} /> Modul / Fitur yang Diakses
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(item.modul_fitur && item.modul_fitur.length > 0) ? (
                      item.modul_fitur.map((m) => (
                        <span key={m} className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-[10.5px] font-bold">{m}</span>
                      ))
                    ) : (
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">-</span>
                    )}
                  </div>
                </div>
                <Field label="Jenis Permohonan" value={item.jenis_permohonan?.nama_jenis || item.nama_jenis_permohonan} icon={<ShieldCheck size={12} />} />
                <Field label="Sifat Akses" value={item.sifat_akses} icon={<ShieldCheck size={12} />} />
                <Field label="Level Akses" value={item.level_akses?.nama_level || item.nama_level_akses} icon={<User size={12} />} />
                <Field label="Waktu Akses" value={item.waktu_akses === "Lainnya" ? item.waktu_akses_lainnya : item.waktu_akses} icon={<Clock size={12} />} />
                <div className="sm:col-span-2">
                  <Field label="Durasi Berlaku" value={durasi} icon={<Calendar size={12} />} />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    <ShieldCheck size={12} /> Keperluan / Justifikasi Teknis
                  </div>
                  <p className="text-xs font-medium italic text-slate-700 dark:text-slate-200 leading-relaxed">
                    &ldquo;{item.keperluan || "-"}&rdquo;
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Ketentuan & Syarat */}
          <aside className="lg:col-span-1">
            <section className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 lg:sticky lg:top-6">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
                Ketentuan &amp; Syarat
              </h3>
              <ul className="space-y-3 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <li className="flex gap-2"><span className="text-emerald-500 mt-1">•</span> Hak akses bersifat personal dan tidak boleh dipindahtangankan.</li>
                <li className="flex gap-2"><span className="text-emerald-500 mt-1">•</span> Password wajib diganti setiap 90 hari sesuai standar SMKI.</li>
                <li className="flex gap-2"><span className="text-emerald-500 mt-1">•</span> Akses hanya diperbolehkan untuk kepentingan kedinasan.</li>
                <li className="flex gap-2"><span className="text-emerald-500 mt-1">•</span> Pelanggaran terhadap kebijakan akan dikenakan sanksi sesuai UU ITE.</li>
              </ul>
              <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700">
                <p className="text-[10.5px] italic text-slate-500 dark:text-slate-400 leading-relaxed">
                  &ldquo;Data ini dilindungi oleh Kebijakan Keamanan Informasi Organisasi. Penyalahgunaan akan diproses secara hukum.&rdquo;
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
