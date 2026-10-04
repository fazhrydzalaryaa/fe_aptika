"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createDetailPerjalanan,
  getPegawaiList,
  createPegawai,
  createSpdPeserta,
  getRekeningList,
  deleteRekening,
  getAlatAngkutanList,
  deleteAlatAngkutan,
  getBidangs,
} from "@/services/api";
import { showToast } from "@/components/ui/Toast";
import {
  RekeningModal,
  AlatAngkutanModal,
  SpdFieldActionButtons,
} from "@/components/spd/SpdMasterModals";

type StaffRow = { nama: string; nip: string; pangkat: string; jabatan: string };

const emptyStaff = (): StaffRow => ({ nama: "", nip: "", pangkat: "", jabatan: "" });

export default function SpdInputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ── [1] DETAIL PERJALANAN ─────────────────────────────
  const [kegiatan, setKegiatan] = useState("");
  const [subKegiatan, setSubKegiatan] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [tglBerangkat, setTglBerangkat] = useState("");
  const [tglKembali, setTglKembali] = useState("");
  const [bidangId, setBidangId] = useState<number | "">("");
  const [rekeningId, setRekeningId] = useState<number | "">("");
  const [alatAngkutan, setAlatAngkutan] = useState("Kendaraan Dinas");
  const [deskripsi, setDeskripsi] = useState("");
  
  // ── TAMBAHAN BARU: SP, Visum, dan PPK ─────────────────
  const [nomorSp, setNomorSp] = useState("");
  const [nomorVisum, setNomorVisum] = useState("");
  const [ppkId, setPpkId] = useState<number | "">("");

  // ── [2] KABID (opsional, hanya 1) ────────────────────
  const [includeKabid, setIncludeKabid] = useState(false);
  const [kabid, setKabid] = useState<StaffRow>(emptyStaff());

  // ── [3] STAFF (min 1, maks 4) ────────────────────────
  const [staffList, setStaffList] = useState<StaffRow[]>([emptyStaff()]);

  // ── Data dari API ─────────────────────────────────────
  const [bidangOptions, setBidangOptions] = useState<any[]>([]);
  const [rekeningOptions, setRekeningOptions] = useState<any[]>([]);
  const [pegawaiOptions, setPegawaiOptions] = useState<any[]>([]);
  const [angkutanOptions, setAngkutanOptions] = useState<any[]>([
    "Kendaraan Dinas",
    "Pesawat Udara",
    "Kereta Api",
    "Kapal Laut",
    "Kendaraan Darat Lainnya",
  ]);

  // ── Modal states for Rekening & Alat Angkutan ─────────
  const [isRekeningModalOpen, setIsRekeningModalOpen] = useState(false);
  const [isAngkutanModalOpen, setIsAngkutanModalOpen] = useState(false);
  const [rekeningToEdit, setRekeningToEdit] = useState<any>(null);
  const [angkutanToEdit, setAngkutanToEdit] = useState<any>(null);

  // ── Kalkulasi Durasi ──────────────────────────────────
  const lamaHari =
    tglBerangkat && tglKembali
      ? Math.max(
          1,
          Math.ceil(
            (new Date(tglKembali).getTime() - new Date(tglBerangkat).getTime()) /
              86400000
          ) + 1
        )
      : 0;

  const validStaff = staffList.filter((s) => s.nama.trim());

  // ── Fetch data bidang, rekening, pegawai, angkutan ────
  const fetchRekening = async () => {
    try {
      const rRes = await getRekeningList();
      setRekeningOptions(Array.isArray(rRes?.data) ? rRes.data : []);
    } catch {
      setRekeningOptions([]);
    }
  };

  const fetchAngkutan = async () => {
    try {
      const aRes = await getAlatAngkutanList();
      if (Array.isArray(aRes?.data) && aRes.data.length > 0) {
        setAngkutanOptions(aRes.data);
      }
    } catch {
      // fallback to existing list
    }
  };

  useEffect(() => {
    fetchRekening();
    fetchAngkutan();

    const fetchBidang = async () => {
      try {
        const res = await getBidangs();
        if (res.success && Array.isArray(res.data)) {
          setBidangOptions(res.data);
        } else if (Array.isArray(res)) {
          setBidangOptions(res);
        }
      } catch (error) {
        console.error("Gagal mengambil data bidang:", error);
      }
    };
    fetchBidang();

    const fetchPegawai = async () => {
      try {
        const pRes = await getPegawaiList();
        setPegawaiOptions(Array.isArray(pRes?.data) ? pRes.data : []);
      } catch {
        setPegawaiOptions([]);
      }
    };
    fetchPegawai();
  }, []);

  // ── Handlers Rekening ────────────────────────────────
  const handleEditRekening = () => {
    const sel = rekeningOptions.find((r) => r.id === Number(rekeningId));
    if (!sel) {
      showToast.error("Silakan pilih kode rekening yang ingin diubah terlebih dahulu!");
      return;
    }
    setRekeningToEdit(sel);
    setIsRekeningModalOpen(true);
  };

  const handleDeleteRekening = async () => {
    const sel = rekeningOptions.find((r) => r.id === Number(rekeningId));
    if (!sel) {
      showToast.error("Silakan pilih kode rekening yang ingin dihapus terlebih dahulu!");
      return;
    }
    if (
      !window.confirm(
        `Hapus kode rekening "${sel.kode_rekening} - ${sel.nama_rekening}"?`
      )
    ) {
      return;
    }

    try {
      await deleteRekening(sel.id);
      showToast.success("Kode rekening berhasil dihapus!");
      setRekeningId("");
      fetchRekening();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menghapus kode rekening";
      showToast.error(msg);
    }
  };

  // ── Handlers Alat Angkutan ───────────────────────────
  const handleEditAngkutan = () => {
    const sel = angkutanOptions.find((a: any) =>
      typeof a === "string" ? a === alatAngkutan : a.nama === alatAngkutan
    );
    if (!sel) return;
    if (typeof sel === "object") {
      setAngkutanToEdit(sel);
    } else {
      setAngkutanToEdit({ nama: sel });
    }
    setIsAngkutanModalOpen(true);
  };

  const handleDeleteAngkutan = async () => {
    const sel = angkutanOptions.find((a: any) =>
      typeof a === "string" ? a === alatAngkutan : a.nama === alatAngkutan
    );
    const selName = typeof sel === "string" ? sel : sel?.nama || alatAngkutan;

    if (!window.confirm(`Hapus alat angkutan "${selName}"?`)) {
      return;
    }

    if (sel && typeof sel === "object" && sel.id) {
      try {
        await deleteAlatAngkutan(sel.id);
        showToast.success("Alat angkutan berhasil dihapus!");
        const nextList = angkutanOptions.filter((a: any) =>
          typeof a === "string" ? a !== selName : a.id !== sel.id
        );
        setAngkutanOptions(nextList);
        const fallback = nextList[0]
          ? typeof nextList[0] === "string"
            ? nextList[0]
            : nextList[0].nama
          : "Kendaraan Dinas";
        setAlatAngkutan(fallback);
        fetchAngkutan();
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Gagal menghapus alat angkutan";
        showToast.error(msg);
      }
    } else {
      const nextList = angkutanOptions.filter((a: any) =>
        typeof a === "string" ? a !== selName : a.nama !== selName
      );
      setAngkutanOptions(nextList);
      const fallback = nextList[0]
        ? typeof nextList[0] === "string"
          ? nextList[0]
          : nextList[0].nama
        : "Kendaraan Dinas";
      setAlatAngkutan(fallback);
      showToast.success("Alat angkutan berhasil dihapus!");
    }
  };

  // ── Staff handlers ────────────────────────────────────
  const addStaff = () => {
    if (staffList.length < 4) setStaffList((p) => [...p, emptyStaff()]);
  };
  const removeStaff = (i: number) =>
    setStaffList((p) => p.filter((_, idx) => idx !== i));
  const updateStaff = (i: number, field: keyof StaffRow, value: string) => {
    const updated = [...staffList];
    updated[i] = { ...updated[i], [field]: value };
    setStaffList(updated);
  };

  // ── Auto-fill from pegawai list ───────────────────────
  const autofillKabid = (nip: string) => {
    const found = pegawaiOptions.find((p) => p.nip === nip);
    if (found)
      setKabid({ nama: found.nama, nip: found.nip, pangkat: found.pangkat, jabatan: found.jabatan });
  };
  const autofillStaff = (i: number, nip: string) => {
    const found = pegawaiOptions.find((p) => p.nip === nip);
    if (found) {
      const updated = [...staffList];
      updated[i] = { nama: found.nama, nip: found.nip, pangkat: found.pangkat, jabatan: found.jabatan };
      setStaffList(updated);
    }
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async () => {
    const validS = staffList.filter((s) => s.nama.trim() && s.nip.trim());
    if (!kegiatan || !tujuan || !tglBerangkat || !tglKembali) {
      showToast.error("Mohon lengkapi data detail perjalanan!");
      return;
    }
    if (!bidangId) {
      showToast.error("Pilih bidang terlebih dahulu!");
      return;
    }
    if (validS.length < 1) {
      showToast.error("Minimal 1 staff harus diisi!");
      return;
    }
    setLoading(true);
    let step = "init";
    try {
      // Step 1: Ambil daftar pegawai
      step = "getPegawaiList";
      const pRes = await getPegawaiList();
      const currentList: any[] = Array.isArray(pRes?.data) ? pRes.data : [];

      const getOrCreatePegawai = async (row: StaffRow, role: "kabid" | "staff") => {
        const cleanNip = (row.nip || "").trim();
        const cleanNama = (row.nama || "").trim();

        const existing = currentList.find(
          (p) => String(p.nip || "").trim().replace(/\s+/g, "") === cleanNip.replace(/\s+/g, "")
        );
        if (existing?.id) return existing.id as number;

        step = `createPegawai(${cleanNama})`;
        try {
          const created = await createPegawai({
            nama: cleanNama,
            nip: cleanNip,
            pangkat: row.pangkat || "Golongan III",
            jabatan: row.jabatan || (role === "kabid" ? "Kepala Bidang" : "Staf"),
            tanggal_lahir: "1990-01-01",
            role,
          });
          const newObj = created?.data || created;
          if (newObj && newObj.id) {
            currentList.push(newObj);
            return newObj.id as number;
          }
          return (newObj?.id ?? created?.id) as number;
        } catch (err: any) {
          const errStr = typeof err?.response?.data === "string"
            ? err.response.data
            : JSON.stringify(err?.response?.data || err?.message || "");

          if (errStr.includes("already been taken") || errStr.includes("duplicate") || err?.response?.status === 422) {
            const latestRes = await getPegawaiList();
            const latestList: any[] = Array.isArray(latestRes?.data) ? latestRes.data : [];
            const found = latestList.find(
              (p) => String(p.nip || "").trim().replace(/\s+/g, "") === cleanNip.replace(/\s+/g, "")
            );
            if (found?.id) {
              return found.id as number;
            }
          }
          throw err;
        }
      };

      const participantIds: number[] = [];

      if (includeKabid && kabid.nama && kabid.nip) {
        const id = await getOrCreatePegawai(kabid, "kabid");
        participantIds.push(id);
      }
      for (const s of validS) {
        const id = await getOrCreatePegawai(s, "staff");
        participantIds.push(id);
      }

      // Step 2: Buat detail perjalanan
      step = "createDetailPerjalanan";
      const detailPayload: any = {
        kegiatan,
        sub_kegiatan: subKegiatan || kegiatan,
        tujuan,
        tanggal_berangkat: tglBerangkat,
        tanggal_kembali: tglKembali,
        bidang_id: bidangId,
        alat_angkutan: alatAngkutan,
        deskripsi,
        // Menyertakan data baru ke backend
        nomor_sp: nomorSp,
        nomor_visum: nomorVisum,
        ppk_id: ppkId ? Number(ppkId) : null,
      };
      if (rekeningId) detailPayload.rekening_id = rekeningId;

      const detailRes = await createDetailPerjalanan(detailPayload);
      const detailId: number = detailRes?.data?.id ?? detailRes?.id;

      // Step 3: Daftarkan peserta
      step = "createSpdPeserta";
      if (detailId && participantIds.length > 0) {
        await createSpdPeserta({ detail_perjalanan_id: detailId, pegawai_id: participantIds });
      }

      showToast.success("Usulan SPD berhasil diajukan!");
      router.push("/spd");
    } catch (err: any) {
      const apiData = err?.response?.data;
      const apiMsg =
        (typeof apiData?.errors === "string" ? apiData.errors : JSON.stringify(apiData?.errors)) ||
        apiData?.message ||
        err?.message ||
        "Unknown error";
      console.error(`[STEP: ${step}] Error:`, JSON.stringify(apiData, null, 2));
      showToast.error(`Gagal di step: ${step} - ${apiMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────
  const card: React.CSSProperties = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f2540",
    borderBottom: "2px solid #f1f5f9",
    paddingBottom: "10px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };
  const label: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    color: "#0f2540",
    backgroundColor: "white",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };
  const select: React.CSSProperties = { ...input, cursor: "pointer" };
  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "960px", margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
        <button
          onClick={() => router.push("/spd")}
          style={{ backgroundColor: "white", border: "1px solid #e2e8f0", color: "#475569", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
        >
          ← Kembali
        </button>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f2540", margin: 0 }}>
            Buat Usulan SPD
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
            Isi semua bagian berikut untuk mengajukan Surat Perjalanan Dinas
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 1: Detail Perjalanan                   */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={card}>
          <h2 style={sectionTitle}>
            <span style={{ background: "#0f2540", color: "white", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>1</span>
            Detail Perjalanan Dinas
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Nomor SP, Nomor Visum, PPK */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={label}>Nomor SP</label>
                <input style={input} placeholder="Contoh: 090/123-Aptika" value={nomorSp} onChange={(e) => setNomorSp(e.target.value)} />
              </div>
              <div>
                <label style={label}>Nomor Visum</label>
                <input style={input} placeholder="Contoh: 094/456-Aptika" value={nomorVisum} onChange={(e) => setNomorVisum(e.target.value)} />
              </div>
              <div>
                <label style={label}>Pejabat Pembuat Komitmen (PPK)</label>
                <select style={select} value={ppkId} onChange={(e) => setPpkId(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">— Pilih PPK —</option>
                  {pegawaiOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama} - {p.jabatan}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kegiatan & Sub Kegiatan */}
            <div style={grid2}>
              <div>
                <label style={label}>Kegiatan <span style={{ color: "red" }}>*</span></label>
                <input style={input} placeholder="Contoh: Workshop AI Nasional" value={kegiatan} onChange={(e) => setKegiatan(e.target.value)} />
              </div>
              <div>
                <label style={label}>Sub Kegiatan</label>
                <input style={input} placeholder="Contoh: Pelatihan Penggunaan AI" value={subKegiatan} onChange={(e) => setSubKegiatan(e.target.value)} />
              </div>
            </div>

            {/* Tujuan */}
            <div>
              <label style={label}>Tujuan (Instansi / Kota) <span style={{ color: "red" }}>*</span></label>
              <input style={input} placeholder="Contoh: Kementerian Kominfo RI, Jakarta" value={tujuan} onChange={(e) => setTujuan(e.target.value)} />
            </div>

            {/* Tanggal & Durasi */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", alignItems: "end" }}>
              <div>
                <label style={label}>Tanggal Berangkat <span style={{ color: "red" }}>*</span></label>
                <input style={input} type="date" value={tglBerangkat} onChange={(e) => setTglBerangkat(e.target.value)} />
              </div>
              <div>
                <label style={label}>Tanggal Kembali <span style={{ color: "red" }}>*</span></label>
                <input style={input} type="date" value={tglKembali} min={tglBerangkat} onChange={(e) => setTglKembali(e.target.value)} />
              </div>
              <div style={{ paddingBottom: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "2px" }}>Durasi</div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: lamaHari > 0 ? "#1d4ed8" : "#cbd5e1" }}>
                  {lamaHari > 0 ? `${lamaHari} Hari` : "—"}
                </div>
              </div>
            </div>

            {/* Bidang & Rekening & Angkutan */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr 1.15fr", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "6px", minHeight: "22px" }}>
                  <label style={{ ...label, marginBottom: 0, whiteSpace: "nowrap" }}>Pilih Bidang <span style={{ color: "red" }}>*</span></label>
                </div>
                <select
                  style={select}
                  value={bidangId}
                  onChange={(e) => setBidangId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>— Pilih Bidang —</option>
                  {bidangOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", minHeight: "22px" }}>
                  <label style={{ ...label, marginBottom: 0, whiteSpace: "nowrap" }}>Kode Rekening</label>
                  <SpdFieldActionButtons
                    onAdd={() => {
                      setRekeningToEdit(null);
                      setIsRekeningModalOpen(true);
                    }}
                    onEdit={handleEditRekening}
                    onDelete={handleDeleteRekening}
                    hasSelection={Boolean(rekeningId)}
                  />
                </div>
                <select
                  style={select}
                  value={rekeningId}
                  onChange={(e) => setRekeningId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">— Pilih Rekening —</option>
                  {rekeningOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.kode_rekening} · {r.nomor_rekening} · {r.nama_rekening}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", minHeight: "22px" }}>
                  <label style={{ ...label, marginBottom: 0, whiteSpace: "nowrap" }}>Alat Angkutan</label>
                  <SpdFieldActionButtons
                    onAdd={() => {
                      setAngkutanToEdit(null);
                      setIsAngkutanModalOpen(true);
                    }}
                    onEdit={handleEditAngkutan}
                    onDelete={handleDeleteAngkutan}
                    hasSelection={Boolean(alatAngkutan)}
                  />
                </div>
                <select
                  style={select}
                  value={alatAngkutan}
                  onChange={(e) => setAlatAngkutan(e.target.value)}
                >
                  {angkutanOptions.map((a: any) => {
                    const name = typeof a === "string" ? a : a.nama;
                    const id = typeof a === "string" ? a : a.id;
                    return (
                      <option key={id} value={name}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label style={label}>Deskripsi / Maksud Perjalanan</label>
              <textarea
                style={{ ...input, resize: "none" }}
                rows={3}
                placeholder="Tuliskan ringkasan tujuan dan agenda perjalanan dinas..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 2: Kabid (Opsional, hanya 1)          */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={card}>
          <h2 style={sectionTitle}>
            <span style={{ background: "#7c3aed", color: "white", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>2</span>
            SPD Kepala Bidang (Kabid)
            <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 500, color: "#64748b" }}>Opsional</span>
          </h2>

          {/* Toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: includeKabid ? "20px" : "0", cursor: "pointer", userSelect: "none" }}>
            <div
              onClick={() => setIncludeKabid(!includeKabid)}
              style={{
                width: 44, height: 24, borderRadius: 12,
                backgroundColor: includeKabid ? "#7c3aed" : "#cbd5e1",
                position: "relative", cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: includeKabid ? 23 : 3,
                width: 18, height: 18, borderRadius: "50%", background: "white",
                transition: "left 0.2s",
              }} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
              {includeKabid ? "Kabid ikut dalam perjalanan ini" : "Kabid tidak ikut"}
            </span>
          </label>

          {includeKabid && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Autocomplete pilih dari daftar */}
              <div>
                <label style={label}>Pilih dari Daftar Pegawai (NIP)</label>
                <select style={select} onChange={(e) => autofillKabid(e.target.value)} defaultValue="">
                  <option value="">— Ketik manual atau pilih dari daftar —</option>
                  {pegawaiOptions.filter((p) => p.role === "kabid").map((p) => (
                    <option key={p.id} value={p.nip}>{p.nama} — {p.jabatan}</option>
                  ))}
                </select>
              </div>
              <div style={grid2}>
                <div>
                  <label style={label}>Nama <span style={{ color: "red" }}>*</span></label>
                  <input style={input} placeholder="Nama lengkap..." value={kabid.nama} onChange={(e) => setKabid({ ...kabid, nama: e.target.value })} />
                </div>
                <div>
                  <label style={label}>NIP <span style={{ color: "red" }}>*</span></label>
                  <input style={input} placeholder="18 digit NIP..." value={kabid.nip} onChange={(e) => setKabid({ ...kabid, nip: e.target.value })} />
                </div>
              </div>
              <div style={grid2}>
                <div>
                  <label style={label}>Pangkat / Golongan</label>
                  <input style={input} placeholder="Contoh: Pembina / IVa" value={kabid.pangkat} onChange={(e) => setKabid({ ...kabid, pangkat: e.target.value })} />
                </div>
                <div>
                  <label style={label}>Jabatan</label>
                  <input style={input} placeholder="Contoh: Kepala Bidang Aptika" value={kabid.jabatan} onChange={(e) => setKabid({ ...kabid, jabatan: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 3: Staff (min 1, maks 4)              */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={card}>
          <h2 style={sectionTitle}>
            <span style={{ background: "#0891b2", color: "white", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>3</span>
            SPD Staff (Min. 1, Maks. 4)
            <span style={{ marginLeft: "auto", fontSize: "12px", color: "#0891b2", fontWeight: "600" }}>
              {staffList.length}/4 Staff · 1 No. SPD Bersama
            </span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {staffList.map((s, i) => (
              <div key={i} style={{ padding: "16px", border: "1px solid #e0f2fe", borderRadius: "10px", backgroundColor: "#f0f9ff", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0369a1" }}>Staff #{i + 1}</span>
                  {staffList.length > 1 && (
                    <button
                      onClick={() => removeStaff(i)}
                      style={{ background: "none", border: "none", color: "#ef4444", fontSize: "18px", cursor: "pointer", padding: "0 4px" }}
                    >×</button>
                  )}
                </div>

                {/* Autocomplete */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={label}>Pilih dari Daftar Pegawai</label>
                  <select style={select} onChange={(e) => autofillStaff(i, e.target.value)} defaultValue="">
                    <option value="">— Pilih untuk auto-isi —</option>
                    {pegawaiOptions.filter((p) => p.role === "staff").map((p) => (
                      <option key={p.id} value={p.nip}>{p.nama} — {p.jabatan}</option>
                    ))}
                  </select>
                </div>

                <div style={grid2}>
                  <div>
                    <label style={label}>Nama <span style={{ color: "red" }}>*</span></label>
                    <input style={input} placeholder="Nama lengkap..." value={s.nama} onChange={(e) => updateStaff(i, "nama", e.target.value)} />
                  </div>
                  <div>
                    <label style={label}>NIP <span style={{ color: "red" }}>*</span></label>
                    <input style={input} placeholder="18 digit NIP..." value={s.nip} onChange={(e) => updateStaff(i, "nip", e.target.value)} />
                  </div>
                </div>
                <div style={{ ...grid2, marginTop: "12px" }}>
                  <div>
                    <label style={label}>Pangkat / Golongan</label>
                    <input style={input} placeholder="Contoh: Penata / IIIc" value={s.pangkat} onChange={(e) => updateStaff(i, "pangkat", e.target.value)} />
                  </div>
                  <div>
                    <label style={label}>Jabatan</label>
                    <input style={input} placeholder="Contoh: Pranata Komputer" value={s.jabatan} onChange={(e) => updateStaff(i, "jabatan", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            {staffList.length < 4 && (
              <button
                onClick={addStaff}
                style={{ border: "2px dashed #bae6fd", borderRadius: "10px", backgroundColor: "transparent", padding: "14px", color: "#0891b2", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
              >
                + Tambah Staff (Maks. 4)
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* ACTION BUTTONS                                 */}
        {/* ═══════════════════════════════════════════════ */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingBottom: "40px" }}>
          <button
            onClick={() => router.push("/spd")}
            style={{ padding: "12px 24px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "white", color: "#475569", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
          >
            Batal
          </button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            style={{
              padding: "12px 32px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: loading ? "#93c5fd" : "#0f2540",
              color: "white",
              fontWeight: "700",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {loading && (
              <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {loading ? "Menyimpan..." : "Ajukan SPD"}
          </button>
        </div>
      </div>

      {/* Modal Tambah / Ubah Rekening */}
      <RekeningModal
        isOpen={isRekeningModalOpen}
        onClose={() => {
          setIsRekeningModalOpen(false);
          setRekeningToEdit(null);
        }}
        initialData={rekeningToEdit}
        onSuccess={(saved) => {
          fetchRekening();
          if (saved?.id) {
            setRekeningId(saved.id);
          }
        }}
      />

      {/* Modal Tambah / Ubah Alat Angkutan */}
      <AlatAngkutanModal
        isOpen={isAngkutanModalOpen}
        onClose={() => {
          setIsAngkutanModalOpen(false);
          setAngkutanToEdit(null);
        }}
        initialData={angkutanToEdit}
        onSuccess={(saved) => {
          fetchAngkutan();
          if (saved?.nama) {
            setAlatAngkutan(saved.nama);
          }
        }}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus, select:focus, textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
      `}</style>
    </div>
  );
}