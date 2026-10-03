"use client";

import { useParams } from "next/navigation";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import HakAksesTiForm from "@/components/smki/HakAksesTiForm";

export default function EditHakAksesTiPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <HakAksesTiForm mode="edit" id={id} />
    </ServiceRouteGuard>
  );
}
