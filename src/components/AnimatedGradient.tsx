import { useEffect, useRef } from 'react';

const AnimatedGradient = () => {
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gradient = gradientRef.current;
    if (!gradient) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Create flowing wave-like movement
      const x1 = Math.sin(time) * 20 + 50;
      const y1 = Math.cos(time * 0.8) * 15 + 50;
      const x2 = Math.sin(time * 1.2) * 25 + 50;
      const y2 = Math.cos(time * 0.6) * 20 + 50;
      const x3 = Math.sin(time * 0.9) * 30 + 50;
      const y3 = Math.cos(time * 1.1) * 25 + 50;

      gradient.style.background = `
        radial-gradient(circle at ${x1}% ${y1}%, rgba(34, 197, 94, 0.4) 0%, transparent 50%),
        radial-gradient(circle at ${x2}% ${y2}%, rgba(163, 230, 53, 0.3) 0%, transparent 50%),
        radial-gradient(circle at ${x3}% ${y3}%, rgba(132, 204, 22, 0.35) 0%, transparent 50%),
        linear-gradient(135deg, 
          rgba(34, 197, 94, 0.2) 0%, 
          rgba(163, 230, 53, 0.15) 25%, 
          rgba(132, 204, 22, 0.2) 50%, 
          rgba(34, 197, 94, 0.25) 75%, 
          rgba(163, 230, 53, 0.2) 100%
        )
      `;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div
        ref={gradientRef}
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 30% 70%, rgba(163, 230, 53, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(132, 204, 22, 0.35) 0%, transparent 50%),
            linear-gradient(135deg, 
              rgba(34, 197, 94, 0.2) 0%, 
              rgba(163, 230, 53, 0.15) 25%, 
              rgba(132, 204, 22, 0.2) 50%, 
              rgba(34, 197, 94, 0.25) 75%, 
              rgba(163, 230, 53, 0.2) 100%
            )
          `
        }}
      />
      
      {/* Animated blur circles */}
      <div className="absolute -left-32 top-[-140px] h-64 w-64 rounded-full bg-brand-primary/50 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-160px] right-[-120px] h-72 w-72 rounded-full bg-brand-lime/40 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-chartreuse/45 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Additional floating elements */}
      <div className="absolute top-1/4 right-1/4 h-32 w-32 rounded-full bg-brand-lime/30 blur-2xl animate-bounce" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-1/4 left-1/4 h-40 w-40 rounded-full bg-brand-chartreuse/35 blur-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
    </div>
  );
};

export default AnimatedGradient;
