const paths: Record<string, string> = {
  battle:
    "M7 4 20 17M17 4 4 17M4 4l4 1-3 3-1-4ZM20 4l-4 1 3 3 1-4ZM2 19l4-4 3 3-4 4M22 19l-4-4-3 3 4 4",
  formation: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  upgrade: "M5 21h14M8 21v-6h8v6M4 11h16l-3 4H7zM12 3v7M8 6l4-4 4 4",
  gacha: "m12 2 8 7-3 12H7L4 9l8-7ZM4 9h16M12 2 8 9l4 12 4-12-4-7Z",
  book: "M12 6C8 3 4 4 2 5v15c3-2 7-2 10 0 3-2 7-2 10 0V5c-2-1-6-2-10 1ZM12 6v14",
  rock: "m4 18-1-8 6-7 10 3 3 11-8 5-10-4ZM3 10l10 3 6-7M13 13l1 9M9 3l4 10",
  home: "m2 11 10-9 10 9M5 9v12h14V9M9 21v-7h6v7",
  star: "m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1 3-6Z",
  lock: "M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4M12 14v3",
};
export function GameIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      className={`game-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.rock} />
    </svg>
  );
}
export function SacredLandscape() {
  return (
    <svg
      className="sacred-landscape"
      viewBox="0 0 1440 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="homeSky" x2="0" y2="1">
          <stop stopColor="#b4e4da" />
          <stop offset="1" stopColor="#fbefbc" />
        </linearGradient>
        <linearGradient id="homeEarth" x2="0" y2="1">
          <stop stopColor="#75b392" />
          <stop offset="1" stopColor="#315d51" />
        </linearGradient>
      </defs>
      <path fill="url(#homeSky)" d="M0 0h1440v700H0z" />
      <circle cx="870" cy="180" r="145" fill="#fff6cf" />
      <circle
        cx="870"
        cy="180"
        r="171"
        fill="none"
        stroke="#fff6cf"
        strokeWidth="2"
        opacity=".5"
      />
      <path
        fill="#acd1b8"
        d="m0 360 120-160 90 90 170-210 175 225 160-137 105 122 150-200 170 210 180-150 120 160v390H0Z"
      />
      <path
        fill="#81ad98"
        d="m0 450 200-170 150 150 220-200 160 230 130-170 190 120 150-230 240 250v270H0Z"
      />
      <path
        fill="url(#homeEarth)"
        d="M0 540q240-120 480-40t520-50 440 50v200H0Z"
      />
      <g fill="#3f7965">
        <path d="m50 530 45-230 35 50 35 210ZM1200 540l35-300 50-60 30 350ZM1340 540l20-160 35 20 30 160Z" />
      </g>
      <g fill="#e2e3c2" stroke="#567765" strokeWidth="5">
        <path d="M1060 530V330h38V225h40v105h38v200Z" />
        <path d="m1081 228 37-47 37 47ZM1038 335l80-45 80 45Z" />
      </g>
      <path fill="#aec496" d="M0 612q350-70 660-20t780-35v143H0Z" />
      <g fill="#f3ecd3" opacity=".6">
        <path d="m160 120 40-12 80 16-80 8ZM1010 70l50-12 100 18-80 8Z" />
      </g>
    </svg>
  );
}
