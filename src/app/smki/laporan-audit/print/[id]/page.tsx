"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Printer,
  ChevronLeft,
  FileDown,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import {
  getSmkiLaporanAuditDetail,
  exportSmkiLaporanAuditDocx,
  SmkiLaporanAudit,
} from "@/services/api";

export default function PrintLaporanAuditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<SmkiLaporanAudit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      try {
        const res = await getSmkiLaporanAuditDetail(id);
        if (res.success && res.data) {
          setReport(res.data);
        }
      } catch (err) {
        console.error("Gagal memuat laporan audit untuk cetak:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadReport();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = async () => {
    if (!report) return;
    setIsExporting(true);
    try {
      const blob = await exportSmkiLaporanAuditDocx(report.id_laporan_audit);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FR-006_${report.nomor_laporan}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal ekspor docx:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTanggalIndo = (dateStr?: string) => {
    if (!dateStr) return "XXXXX";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-medium text-slate-600">
          Menyiapkan format dokumen FR-006...
        </span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-sm font-medium text-slate-600">
          Data laporan audit tidak ditemukan.
        </p>
        <button
          onClick={() => router.push("/smki/laporan-audit")}
          className="px-4 py-2 bg-[#065f46] text-white text-xs font-semibold rounded-xl"
        >
          Kembali
        </button>
      </div>
    );
  }

  const unitKerjaName =
    report.nama_unit_kerja || report.unit_kerja?.nama_unit_kerja || "-";
  const auditorName = report.auditor || "Auditor";
  const auditeeName = report.auditee || "Auditee";
  const tglAuditFormatted = formatTanggalIndo(report.tanggal_audit);
  const todayFormatted = formatTanggalIndo(new Date().toISOString());

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0">
      {/* Floating Action Bar - Hidden when printing */}
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => router.push(`/smki/laporan-audit/detail/${report.id_laporan_audit}`)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Detail</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportDocx}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>Unduh Word (.docx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* A4 Paper Container - Matching Mockup Page 6 and FR-006 docx */}
      <div className="max-w-[210mm] mx-auto bg-white p-[20mm] shadow-lg print:shadow-none print:p-0 print:max-w-none text-slate-900 font-sans text-[11pt] leading-normal print:w-full space-y-6">
        {/* Document Header Table - FR-006 Standard */}
        <div className="border border-black">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                {/* Logo Box */}
                <td className="w-28 p-2 border-r border-black text-center align-middle">
                  <img
                    src="/logo-fr047.png"
                    alt="Logo Jabar"
                    className="w-16 h-auto mx-auto object-contain"
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = "/logo.png";
                    }}
                  />
                </td>

                {/* Form Title */}
                <td className="p-3 border-r border-black text-center align-middle">
                  <h2 className="text-base font-bold tracking-wide uppercase text-slate-900">
                    FORM LAPORAN AUDIT
                  </h2>
                </td>

                {/* Document Metadata */}
                <td className="w-56 p-2 text-[9pt] align-middle">
                  <table className="w-full text-left">
                    <tbody>
                      <tr>
                        <td className="font-semibold py-0.5 w-24">No.Dokumen</td>
                        <td className="py-0.5">: FR-006/KOM.03.05/SANDIKAMI</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">No.Revisi</td>
                        <td className="py-0.5">: 2.1</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Tanggal Berlaku</td>
                        <td className="py-0.5">: 11 September 2023</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Title */}
        <div className="text-center pt-2 pb-1">
          <h1 className="text-base font-bold tracking-wider underline uppercase text-slate-900">
            LAPORAN AUDIT INTERNAL
          </h1>
        </div>

        {/* Section A: Latar Belakang */}
        <div className="space-y-1.5 text-justify text-[10pt] leading-relaxed">
          <h3 className="font-bold text-slate-900">A. Latar Belakang</h3>
          <p className="pl-4">
            Audit internal merupakan salah satu persyaratan ISO/IEC 27001:2022 yang harus dipenuhi oleh Dinas Komunikasi dan Informatika Provinsi Jawa Barat sebagai bentuk dari evaluasi kinerja sistem manajemen. Audit internal dimaksudkan untuk meninjau tingkat kesesuaian dan efektivitas penerapan Sistem Manajemen Keamanan Informasi (SMKI) yang telah diimplementasikan.
          </p>
        </div>

        {/* Section B: Tujuan */}
        <div className="space-y-1.5 text-justify text-[10pt] leading-relaxed">
          <h3 className="font-bold text-slate-900">B. Tujuan</h3>
          <p className="pl-4">
            Audit internal merupakan bagian dari proses implementasi SMKI yang diterapkan oleh Dinas Komunikasi dan Informatika Provinsi Jawa Barat dengan tujuan sebagai berikut :
          </p>
          <ol className="list-decimal pl-9 space-y-0.5">
            <li>Memeriksa kesesuaian atau ketidaksesuaian persyaratan standar.</li>
            <li>Memeriksa kesesuaian pencapaian tujuan keamanan informasi yang telah ditentukan.</li>
            <li>Menemukan peluang perbaikan dari proses implementasi SMKI sehingga tercapai perbaikan berkelanjutan.</li>
          </ol>
        </div>

        {/* Section C: Waktu Pelaksanaan dan Ruang Lingkup Audit */}
        <div className="space-y-1.5 text-justify text-[10pt] leading-relaxed">
          <h3 className="font-bold text-slate-900">
            C. Waktu Pelaksanaan dan Ruang Lingkup Audit
          </h3>
          <p className="pl-4">
            Pelaksanaan audit internal SMKI Dinas Komunikasi dan Informatika Provinsi Jawa Barat dilakukan oleh Tim Audit Internal. Audit internal dilakukan pada tanggal <span className="font-semibold">{tglAuditFormatted}</span>. (jadwal disesuaikan dengan ketersediaan waktu dan kesepakatan antara auditor dan auditee) Ruang lingkup audit mencakup ke beberapa unit kerja terkait, diantaranya : <span className="font-semibold">{unitKerjaName}</span>.
          </p>
        </div>

        {/* Section D: Hasil Audit dan Tindak Lanjut */}
        <div className="space-y-2 text-justify text-[10pt] leading-relaxed">
          <h3 className="font-bold text-slate-900">
            D. Hasil Audit dan Tindak Lanjut
          </h3>
          <p className="pl-4">
            Selama proses audit internal yang telah dilakukan ditemukan beberapa temuan dengan keterangan sebagai berikut :
          </p>
          <div className="pl-8 space-y-0.5 font-medium">
            <div className="grid grid-cols-[140px_10px_1fr]">
              <span>Temuan Major</span>
              <span>:</span>
              <span className="font-bold text-rose-700">{report.temuan_major}</span>
            </div>
            <div className="grid grid-cols-[140px_10px_1fr]">
              <span>Temuan Minor</span>
              <span>:</span>
              <span className="font-bold text-amber-700">{report.temuan_minor}</span>
            </div>
            <div className="grid grid-cols-[140px_10px_1fr]">
              <span>OFI</span>
              <span>:</span>
              <span className="font-bold text-emerald-700">{report.ofi}</span>
            </div>
          </div>

          <p className="pl-4 pt-1">
            Adapun rincian dari temuan tersebut adalah :
          </p>

          {/* Metadata Box Unit Kerja, Auditor, Auditee */}
          <div className="w-80 ml-4 border border-black text-[9pt] my-2">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-black">
                  <td className="py-1 px-2.5 font-semibold w-24 border-r border-black">
                    Unit Kerja
                  </td>
                  <td className="py-1 px-2.5">{unitKerjaName}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="py-1 px-2.5 font-semibold border-r border-black">
                    Auditor:
                  </td>
                  <td className="py-1 px-2.5">{auditorName}</td>
                </tr>
                <tr>
                  <td className="py-1 px-2.5 font-semibold border-r border-black">
                    Auditee:
                  </td>
                  <td className="py-1 px-2.5">{auditeeName}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table of Findings - Matching Mockup Page 6 (Green Header) */}
          <div className="pt-2">
            <table className="w-full border border-black border-collapse text-[9pt]">
              <thead>
                <tr className="bg-[#00875a] text-white print:bg-[#00875a] print:text-white border-b border-black">
                  <th className="py-2 px-2 text-center w-8 border-r border-black">
                    No
                  </th>
                  <th className="py-2 px-2 text-center w-28 border-r border-black">
                    Tanggal Audit Internal
                  </th>
                  <th className="py-2 px-2 text-center w-28 border-r border-black">
                    Kategori Temuan
                  </th>
                  <th className="py-2 px-2 text-center w-36 border-r border-black">
                    Klausul/ Annex Terkait
                  </th>
                  <th className="py-2 px-3 text-center border-r border-black">
                    Deskripsi Temuan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {report.detail_temuans && report.detail_temuans.length > 0 ? (
                  report.detail_temuans.map((d, i) => (
                    <tr key={d.id_detail_temuan || i} className="align-top">
                      <td className="py-2 px-2 text-center border-r border-black font-medium">
                        {i + 1}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-black">
                        {formatTanggalIndo(d.tanggal_audit)}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-black font-semibold">
                        {d.kategori_temuan || "-"}
                      </td>
                      <td className="py-2 px-2 border-r border-black font-medium">
                        {d.klausul_annex || "-"}
                      </td>
                      <td className="py-2 px-3 space-y-1">
                        <p>{d.deskripsi_temuan || "-"}</p>
                        {d.rekomendasi && (
                          <p className="text-[8.5pt] italic text-slate-700 pt-1">
                            <span className="font-semibold">Rekomendasi:</span> {d.rekomendasi}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 text-center italic text-slate-500">
                      Tidak ada rincian temuan audit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tanda Tangan Section - Matching Mockup Page 6 */}
        <div className="pt-6 text-[10pt] break-inside-avoid">
          <div className="grid grid-cols-2 text-center gap-12">
            <div>
              <p>Bandung, {todayFormatted}</p>
              <p className="font-medium mt-1">Auditor,</p>
              <div className="h-20" />
              <p className="font-bold underline">({auditorName})</p>
            </div>
            <div>
              <p>Bandung, {todayFormatted}</p>
              <p className="font-medium mt-1">Auditee,</p>
              <div className="h-20" />
              <p className="font-bold underline">({auditeeName})</p>
            </div>
          </div>
        </div>

        {/* Footer Classification - Matching Mockup Page 6 */}
        <div className="pt-8 border-t border-slate-300 text-[8pt] text-slate-500 flex items-center justify-between">
          <span>Klasifikasi : INTERNAL</span>
          <span>Halaman 1 dari 1</span>
        </div>
      </div>

      {/* Print-specific style tag */}
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
