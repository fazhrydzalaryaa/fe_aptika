import { api } from "@/services/api";

export interface KategoriRuangLingkup {
  id: number;
  nama_kategori: string;
}

export interface RuangLingkup {
  id: number;
  nama_ruang_lingkup: string;
  kategori_ruang_lingkup_id: number;
}

export interface PenyediaItem {
  id: number;
  nama_perusahaan: string;
  alamat: string;
  no_kontrak: string | null;
  kategori_ruang_lingkup_id: number | null;
  ruang_lingkup_id: number | null;
  contact_person: string;
  no_telp: string;
  berita_acara: "Tersedia" | "Tidak Ada";
  created_at?: string;
  updated_at?: string;
  kategori_ruang_lingkup?: KategoriRuangLingkup | null;
  ruang_lingkup?: RuangLingkup | null;
}

export interface HeaderInfo {
  no_dokumen: string;
  no_revisi: string;
  tanggal_berlaku: string;
}

export interface LookupData {
  kategori: KategoriRuangLingkup[];
  ruang_lingkup: RuangLingkup[];
}

export interface GetPenyediaParams {
  search?: string;
  kategori_id?: string | number;
  ruang_lingkup_id?: string | number;
  berita_acara?: string;
  page?: number;
  per_page?: number;
}

export const fetchPenyedia = async (params?: GetPenyediaParams) => {
  const res = await api.get("/smki/daftar-penyedia", { params });
  return res.data;
};

export const fetchPenyediaDetail = async (id: number) => {
  const res = await api.get(`/smki/daftar-penyedia/${id}`);
  return res.data;
};

export const fetchPenyediaLookup = async (): Promise<LookupData> => {
  const res = await api.get("/smki/daftar-penyedia/lookup");
  return res.data;
};

export interface PenyediaFormPayload {
  nama_perusahaan: string;
  alamat: string;
  no_kontrak?: string | null;
  kategori_ruang_lingkup_id?: number | null;
  ruang_lingkup_id?: number | null;
  contact_person: string;
  no_telp: string;
  berita_acara: "Tersedia" | "Tidak Ada";
}

export const createPenyedia = async (data: PenyediaFormPayload) => {
  const res = await api.post("/smki/daftar-penyedia", data);
  return res.data;
};

export const updatePenyedia = async (id: number, data: PenyediaFormPayload) => {
  const res = await api.put(`/smki/daftar-penyedia/${id}`, data);
  return res.data;
};

export const deletePenyedia = async (id: number) => {
  const res = await api.delete(`/smki/daftar-penyedia/${id}`);
  return res.data;
};

export const downloadPenyediaDocx = async (params?: any) => {
  const res = await api.get("/smki/daftar-penyedia/export-docx", {
    params,
    responseType: "blob",
  });
  return res.data;
};
