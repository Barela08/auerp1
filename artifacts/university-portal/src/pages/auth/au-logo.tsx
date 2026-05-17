import { useBranding } from "@/contexts/branding-context";

export function AuLogo() {
  const branding = useBranding();
  return (
    <div className="flex items-center justify-center gap-0 drop-shadow-lg py-1">
      <img
        src={branding.logo_round ?? "/au-logo-main.png"}
        alt="Alliance University"
        className="w-12 h-12 object-contain drop-shadow"
      />
      <div className="ml-2 mr-3 leading-tight">
        <p className="font-black tracking-widest text-white" style={{ fontSize: "1.05rem", fontFamily: "Georgia, serif", textShadow: "0 1px 4px rgba(0,0,0,0.7)", lineHeight: 1 }}>ALLIANCE</p>
        <p className="font-black tracking-widest text-white" style={{ fontSize: "0.85rem", fontFamily: "Georgia, serif", textShadow: "0 1px 4px rgba(0,0,0,0.7)", lineHeight: 1 }}>UNIVERSITY</p>
      </div>
      <div className="w-px h-10 bg-white/60 mx-3" />
      <div className="text-center leading-none">
        <p className="font-bold text-white tracking-widest" style={{ fontSize: "0.5rem", textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>NAAC</p>
        <p className="font-bold text-white tracking-widest" style={{ fontSize: "0.5rem", textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>GRADE</p>
        <p className="font-black text-red-500" style={{ fontSize: "1.6rem", lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>A+</p>
        <p className="text-white" style={{ fontSize: "0.38rem", letterSpacing: "0.05em", textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>ACCREDITED UNIVERSITY</p>
      </div>
    </div>
  );
}
