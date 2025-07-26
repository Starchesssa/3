
import React from "react";

export const Bank: React.FC = () => {
  const pillars = Array.from({ length: 4 });

  return (
    <div
      style={{
        background: "linear-gradient(#0d0d0d, #1a1a1a)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 300,
          height: 250,
          backgroundColor: "#FFD580",
          borderRadius: 10,
          boxShadow: "0 0 30px rgba(255, 215, 128, 0.6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Roof */}
        <div
          style={{
            position: "absolute",
            top: -60,
            width: 0,
            height: 0,
            borderLeft: "160px solid transparent",
            borderRight: "160px solid transparent",
            borderBottom: "60px solid #FF6F61",
            filter: "drop-shadow(0 0 10px #FF6F61aa)",
            zIndex: 2,
          }}
        />

        {/* Pillars */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
            padding: "0 20px",
          }}
        >
          {pillars.map((_, i) => (
            <div
              key={i}
              style={{
                width: 20,
                height: 100,
                backgroundColor: "white",
                borderRadius: 10,
                boxShadow: "inset 0 0 5px #ccc",
              }}
            />
          ))}
        </div>

        {/* Base */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: 40,
            backgroundColor: "#D4A373",
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            boxShadow: "0 -5px 10px rgba(0, 0, 0, 0.2)",
          }}
        />

        {/* BANK Text */}
        <div
          style={{
            position: "absolute",
            top: 110,
            fontSize: 24,
            fontWeight: "bold",
            color: "#FFCC00",
            textShadow: "0 0 5px #FFCC00aa, 0 0 10px #FFCC00aa",
            zIndex: 3,
          }}
        >
          BANK
        </div>

        {/* Sparkle */}
        <div
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            background: "radial-gradient(circle, #fff, transparent)",
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "sparkle 2s infinite ease-in-out",
          }}
        />
      </div>

      {/* Animation keyframes via <style> for Remotion */}
      <style>{`
        @keyframes sparkle {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
