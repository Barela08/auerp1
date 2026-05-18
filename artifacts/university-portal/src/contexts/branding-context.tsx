import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

export interface BrandingSettings {
  logo_round: string | null;
  logo_horizontal: string | null;
  student_login_bg: string | null;
  staff_login_bg: string | null;
  admin_login_bg: string | null;
  signature_controller: string | null;
  signature_registrar: string | null;
  signature_exam: string | null;
  hall_ticket_header: string | null;
  receipt_header: string | null;
}

const DEFAULTS: BrandingSettings = {
  logo_round: "/au-logo-round.png",
  logo_horizontal: "/au-logo-horizontal.png",
  student_login_bg: "/campus-bg1.jpg",
  staff_login_bg: "/campus-bg2.jpg",
  admin_login_bg: "/campus-bg2.jpg",
  signature_controller: "/signature-controller.webp",
  signature_registrar: "/signature-registrar.webp",
  signature_exam: null,
  hall_ticket_header: null,
  receipt_header: null,
};

const BrandingContext = createContext<BrandingSettings>(DEFAULTS);

async function fetchBranding(): Promise<BrandingSettings> {
  const res = await fetch("/api/branding");
  if (!res.ok) return DEFAULTS;
  const data = await res.json();
  const merged: BrandingSettings = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS) as (keyof BrandingSettings)[]) {
    if (data[key]) merged[key] = data[key];
  }
  return merged;
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: ["branding"],
    queryFn: fetchBranding,
    staleTime: 60000,
  });
  return (
    <BrandingContext.Provider value={data ?? DEFAULTS}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
