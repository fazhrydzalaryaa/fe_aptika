"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FileText,
  FileCheck,
  Building2,
  User,
  Calendar,
  Tag,
  Shield,
  Printer,
  ChevronLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  FileDown,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  getSmkiLaporanAuditDetail,
  exportSmkiLaporanAuditDocx,
  SmkiLaporanAudit,
} from "@/services/api";

export default function DetailLaporanAuditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<SmkiLaporanAudit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const res = await getSmkiLaporanAuditDetail(id);
        if (res.success && res.data) {
          setReport(res.data);
        }
      } catch (err) {
        console.error("Gagal memuat detail laporan audit:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadDetail();
  }, [id]);

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
      console.error("Gagal unduh docx:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTanggalIndo = (dateStr?: string) => {
    if (!dateStr) return "-";
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
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-medium text-slate-600">
          Memuat detail laporan audit...
        </span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-24 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">
          Laporan Audit Tidak Ditemukan
        </h2>
        <button
          onClick={() => router.push("/smki/laporan-audit")}
          className="px-4 py-2 bg-[#065f46] text-white text-xs font-semibold rounded-xl"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="space-y-6 pb-16 max-w-6xl mx-auto">
        {/* Breadcrumb & Action Header - Matching Mockup Page 3 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span
                onClick={() => router.push("/smki/laporan-audit")}
                className="hover:text-emerald-700 cursor-pointer transition"
              >
                AUDIT
              </span>
              <span>&gt;</span>
              <span className="text-slate-900">DETAIL LAPORAN</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Detail Laporan Audit
            </h1>
            <p className="text-xs text-slate-500">
              Nomor Dokumen: <span className="font-bold text-emerald-700">{report.nomor_laporan}</span> | Status: <span className="font-semibold text-slate-800">{report.status}</span>
            </p>
          </div>

          {/* Action Buttons Top - Matching Mockup Page 3 */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push("/smki/laporan-audit")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              <span>Kembali ke Daftar</span>
            </button>

            <button
              onClick={handleExportDocx}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>Unduh Word (.docx)</span>
            </button>

            <button
              onClick={() => router.push(`/smki/laporan-audit/print/${report.id_laporan_audit}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* Section 1: Hasil Audit dan Tindak Lanjut - Matching Mockup Page 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Hasil Audit dan Tindak Lanjut
            </h2>
          </div>

          <div className="space-y-4">
            {/* Row 1: Temuan Major, Minor, OFI stat boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Major */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  TEMUAN MAJOR
                </div>
                <div className="text-2xl font-black text-rose-600">
                  {report.temuan_major}
                </div>
              </div>

              {/* Minor */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  TEMUAN MINOR
                </div>
                <div className="text-2xl font-black text-amber-600">
                  {report.temuan_minor}
                </div>
              </div>

              {/* OFI */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  OFI
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  {report.ofi}
                </div>
              </div>
            </div>

            {/* Row 2: Unit Kerja, Auditor, Auditee */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  UNIT KERJA
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {report.nama_unit_kerja || report.unit_kerja?.nama_unit_kerja || "-"}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  AUDITOR
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {report.auditor || "-"}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  AUDITEE
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {report.auditee || "-"}
                </div>
              </div>
            </div>

            {/* Row 3: Tanggal, Kategori, Klausul/Annex */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  TANGGAL AUDIT INTERNAL
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {formatTanggalIndo(report.tanggal_audit)}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  KATEGORI
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {report.kategori || "Kategori"}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  KLAUSUL/ANNEX TERKAIT
                </div>
                <div className="text-xs font-bold text-slate-800 truncate">
                  {report.klausul_annex || "Multi-Clause (Lihat Rincian)"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: RINCIAN TEMUAN - Matching Mockup Page 3 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>RINCIAN TEMUAN</span>
          </div>

          {report.detail_temuans && report.detail_temuans.length > 0 ? (
            <div className="space-y-4">
              {report.detail_temuans.map((item, idx) => (
                <div
                  key={item.id_detail_temuan || idx}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4"
                >
                  {/* Finding Title & Badges */}
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {item.klausul_annex || `Temuan #${idx + 1}`}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.kategori_temuan === "Major"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : item.kategori_temuan === "Minor"
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {item.kategori_temuan || "KATEGORI"}
                    </span>
                  </div>

                  {/* Deskripsi Temuan */}
                  <div className="space-y-1 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      DESKRIPSI TEMUAN
                    </div>
                    <p className="text-slate-700 leading-relaxed font-normal">
                      {item.deskripsi_temuan || "-"}
                    </p>
                  </div>

                  {/* Rekomendasi Box */}
                  {item.rekomendasi && (
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1 text-xs">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        REKOMENDASI
                      </div>
                      <p className="text-slate-800 leading-relaxed font-normal">
                        {item.rekomendasi}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              Tidak ada rincian temuan pada laporan audit ini.
            </div>
          )}
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
