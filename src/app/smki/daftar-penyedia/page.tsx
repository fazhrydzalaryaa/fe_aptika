"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Plus,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  FileDown,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Clock3,
  Layers,
  Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PenyediaFormModal from "@/components/smki/PenyediaFormModal";
import PenyediaDetailModal from "@/components/smki/PenyediaDetailModal";
import PenyediaExportModal from "@/components/smki/PenyediaExportModal";
import {
  fetchPenyedia,
  fetchPenyediaLookup,
  createPenyedia,
  updatePenyedia,
  deletePenyedia,
  downloadPenyediaDocx,
  PenyediaItem,
  LookupData,
  PenyediaFormPayload,
} from "@/services/smki/daftarPenyediaService";

const STAT_TONES = {
  teal: {
    value: "text-teal-600 dark:text-teal-400",
    icon: "bg-teal-50 dark:bg-teal-950/60 border-teal-200/60 dark:border-teal-800/50 text-teal-600 dark:text-teal-400",
  },
  emerald: {
    value: "text-emerald-600 dark:text-emerald-400",
    icon: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    value: "text-amber-600 dark:text-amber-400",
    icon: "bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/50 text-amber-600 dark:text-amber-400",
  },
  blue: {
    value: "text-blue-600 dark:text-blue-400",
    icon: "bg-blue-50 dark:bg-blue-950/60 border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400",
  },
};

export default function DaftarPenyediaPage() {
  const { bidang } = useAuthStore();

  const [items, setItems] = useState<PenyediaItem[]>([]);
  const [stats, setStats] = useState({
    total_penyedia: 0,
    ba_lengkap: 0,
    ba_menunggu: 0,
    scope_berbeda: 0,
  });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [ruangLingkupId, setRuangLingkupId] = useState("");
  const [beritaAcara, setBeritaAcara] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });

  const [lookup, setLookup] = useState<LookupData>({ kategori: [], ruang_lingkup: [] });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PenyediaItem | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<PenyediaItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PenyediaItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Baris yang dicentang untuk diekspor (tetap tersimpan saat pindah halaman)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportNoDokumen, setExportNoDokumen] = useState("FR-020/KOM.03.05/SANDIKAMI");
  const [exportNoRevisi, setExportNoRevisi] = useState("1.0");
  const [exportTanggalBerlaku, setExportTanggalBerlaku] = useState("");
  const [exportPeriode, setExportPeriode] = useState(String(new Date().getFullYear()));

  const loadLookup = useCallback(async () => {
    try {
      const data = await fetchPenyediaLookup();
      setLookup(data);
    } catch (err) {
      console.error("Gagal memuat master kategori/ruang lingkup", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPenyedia({
        search: search || undefined,
        ruang_lingkup_id: ruangLingkupId || undefined,
        berita_acara: beritaAcara || undefined,
        page,
        per_page: 10,
      });
      if (res.success) {
        setItems(res.data || []);
        if (res.stats) setStats(res.stats);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      toast.error("Gagal memuat data penyedia barang/jasa");
    } finally {
      setLoading(false);
    }
  }, [search, ruangLingkupId, beritaAcara, page]);

  useEffect(() => { loadLookup(); }, [loadLookup]);
  useEffect(() => {
    const t = setTimeout(() => loadData(), 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleResetFilter = () => {
    setSearch("");
    setRuangLingkupId("");
    setBeritaAcara("");
    setPage(1);
  };

  const pageIds = items.map((i) => i.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected = pageIds.some((id) => selectedIds.includes(id));

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectPage = () =>
    setSelectedIds((prev) =>
      allPageSelected ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds]))
    );

  const handleCreate = () => { setSelectedItem(null); setIsFormOpen(true); };
  const handleEdit = (item: PenyediaItem) => { setSelectedItem(item); setIsFormOpen(true); };
  const handleViewDetail = (item: PenyediaItem) => { setDetailItem(item); setIsDetailOpen(true); };
  const handleDeletePrompt = (item: PenyediaItem) => { setItemToDelete(item); setIsDeleteOpen(true); };

  const handleSaveForm = async (data: PenyediaFormPayload) => {
    if (selectedItem) {
      await updatePenyedia(selectedItem.id, data);
      toast.success("Data penyedia berhasil diperbarui!");
    } else {
      await createPenyedia(data);
      toast.success("Data penyedia baru berhasil ditambahkan!");
    }
    loadData();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await deletePenyedia(itemToDelete.id);
      setSelectedIds((prev) => prev.filter((id) => id !== itemToDelete.id));
      toast.success("Data penyedia berhasil dihapus!");
      setIsDeleteOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      toast.error("Gagal menghapus data penyedia");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDoExport = async () => {
    setExporting(true);
    try {
      const params: any = {
        no_dokumen: exportNoDokumen || undefined,
        no_revisi: exportNoRevisi || undefined,
        tanggal_berlaku: exportTanggalBerlaku || undefined,
        periode: exportPeriode || undefined,
      };
      if (selectedIds.length > 0) {
        // Ada baris dipilih -> hanya data terpilih yang diekspor
        params.ids = selectedIds.join(","); // mis. "1,3,7" (didukung backend)
      } else {
        // Tidak ada pilihan -> ekspor semua data sesuai filter aktif
        if (search) params.search = search;
        if (ruangLingkupId) params.ruang_lingkup_id = ruangLingkupId;
        if (beritaAcara) params.berita_acara = beritaAcara;
      }

      const blob = await downloadPenyediaDocx(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `FR-020_Daftar_Penyedia_${dateStr}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Dokumen FR-020 (.docx) berhasil diunduh!");
      setIsExportOpen(false);
    } catch (err) {
      toast.error("Gagal mengunduh dokumen FR-020");
    } finally {
      setExporting(false);
    }
  };

  const beritaAcaraBadge = (status: string) => {
    const ok = status === "Tersedia";
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${ok ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-red-50 text-red-600 border-red-200/80 dark:bg-red-950/50 dark:text-red-300"}`}>
        {status}
      </span>
    );
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-7 text-white shadow-lg">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-36 -top-12 w-48 h-48 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 size={22} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                  Manajemen Daftar Penyedia Barang/Jasa
                </h1>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  Portal inventarisasi dan verifikasi rekanan penyedia barang dan jasa resmi organisasi, sesuai standar formulir SMKI FR-020.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-200" />
                <span>Unit Kerja: <strong className="text-white">{bidang?.name || "Semua Bidang"}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <FileDown size={16} className="text-emerald-200" />
                <span>Format Ekspor: <strong className="text-white">Microsoft Word (.docx)</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Penyedia", value: stats.total_penyedia, sub: "Perusahaan", icon: <Building2 size={22} />, tone: STAT_TONES.teal },
            { label: "BA Lengkap", value: stats.ba_lengkap, sub: "Tersedia", icon: <FileCheck2 size={22} />, tone: STAT_TONES.emerald },
            { label: "BA Menunggu", value: stats.ba_menunggu, sub: "Tertunda", icon: <Clock3 size={22} />, tone: STAT_TONES.amber },
            { label: "Scope Berbeda", value: stats.scope_berbeda, sub: "Kategori", icon: <Layers size={22} />, tone: STAT_TONES.blue },
          ].map((card, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
                <h3 className={`text-2xl font-black ${card.tone.value}`}>{card.value}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{card.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${card.tone.icon}`}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari nama perusahaan, scope pekerjaan, atau nomor kontrak..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <button
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <FileDown size={16} /> {selectedIds.length > 0 ? `Ekspor (${selectedIds.length} dipilih)` : "Ekspor (DOCX)"}
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-colors"
            >
              <Plus size={16} /> Tambah Penyedia
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <select
              value={ruangLingkupId}
              onChange={(e) => { setRuangLingkupId(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="">Semua Scope</option>
              {lookup.ruang_lingkup.map((r) => (
                <option key={r.id} value={r.id}>{r.nama_ruang_lingkup}</option>
              ))}
            </select>
            <select
              value={beritaAcara}
              onChange={(e) => { setBeritaAcara(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Tidak Ada">Tidak Ada</option>
            </select>
            <button
              onClick={handleResetFilter}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw size={14} /> Reset Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">Daftar Penyedia Barang & Jasa SMKI</h2>
            </div>
            <div className="flex items-center gap-3">
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {selectedIds.length} dipilih · Hapus pilihan
                </button>
              )}
              <span className="text-xs text-slate-400">Menampilkan {items.length} dari {meta.total} data rekanan</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed min-w-[1020px]">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[3%]" />
                <col className="w-[17%]" />
                <col className="w-[16%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[11%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left align-middle px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Pilih semua di halaman ini"
                      checked={allPageSelected}
                      ref={(el) => { if (el) el.indeterminate = !allPageSelected && somePageSelected; }}
                      onChange={toggleSelectPage}
                      disabled={items.length === 0}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                  </th>
                  <th className="text-left align-middle px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">No</th>
                  <th className="text-left align-middle px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Nama Perusahaan</th>
                  <th className="text-left align-middle px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Scope Pekerjaan</th>
                  <th className="text-left align-middle px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">No. Kontrak</th>
                  <th className="text-left align-middle px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">CP / Person</th>
                  <th className="text-left align-middle px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Telepon</th>
                  <th className="text-left align-middle px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status BA</th>
                  <th className="text-right align-middle px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400"><Loader2 size={22} className="animate-spin mx-auto mb-2" />Memuat data penyedia...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400"><AlertCircle size={22} className="mx-auto mb-2" />Belum ada data penyedia yang tersedia.</td></tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/70 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 align-middle">
                        <input
                          type="checkbox"
                          aria-label={`Pilih ${item.nama_perusahaan}`}
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="w-4 h-4 accent-emerald-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 align-middle text-slate-500">{(meta.current_page - 1) * meta.per_page + idx + 1}</td>
                      <td className="px-4 py-3 align-middle">
                        <button onClick={() => handleViewDetail(item)} className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline text-left line-clamp-2">
                          {item.nama_perusahaan}
                        </button>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm italic text-slate-600 dark:text-slate-300 line-clamp-2">{item.ruang_lingkup?.nama_ruang_lingkup || "-"}</td>
                      <td className="px-4 py-3 align-middle text-xs text-slate-600 dark:text-slate-300 truncate">{item.no_kontrak || "-"}</td>
                      <td className="px-4 py-3 align-middle text-sm text-slate-700 dark:text-slate-200 truncate">{item.contact_person}</td>
                      <td className="px-4 py-3 align-middle text-xs text-slate-600 dark:text-slate-300 truncate">{item.no_telp}</td>
                      <td className="px-4 py-3 align-middle">{beritaAcaraBadge(item.berita_acara)}</td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleViewDetail(item)} title="Detail" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"><Eye size={16} /></button>
                          <button onClick={() => handleEdit(item)} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"><Pencil size={16} /></button>
                          <button onClick={() => handleDeletePrompt(item)} title="Hapus" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && items.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <span>Halaman {meta.current_page} dari {meta.last_page}</span>
              <div className="flex items-center gap-1">
                <button disabled={meta.current_page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronLeft size={14} /></button>
                <button disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PenyediaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveForm}
        initialData={selectedItem}
        lookup={lookup}
      />

      <PenyediaDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={detailItem} />

      <PenyediaExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleDoExport}
        loading={exporting}
        selectedCount={selectedIds.length}
        noDokumen={exportNoDokumen}
        setNoDokumen={setExportNoDokumen}
        noRevisi={exportNoRevisi}
        setNoRevisi={setExportNoRevisi}
        tanggalBerlaku={exportTanggalBerlaku}
        setTanggalBerlaku={setExportTanggalBerlaku}
        periode={exportPeriode}
        setPeriode={setExportPeriode}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Konfirmasi Hapus Data"
        message={`Apakah Anda yakin ingin menghapus data penyedia "${itemToDelete?.nama_perusahaan}"? Tindakan ini tidak dapat dibatalkan dan semua data terkait akan hilang dari sistem.`}
      />
    </ServiceRouteGuard>
  );
}
