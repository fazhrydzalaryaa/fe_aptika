"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  createRekening,
  updateRekening,
  createAlatAngkutan,
  updateAlatAngkutan,
  updatePegawai,
} from "@/services/api";
import { showToast } from "@/components/ui/Toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

// ─── REKENING MODAL (TAMBAH / UBAH) ───────────────────────
interface RekeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: any) => void;
  initialData?: {
    id?: number;
    kode_rekening?: string;
    nomor_rekening?: string;
    nama_rekening?: string;
  } | null;
}

export function RekeningModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: RekeningModalProps) {
  const isEdit = Boolean(initialData?.id);
  const [kode, setKode] = useState("");
  const [nomor, setNomor] = useState("");
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setKode(initialData.kode_rekening || "");
        setNomor(initialData.nomor_rekening || "");
        setNama(initialData.nama_rekening || "");
      } else {
        setKode("");
        setNomor("");
        setNama("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kode.trim() || !nomor.trim() || !nama.trim()) {
      showToast.error("Semua field kode, nomor, dan nama rekening wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && initialData?.id) {
        const res = await updateRekening(initialData.id, {
          kode_rekening: kode.trim(),
          nomor_rekening: nomor.trim(),
          nama_rekening: nama.trim(),
        });
        showToast.success("Kode rekening berhasil diperbarui!");
        onSuccess(res?.data || { id: initialData.id, kode_rekening: kode.trim(), nomor_rekening: nomor.trim(), nama_rekening: nama.trim() });
      } else {
        const res = await createRekening({
          kode_rekening: kode.trim(),
          nomor_rekening: nomor.trim(),
          nama_rekening: nama.trim(),
        });
        showToast.success("Kode rekening baru berhasil ditambahkan!");
        onSuccess(res?.data);
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Gagal menyimpan rekening";
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Ubah Kode Rekening" : "Tambah Kode Rekening Baru"}
      size="md"
      footer={
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              color: "#475569",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#1d4ed8",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? "Simpan Perubahan" : "Tambah Rekening"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "5px" }}>
            Kode Rekening <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: 5.1.02.04.01.0001"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "5px" }}>
            Nomor Rekening <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: 001.234.567.89"
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "5px" }}>
            Nama Rekening <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Belanja Perjalanan Dinas Dalam Daerah"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
            }}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

// ─── ALAT ANGKUTAN MODAL (TAMBAH / UBAH) ───────────────────
interface AlatAngkutanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: any) => void;
  initialData?: {
    id?: number;
    nama?: string;
    deskripsi?: string;
  } | null;
}

export function AlatAngkutanModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AlatAngkutanModalProps) {
  const isEdit = Boolean(initialData?.id);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNama(initialData.nama || "");
        setDeskripsi(initialData.deskripsi || "");
      } else {
        setNama("");
        setDeskripsi("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      showToast.error("Nama alat angkutan wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && initialData?.id) {
        const res = await updateAlatAngkutan(initialData.id, {
          nama: nama.trim(),
          deskripsi: deskripsi.trim() || undefined,
        });
        showToast.success("Alat angkutan berhasil diperbarui!");
        onSuccess(res?.data || { id: initialData.id, nama: nama.trim(), deskripsi: deskripsi.trim() });
      } else {
        const res = await createAlatAngkutan({
          nama: nama.trim(),
          deskripsi: deskripsi.trim() || undefined,
        });
        showToast.success("Alat angkutan baru berhasil ditambahkan!");
        onSuccess(res?.data);
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Gagal menyimpan alat angkutan";
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Ubah Alat Angkutan" : "Tambah Alat Angkutan Baru"}
      size="md"
      footer={
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              color: "#475569",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#1d4ed8",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? "Simpan Perubahan" : "Tambah Angkutan"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "5px" }}>
            Nama Alat Angkutan <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Kereta Cepat Whoosh, Kendaraan Dinas, dll"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "5px" }}>
            Keterangan / Deskripsi (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: Transportasi darat cepat"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>
      </form>
    </Modal>
  );
}

// ─── PEGAWAI MODAL (UBAH DATA PEGAWAI) ────────────────────
interface PegawaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: any) => void;
  initialData?: {
    id?: number;
    nama?: string;
    nip?: string;
    pangkat?: string;
    jabatan?: string;
    role?: "kabid" | "staff" | string;
  } | null;
}

export function PegawaiModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: PegawaiModalProps) {
  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  const [pangkat, setPangkat] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [role, setRole] = useState<"kabid" | "staff">("staff");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setNama(initialData.nama || "");
      setNip(initialData.nip || "");
      setPangkat(initialData.pangkat || "");
      setJabatan(initialData.jabatan || "");
      setRole((initialData.role as "kabid" | "staff") || "staff");
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id) return;
    if (!nama.trim() || !nip.trim() || !pangkat.trim() || !jabatan.trim()) {
      showToast.error("Nama, NIP, Pangkat, dan Jabatan wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const res = await updatePegawai(initialData.id, {
        nama: nama.trim(),
        nip: nip.trim(),
        pangkat: pangkat.trim(),
        jabatan: jabatan.trim(),
        role: role,
      });
      showToast.success("Data pegawai berhasil diperbarui!");
      onSuccess(res?.data || {
        id: initialData.id,
        nama: nama.trim(),
        nip: nip.trim(),
        pangkat: pangkat.trim(),
        jabatan: jabatan.trim(),
        role: role,
      });
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Gagal memperbarui pegawai";
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ubah Data Pegawai"
      size="md"
      footer={
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              color: "#475569",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#1d4ed8",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Simpan Perubahan
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "5px" }}>
            Nama Pegawai <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Nama lengkap..."
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "5px" }}>
            NIP <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="18 digit NIP..."
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "5px" }}>
            Pangkat / Golongan <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Pembina / IVa atau Penata / IIIc"
            value={pangkat}
            onChange={(e) => setPangkat(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "5px" }}>
            Jabatan <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Kepala Bidang Aptika"
            value={jabatan}
            onChange={(e) => setJabatan(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "5px" }}>
            Peran / Role <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "kabid" | "staff")}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
              backgroundColor: "white",
            }}
          >
            <option value="kabid">Kepala Bidang (Kabid)</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}

// ─── ACTION BUTTONS HELPER (PRESISI & RAPI - ICON ONLY) ───
export function SpdFieldActionButtons({
  onAdd,
  onEdit,
  onDelete,
  hasSelection,
}: {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  hasSelection?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          title="Tambah Data Baru"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "22px",
            height: "22px",
            padding: 0,
            borderRadius: "5px",
            color: "#2563eb",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <Plus size={12} strokeWidth={2.5} />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          title="Ubah Data Terpilih"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "22px",
            height: "22px",
            padding: 0,
            borderRadius: "5px",
            color: hasSelection ? "#b45309" : "#94a3b8",
            backgroundColor: hasSelection ? "#fef3c7" : "#f8fafc",
            border: hasSelection ? "1px solid #fde68a" : "1px solid #e2e8f0",
            cursor: hasSelection ? "pointer" : "not-allowed",
            transition: "all 0.15s ease",
            opacity: hasSelection ? 1 : 0.75,
          }}
        >
          <Pencil size={12} strokeWidth={2.5} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          title="Hapus Data Terpilih"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "22px",
            height: "22px",
            padding: 0,
            borderRadius: "5px",
            color: hasSelection ? "#dc2626" : "#94a3b8",
            backgroundColor: hasSelection ? "#fef2f2" : "#f8fafc",
            border: hasSelection ? "1px solid #fecaca" : "1px solid #e2e8f0",
            cursor: hasSelection ? "pointer" : "not-allowed",
            transition: "all 0.15s ease",
            opacity: hasSelection ? 1 : 0.75,
          }}
        >
          <Trash2 size={12} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

