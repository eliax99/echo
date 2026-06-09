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
          background: "linear-gradient(180deg,#2a2a30,#0d0d12 70%,#000)",
          transform: "rotate(-14deg) skewX(-8deg)",
          boxShadow: "0 0 40px rgba(255,120,40,0.25), inset 0 0 20px #000",
          borderTop: "1px solid #555",
        }}
      />
      <div className="absolute right-[18%] bottom-[20%] w-[160px] h-[36px]"
        style={{
          background: "linear-gradient(180deg,#1a1a22,#0a0a10)",
          transform: "rotate(22deg)",
          boxShadow: "0 0 30px rgba(255,100,40,0.2)",
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
