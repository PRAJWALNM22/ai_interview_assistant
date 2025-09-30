import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
  particleCount?: number;
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  size: number;
  life: number;
  maxLife: number;
}

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', 
  '#a29bfe', '#fd79a8', '#fdcb6e', '#00b894', '#00cec9', 
  '#e17055', '#fab1a0'
];

const Confetti: React.FC<ConfettiProps> = ({ 
  active, 
  particleCount = 100, 
  duration = 5000 
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      // Initialize particles
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 4,
        life: 0,
        maxLife: Math.random() * 300 + 200
      }));
      
      setParticles(newParticles);
      
      let animationFrameId: number;
      
      // Start animation
      const animate = () => {
        setParticles(prevParticles => {
          return prevParticles
            .map(particle => ({
              ...particle,
              x: particle.x + particle.vx,
              y: particle.y + particle.vy,
              vy: particle.vy + 0.1, // gravity
              rotation: particle.rotation + particle.rotationSpeed,
              life: particle.life + 1
            }))
            .filter(particle => 
              particle.y < window.innerHeight + 50 && 
              particle.life < particle.maxLife &&
              particle.x > -50 && 
              particle.x < window.innerWidth + 50
            );
        });
        
        animationFrameId = requestAnimationFrame(animate);
      };
      
      animate();
      
      // Auto cleanup after duration
      const timeout = setTimeout(() => {
        setParticles([]);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      }, duration);
      
      return () => {
        clearTimeout(timeout);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [active, particleCount, duration]);

  if (!active) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    >
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            opacity: Math.max(0, 1 - (particle.life / particle.maxLife))
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;