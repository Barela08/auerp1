/**
 * Shared document assets: QR Code (Alliance University provided image)
 * and dynamically generated Code-39 style barcodes.
 */

/** Renders the official Alliance University QR code image. */
export function AUQRCode({ size = 72 }: { size?: number }) {
  return (
    <img
      src="/au-qr-code.png"
      alt="Alliance University QR Code"
      width={size}
      height={size}
      style={{ imageRendering: "pixelated", display: "block" }}
    />
  );
}

/**
 * Renders a deterministic SVG barcode from an arbitrary string value.
 * Produces a Code-39-inspired visual with narrow (1-unit) and wide (2.5-unit) bars.
 */
export function AUBarcode({
  value,
  height = 40,
  showText = true,
  textSize = 8,
  barColor = "#000000",
}: {
  value: string;
  height?: number;
  showText?: boolean;
  textSize?: number;
  barColor?: string;
}) {
  const bars = buildBarPattern(value);
  const narrowW = 1.6;
  const wideW = 3.8;
  const gap = 1.2;

  let totalWidth = 0;
  const segments: { x: number; w: number; filled: boolean }[] = [];

  bars.forEach((entry, i) => {
    const w = entry.wide ? wideW : narrowW;
    segments.push({ x: totalWidth, w, filled: entry.bar });
    totalWidth += w;
    if (i < bars.length - 1) totalWidth += gap;
  });

  const svgWidth = totalWidth;
  const svgHeight = height + (showText ? textSize + 4 : 0);

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ display: "block" }}
      aria-label={`Barcode for ${value}`}
    >
      {segments.map((seg, i) =>
        seg.filled ? (
          <rect
            key={i}
            x={seg.x}
            y={0}
            width={seg.w}
            height={height}
            fill={barColor}
          />
        ) : null
      )}
      {showText && (
        <text
          x={svgWidth / 2}
          y={height + textSize + 1}
          textAnchor="middle"
          fontSize={textSize}
          fontFamily="Arial, monospace"
          fill="#333"
          letterSpacing="1"
        >
          {value}
        </text>
      )}
    </svg>
  );
}

/** Builds a bar/space pattern from an input string deterministically. */
function buildBarPattern(value: string): { bar: boolean; wide: boolean }[] {
  // Code 39 encodes: start + chars + end
  // Each char → 5 bars + 4 spaces (alternating), with wide/narrow bits.
  // We approximate Code 39 with a hash-derived wide/narrow pattern per character.
  const C39_PATTERNS: Record<string, number> = {
    '0':0b000110100,'1':0b100100001,'2':0b001100001,'3':0b101100000,
    '4':0b000110001,'5':0b100110000,'6':0b001110000,'7':0b000100101,
    '8':0b100100100,'9':0b001100100,'A':0b100001001,'B':0b001001001,
    'C':0b101001000,'D':0b000011001,'E':0b100011000,'F':0b001011000,
    'G':0b000001101,'H':0b100001100,'I':0b001001100,'J':0b000011100,
    'K':0b100000011,'L':0b001000011,'M':0b101000010,'N':0b000010011,
    'O':0b100010010,'P':0b001010010,'Q':0b000000111,'R':0b100000110,
    'S':0b001000110,'T':0b000010110,'U':0b110000001,'V':0b011000001,
    'W':0b111000000,'X':0b010010001,'Y':0b110010000,'Z':0b011010000,
    '-':0b010000101,'.':0b110000100,' ':0b011000100,'*':0b010010100,
    '$':0b010101000,'/':0b010100010,'+':0b010001010,'%':0b000101010,
  };

  // normalise: uppercase, replace unsupported with '-'
  const safe = value
    .toUpperCase()
    .split("")
    .map((c) => (C39_PATTERNS[c] !== undefined ? c : "-"))
    .join("");

  const chars = ["*", ...safe.split(""), "*"];
  const result: { bar: boolean; wide: boolean }[] = [];

  chars.forEach((ch, charIdx) => {
    const bits = C39_PATTERNS[ch] ?? C39_PATTERNS["-"]!;
    for (let bit = 8; bit >= 0; bit--) {
      const isWide = !!((bits >> bit) & 1);
      const isBar = (8 - bit) % 2 === 0; // even positions = bar, odd = space
      result.push({ bar: isBar, wide: isWide });
    }
    // inter-character gap (narrow space) — except after last char
    if (charIdx < chars.length - 1) {
      result.push({ bar: false, wide: false });
    }
  });

  return result;
}
