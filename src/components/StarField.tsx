import React, { useEffect, useRef } from 'react';

export const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    const starCount = 100;

    class Star {
      x: number;
      y: number;
      z: number;
      size: number;
      opacity: number;
      sparkleSpeed: number;
      sparklePhase: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.z = Math.random() * canvas!.width;
        this.size = Math.random() * 0.8 + 0.2;
        this.opacity = Math.random() * 0.5;
        this.sparkleSpeed = 0.01 + Math.random() * 0.02;
        this.sparklePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.sparklePhase += this.sparkleSpeed;
        this.opacity = ((Math.sin(this.sparklePhase) + 1) / 2) * 0.5;
        
        // Move towards viewer for 3D feel
        this.z -= 0.3;
        if (this.z <= 0) {
          this.z = canvas!.width;
          this.x = Math.random() * canvas!.width;
          this.y = Math.random() * canvas!.height;
        }
      }

      draw() {
        const x = (this.x - canvas!.width / 2) * (canvas!.width / this.z) + canvas!.width / 2;
        const y = (this.y - canvas!.height / 2) * (canvas!.width / this.z) + canvas!.height / 2;
        const s = this.size * (canvas!.width / this.z);

        if (x < 0 || x > canvas!.width || y < 0 || y > canvas!.height) return;

        ctx!.beginPath();
        ctx!.arc(x, y, s, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx!.fill();

        // Add a subtle glow for "sparkling"
        if (this.opacity > 0.4) {
          ctx!.shadowBlur = 5;
          ctx!.shadowColor = 'rgba(255, 255, 255, 0.3)';
          ctx!.fill();
          ctx!.shadowBlur = 0;
        }
      }
    }

    const init = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        star.update();
        star.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};
