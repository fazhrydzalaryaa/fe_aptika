"use client";

import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import HakAksesTiForm from "@/components/smki/HakAksesTiForm";

export default function CreateHakAksesTiPage() {
  return (
    <ServiceRouteGuard requiredService="SMKI">
      <HakAksesTiForm mode="create" />
    </ServiceRouteGuard>
  );
}
