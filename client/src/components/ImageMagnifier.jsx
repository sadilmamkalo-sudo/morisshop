import { useState, useRef } from 'react';

export default function ImageMagnifier({ src, alt, zoomLevel = 2 }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  return (
    <div className="relative overflow-hidden rounded bg-white dark:bg-ink-800"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onMouseMove={handleMouseMove}>
      <img ref={imgRef} src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
      {show && (
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: `${zoomLevel * 100}% ${zoomLevel * 100}%`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            WebkitMaskImage: `radial-gradient(circle 80px at ${pos.x}% ${pos.y}%, black 100%, transparent 100%)`,
            maskImage: `radial-gradient(circle 80px at ${pos.x}% ${pos.y}%, black 100%, transparent 100%)`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
}
