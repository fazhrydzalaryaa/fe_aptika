"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FileText,
  Save,
  User,
  Calendar,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderSync,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  getSmkiLaporanAuditDetail,
  getSmkiLaporanAuditLookup,
  updateSmkiLaporanAudit,
  SmkiUnitKerja,
  SmkiDetailTemuan,
} from "@/services/api";

export default function EditLaporanAuditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Master lookup data
  const [unitKerjas, setUnitKerjas] = useState<SmkiUnitKerja[]>([]);
  const [standardClauses, setStandardClauses] = useState<string[]>([]);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form Fields
  const [nomorLaporan, setNomorLaporan] = useState("");
  const [unitKerja, setUnitKerja] = useState("");
  const [tanggalAudit, setTanggalAudit] = useState("");
  const [auditor, setAuditor] = useState("");
  const [auditee, setAuditee] = useState("");
  const [kategori, setKategori] = useState("Kategori");
  const [status, setStatus] = useState("Sedang Ditinjau");

  // Summary counts
  const [temuanMajor, setTemuanMajor] = useState<number>(0);
  const [temuanMinor, setTemuanMinor] = useState<number>(0);
  const [ofi, setOfi] = useState<number>(0);

  // Details
  const [findings, setFindings] = useState<
    Array<{
      id: string;
      tanggal_audit: string;
      kategori_temuan: string;
      klausul_annex: string;
      deskripsi_temuan: string;
      rekomendasi: string;
    }>
  >([]);

  // Load existing report
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [lookupRes, reportRes] = await Promise.all([
          getSmkiLaporanAuditLookup(),
          getSmkiLaporanAuditDetail(id),
        ]);

        if (lookupRes.success && lookupRes.data) {
          if (lookupRes.data.unit_kerjas) setUnitKerjas(lookupRes.data.unit_kerjas);
          if (lookupRes.data.standard_clauses)
            setStandardClauses(lookupRes.data.standard_clauses);
        }

        if (reportRes.success && reportRes.data) {
          const rep = reportRes.data;
          setNomorLaporan(rep.nomor_laporan || "");
          setUnitKerja(rep.nama_unit_kerja || rep.unit_kerja?.nama_unit_kerja || "");
          setTanggalAudit(
            rep.tanggal_audit
              ? new Date(rep.tanggal_audit).toISOString().split("T")[0]
              : ""
          );
          setAuditor(rep.auditor || "");
          setAuditee(rep.auditee || "");
          setKategori(rep.kategori || "Kategori");
          setStatus(rep.status || "Sedang Ditinjau");
          setTemuanMajor(rep.temuan_major || 0);
          setTemuanMinor(rep.temuan_minor || 0);
          setOfi(rep.ofi || 0);

          if (rep.detail_temuans && rep.detail_temuans.length > 0) {
            setFindings(
              rep.detail_temuans.map((d: any, idx: number) => ({
                id: (d.id_detail_temuan || idx + 1).toString(),
                tanggal_audit: d.tanggal_audit || "",
                kategori_temuan: d.kategori_temuan || "Major",
                klausul_annex: d.klausul_annex || "",
                deskripsi_temuan: d.deskripsi_temuan || "",
                rekomendasi: d.rekomendasi || "",
              }))
            );
          } else {
            setFindings([
              {
                id: "1",
                tanggal_audit: rep.tanggal_audit || "",
                kategori_temuan: "Major",
                klausul_annex: "A.5.15 Access Control",
                deskripsi_temuan: "",
                rekomendasi: "",
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data laporan audit:", err);
        showToast("error", "Gagal memuat data laporan audit.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddFinding = () => {
    const nextId = (findings.length + 1).toString();
    setFindings([
      ...findings,
      {
        id: nextId,
        tanggal_audit: tanggalAudit || new Date().toISOString().split("T")[0],
        kategori_temuan: "Major",
        klausul_annex: standardClauses[0] || "A.5.15 Access Control",
        deskripsi_temuan: "",
        rekomendasi: "",
      },
    ]);
  };

  const handleRemoveFinding = (index: number) => {
    if (findings.length <= 1) {
      showToast("error", "Minimal harus ada 1 rincian temuan.");
      return;
    }
    const updated = findings.filter((_, i) => i !== index);
    setFindings(updated);
  };

  const handleFindingChange = (
    index: number,
    field: keyof (typeof findings)[0],
    value: string
  ) => {
    const updated = [...findings];
    updated[index] = { ...updated[index], [field]: value };
    setFindings(updated);
  };

  const handleSubmit = async () => {
    if (!unitKerja) {
      showToast("error", "Unit Kerja wajib dipilih.");
      return;
    }
    if (!auditor.trim()) {
      showToast("error", "Nama Auditor wajib diisi.");
      return;
    }
    if (!auditee.trim()) {
      showToast("error", "Nama Auditee wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const detailsPayload: SmkiDetailTemuan[] = findings.map((f) => ({
        tanggal_audit: f.tanggal_audit,
        kategori_temuan: f.kategori_temuan,
        klausul_annex: f.klausul_annex,
        deskripsi_temuan: f.deskripsi_temuan,
        rekomendasi: f.rekomendasi,
      }));

      const payload = {
        nomor_laporan: nomorLaporan,
        temuan_major: temuanMajor,
        temuan_minor: temuanMinor,
        ofi: ofi,
        unit_kerja: unitKerja,
        auditor: auditor.trim(),
        auditee: auditee.trim(),
        tanggal_audit: tanggalAudit,
        kategori: kategori,
        status: status,
        details: detailsPayload,
      };

      const res = await updateSmkiLaporanAudit(id, payload);
      if (res.success) {
        showToast("success", "Data Laporan Audit berhasil diperbarui.");
        setTimeout(() => {
          router.push("/smki/laporan-audit");
        }, 1000);
      } else {
        showToast("error", res.message || "Gagal memperbarui laporan audit.");
      }
    } catch (err: any) {
      console.error("Gagal update laporan:", err);
      showToast(
        "error",
        err?.response?.data?.message || "Terjadi kesalahan saat menyimpan perubahan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-medium text-slate-600">
          Memuat data laporan audit...
        </span>
      </div>
    );
  }

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="space-y-6 pb-16 max-w-6xl mx-auto">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
              toastMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-rose-50 text-rose-800 border-rose-300"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Breadcrumb & Action Header - Matching Mockup Page 5 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span
                onClick={() => router.push("/smki/laporan-audit")}
                className="hover:text-emerald-700 cursor-pointer transition"
              >
                DAFTAR LAPORAN AUDIT
              </span>
              <span>&gt;</span>
              <span className="text-slate-900">EDIT LAPORAN AUDIT</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Edit Laporan Audit
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                SEDANG MENGEDIT
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                ID: {nomorLaporan}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Perbarui detail temuan dan informasi metadata laporan audit sesuai dengan standar prosedur SMKI FR-006.
            </p>
          </div>

          {/* Action Buttons Top - Matching Mockup Page 5 */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/smki/laporan-audit")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/smki/laporan-audit")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition"
            >
              <X className="w-4 h-4" />
              <span>Batal</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>

        {/* Section 1: Informasi Dasar Laporan - Matching Mockup Page 5 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Informasi Dasar Laporan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unit Kerja */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Unit Kerja</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={unitKerja}
                onChange={(e) => setUnitKerja(e.target.value)}
                className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              >
                <option value="">-- Pilih Unit Kerja --</option>
                {unitKerjas.map((uk) => (
                  <option key={uk.id_unit_kerja} value={uk.nama_unit_kerja}>
                    {uk.nama_unit_kerja}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal Audit Internal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Tanggal Audit Internal</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggalAudit}
                onChange={(e) => setTanggalAudit(e.target.value)}
                className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              />
            </div>

            {/* Auditor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Auditor</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={auditor}
                  onChange={(e) => setAuditor(e.target.value)}
                  placeholder="Nama Auditor"
                  className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Auditee */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Auditee (Pihak Diaudit)</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={auditee}
                  onChange={(e) => setAuditee(e.target.value)}
                  placeholder="Nama Auditee / Penanggung Jawab"
                  className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Kategori</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              >
                <option value="Kategori">Kategori</option>
                <option value="Akses Kontrol">Akses Kontrol</option>
                <option value="Keamanan Jaringan">Keamanan Jaringan</option>
                <option value="Pengelolaan Aset">Pengelolaan Aset</option>
                <option value="Kriptografi">Kriptografi</option>
                <option value="Keamanan Fisik">Keamanan Fisik</option>
              </select>
            </div>

            {/* Status Laporan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Status Laporan</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              >
                <option value="Draft">Draft</option>
                <option value="Sedang Ditinjau">Sedang Ditinjau</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Ringkasan Jumlah Temuan - Matching Mockup Page 5 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <FolderSync className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Ringkasan Jumlah Temuan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Major */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Temuan Major
              </label>
              <input
                type="number"
                min="0"
                value={temuanMajor}
                onChange={(e) => setTemuanMajor(parseInt(e.target.value) || 0)}
                className="w-full text-sm font-bold text-rose-600 bg-rose-50/30 border border-rose-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-rose-500 transition"
              />
            </div>

            {/* Minor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Temuan Minor
              </label>
              <input
                type="number"
                min="0"
                value={temuanMinor}
                onChange={(e) => setTemuanMinor(parseInt(e.target.value) || 0)}
                className="w-full text-sm font-bold text-amber-600 bg-amber-50/30 border border-amber-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-amber-500 transition"
              />
            </div>

            {/* OFI */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                OFI
              </label>
              <input
                type="number"
                min="0"
                value={ofi}
                onChange={(e) => setOfi(parseInt(e.target.value) || 0)}
                className="w-full text-sm font-bold text-emerald-600 bg-emerald-50/30 border border-emerald-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Rincian Temuan Audit - Matching Mockup Page 5 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Rincian Temuan Audit
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Kelola dan edit setiap poin temuan yang ditemukan selama audit.
              </p>
            </div>
          </div>

          {/* Finding Cards */}
          <div className="space-y-6">
            {findings.map((item, idx) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4"
              >
                {/* Header with Circle Index */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">
                      Detail Temuan #{idx + 1}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFinding(idx)}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Klausul / Annex Terkait */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>Klausul / Annex Terkait</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.klausul_annex}
                      onChange={(e) =>
                        handleFindingChange(idx, "klausul_annex", e.target.value)
                      }
                      placeholder="contoh: A.5.15 Access Control"
                      className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                    />
                  </div>

                  {/* Kategori Temuan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>Kategori Temuan</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={item.kategori_temuan}
                      onChange={(e) =>
                        handleFindingChange(idx, "kategori_temuan", e.target.value)
                      }
                      className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                    >
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                      <option value="OFI">OFI</option>
                    </select>
                  </div>
                </div>

                {/* Deskripsi Temuan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>Deskripsi Temuan</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={item.deskripsi_temuan}
                    onChange={(e) =>
                      handleFindingChange(idx, "deskripsi_temuan", e.target.value)
                    }
                    className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                </div>

                {/* Rekomendasi Tindak Lanjut */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>Rekomendasi Tindak Lanjut</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={item.rekomendasi}
                    onChange={(e) =>
                      handleFindingChange(idx, "rekomendasi", e.target.value)
                    }
                    className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Wide Button + Tambah Temuan - Matching Mockup Page 5 */}
          <button
            type="button"
            onClick={handleAddFinding}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/40 text-slate-600 hover:text-emerald-700 text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Klik untuk menambahkan temuan baru ke daftar ini</span>
          </button>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
