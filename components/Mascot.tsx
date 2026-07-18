// Standing ZombiesCat: chunky red inflatable devil-cat with X eyes, sawtooth
// grin and a wavy belly line — the hero mascot.
export default function Mascot({ size = 260 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 260" fill="none" className="mascot" aria-label="ZombiesCat">
      <defs>
        <radialGradient id="body" cx="42%" cy="34%" r="72%">
          <stop offset="0" stopColor="#ff3a48" />
          <stop offset="0.6" stopColor="#ee1d2b" />
          <stop offset="1" stopColor="#c00d1e" />
        </radialGradient>
      </defs>

      {/* feet */}
      <ellipse cx="86" cy="242" rx="26" ry="14" fill="#c00d1e" />
      <ellipse cx="154" cy="242" rx="26" ry="14" fill="#c00d1e" />
      {/* arms */}
      <path d="M44 132 q-26 20 -20 58 q14 10 30 -6 q-8 -30 6 -50 Z" fill="#e11626" />
      <path d="M196 132 q26 20 20 58 q-14 10 -30 -6 q8 -30 -6 -50 Z" fill="#e11626" />
      {/* ears */}
      <path d="M70 66 L60 12 L108 54 Z" fill="url(#body)" />
      <path d="M170 66 L180 12 L132 54 Z" fill="url(#body)" />
      {/* body */}
      <rect x="46" y="44" width="148" height="196" rx="60" fill="url(#body)" />
      {/* X eyes */}
      <g stroke="#fff" strokeWidth="12" strokeLinecap="round">
        <path d="M84 104 l22 22 M106 104 l-22 22" />
        <path d="M134 104 l22 22 M156 104 l-22 22" />
      </g>
      {/* sawtooth grin */}
      <path d="M82 150 H158 L149 168 L140 150 L131 168 L122 150 L113 168 L104 150 L95 168 L86 150 Z" fill="#fff" />
      {/* wavy belly line */}
      <path d="M82 204 q9 -10 18 0 q9 10 18 0 q9 -10 18 0 q9 10 18 0" stroke="#fff" strokeWidth="9" strokeLinecap="round" fill="none" />
    </svg>
  );
}
