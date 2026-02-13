export default function CalmBackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #050508 0%, #08090c 50%, #060709 100%)",
        }}
      />
    </div>
  );
}
