"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  createRekening,
  updateRekening,
  createAlatAngkutan,
  updateAlatAngkutan,
} from "@/services/api";
import { showToast } from "@/components/ui/Toast";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";

// ─── REKENING MODAL ──────────────────────────────────────
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
        onSuccess(res?.data || { id: initialData.id, kode_rekening: kode, nomor_rekening: nomor, nama_rekening: nama });
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
      const msg = err?.response?.data?.message || err?.message || "Gagal menyimpan rekening";
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

// ─── ALAT ANGKUTAN MODAL ─────────────────────────────────
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
      const msg = err?.response?.data?.message || err?.message || "Gagal menyimpan alat angkutan";
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
            placeholder="Contoh: Kendaraan Dinas, Kereta Cepat Whoosh, dll"
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
            placeholder="Contoh: Operasional kendaraan dinas roda empat"
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

// ─── ACTION BUTTONS HELPER ───────────────────────────────
export function SpdFieldActionButtons({
  onAdd,
  onEdit,
  onDelete,
  hasSelection,
}: {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hasSelection: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <button
        type="button"
        onClick={onAdd}
        title="Tambah Data Baru"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          padding: "2px 7px",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#2563eb",
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <Plus size={11} strokeWidth={2.5} />
        Tambah
      </button>

      {hasSelection && (
        <>
          <button
            type="button"
            onClick={onEdit}
            title="Ubah Data Terpilih"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              padding: "2px 7px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#b45309",
              backgroundColor: "#fef3c7",
              border: "1px solid #fde68a",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Edit2 size={11} strokeWidth={2.5} />
            Ubah
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Hapus Data Terpilih"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              padding: "2px 7px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#dc2626",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Trash2 size={11} strokeWidth={2.5} />
            Hapus
          </button>
        </>
      )}
    </div>
  );
}
