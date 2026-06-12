export function SpaceBackground() {
  // floating wreckage pieces
  const debris = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div className="nebula" />
      <div className="starfield" />
      <div className="starfield" style={{ animationDuration: "140s", opacity: 0.5 }} />
      {/* Distant planet */}
      <div
        className="absolute rounded-full"
        style={{
          width: 380,
          height: 380,
          right: "-80px",
          top: "20%",
          background:
            "radial-gradient(circle at 30% 30%, #6a8cff 0%, #2a3a8a 40%, #0a0f30 70%, transparent 100%)",
          boxShadow: "0 0 120px rgba(80,120,255,0.35), inset -40px -20px 80px rgba(0,0,0,0.7)",
          filter: "blur(0.4px)",
        }}
      />
      {/* Wreckage */}
      <div className="absolute left-[10%] top-[55%] w-[260px] h-[60px]"
        style={{
          background: "linear-gradient(180deg,#171b27,#060911 70%,#000)",
          transform: "rotate(-14deg) skewX(-8deg)",
          boxShadow: "0 0 72px rgba(56,189,248,0.14), inset 0 0 24px rgba(0,255,233,0.05)",
          borderTop: "1px solid rgba(56,189,248,0.2)",
          borderLeft: "1px solid rgba(56,189,248,0.12)",
        }}
      />
      <div className="absolute right-[18%] bottom-[20%] w-[160px] h-[36px]"
        style={{
          background: "linear-gradient(180deg,#10121b,#05070f)",
          transform: "rotate(22deg)",
          boxShadow: "0 0 40px rgba(56,189,248,0.14)",
          border: "1px solid rgba(56,189,248,0.12)",
        }}
      />
      <div className="absolute left-[50%] top-[15%] h-[220px] w-[220px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(48,207,255,0.18), transparent 55%)",
          transform: "translateX(-50%)",
          filter: "blur(1px)",
        }}
      />
      <div className="absolute right-[10%] top-[10%] h-[160px] w-[160px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(140,80,255,0.12), transparent 55%)",
          filter: "blur(2px)",
        }}
      />
      {/* Drifting debris */}
      {debris.map((i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: 2 + (i % 4) * 2,
            height: 2 + (i % 3) * 2,
            background: i % 3 === 0 ? "#f80" : "#888",
            borderRadius: i % 2 ? "2px" : "50%",
            top: `${(i * 53) % 100}%`,
            left: `${(i * 37) % 100}%`,
            opacity: 0.7,
            animation: `debris ${40 + i * 7}s linear ${-i * 4}s infinite`,
            boxShadow: i % 3 === 0 ? "0 0 8px #f80" : "none",
          }}
        />
      ))}
    </div>
  );
}
