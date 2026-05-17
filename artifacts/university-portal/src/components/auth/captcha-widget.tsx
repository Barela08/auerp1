import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { RefreshCw } from "lucide-react";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generateCode(len = 5) {
  let code = "";
  for (let i = 0; i < len; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
  return code;
}

export interface CaptchaHandle {
  validate: (input: string) => boolean;
  refresh: () => void;
  code: string;
}

export const CaptchaWidget = forwardRef<CaptchaHandle, { className?: string }>(({ className }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState(() => generateCode());

  const draw = (c: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#e8e8e8";
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * W, Math.random() * H);
      ctx.lineTo(Math.random() * W, Math.random() * H);
      ctx.strokeStyle = `rgba(${Math.random() * 100 + 80},${Math.random() * 100 + 80},${Math.random() * 100 + 80},0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const letterW = W / c.length;
    c.split("").forEach((ch, i) => {
      const angle = (Math.random() - 0.5) * 0.4;
      const x = letterW * i + letterW / 2;
      const y = H / 2 + (Math.random() - 0.5) * 6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      const fontSize = 22 + Math.floor(Math.random() * 6);
      const fonts = ["Arial", "Courier New", "Georgia", "Verdana"];
      ctx.font = `bold ${fontSize}px ${fonts[i % fonts.length]}`;
      const r = Math.floor(Math.random() * 60);
      const g = Math.floor(Math.random() * 60);
      const b = Math.floor(Math.random() * 60 + 80);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });

    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
      ctx.fill();
    }
  };

  useEffect(() => { draw(code); }, [code]);

  const refresh = () => {
    const next = generateCode();
    setCode(next);
    setTimeout(() => draw(next), 0);
  };

  useImperativeHandle(ref, () => ({
    validate: (input: string) => input.toLowerCase() === code.toLowerCase(),
    refresh,
    code,
  }));

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        width={120}
        height={44}
        className="border border-gray-300 rounded cursor-pointer select-none"
        title="Click to refresh"
        onClick={refresh}
      />
      <button
        type="button"
        onClick={refresh}
        className="text-blue-500 hover:text-blue-700 transition-colors"
        title="Refresh captcha"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  );
});

CaptchaWidget.displayName = "CaptchaWidget";
