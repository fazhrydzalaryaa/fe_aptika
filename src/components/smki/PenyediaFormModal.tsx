"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Building2, MapPin, FileText, User, Phone, ClipboardCheck, Loader2, PlusCircle, Edit3 } from "lucide-react";
import { PenyediaItem, LookupData, PenyediaFormPayload } from "@/services/smki/daftarPenyediaService";

interface PenyediaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PenyediaFormPayload) => Promise<void>;
  initialData?: PenyediaItem | null;
  lookup: LookupData;
}

export default function PenyediaFormModal({ isOpen, onClose, onSave, initialData, lookup }: PenyediaFormModalProps) {
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [alamat, setAlamat] = useState("");
  const [noKontrak, setNoKontrak] = useState("");
  const [kategoriId, setKategoriId] = useState<number | "">("");
  const [ruangLingkupId, setRuangLingkupId] = useState<number | "">("");
  const [contactPerson, setContactPerson] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [beritaAcara, setBeritaAcara] = useState<"Tersedia" | "Tidak Ada">("Tersedia");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setNamaPerusahaan(initialData.nama_perusahaan || "");
      setAlamat(initialData.alamat || "");
      setNoKontrak(initialData.no_kontrak || "");
      setKategoriId(initialData.kategori_ruang_lingkup_id ?? "");
      setRuangLingkupId(initialData.ruang_lingkup_id ?? "");
      setContactPerson(initialData.contact_person || "");
      setNoTelp(initialData.no_telp || "");
      setBeritaAcara(initialData.berita_acara || "Tersedia");
    } else {
      setNamaPerusahaan("");
      setAlamat("");
      setNoKontrak("");
      setKategoriId("");
      setRuangLingkupId("");
      setContactPerson("");
      setNoTelp("");
      setBeritaAcara("Tersedia");
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Ruang lingkup hanya menampilkan pilihan sesuai kategori yang dipilih (use case scenario 3, langkah 6-8)
  const filteredRuangLingkup = useMemo(
    () => lookup.ruang_lingkup.filter((r) => r.kategori_ruang_lingkup_id === kategoriId),
    [lookup.ruang_lingkup, kategoriId]
  );

  const handleKategoriChange = (value: string) => {
    const id = value === "" ? "" : Number(value);
    setKategoriId(id);
    setRuangLingkupId(""); // reset ruang lingkup setiap kategori berubah
  };

  if (!isOpen) return null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!namaPerusahaan.trim()) next.namaPerusahaan = "Nama penyedia wajib diisi";
    if (!alamat.trim()) next.alamat = "Alamat lengkap diperlukan untuk verifikasi";
    if (!contactPerson.trim()) next.contactPerson = "Contact Person wajib diisi";
    if (!noTelp.trim()) next.noTelp = "Telepon/WhatsApp wajib diisi";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        nama_perusahaan: namaPerusahaan.trim(),
        alamat: alamat.trim(),
        no_kontrak: noKontrak.trim() || null,
        kategori_ruang_lingkup_id: kategoriId === "" ? null : kategoriId,
        ruang_lingkup_id: ruangLingkupId === "" ? null : ruangLingkupId,
        contact_person: contactPerson.trim(),
        no_telp: noTelp.trim(),
        berita_acara: beritaAcara,
      });
      onClose();
    } catch (err) {
      // toast error ditangani oleh pemanggil (page)
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0d1d36] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-10 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-t-2xl px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              {isEdit ? <Edit3 size={18} /> : <PlusCircle size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold">{isEdit ? "Edit Data Penyedia" : "Tambah Penyedia Baru"}</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {isEdit
                  ? "Lengkapi formulir di bawah ini untuk mengubah data penyedia barang/jasa."
                  : "Lengkapi formulir di bawah ini untuk menambahkan penyedia barang atau jasa baru."}
              </p>
            </div>
          </div>
          <button type="button" onClick={loading ? undefined : onClose} className="text-white/80 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Nama Penyedia <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={namaPerusahaan}
                  onChange={(e) => setNamaPerusahaan(e.target.value)}
                  placeholder="Masukkan nama perusahaan/penyedia"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 ${errors.namaPerusahaan ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                />
              </div>
              {errors.namaPerusahaan && <p className="text-[11px] text-red-500 mt-1">{errors.namaPerusahaan}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Alamat Lengkap <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. Merdeka No. 123, Kota Bandung"
                  rows={2}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none ${errors.alamat ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                />
              </div>
              {errors.alamat && <p className="text-[11px] text-red-500 mt-1">{errors.alamat}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Nomor Kontrak</label>
              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={noKontrak}
                  onChange={(e) => setNoKontrak(e.target.value)}
                  placeholder="Contoh: 001/SPK/DISKO/2024"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Telepon / WhatsApp <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={noTelp}
                  onChange={(e) => setNoTelp(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 ${errors.noTelp ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                />
              </div>
              {errors.noTelp && <p className="text-[11px] text-red-500 mt-1">{errors.noTelp}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Kontak Person (CP) <span className="text-red-500">*</span></label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Nama penanggung jawab"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 ${errors.contactPerson ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                />
              </div>
              {errors.contactPerson && <p className="text-[11px] text-red-500 mt-1">{errors.contactPerson}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Status Laporan <span className="text-red-500">*</span></label>
              <div className="relative">
                <ClipboardCheck size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={beritaAcara}
                  onChange={(e) => setBeritaAcara(e.target.value as "Tersedia" | "Tidak Ada")}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 appearance-none"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Tidak Ada">Tidak Ada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Kategori Ruang Lingkup Pekerjaan</label>
              <select
                value={kategoriId}
                onChange={(e) => handleKategoriChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="">Contoh: Teknologi Informasi & Sistem Informasi</option>
                {lookup.kategori.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Ruang Lingkup Jasa/Pekerjaan</label>
              <select
                value={ruangLingkupId}
                onChange={(e) => setRuangLingkupId(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={kategoriId === ""}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{kategoriId === "" ? "Pilih kategori terlebih dahulu" : "Contoh: Infrastruktur Jaringan"}</option>
                {filteredRuangLingkup.map((r) => (
                  <option key={r.id} value={r.id}>{r.nama_ruang_lingkup}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
