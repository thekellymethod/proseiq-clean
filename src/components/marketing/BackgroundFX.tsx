export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {/* Primary gradient field */}
      <div
        className="absolute inset-0"
        style={{
          background:
            `
            radial-gradient(1400px 900px at 18% -12%, rgba(251,191,36,0.24), transparent 55%),
            radial-gradient(1100px 800px at 82% -6%, rgba(56,189,248,0.18), transparent 58%),
            radial-gradient(900px 700px at 75% 85%, rgba(168,85,247,0.12), transparent 60%),
            linear-gradient(to bottom, #020203 0%, #070812 45%, #090914 100%)
            `,
        }}
      />

      {/* Softer vignette (less crush) */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_12%,transparent_45%,rgba(0,0,0,0.45)_100%)]" />

      {/* Fine grain for depth */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.07] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
