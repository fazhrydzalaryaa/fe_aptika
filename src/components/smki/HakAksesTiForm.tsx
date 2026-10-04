"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Loader2,
  Save,
  ChevronLeft,
  Monitor,
  Wifi,
  Database,
  AppWindow,
  Laptop,
  CircleDot,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Check,
  Briefcase,
  Mail,
  IdCard,
  Building2,
  Phone,
  Tags,
  Info,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createHakAksesTi,
  updateHakAksesTi,
  getHakAksesTiDetail,
  getHakAksesTiLookup,
  HakAksesTiLookupData,
} from "@/services/api";

interface Props {
  mode: "create" | "edit";
  id?: string | number;
}

const JENIS_ORDER = ["OS (Admin)", "Aplikasi", "Database", "Internet", "Teleworking", "Lainnya"];

const JENIS_ICONS: Record<string, React.ReactNode> = {
  "OS (Admin)": <Monitor size={15} />,
  Internet: <Wifi size={15} />,
  Database: <Database size={15} />,
  Aplikasi: <AppWindow size={15} />,
  Teleworking: <Laptop size={15} />,
  Lainnya: <Tags size={15} />,
};

const SIFAT_OPTIONS = [
  { value: "Permanen", desc: "Berlaku selama masa penugasan aktif di unit kerja terkait." },
  { value: "Rutin", desc: "Berlaku untuk proyek, kontrak, atau masa penugasan terbatas." },
  { value: "Sementara", desc: "Berlaku untuk tugas tertentu dengan periode jelas." },
];

const WAKTU_OPTIONS = [
  { value: "Jam Kerja", label: "Jam Kerja", desc: "08.00 – 16.30", icon: <Clock size={16} /> },
  { value: "24 Jam", label: "24 Jam Full", desc: "Shift / Maintenance", icon: <CircleDot size={16} /> },
  { value: "Lainnya", label: "Lainnya", desc: "Jadwal Spesifik", icon: <Clock size={16} /> },
];

export default function HakAksesTiForm({ mode, id }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [lookups, setLookups] = useState<HakAksesTiLookupData | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // Data pemohon
  const [namaPemohon, setNamaPemohon] = useState("");
  const [nip, setNip] = useState("");
  const [kontak, setKontak] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [unitKerja, setUnitKerja] = useState<string>("");
  const [email, setEmail] = useState("");

  // Detail permohonan
  const [jenisPermohonan, setJenisPermohonan] = useState<string>("");
  const [masaMulai, setMasaMulai] = useState("");
  const [masaSelesai, setMasaSelesai] = useState("");
  const [selectedJenis, setSelectedJenis] = useState<number[]>([]);
  const [sistemLainnya, setSistemLainnya] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [sifat, setSifat] = useState("Permanen");
  const [level, setLevel] = useState<string>("");
  const [waktu, setWaktu] = useState("Jam Kerja");
  const [waktuLainnya, setWaktuLainnya] = useState("");
  const [persetujuan, setPersetujuan] = useState(false);

  const jenisAksesList = useMemo(() => {
    const list = lookups?.jenis_akses ?? [];
    return [...list].sort((a, b) => {
      const ia = JENIS_ORDER.indexOf(a.nama_akses || "");
      const ib = JENIS_ORDER.indexOf(b.nama_akses || "");
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [lookups]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getHakAksesTiLookup();
        if (res?.success) setLookups(res.data);
      } catch (err) {
        console.error("Gagal memuat master hak akses", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getHakAksesTiDetail(id);
        const d = res?.data;
        if (d) {
          setNamaPemohon(d.nama_pemohon || "");
          setNip(d.nip_id_pegawai || "");
          setKontak(d.kontak_person || "");
          setJabatan(d.jabatan || "");
          setUnitKerja(d.id_unit_kerja ? String(d.id_unit_kerja) : "");
          setEmail(d.email || "");
          setJenisPermohonan(d.id_jenis_permohonan ? String(d.id_jenis_permohonan) : "");
          setMasaMulai(d.masa_berlaku_mulai ? String(d.masa_berlaku_mulai).slice(0, 10) : "");
          setMasaSelesai(d.masa_berlaku_selesai ? String(d.masa_berlaku_selesai).slice(0, 10) : "");
          setSelectedJenis((d.jenis_akses || []).map((j: { id_jenis_akses?: number }) => j.id_jenis_akses as number));
          setSistemLainnya(d.sistem_lainnya || "");
          setKeperluan(d.keperluan || "");
          setSifat(d.sifat_akses || "Permanen");
          setLevel(d.id_level_akses ? String(d.id_level_akses) : "");
          setWaktu(d.waktu_akses || "Jam Kerja");
          setWaktuLainnya(d.waktu_akses_lainnya || "");
          setPersetujuan(!!d.persetujuan_ketentuan);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Gagal memuat data formulir");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id]);

  const toggleJenis = (jid: number) => {
    setSelectedJenis((prev) =>
      prev.includes(jid) ? prev.filter((x) => x !== jid) : [...prev, jid]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaPemohon.trim()) { toast.error("Nama lengkap pemohon wajib diisi!"); return; }
    if (!unitKerja) { toast.error("Unit kerja / bidang wajib dipilih!"); return; }
    if (!jenisPermohonan) { toast.error("Jenis permohonan wajib dipilih!"); return; }
    if (selectedJenis.length === 0) { toast.error("Pilih minimal satu sistem/aplikasi/aset yang diakses!"); return; }
    if (waktu === "Lainnya" && !waktuLainnya.trim()) { toast.error("Sebutkan jadwal waktu akses lainnya!"); return; }
    if (!persetujuan) { toast.error("Pemohon harus menyetujui ketentuan keamanan!"); return; }

    setSubmitting(true);
    try {
      const payload = {
        nama_pemohon: namaPemohon.trim(),
        nip_id_pegawai: nip.trim() || null,
        kontak_person: kontak.trim() || null,
        jabatan: jabatan.trim() || null,
        id_unit_kerja: Number(unitKerja),
        email: email.trim() || null,
        id_jenis_permohonan: Number(jenisPermohonan),
        masa_berlaku_mulai: masaMulai || null,
        masa_berlaku_selesai: masaSelesai || null,
        jenis_akses: selectedJenis,
        sistem_lainnya: sistemLainnya.trim() || null,
        keperluan: keperluan.trim() || null,
        sifat_akses: sifat,
        id_level_akses: level ? Number(level) : null,
        waktu_akses: waktu,
        waktu_akses_lainnya: waktu === "Lainnya" ? waktuLainnya.trim() : null,
        persetujuan_ketentuan: persetujuan,
      };

      if (isEdit && id) {
        const res = await updateHakAksesTi(id, payload);
        toast.success(res?.message || "Data berhasil diperbarui!");
        router.push(`/smki/hak-akses-ti/detail/${id}`);
      } else {
        const res = await createHakAksesTi(payload);
        toast.success(res?.message || "Formulir berhasil disimpan!");
        const newId = res?.data?.id_hak_akses;
        router.push(newId ? `/smki/hak-akses-ti/detail/${newId}` : "/smki/hak-akses-ti");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan formulir");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white placeholder-slate-400";
  const inputIconCls = `${inputCls} pl-9`;
  const labelCls = "block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5";
  const sectionHead = (icon: React.ReactNode, title: string, sub: string) => (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">{title}</h2>
        <p className="text-[11px] text-slate-400">{sub}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 size={28} className="animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-slate-500">Memuat formulir...</p>
      </div>
    );
  }

  const formTitle = isEdit ? "Edit Formulir Hak Akses TI" : "Formulir Pengajuan Akses TI";
  const submitLabel = isEdit ? "Simpan Perubahan" : "Simpan & Ajukan";
  const submitButton = (
    <button
      type="submit"
      disabled={submitting}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
    >
      {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
      <span>{submitLabel}</span>
    </button>
  );

  const ketentuanBox = (
    <div className="rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-5">
      <p className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-3">
        <AlertTriangle size={14} /> Ketentuan Pengguna (Syarat &amp; Ketentuan)
      </p>
      <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
        <li>User harus menyetujui dan mematuhi kebijakan keamanan informasi, kebijakan pengamanan Sistem/Aplikasi dan prosedur terkait.</li>
        <li>User dilarang mengalihkan dan/atau meminjamkan hak akses kepada pihak lain.</li>
        <li>User dilarang menyalahgunakan hak akses untuk kepentingan selain penugasan yang telah ditetapkan.</li>
        <li>Pelanggaran terhadap kebijakan akan menyebabkan pencabutan akses, tindakan disiplin, dan sanksi sesuai peraturan yang berlaku.</li>
      </ol>
      <label className="flex items-start gap-3 mt-4 pt-4 border-t border-amber-200/70 dark:border-amber-900/50 cursor-pointer">
        <input
          type="checkbox"
          checked={persetujuan}
          onChange={(e) => setPersetujuan(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
          Saya menyetujui seluruh ketentuan keamanan informasi yang berlaku.
          <span className="block text-[10.5px] font-medium text-slate-400 mt-0.5">
            Dengan mencentang ini, pemohon menyatakan bahwa data yang diisi adalah benar dan siap menanggung konsekuensi hukum atas penyalahgunaan akses.
          </span>
        </span>
      </label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/smki/hak-akses-ti")}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-emerald-600 mb-1.5"
          >
            <ChevronLeft size={13} /> {isEdit ? "Daftar Hak Akses" : "Manajemen Hak Akses TI"}
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{formTitle}</h1>
            {!isEdit && (
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                FORM-TI-2024
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lengkapi data pemohon, detail permohonan akses, dan persetujuan ketentuan keamanan informasi.
          </p>
        </div>
        {isEdit && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/smki/hak-akses-ti")}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            {submitButton}
          </div>
        )}
      </div>

      {/* A. Data Pemohon */}
      <section className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
        {sectionHead(<User size={18} />, "Data Pemohon", "Informasi identitas pegawai atau pihak ketiga yang mengajukan hak akses.")}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>{isEdit ? "Nama Lengkap" : "Nama Lengkap Pemohon"} <span className="text-rose-500">*</span></label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={namaPemohon} onChange={(e) => setNamaPemohon(e.target.value)} placeholder="Masukkan nama lengkap" className={inputIconCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{isEdit ? "NIP / NIK" : "NIP / NIK / ID Vendor"} {isEdit && <span className="text-rose-500">*</span>}</label>
            <div className="relative">
              <IdCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="Masukkan nomor identitas" className={inputIconCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{isEdit ? "Nomor Telepon / WA" : "No. HP"} {isEdit && <span className="text-rose-500">*</span>}</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={kontak} onChange={(e) => setKontak(e.target.value)} placeholder="Masukkan nomor handphone" className={inputIconCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{isEdit ? "Jabatan" : "Jabatan Struktural / Fungsional"} {isEdit && <span className="text-rose-500">*</span>}</label>
            <div className="relative">
              <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={jabatan} onChange={(e) => setJabatan(e.target.value)} placeholder="Contoh: Pranata Komputer Ahli Muda" className={inputIconCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{isEdit ? "Unit Kerja / Bidang" : "Unit Kerja / Bidang / Instansi"} <span className="text-rose-500">*</span></label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select value={unitKerja} onChange={(e) => setUnitKerja(e.target.value)} className={inputIconCls}>
                <option value="">Pilih Unit Kerja / Bidang</option>
                {lookups?.unit_kerjas?.map((u) => (
                  <option key={u.id_unit_kerja} value={u.id_unit_kerja}>{u.nama_unit}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>{isEdit ? "Email Dinas" : "Email"}</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Contoh: nama@jabarprov.go.id" className={inputIconCls} />
            </div>
          </div>
        </div>
      </section>

      {/* B. Detail Permohonan Akses */}
      <section className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
        {sectionHead(<Lock size={18} />, "Detail Permohonan Akses", "Tentukan jenis tindakan permohonan dan target aset informasi yang akan diakses.")}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className={labelCls}>Jenis Permohonan <span className="text-rose-500">*</span></label>
            <select value={jenisPermohonan} onChange={(e) => setJenisPermohonan(e.target.value)} className={inputCls}>
              <option value="">Pilih Jenis Permohonan</option>
              {lookups?.jenis_permohonans?.map((j) => (
                <option key={j.id_jenis_permohonan} value={j.id_jenis_permohonan}>{j.nama_jenis}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Masa Berlaku <span className="text-rose-500">*</span></label>
            <div className="flex items-center gap-2">
              <input type="date" value={masaMulai} onChange={(e) => setMasaMulai(e.target.value)} className={inputCls} placeholder="dari tanggal" />
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">sampai</span>
              <input type="date" value={masaSelesai} onChange={(e) => setMasaSelesai(e.target.value)} className={inputCls} placeholder="dari tanggal" />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className={labelCls}>Sistem / Aplikasi / Aset yang Diakses <span className="text-rose-500">*</span></label>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih satu atau lebih</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            {jenisAksesList.map((j) => {
              const selected = selectedJenis.includes(j.id_jenis_akses!);
              return (
                <button
                  type="button"
                  key={j.id_jenis_akses}
                  onClick={() => toggleJenis(j.id_jenis_akses!)}
                  className="flex items-center gap-2.5 text-left group"
                >
                  <span className={`w-4 h-4 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-all ${selected ? "bg-emerald-600 border-emerald-600" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"}`}>
                    {selected && <Check size={11} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className={selected ? "text-emerald-600" : "text-slate-400"}>{JENIS_ICONS[j.nama_akses || ""] || <Tags size={15} />}</span>
                  <span className={`text-xs font-semibold ${selected ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>{j.nama_akses}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lain-lain (sebutkan spesifikasi sistem) */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mb-5 flex justify-end">
          <input
            type="text"
            value={sistemLainnya}
            onChange={(e) => setSistemLainnya(e.target.value)}
            placeholder="Lain-lain (Sebutkan spesifikasi sistem)"
            className={`${inputCls} md:w-1/2`}
          />
        </div>

        {/* CREATE: Keperluan, Sifat + Level, Waktu di dalam card yang sama (mockup page 2) */}
        {!isEdit && (
          <>
            <div className="mb-5">
              <label className={labelCls}>Keperluan / Alasan Pemberian Akses</label>
              <textarea
                rows={3}
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                placeholder="Jelaskan secara detail alasan permohonan hak akses ini untuk mendukung penyelesaian tugas kedinasan..."
                className={`${inputCls} resize-none`}
              />
              <p className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-1.5">
                <Info size={12} /> Justifikasi yang kuat mempercepat proses verifikasi oleh Tim Keamanan Informasi.
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                  <ShieldCheck size={13} /> Sifat Masa Berlaku Akses
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {SIFAT_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setSifat(opt.value)}
                      className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border text-left transition-all ${opt.value === "Permanen" ? "col-span-2 md:col-span-1" : ""} ${
                        sifat === opt.value
                          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                      }`}
                    >
                      <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sifat === opt.value ? "border-emerald-600" : "border-slate-300 dark:border-slate-600"}`}>
                        {sifat === opt.value && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                      </span>
                      <span>
                        <span className="block text-xs font-bold text-slate-800 dark:text-white">{opt.value}</span>
                        <span className="block text-[10.5px] text-slate-400 mt-0.5">{opt.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-1">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                  <Layers size={13} /> Tingkatan / Level Akses
                </p>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
                  <option value="">Level/Area Hak Akses</option>
                  {lookups?.level_akses?.map((l) => (
                    <option key={l.id_level_akses} value={l.id_level_akses}>{l.nama_level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-5">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                <Clock size={13} /> Jadwal Waktu Akses
              </p>
              <div className="grid grid-cols-3 gap-3">
                {WAKTU_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setWaktu(opt.value)}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3.5 rounded-xl border text-center transition-all ${
                      waktu === opt.value
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                    }`}
                  >
                    <span className={waktu === opt.value ? "text-emerald-600" : "text-slate-400"}>{opt.icon}</span>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-white">{opt.label}</span>
                    <span className="text-[9.5px] text-slate-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
              {waktu === "Lainnya" && (
                <input
                  type="text"
                  value={waktuLainnya}
                  onChange={(e) => setWaktuLainnya(e.target.value)}
                  placeholder="Sebutkan jadwal waktu akses khusus..."
                  className={`${inputCls} mt-2.5`}
                />
              )}
            </div>
          </>
        )}
      </section>

      {/* CREATE: Ketentuan full-width (mockup page 2) */}
      {!isEdit && (
        <section className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
          {sectionHead(<ShieldCheck size={18} />, "Ketentuan Keamanan & Persetujuan", "Pakta integritas dan kewajiban menjaga kerahasiaan aset informasi.")}
          {ketentuanBox}
        </section>
      )}

      {/* EDIT: Kebutuhan Teknis + Ketentuan & Syarat (mockup page 3) */}
      {isEdit && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
            {sectionHead(<ShieldCheck size={18} />, "Kebutuhan Teknis", "Detail fungsional, operasional, dan area akses yang diminta.")}

            <div className="mb-5">
              <label className={labelCls}>Keperluan / Alasan Akses <span className="text-rose-500">*</span></label>
              <textarea
                rows={4}
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                placeholder="Jelaskan secara detail alasan permohonan hak akses ini..."
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className={labelCls}>Sifat Akses <span className="text-rose-500">*</span></label>
                <div className="flex flex-col gap-2.5">
                  {SIFAT_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setSifat(opt.value)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all ${
                        sifat === opt.value
                          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sifat === opt.value ? "border-emerald-600" : "border-slate-300 dark:border-slate-600"}`}>
                        {sifat === opt.value && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{opt.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Level / Area Akses <span className="text-rose-500">*</span></label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
                  <option value="">Level/Area Hak Akses</option>
                  {lookups?.level_akses?.map((l) => (
                    <option key={l.id_level_akses} value={l.id_level_akses}>{l.nama_level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Waktu Akses <span className="text-rose-500">*</span></label>
              <div className="flex flex-col gap-2.5">
                {[
                  { value: "Jam Kerja", label: "Jam Kerja (08.00 – 17.00)" },
                  { value: "24 Jam", label: "24 Jam" },
                  { value: "Lainnya", label: "Lainnya (Spesifik)" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setWaktu(opt.value)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all ${
                      waktu === opt.value
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${waktu === opt.value ? "border-emerald-600" : "border-slate-300 dark:border-slate-600"}`}>
                      {waktu === opt.value && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{opt.label}</span>
                  </button>
                ))}
              </div>
              {waktu === "Lainnya" && (
                <input
                  type="text"
                  value={waktuLainnya}
                  onChange={(e) => setWaktuLainnya(e.target.value)}
                  placeholder="Sebutkan jadwal waktu akses khusus..."
                  className={`${inputCls} mt-2.5`}
                />
              )}
            </div>
          </section>

          <aside className="lg:col-span-1">
            <section className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 lg:sticky lg:top-6">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Ketentuan &amp; Syarat</h3>
              <ul className="space-y-3 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <li className="flex gap-2"><span className="text-emerald-500 mt-1">•</span> Hak akses bersifat personal dan rahasia.</li>
                <li className="flex gap-2"><span className="text-emerald-500 mt-1">•</span> Password wajib diganti setiap 90 hari sesuai standar SMKI.</li>
                <li className="flex gap-2"><span className="text-emerald-500 mt-1">•</span> Dilarang menggunakan hak akses di luar keperluan dinas.</li>
                <li className="flex gap-2"><span className="text-emerald-500 mt-1">•</span> Segala aktivitas akses dicatat dalam sistem log audit.</li>
                <li className="flex gap-2"><span className="text-emerald-500 mt-1">•</span> Pelanggaran akan dikenakan sanksi sesuai UU ITE.</li>
              </ul>
              <div className="mt-5 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-2.5">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10.5px] font-semibold text-amber-800 dark:text-amber-300 leading-relaxed">
                  Penting: Perubahan pada level akses memerlukan verifikasi ulang oleh Manajer Keamanan Informasi.
                </p>
              </div>
            </section>
          </aside>
        </div>
      )}

      {/* CREATE: bottom actions (mockup page 2) */}
      {!isEdit && (
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/smki/hak-akses-ti")}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold hover:text-emerald-600 transition-all"
          >
            <ChevronLeft size={14} /> Batal &amp; Kembali
          </button>
          {submitButton}
        </div>
      )}
    </form>
  );
}
