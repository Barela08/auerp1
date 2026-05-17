export function AuLogo() {
  return (
    <div className="flex items-center gap-3 py-2 px-4 drop-shadow-lg">
      <img
        src="/au-logo-round.webp"
        alt="Alliance University"
        className="w-14 h-14 object-contain drop-shadow-lg"
      />
      <img
        src="/au-logo-horizontal.png"
        alt="Alliance University"
        className="h-12 object-contain drop-shadow-lg"
        style={{ maxWidth: "220px" }}
      />
    </div>
  );
}
