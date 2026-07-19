// Official ZombiesCat head: red body, pointy ears, white-disc eyes with red X,
// wide-open mouth with two rows of white sawtooth teeth (per the standard 3D model).
// Animated: idle chewing (lower jaw) + occasional eye blink — see .zc-* keyframes in globals.css.
export default function Logo({ size = 30, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={animated ? "zc-logo" : undefined}
    >
      {/* ears — short, rounded (per official model, not sharp) */}
      <path d="M13 26 Q12 10 20 8 Q28 7 30 18 Z" fill="#ee1d2b" />
      <path d="M51 26 Q52 10 44 8 Q36 7 34 18 Z" fill="#ee1d2b" />
      {/* head/body block */}
      <rect x="8" y="13" width="48" height="46" rx="17" fill="#ee1d2b" />
      {/* eyes: white disc + red X */}
      <g className="zc-eye" style={{ transformOrigin: "23px 27px" }}>
        <circle cx="23" cy="27" r="6.4" fill="#fff" />
        <g stroke="#ee1d2b" strokeWidth="2.7" strokeLinecap="round">
          <path d="M20.4 24.4 l5.2 5.2 M25.6 24.4 l-5.2 5.2" />
        </g>
      </g>
      <g className="zc-eye zc-eye-2" style={{ transformOrigin: "41px 27px" }}>
        <circle cx="41" cy="27" r="6.4" fill="#fff" />
        <g stroke="#ee1d2b" strokeWidth="2.7" strokeLinecap="round">
          <path d="M38.4 24.4 l5.2 5.2 M43.6 24.4 l-5.2 5.2" />
        </g>
      </g>
      {/* mouth cavity */}
      <rect x="15" y="37" width="34" height="17" rx="3.5" fill="#8f0d18" />
      {/* upper teeth: sawtooth hanging down */}
      <path
        d="M15.5 37.5 h33 v0.5 l-2.75 5 -2.75 -5 -2.75 5 -2.75 -5 -2.75 5 -2.75 -5 -2.75 5 -2.75 -5 -2.75 5 -2.75 -5 -2.75 5 -2.75 -5 Z"
        fill="#fff"
      />
      {/* lower jaw teeth: sawtooth rising up (animated chew) */}
      <g className="zc-jaw">
        <path
          d="M15.5 53.5 l2.75 -5 2.75 5 2.75 -5 2.75 5 2.75 -5 2.75 5 2.75 -5 2.75 5 2.75 -5 2.75 5 2.75 -5 2.75 5 Z"
          fill="#fff"
        />
      </g>
    </svg>
  );
}
