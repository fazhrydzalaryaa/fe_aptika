"use client";

import React, { useState } from "react";
import { X, FileText, Calendar, Hash, Loader2, Download, Lock, Info } from "lucide-react";
import toast from "react-hot-toast";
import { exportHakAksesTiDocx } from "@/services/api";

interface Props {
  open: boolean;
  onClose: () => void;
  mode?: "all" | "single";
  singleId?: number | string | null;
  filters?: {
    search?: string;
    status?: string;
    sifat_akses?: string;
    jenis_permohonan?: string | number;
  };
}

export default function HakAksesTiExportModal({
  open,
  onClose,
  mode = "all",
  singleId = null,
  filters,
}: Props) {
  const [noDokumen, setNoDokumen] = useState("SMKI/FORM/TI/2024/021");
  const [noRevisi, setNoRevisi] = useState("1.1");
  const [tanggalBerlaku, setTanggalBerlaku] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [format, setFormat] = useState("docx");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const triggerDownload = (blobData: any, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (format === "pdf") {
      toast.error("Format PDF mengikuti gaya cetak dokumen. Silakan buka detail lalu pilih Cetak Dokumen.");
      return;
    }
    setLoading(true);
    try {
      const params: any = {
        no_dokumen: noDokumen || undefined,
        no_revisi: noRevisi || undefined,
        tanggal_berlaku: tanggalBerlaku || undefined,
      };
      if (mode === "single" && singleId) {
        params.id = singleId;
      } else if (filters) {
        params.search = filters.search || undefined;
        params.status = filters.status || undefined;
        params.sifat_akses = filters.sifat_akses || undefined;
      }

      const blob = await exportHakAksesTiDocx(params);
      const dateStr = new Date().toISOString().slice(0, 10);
      triggerDownload(blob, `FR-018_Formulir_Hak_Akses_TI_${dateStr}.docx`);
      toast.success("Dokumen FR-018 (DOCX) berhasil diunduh!");
      onClose();
    } catch (err: any) {
      let errMsg = "Gagal mengunduh dokumen FR-018";
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json?.message) errMsg = json.message;
        } catch (_) {}
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-5 text-white">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest uppercase text-emerald-100 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            Konfigurasi Ekspor
          </span>
          <h3 className="text-xl font-extrabold">Ekspor Formulir Hak Akses</h3>
          <p className="text-xs text-emerald-100 mt-1.5 leading-relaxed max-w-sm">
            Sesuaikan parameter kontrol dokumen dan format file sebelum menghasilkan laporan resmi untuk kebutuhan audit SMKI.
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          <div>
            <h4 className="flex items-center gap-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
              <FileText size={13} className="text-emerald-600" />
              Kontrol Dokumen (ISO 27001)
            </h4>

            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <FileText size={13} className="text-emerald-600" /> Nomor Dokumen <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              type="text"
              value={noDokumen}
              onChange={(e) => setNoDokumen(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white mb-3"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Hash size={13} className="text-emerald-600" /> Nomor Revisi <span className="text-rose-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={noRevisi}
                  onChange={(e) => setNoRevisi(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-600" /> Tanggal Berlaku <span className="text-rose-500">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  value={tanggalBerlaku}
                  onChange={(e) => setTanggalBerlaku(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h4 className="flex items-center gap-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
              <Calendar size={13} className="text-emerald-600" />
              Preferensi Generasi File
            </h4>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Format Output
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
            >
              <option value="docx">Microsoft Word (.docx)</option>
              <option value="pdf">Dokumen Cetak / PDF</option>
            </select>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center flex-shrink-0">
              <Info size={15} className="text-emerald-700 dark:text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Pemberitahuan Audit Trail</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 leading-relaxed mt-0.5">
                Proses ekspor dokumen ini akan dicatat dalam log aktivitas sistem. Pastikan data yang diekspor digunakan sesuai kebijakan privasi data organisasi.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Lock size={12} className="text-emerald-600" /> Keamanan Data Terjamin
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>Ekspor Laporan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
