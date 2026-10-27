import type { CSSProperties, ReactNode } from "react";
import { buscarTopico, type Topico, type TopicoKey } from "./lib/topicos";

// Ícones das cartelas (especificação, seção 3). Não substituir.
const icones: Record<TopicoKey, ReactNode> = {
  db: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </>
  ),
  bug: (
    <>
      <path d="M8 2l1.9 1.9" />
      <path d="M14.1 3.9L16 2" />
      <path d="M9 7.1V6a3 3 0 1 1 6 0v1.1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
      <path d="M12 20v-9" />
      <path d="M6.5 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M21 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </>
  ),
  ask: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </>
  ),
  algo: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="9" y="15" width="6" height="6" rx="1" />
      <path d="M6 9v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
      <path d="M12 13v2" />
    </>
  ),
  sec: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <rect x="9" y="11" width="6" height="5" rx="1" />
      <path d="M10 11V9.5a2 2 0 0 1 4 0V11" />
    </>
  ),
  ihc: (
    <>
      <path d="M4 4l7 17 2.5-7.5L21 11z" />
      <path d="M14 14l6 6" />
    </>
  ),
  ia: (
    <>
      <path d="M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8z" />
      <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
    </>
  ),
  net: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M12 7.5V12" />
      <path d="M12 12l-5.3 5" />
      <path d="M12 12l5.3 5" />
      <path d="M7.5 19h9" />
    </>
  ),
  hw: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  sw: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 8h20" />
      <path d="M9.5 11.5L7 14l2.5 2.5" />
      <path d="M14.5 11.5L17 14l-2.5 2.5" />
    </>
  ),
  bully: (
    <>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </>
  ),
};

export function IconeTopico({
  topico,
  className,
}: {
  topico: TopicoKey;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {icones[topico]}
    </svg>
  );
}

export function IconeCoringa({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#F5C542"
      stroke="#F5C542"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" />
    </svg>
  );
}

function Nome({ topico }: { topico: Topico }) {
  if (!topico.linhas) return topico.label;
  return topico.linhas.map((linha, i) => (
    <span key={i} className="block">
      {linha}
    </span>
  ));
}

// Quadrado de tópico, igual ao da cartela. O tamanho vem do contêiner
// (largura do elemento); ícone, texto e cantos são proporcionais ao lado.
export function TopicTile({
  topico,
  estado = "normal",
  className = "",
  style,
}: {
  topico: TopicoKey;
  estado?: "normal" | "sorteado" | "pendente";
  className?: string;
  style?: CSSProperties;
}) {
  const t = buscarTopico(topico);
  const pendente = estado === "pendente";
  return (
    <div
      className={`relative aspect-square rounded-[13%] [container-type:inline-size] ${
        pendente ? "border-[3px] bg-surface" : ""
      } ${className}`}
      style={
        pendente
          ? { borderColor: t.color, color: t.color, ...style }
          : { backgroundColor: t.color, color: "var(--on-tile)", ...style }
      }
    >
      <div className="flex size-full flex-col items-center justify-center gap-[5cqi] p-[7cqi] text-center">
        <IconeTopico topico={topico} className="size-[30cqi] shrink-0" />
        <span className="max-w-full text-[11.5cqi] leading-[1.15] font-semibold [overflow-wrap:anywhere]">
          <Nome topico={t} />
        </span>
      </div>
      {estado === "sorteado" && (
        <span className="absolute top-[5cqi] right-[5cqi] flex size-[20cqi] min-h-4 min-w-4 items-center justify-center rounded-full bg-on-tile text-ink">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-[65%]"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
      )}
    </div>
  );
}

// Coringa: espaço livre das cartelas. Nunca participa do sorteio.
export function CoringaTile({ className = "" }: { className?: string }) {
  return (
    <div
      className={`aspect-square rounded-[13%] bg-ink text-on-tile [container-type:inline-size] ${className}`}
    >
      <div className="flex size-full flex-col items-center justify-center gap-[5cqi] p-[7cqi] text-center">
        <IconeCoringa className="size-[30cqi] shrink-0" />
        <span className="text-[11.5cqi] leading-[1.15] font-semibold">
          Coringa
        </span>
      </div>
    </div>
  );
}
