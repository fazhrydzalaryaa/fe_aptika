"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Printer,
  FileDown,
  Building2,
  Calendar,
  User,
  Filter,
  RefreshCw,
  X,
  FileText,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import {
  getSmkiLaporanAuditList,
  getSmkiLaporanAuditLookup,
  deleteSmkiLaporanAudit,
  exportSmkiLaporanAuditDocx,
  SmkiLaporanAudit,
  SmkiUnitKerja,
  LaporanAuditStats,
} from "@/services/api";

export default function LaporanAuditPage() {
  const router = useRouter();

  // State List Data
  const [items, setItems] = useState<SmkiLaporanAudit[]>([]);
  const [stats, setStats] = useState<LaporanAuditStats>({
    total_laporan: 0,
    sedang_ditinjau: 0,
    total_draft: 0,
    total_selesai: 0,
  });
  const [unitKerjas, setUnitKerjas] = useState<SmkiUnitKerja[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("Semua Unit");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals & Action States
  const [deleteItem, setDeleteItem] = useState<SmkiLaporanAudit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExportingId, setIsExportingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load lookup data
  useEffect(() => {
    const loadLookup = async () => {
      try {
        const res = await getSmkiLaporanAuditLookup();
        if (res.success && res.data?.unit_kerjas) {
          setUnitKerjas(res.data.unit_kerjas);
        }
      } catch (err) {
        console.error("Gagal memuat lookup SMKI Laporan Audit:", err);
      }
    };
    loadLookup();
  }, []);

  // Fetch list
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await getSmkiLaporanAuditList({
        search: search.trim() || undefined,
        unit_kerja: selectedUnit !== "Semua Unit" ? selectedUnit : undefined,
        status: selectedStatus !== "Semua" ? selectedStatus : undefined,
        page: currentPage,
        per_page: 5,
      });

      if (res.success) {
        setItems(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        }
        if (res.meta) {
          setTotalPages(res.meta.last_page || 1);
          setTotalItems(res.meta.total || 0);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data laporan audit:", err);
      showToast("error", "Gagal memuat daftar laporan audit");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, selectedUnit, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      const res = await deleteSmkiLaporanAudit(deleteItem.id_laporan_audit);
      if (res.success) {
        showToast("success", res.message || "Laporan audit berhasil dihapus.");
        setDeleteItem(null);
        fetchData();
      } else {
        showToast("error", res.message || "Gagal menghapus laporan audit.");
      }
    } catch (err: any) {
      showToast("error", err?.response?.data?.message || "Terjadi kesalahan saat menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  // DOCX Export Action
  const handleExportDocx = async (e: React.MouseEvent, item: SmkiLaporanAudit) => {
    e.stopPropagation();
    setIsExportingId(item.id_laporan_audit);
    try {
      const blob = await exportSmkiLaporanAuditDocx(item.id_laporan_audit);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FR-006_${item.nomor_laporan}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("success", `Dokumen FR-006 (${item.nomor_laporan}) berhasil diunduh.`);
    } catch (err) {
      console.error("Gagal mengunduh docx:", err);
      showToast("error", "Gagal mengunduh dokumen Word FR-006.");
    } finally {
      setIsExportingId(null);
    }
  };

  const formatTanggalIndo = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Selesai":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Selesai
          </span>
        );
      case "Sedang Ditinjau":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Sedang Ditinjau
          </span>
        );
      case "Draft":
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Draft
          </span>
        );
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="space-y-6 pb-12">
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

        {/* 1. Header Hero Banner - Matching Mockup Page 1 & 2 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#065f46] via-[#047857] to-[#059669] text-white p-6 shadow-md border border-emerald-600/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Laporan Audit SMKI
                </h1>
              </div>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Modul pencatatan, ringkasan temuan, dan tindak lanjut audit penerapan Sistem Manajemen Keamanan Informasi (SMKI)
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-200 hover:text-white transition-colors cursor-pointer">
                  <AlertCircle className="w-3.5 h-3.5" /> Info/Bantuan
                </span>
              </div>
            </div>

            {/* Right Banner Badges */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 min-w-[200px]">
                <Layers className="w-5 h-5 text-emerald-200 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-emerald-200 tracking-wider">
                    BIDANG
                  </div>
                  <div className="text-xs font-bold text-white">
                    Bidang Aplikasi Informatika
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 min-w-[190px]">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-emerald-200 tracking-wider">
                    STATUS LAYANAN
                  </div>
                  <div className="text-xs font-bold text-emerald-200">
                    Aktif & Beroperasi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 4 Stat Cards - Matching Mockup Page 1 & 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Laporan */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                TOTAL LAPORAN
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {stats.total_laporan}
              </h3>
              <p className="text-xs text-slate-500 font-medium">+2 dari bulan lalu</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Sedang Ditinjau */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                SEDANG DITINJAU
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {stats.sedang_ditinjau}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Menunggu persetujuan</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Draft */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                DRAFT
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {stats.total_draft}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Perlu diselesaikan</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Selesai */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                SELESAI
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {stats.total_selesai}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Audit telah difinalisasi</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3. Action Header Bar (+ Tambah Laporan Audit) */}
        <div className="flex justify-end">
          <button
            onClick={() => router.push("/smki/laporan-audit/input")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Laporan Audit</span>
          </button>
        </div>

        {/* 4. Table Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Table Header & Controls */}
          <div className="p-5 border-b border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Daftar Laporan Audit
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan semua rekaman audit internal periode berjalan
                </p>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Unit Kerja Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                    Unit Kerja:
                  </span>
                  <select
                    value={selectedUnit}
                    onChange={(e) => {
                      setSelectedUnit(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  >
                    <option value="Semua Unit">Semua Unit</option>
                    {unitKerjas.map((uk) => (
                      <option key={uk.id_unit_kerja} value={uk.nama_unit_kerja}>
                        {uk.nama_unit_kerja}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nomor laporan, unit kerja, auditor..."
                    className="w-64 md:w-80 text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </form>

                {/* Filter Status Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
                  >
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span>Filter</span>
                    {selectedStatus !== "Semua" && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Filter Status
                      </div>
                      {["Semua", "Draft", "Sedang Ditinjau", "Selesai"].map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            setSelectedStatus(st);
                            setShowFilterDropdown(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                            selectedStatus === st
                              ? "font-bold text-emerald-700 bg-emerald-50"
                              : "text-slate-700"
                          }`}
                        >
                          <span>{st}</span>
                          {selectedStatus === st && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => fetchData()}
                  title="Refresh Data"
                  className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nomor Laporan</th>
                  <th className="py-3 px-4">Unit Kerja</th>
                  <th className="py-3 px-4">Auditor / Auditee</th>
                  <th className="py-3 px-4">Tanggal Audit</th>
                  <th className="py-3 px-4 text-center">Kategori</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                        <span>Memuat data laporan audit...</span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-700">
                          Belum ada data laporan audit yang tersedia.
                        </span>
                        <span className="text-xs text-slate-400">
                          Silakan klik "+ Tambah Laporan Audit" untuk membuat laporan baru.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const rowNumber = (currentPage - 1) * 5 + idx + 1;
                    return (
                      <tr
                        key={item.id_laporan_audit}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* No */}
                        <td className="py-4 px-4 text-center text-slate-500 font-medium">
                          {rowNumber}
                        </td>

                        {/* Nomor Laporan */}
                        <td className="py-4 px-4 font-bold text-emerald-700">
                          {item.nomor_laporan}
                        </td>

                        {/* Unit Kerja */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 font-medium text-slate-800">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{item.nama_unit_kerja || "-"}</span>
                          </div>
                        </td>

                        {/* Auditor / Auditee */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-medium text-slate-900">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{item.auditor || "-"}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 pl-5">
                              KE: {item.auditee || "-"}
                            </div>
                          </div>
                        </td>

                        {/* Tanggal Audit */}
                        <td className="py-4 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatTanggalIndo(item.tanggal_audit)}</span>
                          </div>
                        </td>

                        {/* Kategori */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200">
                            {item.kategori || "Kategori"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          {renderStatusBadge(item.status)}
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Detail */}
                            <button
                              onClick={() => router.push(`/smki/laporan-audit/detail/${item.id_laporan_audit}`)}
                              title="Lihat Detail"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => router.push(`/smki/laporan-audit/edit/${item.id_laporan_audit}`)}
                              title="Edit Laporan"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-700 hover:bg-sky-50 transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Cetak / Print */}
                            <button
                              onClick={() => router.push(`/smki/laporan-audit/print/${item.id_laporan_audit}`)}
                              title="Cetak Dokumen Resmi FR-006"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Ekspor Docx */}
                            <button
                              onClick={(e) => handleExportDocx(e, item)}
                              disabled={isExportingId === item.id_laporan_audit}
                              title="Unduh Word (.docx)"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition"
                            >
                              <FileDown className={`w-4 h-4 ${isExportingId === item.id_laporan_audit ? "animate-pulse" : ""}`} />
                            </button>

                            {/* Hapus */}
                            <button
                              onClick={() => setDeleteItem(item)}
                              title="Hapus Laporan"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer & Pagination */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Menampilkan {items.length} dari {totalItems} laporan audit
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                    currentPage === p
                      ? "bg-[#065f46] text-white shadow-xs"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

        {/* 5. Modal Konfirmasi Hapus - Matching Mockup Page 1 */}
        {deleteItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Hapus Laporan {deleteItem.nomor_laporan}?
              </h3>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteItem(null)}
                  disabled={isDeleting}
                  className="w-24 py-2.5 rounded-xl font-medium text-xs bg-slate-400 hover:bg-slate-500 text-white transition"
                >
                  Tidak
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="w-24 py-2.5 rounded-xl font-medium text-xs bg-[#e11d48] hover:bg-rose-700 text-white transition flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Ya"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ServiceRouteGuard>
  );
}
