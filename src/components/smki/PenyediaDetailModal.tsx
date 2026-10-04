"use client";

import React from "react";
import { X, Building2, MapPin, FileText, Tag, Layers, User, Phone, ClipboardCheck } from "lucide-react";
import { PenyediaItem } from "@/services/smki/daftarPenyediaService";

interface PenyediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PenyediaItem | null;
}

const kode = (id: number) => `PRV-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`;

const formatTanggal = (value?: string) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return value;
  }
};

export default function PenyediaDetailModal({ isOpen, onClose, data }: PenyediaDetailModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0d1d36] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-10 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-t-2xl px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md bg-white/15 text-[11px] font-bold mb-1">ID: {kode(data.id)}</span>
              <h3 className="text-base font-bold">Detail Data Penyedia</h3>
              <p className="text-xs text-emerald-100 mt-0.5">Informasi lengkap profil dan kontrak penyedia barang/jasa.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div>
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-3">Profil Perusahaan</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><Building2 size={12} /> Nama Penyedia</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.nama_perusahaan}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><Phone size={12} /> Telepon / WhatsApp</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.no_telp || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><MapPin size={12} /> Alamat Kantor</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.alamat}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-3">Informasi Kontrak</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><FileText size={12} /> Nomor Kontrak</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.no_kontrak || "-"}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><Tag size={12} /> Kategori Ruang Lingkup</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.kategori_ruang_lingkup?.nama_kategori || "-"}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><Layers size={12} /> Ruang Lingkup Jasa/Pekerjaan</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.ruang_lingkup?.nama_ruang_lingkup || "-"}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><User size={12} /> Contact Person</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.contact_person}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1"><ClipboardCheck size={12} /> Berita Acara/Laporan</p>
                <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${data.berita_acara === "Tersedia" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                  {data.berita_acara}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-400">Terakhir diperbarui: {formatTanggal(data.updated_at)}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
            >
              Tutup Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
