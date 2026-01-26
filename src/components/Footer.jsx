import React from "react";

function Footer() {
  const roses = Array.from({ length: 300 }); // adjust for density

  return (
    <div className="fixed bottom-0 left-0 w-full h-40 overflow-hidden pointer-events-none z-0 bg-transparent">
      {roses.map((_, i) => {
        const left = Math.random() * 100;
        const size = 20 + Math.random() * 30;
        const rotation = Math.random() * 360;
        const top = Math.random() * 20;

        return (
          <img
            key={i}
            src="/roses/rose.png"
            alt="rose"
            style={{
              position: "absolute",
              bottom: `${top}px`,
              left: `${left}vw`,
              width: `${size}px`,
              transform: `rotate(${rotation}deg)`,
              opacity: 0.9,
              zIndex: -10,
              filter: "blur(0.5px)",
            }}
          />
        );
      })}
    </div>
  );
}

export default Footer;