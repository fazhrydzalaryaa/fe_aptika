"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ChevronLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getHakAksesTiDetail, HakAksesTiItem } from "@/services/api";

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className="inline-flex items-center justify-center w-[12px] h-[12px] border border-black align-middle mr-1.5 shrink-0">
      {checked && (
        <svg viewBox="0 0 16 16" className="w-[10px] h-[10px]" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5 L6.5 12 L13 4.5" />
        </svg>
      )}
    </span>
  );
}

export default function PrintHakAksesTiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<HakAksesTiItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await getHakAksesTiDetail(id);
        if (res?.success) setItem(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Gagal memuat formulir");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const fmt = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : "-";

  if (loading || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
        <p className="text-xs font-medium text-slate-600">Menyiapkan format dokumen FR-018...</p>
      </div>
    );
  }

  const jenis = (item.jenis_permohonan?.nama_jenis || "").toLowerCase();
  const jenisAkses = (item.jenis_akses || []).map((j) => j.nama_akses);
  const todayFormatted = fmt(new Date().toISOString());

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0">
      {/* Floating action bar - hidden on print */}
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => router.push(`/smki/hak-akses-ti/detail/${item.id_hak_akses}`)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Detail</span>
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen (Print / PDF)</span>
        </button>
      </div>

      {/* A4 Paper */}
      <div className="max-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none print:p-0 print:max-w-none text-slate-900 font-sans text-[11pt] leading-normal print:w-full space-y-5">
        {/* Kop Surat */}
        <div className="border border-black">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-28 p-2 border-r border-black text-center align-middle">
                  <img
                    src="/logo-fr047.png"
                    alt="Logo Jabar"
                    className="w-16 h-auto mx-auto object-contain"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.onerror = null;
                      t.src = "/logo.png";
                    }}
                  />
                </td>
                <td className="p-3 border-r border-black text-center align-middle">
                  <h2 className="text-base font-bold tracking-wide uppercase text-slate-900">
                    FORMULIR HAK AKSES TI
                  </h2>
                </td>
                <td className="w-56 p-2 text-[9pt] align-middle">
                  <table className="w-full text-left">
                    <tbody>
                      <tr>
                        <td className="font-semibold py-0.5 w-24">No.Dokumen</td>
                        <td className="py-0.5">: FR-018/KOM.03.05/SANDIKAMI</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">No.Revisi</td>
                        <td className="py-0.5">: 1.1</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Tanggal Berlaku</td>
                        <td className="py-0.5">: 07 Juli 2022</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Title */}
        <div className="text-center pt-1">
          <h1 className="text-base font-bold tracking-wider underline uppercase text-slate-900">
            Formulir Permohonan Hak Akses TI
          </h1>
          <p className="text-[9pt] text-slate-600 mt-1">
            Nomor Permohonan: <span className="font-semibold">{item.nomor_request}</span> &nbsp;|&nbsp;
            Status: <span className="font-semibold">{item.status_permohonan}</span>
          </p>
        </div>

        {/* A. Data Pemohon */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-900">A. Data Pemohon</h3>
          <table className="w-full border border-black border-collapse text-[10pt]">
            <tbody>
              {[
                ["Nama Lengkap", item.nama_pemohon],
                ["NIP / NIK / ID Vendor", item.nip_id_pegawai],
                ["Jabatan", item.jabatan],
                ["Unit Kerja / Vendor", item.unit_kerja?.nama_unit || item.nama_unit_kerja],
                ["No. HP / WA", item.kontak_person],
                ["Email", item.email],
              ].map(([label, value], i) => (
                <tr key={i} className={i > 0 ? "border-t border-black" : ""}>
                  <td className="w-56 py-1 px-2 font-semibold border-r border-black bg-slate-50 print:bg-transparent">
                    {label}
                  </td>
                  <td className="py-1 px-2">{value || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* B. Detail Permohonan Akses */}
        <div className="space-y-2 text-[10pt]">
          <h3 className="font-bold text-slate-900">B. Detail Permohonan Akses</h3>

          <div className="pl-2 flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="font-medium">Mohon</span>
            <span className="font-medium inline-flex items-center">
              <Checkbox checked={jenis.includes("baru") || jenis.includes("daftar")} /> Didaftarkan
            </span>
            <span className="font-medium inline-flex items-center">
              <Checkbox checked={jenis.includes("hapus") || jenis.includes("nonaktif")} /> Dihapus
            </span>
            <span className="font-medium inline-flex items-center">
              <Checkbox checked={jenis.includes("ubah") || jenis.includes("perubahan")} /> Dirubah
            </span>
          </div>

          <div className="pl-2">Terhadap akses Sistem/Aplikasi:</div>
          <div className="pl-6 flex flex-wrap gap-x-6 gap-y-1">
            {["OS (Admin)", "Internet", "Database", "Aplikasi", "Teleworking"].map((j) => (
              <span key={j} className="font-medium inline-flex items-center">
                <Checkbox checked={jenisAkses.includes(j)} /> {j}
              </span>
            ))}
            <span className="font-medium inline-flex items-center">
              <Checkbox checked={jenisAkses.includes("Lainnya")} /> Lainnya{item.sistem_lainnya ? `: ${item.sistem_lainnya}` : " ..........."}
            </span>
          </div>

          <table className="w-full border border-black border-collapse text-[10pt] mt-1">
            <tbody>
              {[
                ["Sistem / Aplikasi Utama", item.sistem_aplikasi?.nama_sistem || item.sistem_lainnya || "-"],
                ["Modul / Fitur yang Diakses", item.modul_fitur?.length ? item.modul_fitur.join(", ") : "-"],
                ["Sifat Akses", item.sifat_akses],
                ["Level / Area Hak Akses", item.level_akses?.nama_level || item.nama_level_akses || "-"],
                ["Waktu Akses", item.waktu_akses === "Lainnya" ? item.waktu_akses_lainnya : item.waktu_akses],
                ["Masa Berlaku", `${fmt(item.masa_berlaku_mulai)} s.d. ${fmt(item.masa_berlaku_selesai)}`],
              ].map(([label, value], i) => (
                <tr key={i} className={i > 0 ? "border-t border-black" : ""}>
                  <td className="w-56 py-1 px-2 font-semibold border-r border-black bg-slate-50 print:bg-transparent">
                    {label}
                  </td>
                  <td className="py-1 px-2">{value || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* C. Keperluan */}
        <div className="space-y-1.5 text-justify text-[10pt] leading-relaxed">
          <h3 className="font-bold text-slate-900">C. Keperluan dan Alasan Akses</h3>
          <p className="pl-4">{item.keperluan || "-"}</p>
        </div>

        {/* D. Ketentuan */}
        <div className="space-y-1.5 text-justify text-[10pt] leading-relaxed">
          <h3 className="font-bold text-slate-900">D. Ketentuan Penggunaan Hak Akses</h3>
          <ol className="list-decimal pl-9 space-y-0.5">
            <li>User harus menyetujui dan mematuhi kebijakan keamanan informasi, kebijakan pengamanan Sistem/Aplikasi dan prosedur terkait.</li>
            <li>User dilarang mengalihkan dan/atau meminjamkan hak akses kepada pihak lain.</li>
            <li>User dilarang menyalahgunakan hak akses untuk kepentingan selain penugasan yang telah ditetapkan.</li>
            <li>Pelanggaran terhadap kebijakan keamanan informasi, kebijakan pengamanan Sistem/Aplikasi dan prosedur terkait akan menyebabkan pencabutan akses, tindakan disiplin, dan sanksi sesuai peraturan yang berlaku.</li>
          </ol>
          <p className="pl-4 italic pt-1">
            &ldquo;Saya menyetujui dan bersedia mematuhi ketentuan ini. Saya akan menggunakan hak akses ke
            Sistem/Aplikasi sesuai tugas dan pekerjaan saya dan akan melaporkan setiap masalah atau insiden
            keamanan informasi yang saya ketahui&rdquo;.
          </p>
          <p className="pl-4 font-semibold pt-1 inline-flex items-center">
            <Checkbox checked={!!item.persetujuan_ketentuan} /> Pemohon menyetujui seluruh ketentuan keamanan informasi yang berlaku.
          </p>
        </div>

        {/* Tanda Tangan */}
        <div className="pt-6 text-[10pt] break-inside-avoid">
          <table className="w-full border-collapse text-center">
            <tbody>
              <tr className="align-top">
                <td className="w-1/4 py-1">Dibuat Oleh:<br />Pemohon,</td>
                <td className="w-1/4 py-1">Diketahui Oleh:<br />Atasan Pemohon,</td>
                <td className="w-1/4 py-1">Disetujui Oleh:<br />Penanggung Jawab Perangkat,</td>
                <td className="w-1/4 py-1">Dilaksanakan Oleh:<br />Agen,</td>
              </tr>
              <tr>
                <td className="h-20" />
                <td />
                <td />
                <td />
              </tr>
              <tr className="align-bottom">
                <td className="py-1">({item.nama_pemohon || "............................"})</td>
                <td className="py-1">(............................)</td>
                <td className="py-1">(............................)</td>
                <td className="py-1">(............................)</td>
              </tr>
            </tbody>
          </table>
          <p className="text-right text-[9pt] text-slate-600 pt-2">Bandung, {todayFormatted}</p>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-300 text-[8pt] text-slate-500 flex items-center justify-between">
          <span>Klasifikasi : INTERNAL</span>
          <span>Halaman 1 dari 1</span>
        </div>
      </div>

      {/* Print-specific style */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 10pt;
          }
          aside,
          header,
          nav,
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
      `}</style>
    </div>
  );
}
