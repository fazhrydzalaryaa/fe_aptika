"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Data Master Sistem"
      subtitle="Kelola referensi sentral kode rekening, alat angkutan, daftar pegawai, dan master NDA"
    >
      {children}
    </MainLayout>
  );
}

