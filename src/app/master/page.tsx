"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Car,
  Users,
  FileSignature,
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  Loader2,
  Database,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import {
  getRekeningList,
  createRekening,
  updateRekening,
  deleteRekening,
  getAlatAngkutanList,
  createAlatAngkutan,
  updateAlatAngkutan,
  deleteAlatAngkutan,
  getPegawaiList,
  createPegawai,
  updatePegawai,
  deletePegawai,
  getMasterNdaList,
  createMasterNda,
  updateMasterNda,
  deleteMasterNda,
} from "@/services/api";

type TabType = "rekening" | "angkutan" | "pegawai" | "nda";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabType>("rekening");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Data States
  const [rekeningList, setRekeningList] = useState<any[]>([]);
  const [angkutanList, setAngkutanList] = useState<any[]>([]);
  const [pegawaiList, setPegawaiList] = useState<any[]>([]);
  const [ndaList, setNdaList] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);

  // Form States
  const [formRekening, setFormRekening] = useState({
    kode_rekening: "",
    nomor_rekening: "",
    nama_rekening: "",
  });

  const [formAngkutan, setFormAngkutan] = useState({
    nama: "",
    deskripsi: "",
  });

  const [formPegawai, setFormPegawai] = useState({
    nama: "",
    nip: "",
    pangkat: "",
    jabatan: "",
    role: "staff",
    tanggal_lahir: "1990-01-01",
  });

  const [formNda, setFormNda] = useState({
    judul: "",
    nama_pihak_pertama: "",
    nip_pihak_pertama: "",
    jabatan_pihak_pertama: "",
    instansi_pihak_pertama: "Dinas Komunikasi dan Informatika Provinsi Jawa Barat",
    klausul_perjanjian: "",
    is_active: true,
  });

  // Fetch All Data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [rekRes, angRes, pegRes, ndaRes] = await Promise.allSettled([
        getRekeningList(),
        getAlatAngkutanList(),
        getPegawaiList(),
        getMasterNdaList(),
      ]);

      if (rekRes.status === "fulfilled" && rekRes.value?.data) {
        setRekeningList(rekRes.value.data);
      }
      if (angRes.status === "fulfilled" && angRes.value?.data) {
        setAngkutanList(angRes.value.data);
      }
      if (pegRes.status === "fulfilled" && pegRes.value?.data) {
        setPegawaiList(pegRes.value.data);
      }
      if (ndaRes.status === "fulfilled" && ndaRes.value?.data) {
        setNdaList(ndaRes.value.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat beberapa referensi data master.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered Data
  const filteredRekening = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rekeningList;
    return rekeningList.filter(
      (item) =>
        item.nama_rekening?.toLowerCase().includes(q) ||
        item.kode_rekening?.toLowerCase().includes(q) ||
        item.nomor_rekening?.toLowerCase().includes(q)
    );
  }, [rekeningList, search]);

  const filteredAngkutan = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return angkutanList;
    return angkutanList.filter(
      (item) =>
        item.nama?.toLowerCase().includes(q) ||
        item.deskripsi?.toLowerCase().includes(q)
    );
  }, [angkutanList, search]);

  const filteredPegawai = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return pegawaiList;
    return pegawaiList.filter(
      (item) =>
        item.nama?.toLowerCase().includes(q) ||
        item.nip?.toLowerCase().includes(q) ||
        item.jabatan?.toLowerCase().includes(q) ||
        item.pangkat?.toLowerCase().includes(q)
    );
  }, [pegawaiList, search]);

  const filteredNda = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ndaList;
    return ndaList.filter(
      (item) =>
        item.judul?.toLowerCase().includes(q) ||
        item.nama_pihak_pertama?.toLowerCase().includes(q) ||
        item.nip_pihak_pertama?.toLowerCase().includes(q) ||
        item.jabatan_pihak_pertama?.toLowerCase().includes(q)
    );
  }, [ndaList, search]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    if (activeTab === "rekening") {
      setFormRekening({ kode_rekening: "", nomor_rekening: "", nama_rekening: "" });
    } else if (activeTab === "angkutan") {
      setFormAngkutan({ nama: "", deskripsi: "" });
    } else if (activeTab === "pegawai") {
      setFormPegawai({
        nama: "",
        nip: "",
        pangkat: "",
        jabatan: "",
        role: "staff",
        tanggal_lahir: "1990-01-01",
      });
    } else if (activeTab === "nda") {
      setFormNda({
        judul: "",
        nama_pihak_pertama: "",
        nip_pihak_pertama: "",
        jabatan_pihak_pertama: "",
        instansi_pihak_pertama: "Dinas Komunikasi dan Informatika Provinsi Jawa Barat",
        klausul_perjanjian: "",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === "rekening") {
      setFormRekening({
        kode_rekening: item.kode_rekening || "",
        nomor_rekening: item.nomor_rekening || "",
        nama_rekening: item.nama_rekening || "",
      });
    } else if (activeTab === "angkutan") {
      setFormAngkutan({
        nama: item.nama || "",
        deskripsi: item.deskripsi || "",
      });
    } else if (activeTab === "pegawai") {
      setFormPegawai({
        nama: item.nama || "",
        nip: item.nip || "",
        pangkat: item.pangkat || "",
        jabatan: item.jabatan || "",
        role: item.role || "staff",
        tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.split("T")[0] : "1990-01-01",
      });
    } else if (activeTab === "nda") {
      setFormNda({
        judul: item.judul || "",
        nama_pihak_pertama: item.nama_pihak_pertama || "",
        nip_pihak_pertama: item.nip_pihak_pertama || "",
        jabatan_pihak_pertama: item.jabatan_pihak_pertama || "",
        instansi_pihak_pertama: item.instansi_pihak_pertama || "Dinas Komunikasi dan Informatika Provinsi Jawa Barat",
        klausul_perjanjian: item.klausul_perjanjian || "",
        is_active: item.is_active ?? true,
      });
    }
    setIsModalOpen(true);
  };

  // Submit Form Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === "rekening") {
        if (!formRekening.kode_rekening || !formRekening.nomor_rekening || !formRekening.nama_rekening) {
          toast.error("Harap isi semua kolom kode rekening.");
          setIsSubmitting(false);
          return;
        }
        if (editingItem) {
          await updateRekening(editingItem.id, formRekening);
          toast.success("Kode Rekening berhasil diperbarui.");
        } else {
          await createRekening(formRekening);
          toast.success("Kode Rekening baru berhasil ditambahkan.");
        }
      } else if (activeTab === "angkutan") {
        if (!formAngkutan.nama) {
          toast.error("Nama alat angkutan wajib diisi.");
          setIsSubmitting(false);
          return;
        }
        if (editingItem) {
          await updateAlatAngkutan(editingItem.id, formAngkutan);
          toast.success("Alat Angkutan berhasil diperbarui.");
        } else {
          await createAlatAngkutan(formAngkutan);
          toast.success("Alat Angkutan baru berhasil ditambahkan.");
        }
      } else if (activeTab === "pegawai") {
        if (!formPegawai.nama || !formPegawai.nip || !formPegawai.pangkat || !formPegawai.jabatan) {
          toast.error("Nama, NIP, Pangkat, dan Jabatan pegawai wajib diisi.");
          setIsSubmitting(false);
          return;
        }
        if (editingItem) {
          await updatePegawai(editingItem.id, formPegawai);
          toast.success("Data Pegawai berhasil diperbarui.");
        } else {
          await createPegawai(formPegawai);
          toast.success("Pegawai baru berhasil ditambahkan.");
        }
      } else if (activeTab === "nda") {
        if (!formNda.judul || !formNda.nama_pihak_pertama) {
          toast.error("Judul NDA dan Nama Pejabat Pihak Pertama wajib diisi.");
          setIsSubmitting(false);
          return;
        }
        if (editingItem) {
          await updateMasterNda(editingItem.id, formNda);
          toast.success("Master NDA berhasil diperbarui.");
        } else {
          await createMasterNda(formNda);
          toast.success("Master NDA baru berhasil ditambahkan.");
        }
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDelete = (item: any) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      if (activeTab === "rekening") {
        await deleteRekening(deletingItem.id);
        toast.success("Kode Rekening berhasil dihapus.");
      } else if (activeTab === "angkutan") {
        await deleteAlatAngkutan(deletingItem.id);
        toast.success("Alat Angkutan berhasil dihapus.");
      } else if (activeTab === "pegawai") {
        await deletePegawai(deletingItem.id);
        toast.success("Data Pegawai berhasil dihapus.");
      } else if (activeTab === "nda") {
        await deleteMasterNda(deletingItem.id);
        toast.success("Master NDA berhasil dihapus.");
      }
      setIsDeleteModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal menghapus data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabsConfig = [
    {
      id: "rekening" as TabType,
      label: "Kode Rekening",
      count: rekeningList.length,
      icon: CreditCard,
      usage: "Digunakan di Surat Perjalanan Dinas (SPD) & Alokasi Anggaran",
    },
    {
      id: "angkutan" as TabType,
      label: "Alat Angkutan",
      count: angkutanList.length,
      icon: Car,
      usage: "Digunakan pada Pemilihan Transportasi Surat Perjalanan Dinas (SPD)",
    },
    {
      id: "pegawai" as TabType,
      label: "Daftar Pegawai",
      count: pegawaiList.length,
      icon: Users,
      usage: "Digunakan sebagai Pejabat Pemberi Perintah, Pegawai Diperintah & Pengikut",
    },
    {
      id: "nda" as TabType,
      label: "Master NDA",
      count: ndaList.length,
      icon: FileSignature,
      usage: "Digunakan sebagai Pejabat Penandatangan & Template Dokumen NDA Magang / Pihak Ketiga",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200">
              <Database size={14} />
              <span>Sentral Referensi & Master Data</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Manajemen Data Master
            </h1>
            <p className="text-sm md:text-base text-slate-100/90 max-w-2xl leading-relaxed">
              Pusat referensi data sistem untuk mengisi formulir SPD, Surat Dinas, Penugasan, dan Cetak NDA.
              Data yang Anda tambahkan di sini akan langsung tersedia di seluruh modul aplikasi.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={18} />
            <span>Tambah {tabsConfig.find((t) => t.id === activeTab)?.label}</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tabsConfig.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <div
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                setSearch("");
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer select-none group ${
                isActive
                  ? "bg-white dark:bg-slate-800/90 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                  : "bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-800 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.label}
                </span>
                <div
                  className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${
                    t.id === "rekening"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 border border-blue-200/60"
                      : t.id === "angkutan"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200/60"
                      : t.id === "pegawai"
                      ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 border border-purple-200/60"
                      : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200/60"
                  }`}
                >
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {t.count}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  item terdaftar
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-400 line-clamp-1">
                {t.usage}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Data Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {tabsConfig.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id);
                    setSearch("");
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon size={16} />
                  <span>{t.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? "bg-blue-700 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder={`Cari ${tabsConfig.find((t) => t.id === activeTab)?.label.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            <button
              onClick={fetchAllData}
              title="Muat Ulang Data"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Table Content by Active Tab */}
        <div className="p-4 md:p-6 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Memuat data master...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: KODE REKENING */}
              {activeTab === "rekening" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="py-3.5 px-4 w-12 text-center">No</th>
                        <th className="py-3.5 px-4">Kode Rekening</th>
                        <th className="py-3.5 px-4">Nomor Rekening</th>
                        <th className="py-3.5 px-4">Nama Rekening / Peruntukan</th>
                        <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredRekening.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                            {search ? "Tidak ada rekening yang sesuai pencarian." : "Belum ada data rekening."}
                          </td>
                        </tr>
                      ) : (
                        filteredRekening.map((item, idx) => (
                          <tr
                            key={item.id || idx}
                            className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {item.kode_rekening}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-200">
                              {item.nomor_rekening}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-white">
                              {item.nama_rekening}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-blue-950/40 transition-colors"
                                  title="Edit Rekening"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleOpenDelete(item)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-950/40 transition-colors"
                                  title="Hapus Rekening"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: ALAT ANGKUTAN */}
              {activeTab === "angkutan" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="py-3.5 px-4 w-12 text-center">No</th>
                        <th className="py-3.5 px-4">Nama Alat Angkutan / Kendaraan</th>
                        <th className="py-3.5 px-4">Keterangan / Deskripsi Operasional</th>
                        <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredAngkutan.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                            {search ? "Tidak ada alat angkutan yang sesuai pencarian." : "Belum ada data alat angkutan."}
                          </td>
                        </tr>
                      ) : (
                        filteredAngkutan.map((item, idx) => (
                          <tr
                            key={item.id || idx}
                            className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                              <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                                <Car size={14} />
                              </span>
                              <span>{item.nama}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                              {item.deskripsi || "-"}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-emerald-950/40 transition-colors"
                                  title="Edit Alat Angkutan"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleOpenDelete(item)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-950/40 transition-colors"
                                  title="Hapus Alat Angkutan"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: DAFTAR PEGAWAI */}
              {activeTab === "pegawai" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="py-3.5 px-4 w-12 text-center">No</th>
                        <th className="py-3.5 px-4">Nama Lengkap & Gelar</th>
                        <th className="py-3.5 px-4">NIP</th>
                        <th className="py-3.5 px-4">Pangkat / Golongan</th>
                        <th className="py-3.5 px-4">Jabatan</th>
                        <th className="py-3.5 px-4 text-center">Peran / Role</th>
                        <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredPegawai.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                            {search ? "Tidak ada pegawai yang sesuai pencarian." : "Belum ada data pegawai."}
                          </td>
                        </tr>
                      ) : (
                        filteredPegawai.map((item, idx) => (
                          <tr
                            key={item.id || idx}
                            className="hover:bg-purple-50/40 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              {item.nama}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                              {item.nip}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                              {item.pangkat}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                              {item.jabatan}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase ${
                                  item.role === "kabid"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {item.role === "kabid" ? "Kepala Bidang" : "Staff"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-300 dark:hover:bg-purple-950/40 transition-colors"
                                  title="Edit Pegawai"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleOpenDelete(item)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-950/40 transition-colors"
                                  title="Hapus Pegawai"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: MASTER NDA */}
              {activeTab === "nda" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNda.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                        {search ? "Tidak ada master NDA yang sesuai pencarian." : "Belum ada master NDA."}
                      </div>
                    ) : (
                      filteredNda.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-600 transition-all group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                                  <FileSignature size={18} />
                                </span>
                                <div>
                                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                    {item.judul}
                                  </h3>
                                  <p className="text-[11px] text-slate-400 font-medium">
                                    {item.instansi_pihak_pertama || "Dinas Komunikasi dan Informatika Provinsi Jawa Barat"}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  item.is_active
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {item.is_active ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                PIHAK PERTAMA (Penandatangan):
                              </div>
                              <div className="font-bold text-slate-800 dark:text-slate-100">
                                {item.nama_pihak_pertama}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 text-[11px]">
                                <span>NIP: {item.nip_pihak_pertama || "-"}</span>
                                <span>Jabatan: {item.jabatan_pihak_pertama || "-"}</span>
                              </div>
                              {item.klausul_perjanjian && (
                                <p className="pt-2 text-[11px] text-slate-600 dark:text-slate-300 italic border-t border-slate-100 dark:border-slate-800 line-clamp-2">
                                  &ldquo;{item.klausul_perjanjian}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-300 dark:hover:bg-amber-950/40 transition-colors flex items-center gap-1.5"
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleOpenDelete(item)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 size={13} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Form Modal (Create / Edit) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? "Edit" : "Tambah"} ${
          tabsConfig.find((t) => t.id === activeTab)?.label
        }`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* FORM: REKENING */}
          {activeTab === "rekening" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Kode Rekening <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: 5.1.02.04.01.0001"
                  value={formRekening.kode_rekening}
                  onChange={(e) =>
                    setFormRekening({ ...formRekening, kode_rekening: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Nomor Rekening Kas / Akun <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: 0021-9876-0001"
                  value={formRekening.nomor_rekening}
                  onChange={(e) =>
                    setFormRekening({ ...formRekening, nomor_rekening: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Nama Rekening / Peruntukan Anggaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Belanja Perjalanan Dinas Biasa"
                  value={formRekening.nama_rekening}
                  onChange={(e) =>
                    setFormRekening({ ...formRekening, nama_rekening: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>
            </>
          )}

          {/* FORM: ALAT ANGKUTAN */}
          {activeTab === "angkutan" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Nama Alat Angkutan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Kendaraan Dinas / Kereta Api / Pesawat Udara"
                  value={formAngkutan.nama}
                  onChange={(e) =>
                    setFormAngkutan({ ...formAngkutan, nama: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Keterangan / Deskripsi Operasional (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Misal: Kendaraan dinas operasional roda 4 Pemprov Jabar"
                  value={formAngkutan.deskripsi}
                  onChange={(e) =>
                    setFormAngkutan({ ...formAngkutan, deskripsi: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>
            </>
          )}

          {/* FORM: PEGAWAI */}
          {activeTab === "pegawai" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Nama Lengkap & Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Dian Istanti, S.Sos, MAP"
                  value={formPegawai.nama}
                  onChange={(e) =>
                    setFormPegawai({ ...formPegawai, nama: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    NIP (18 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    placeholder="196905191998032001"
                    value={formPegawai.nip}
                    onChange={(e) =>
                      setFormPegawai({ ...formPegawai, nip: e.target.value })
                    }
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Pangkat / Golongan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Pembina Tk. I - IV/b"
                    value={formPegawai.pangkat}
                    onChange={(e) =>
                      setFormPegawai({ ...formPegawai, pangkat: e.target.value })
                    }
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Jabatan Struktural / Fungsional <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Kepala Bidang Aplikasi Informatika"
                    value={formPegawai.jabatan}
                    onChange={(e) =>
                      setFormPegawai({ ...formPegawai, jabatan: e.target.value })
                    }
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Peran / Role Pegawai <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formPegawai.role}
                    onChange={(e) =>
                      setFormPegawai({ ...formPegawai, role: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                  >
                    <option value="staff">Staff / Pegawai Pelaksana</option>
                    <option value="kabid">Kepala Bidang (Pemberi Perintah SPD)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* FORM: MASTER NDA */}
          {activeTab === "nda" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Judul Perjanjian Kerahasiaan (NDA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: NDA Peserta Magang / PKL Mahasiswa"
                  value={formNda.judul}
                  onChange={(e) => setFormNda({ ...formNda, judul: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Nama Pejabat (Pihak Pertama) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Dian Istanti, S.Sos, MAP"
                    value={formNda.nama_pihak_pertama}
                    onChange={(e) =>
                      setFormNda({ ...formNda, nama_pihak_pertama: e.target.value })
                    }
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    NIP Pejabat Pihak Pertama
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: 19690519 199803 2 001"
                    value={formNda.nip_pihak_pertama}
                    onChange={(e) =>
                      setFormNda({ ...formNda, nip_pihak_pertama: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Jabatan Pejabat Pihak Pertama
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Kepala Bidang Aplikasi Informatika"
                    value={formNda.jabatan_pihak_pertama}
                    onChange={(e) =>
                      setFormNda({ ...formNda, jabatan_pihak_pertama: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Instansi Pihak Pertama
                  </label>
                  <input
                    type="text"
                    placeholder="Dinas Komunikasi dan Informatika Provinsi Jawa Barat"
                    value={formNda.instansi_pihak_pertama}
                    onChange={(e) =>
                      setFormNda({ ...formNda, instansi_pihak_pertama: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Klausul Utama Kerahasiaan
                </label>
                <textarea
                  rows={3}
                  placeholder="Kewajiban menjaga kerahasiaan seluruh informasi non-publik, data operasional, kredensial, dan dokumen teknis..."
                  value={formNda.klausul_perjanjian}
                  onChange={(e) =>
                    setFormNda({ ...formNda, klausul_perjanjian: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="nda_is_active"
                  checked={formNda.is_active}
                  onChange={(e) => setFormNda({ ...formNda, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <label htmlFor="nda_is_active" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Jadikan Template Aktif
                </label>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              <span>{editingItem ? "Simpan Perubahan" : "Tambahkan Data"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Data"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p>
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          {deletingItem && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {deletingItem.nama || deletingItem.nama_rekening || deletingItem.judul || deletingItem.kode_rekening}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              <span>Hapus Sekarang</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

