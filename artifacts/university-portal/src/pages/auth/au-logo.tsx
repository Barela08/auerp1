export function AuLogo() {
  return (
    <div className="flex items-center gap-3 py-2 px-4 drop-shadow-lg">
      <div className="flex flex-col items-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #1a237e 60%, #b71c1c 100%)" }}
        >
          <span className="text-white font-serif font-bold text-xl leading-none">AU</span>
        </div>
      </div>
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span className="text-white font-bold text-xl tracking-widest drop-shadow">ALLIANCE</span>
        </div>
        <span className="text-white font-bold text-xl tracking-widest drop-shadow">UNIVERSITY</span>
        <span className="text-gray-200 text-[0.6rem] tracking-wider font-light">Accredited University</span>
      </div>
      <div
        className="ml-2 rounded px-1.5 py-0.5 flex flex-col items-center border border-red-400 shadow"
        style={{ background: "rgba(183,28,28,0.85)" }}
      >
        <span className="text-white text-[0.45rem] font-bold tracking-wider leading-tight">NAAC</span>
        <span className="text-white text-[0.45rem] font-bold tracking-wider leading-tight">GRADE</span>
        <span className="text-yellow-300 font-extrabold text-sm leading-tight">A+</span>
        <span className="text-white text-[0.4rem] leading-tight">ACCREDITED</span>
      </div>
    </div>
  );
}
