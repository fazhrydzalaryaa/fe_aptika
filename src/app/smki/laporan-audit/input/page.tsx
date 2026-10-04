"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  FileCheck,
  User,
  Calendar,
  Plus,
  Trash2,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  getSmkiLaporanAuditLookup,
  createSmkiLaporanAudit,
  SmkiUnitKerja,
  SmkiDetailTemuan,
} from "@/services/api";

export default function TambahLaporanAuditPage() {
  const router = useRouter();

  // Master lookup data
  const [unitKerjas, setUnitKerjas] = useState<SmkiUnitKerja[]>([]);
  const [standardClauses, setStandardClauses] = useState<string[]>([]);
  const [suggestedNomor, setSuggestedNomor] = useState("");
  const [isLoadingLookup, setIsLoadingLookup] = useState(true);

  // Form Header State
  const [nomorLaporan, setNomorLaporan] = useState("");
  const [temuanMajor, setTemuanMajor] = useState<string>("");
  const [temuanMinor, setTemuanMinor] = useState<string>("");
  const [ofi, setOfi] = useState<string>("");
  const [unitKerja, setUnitKerja] = useState("");
  const [auditor, setAuditor] = useState("");
  const [auditee, setAuditee] = useState("");
  const [tanggalAudit, setTanggalAudit] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Rincian Temuan State
  const [findings, setFindings] = useState<
    Array<{
      id: string;
      tanggal_audit: string;
      kategori_temuan: string;
      klausul_annex: string;
      deskripsi_temuan: string;
      rekomendasi: string;
    }>
  >([
    {
      id: "1",
      tanggal_audit: new Date().toISOString().split("T")[0],
      kategori_temuan: "Major",
      klausul_annex: "A.5.15 Access Control",
      deskripsi_temuan: "",
      rekomendasi: "",
    },
  ]);

  // Loading & Toast State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load Lookup Data
  useEffect(() => {
    const loadLookup = async () => {
      try {
        const res = await getSmkiLaporanAuditLookup();
        if (res.success && res.data) {
          if (res.data.unit_kerjas?.length) {
            setUnitKerjas(res.data.unit_kerjas);
            setUnitKerja(res.data.unit_kerjas[0].nama_unit_kerja);
          }
          if (res.data.standard_clauses?.length) {
            setStandardClauses(res.data.standard_clauses);
          }
          if (res.data.suggested_nomor) {
            setSuggestedNomor(res.data.suggested_nomor);
            setNomorLaporan(res.data.suggested_nomor);
          }
        }
      } catch (err) {
        console.error("Gagal memuat lookup data:", err);
      } finally {
        setIsLoadingLookup(false);
      }
    };
    loadLookup();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add new finding item
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

  // Remove finding item
  const handleRemoveFinding = (index: number) => {
    if (findings.length <= 1) {
      showToast("error", "Minimal harus ada 1 rincian temuan.");
      return;
    }
    const updated = findings.filter((_, i) => i !== index);
    setFindings(updated);
  };

  // Update specific finding field
  const handleFindingChange = (
    index: number,
    field: keyof (typeof findings)[0],
    value: string
  ) => {
    const updated = [...findings];
    updated[index] = { ...updated[index], [field]: value };
    setFindings(updated);
  };

  // Submit Handler
  const handleSubmit = async (targetStatus: "Draft" | "Sedang Ditinjau") => {
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
        nomor_laporan: nomorLaporan || suggestedNomor,
        temuan_major: temuanMajor !== "" ? parseInt(temuanMajor) : undefined,
        temuan_minor: temuanMinor !== "" ? parseInt(temuanMinor) : undefined,
        ofi: ofi !== "" ? parseInt(ofi) : undefined,
        unit_kerja: unitKerja,
        auditor: auditor.trim(),
        auditee: auditee.trim(),
        tanggal_audit: tanggalAudit,
        status: targetStatus,
        details: detailsPayload,
      };

      const res = await createSmkiLaporanAudit(payload);
      if (res.success) {
        showToast("success", "Laporan Audit berhasil disimpan.");
        setTimeout(() => {
          router.push("/smki/laporan-audit");
        }, 1000);
      } else {
        showToast("error", res.message || "Gagal menyimpan laporan audit.");
      }
    } catch (err: any) {
      console.error("Gagal simpan laporan:", err);
      showToast(
        "error",
        err?.response?.data?.message || "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Breadcrumb & Action Buttons Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span
                onClick={() => router.push("/smki/laporan-audit")}
                className="hover:text-emerald-700 cursor-pointer transition"
              >
                Laporan Audit SMKI
              </span>
              <span>&gt;</span>
              <span className="text-slate-900">Tambah Laporan Audit</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Tambah Laporan Audit
            </h1>
            <p className="text-xs text-slate-500">
              Lengkapi detail formulir audit internal sesuai dengan standar SMKI FR-006.
            </p>
          </div>

          {/* Action Buttons Top - Matching Mockup Page 4 */}
          <div className="flex items-center gap-2.5">
            {/* Batal */}
            <button
              type="button"
              onClick={() => router.push("/smki/laporan-audit")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>Batal</span>
            </button>

            {/* Simpan sebagai Draft */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit("Draft")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-[#065f46] text-xs font-semibold transition disabled:opacity-50"
            >
              <Clock className="w-4 h-4 text-[#065f46]" />
              <span>Simpan sebagai Draft</span>
            </button>

            {/* Simpan Laporan Audit */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit("Sedang Ditinjau")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileCheck className="w-4 h-4" />
              )}
              <span>Simpan Laporan Audit</span>
            </button>
          </div>
        </div>

        {/* Card 1: Informasi Laporan Audit - Matching Mockup Page 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Informasi Laporan Audit
            </h2>
          </div>

          <div className="space-y-4">
            {/* Row 1: Temuan Major & Temuan Minor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Temuan Major
                </label>
                <input
                  type="number"
                  min="0"
                  value={temuanMajor}
                  onChange={(e) => setTemuanMajor(e.target.value)}
                  placeholder="Jumlah total temuan"
                  className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Temuan Minor
                </label>
                <input
                  type="number"
                  min="0"
                  value={temuanMinor}
                  onChange={(e) => setTemuanMinor(e.target.value)}
                  placeholder="Jumlah total temuan"
                  className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
              </div>
            </div>

            {/* Row 2: OFI */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                OFI
              </label>
              <input
                type="number"
                min="0"
                value={ofi}
                onChange={(e) => setOfi(e.target.value)}
                placeholder="Jumlah total rekomendasi/peluang peningkatan"
                className="w-full text-xs bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              />
            </div>

            {/* Row 3: Unit Kerja * */}
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

            {/* Row 4: Auditor * & Auditee (Pihak Diaudit) * */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
        </div>

        {/* Card 2: Rincian Temuan - Matching Mockup Page 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Rincian Temuan
            </h2>
          </div>

          {/* Dynamic Findings List */}
          <div className="space-y-6">
            {findings.map((item, idx) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-4 relative"
              >
                {/* Finding Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveFinding(idx)}
                      title="Hapus Temuan"
                      className="text-rose-500 hover:text-rose-700 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h3 className="text-sm font-bold text-slate-800">
                      Temuan {idx + 1}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tanggal Audit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>Tanggal Audit</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={item.tanggal_audit}
                        onChange={(e) =>
                          handleFindingChange(idx, "tanggal_audit", e.target.value)
                        }
                        className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                      />
                    </div>
                  </div>

                  {/* Kategori */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>Kategori</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={item.kategori_temuan}
                      onChange={(e) =>
                        handleFindingChange(idx, "kategori_temuan", e.target.value)
                      }
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                    >
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                      <option value="OFI">OFI</option>
                    </select>
                  </div>
                </div>

                {/* Klausul/Annex Terkait */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>Klausul/Annex terkait</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={item.klausul_annex}
                    onChange={(e) =>
                      handleFindingChange(idx, "klausul_annex", e.target.value)
                    }
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  >
                    {standardClauses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
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
                    placeholder="Deskripsi lengkap :"
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                </div>

                {/* Rekomendasi Tindak Lanjut */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Rekomendasi Tindak Lanjut
                  </label>
                  <textarea
                    rows={2}
                    value={item.rekomendasi}
                    onChange={(e) =>
                      handleFindingChange(idx, "rekomendasi", e.target.value)
                    }
                    placeholder="Rekomendasi perbaikan / tindakan korektif..."
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Button + Tambah Temuan - Matching Mockup Page 4 */}
          <div>
            <button
              type="button"
              onClick={handleAddFinding}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Temuan</span>
            </button>
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}
