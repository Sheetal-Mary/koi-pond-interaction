import { useEffect, useRef, useState } from 'react';

interface KoiFish {
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  secondaryColor: string;
  tailPhase: number;
  finPhase: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  age: number;
  particles: { angle: number; distance: number; speed: number; size: number }[];
}

interface LilyPad {
  x: number;
  y: number;
  flowerColor: string;
  centerColor: string;
  animation: number;
  petalRotation: number;
}

export function KoiPond() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fishRef = useRef<KoiFish[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const lilyPadsRef = useRef<LilyPad[]>([]);
  const animationFrameRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize koi fish with colorful patterns
    const koiPatterns = [
      { primary: '#FF6B6B', secondary: '#FF8E8E' }, // bright red
      { primary: '#FFA500', secondary: '#FFD700' }, // orange to gold
      { primary: '#FFFFFF', secondary: '#FFE4B5' }, // white to cream
      { primary: '#FF1493', secondary: '#FFA0D2' }, // deep pink
      { primary: '#4169E1', secondary: '#87CEEB' }, // royal blue to sky blue
      { primary: '#FF4500', secondary: '#FF8C00' }, // orange red
      { primary: '#FFD700', secondary: '#FFF8DC' }, // gold to cornsilk
      { primary: '#FF69B4', secondary: '#FFB6C1' }, // hot pink
    ];

    fishRef.current = Array.from({ length: 8 }, () => {
      const pattern = koiPatterns[Math.floor(Math.random() * koiPatterns.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        angle: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
        size: 35 + Math.random() * 35,
        color: pattern.primary,
        secondaryColor: pattern.secondary,
        tailPhase: Math.random() * Math.PI * 2,
        finPhase: Math.random() * Math.PI * 2,
      };
    });

    // Draw realistic koi fish
    const drawKoi = (fish: KoiFish) => {
      ctx.save();
      ctx.translate(fish.x, fish.y);
      ctx.rotate(fish.angle);

      const tailWave = Math.sin(fish.tailPhase) * 0.2;
      const finWave = Math.sin(fish.finPhase) * 0.15;

      // Shadow beneath fish
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(0, fish.size * 0.1, fish.size * 0.9, fish.size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail fin
      ctx.fillStyle = fish.secondaryColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.moveTo(-fish.size * 0.9, 0);
      ctx.quadraticCurveTo(
        -fish.size * 1.4,
        -fish.size * 0.7 + tailWave * fish.size,
        -fish.size * 1.6,
        -fish.size * 0.4 + tailWave * fish.size
      );
      ctx.lineTo(-fish.size * 1.5, 0 + tailWave * fish.size * 0.5);
      ctx.lineTo(-fish.size * 1.6, fish.size * 0.4 - tailWave * fish.size);
      ctx.quadraticCurveTo(
        -fish.size * 1.4,
        fish.size * 0.7 - tailWave * fish.size,
        -fish.size * 0.9,
        0
      );
      ctx.closePath();
      ctx.fill();

      // Main body with gradient
      const gradient = ctx.createLinearGradient(fish.size, -fish.size * 0.4, -fish.size * 0.5, fish.size * 0.4);
      gradient.addColorStop(0, fish.color);
      gradient.addColorStop(0.5, fish.secondaryColor);
      gradient.addColorStop(1, fish.color);
      ctx.fillStyle = gradient;
      
      ctx.beginPath();
      ctx.ellipse(0, 0, fish.size, fish.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Decorative pattern spots
      ctx.shadowBlur = 0;
      ctx.fillStyle = fish.secondaryColor;
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
          -fish.size * 0.3 + i * fish.size * 0.3,
          -fish.size * 0.15 + (i % 2) * fish.size * 0.2,
          fish.size * 0.15,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Dorsal fin
      ctx.fillStyle = fish.secondaryColor;
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.moveTo(-fish.size * 0.2, -fish.size * 0.45);
      ctx.quadraticCurveTo(
        -fish.size * 0.1,
        -fish.size * 0.8 + finWave * fish.size * 0.3,
        fish.size * 0.1,
        -fish.size * 0.45
      );
      ctx.lineTo(fish.size * 0.05, -fish.size * 0.4);
      ctx.lineTo(-fish.size * 0.15, -fish.size * 0.4);
      ctx.closePath();
      ctx.fill();

      // Pectoral fin
      ctx.fillStyle = fish.color;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.ellipse(
        fish.size * 0.2,
        fish.size * 0.3 + finWave * fish.size * 0.2,
        fish.size * 0.3,
        fish.size * 0.15,
        0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.globalAlpha = 1;

      // Scales texture
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 0.5;
      for (let i = -3; i < 4; i++) {
        for (let j = -1; j < 2; j++) {
          ctx.beginPath();
          ctx.arc(
            i * fish.size * 0.15,
            j * fish.size * 0.2,
            fish.size * 0.1,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }

      // Eye
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#3D4F4F';
      ctx.beginPath();
      ctx.arc(fish.size * 0.6, -fish.size * 0.05, fish.size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(fish.size * 0.62, -fish.size * 0.08, fish.size * 0.04, 0, Math.PI * 2);
      ctx.fill();

      // Body highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.ellipse(fish.size * 0.3, -fish.size * 0.2, fish.size * 0.5, fish.size * 0.15, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Mouth detail
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fish.size * 0.95, 0, fish.size * 0.08, 0.3, -0.3);
      ctx.stroke();

      ctx.restore();
    };

    // Draw ripple with splash animation
    const drawRipple = (ripple: Ripple) => {
      ctx.save();
      
      // Draw main expanding ring with pulsing effect
      const pulseScale = 1 + Math.sin(ripple.age * 0.3) * 0.1;
      const mainRadius = ripple.radius * pulseScale;
      
      // Outer glow ring
      ctx.strokeStyle = `rgba(150, 220, 240, ${ripple.alpha * 0.3})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, mainRadius + 5, 0, Math.PI * 2);
      ctx.stroke();
      
      // Main ring with gradient
      const gradient = ctx.createRadialGradient(
        ripple.x, ripple.y, Math.max(0, mainRadius - 10),
        ripple.x, ripple.y, mainRadius + 10
      );
      gradient.addColorStop(0, `rgba(100, 210, 240, ${ripple.alpha * 0.6})`);
      gradient.addColorStop(0.5, `rgba(140, 230, 250, ${ripple.alpha})`);
      gradient.addColorStop(1, `rgba(100, 210, 240, ${ripple.alpha * 0.4})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, mainRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner ring
      if (ripple.radius > 15) {
        ctx.strokeStyle = `rgba(180, 240, 255, ${ripple.alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, mainRadius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Draw radiating water droplet particles
      ripple.particles.forEach((particle, index) => {
        particle.distance += particle.speed;
        const particleX = ripple.x + Math.cos(particle.angle) * particle.distance;
        const particleY = ripple.y + Math.sin(particle.angle) * particle.distance;
        
        // Particle trail
        ctx.strokeStyle = `rgba(120, 220, 240, ${ripple.alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(
          ripple.x + Math.cos(particle.angle) * (particle.distance - 10),
          ripple.y + Math.sin(particle.angle) * (particle.distance - 10)
        );
        ctx.lineTo(particleX, particleY);
        ctx.stroke();
        
        // Particle droplet
        const particleAlpha = ripple.alpha * (1 - particle.distance / ripple.maxRadius);
        ctx.fillStyle = `rgba(200, 240, 255, ${particleAlpha})`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgba(150, 230, 250, ${particleAlpha})`;
        ctx.beginPath();
        ctx.arc(particleX, particleY, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Central splash burst when young
      if (ripple.age < 10) {
        const burstAlpha = ripple.alpha * (1 - ripple.age / 10);
        ctx.fillStyle = `rgba(255, 255, 255, ${burstAlpha * 0.6})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(200, 240, 255, ${burstAlpha})`;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, 8 - ripple.age * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Radiating lines from center
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const length = ripple.age * 3;
          ctx.strokeStyle = `rgba(220, 245, 255, ${burstAlpha * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ripple.x, ripple.y);
          ctx.lineTo(
            ripple.x + Math.cos(angle) * length,
            ripple.y + Math.sin(angle) * length
          );
          ctx.stroke();
        }
      }
      
      ctx.shadowBlur = 0;
      ctx.restore();
    };

    // Draw pond elements
    const drawFountain = () => {
      const fountainX = canvas.width * 0.5;
      const fountainY = canvas.height * 0.2;
      const size = 40;
      const time = Date.now() * 0.001;

      // Base
      ctx.fillStyle = '#8B9B8B';
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(fountainX, fountainY + size * 0.5, size * 1.2, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bowl
      ctx.fillStyle = '#9EAAA0';
      ctx.beginPath();
      ctx.arc(fountainX, fountainY, size, 0, Math.PI, true);
      ctx.lineTo(fountainX + size, fountainY);
      ctx.quadraticCurveTo(fountainX, fountainY + size * 0.3, fountainX - size, fountainY);
      ctx.closePath();
      ctx.fill();

      // Water droplets
      ctx.shadowBlur = 5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < 5; i++) {
        const angle = (time + i) % (Math.PI * 2);
        const height = Math.abs(Math.sin(angle)) * size * 0.8;
        ctx.beginPath();
        ctx.arc(
          fountainX + Math.cos(i) * size * 0.3,
          fountainY - height,
          size * 0.1,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    // Initialize lily pads
    lilyPadsRef.current = [
      { x: 0.25, y: 0.4, flowerColor: '#F5E6F0', centerColor: '#F9E4A0', animation: 0, petalRotation: 0 },    // pale lavender with soft yellow
      { x: 0.7, y: 0.55, flowerColor: '#FFF5F7', centerColor: '#FFE9B3', animation: 0, petalRotation: 0 },    // very pale pink with cream
      { x: 0.6, y: 0.75, flowerColor: '#E8E4F3', centerColor: '#F5D0A9', animation: 0, petalRotation: 0 },    // very light purple with peach
      { x: 0.35, y: 0.65, flowerColor: '#FFE8E8', centerColor: '#FFE6A7', animation: 0, petalRotation: 0 },   // very pale coral with light yellow
      { x: 0.8, y: 0.3, flowerColor: '#F0F5F5', centerColor: '#F0E68C', animation: 0, petalRotation: 0 },     // pale mint with khaki
    ];

    const drawLilyPads = () => {
      lilyPadsRef.current.forEach((lily, index) => {
        const x = canvas.width * lily.x;
        const y = canvas.height * lily.y;
        const size = 40 + index * 5;

        // Animation effects
        const bounceEffect = lily.animation > 0 ? Math.sin(lily.animation * 0.3) * 5 : 0;
        const scaleEffect = lily.animation > 0 ? 1 + Math.sin(lily.animation * 0.2) * 0.1 : 1;

        ctx.save();
        ctx.translate(x, y + bounceEffect);
        ctx.scale(scaleEffect, scaleEffect);

        // Lily pad - brighter green
        ctx.fillStyle = '#90D090';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Cut in lily pad
        ctx.fillStyle = '#78B878';
        ctx.beginPath();
        ctx.moveTo(size * 0.7, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(size * 0.5, -size * 0.3);
        ctx.closePath();
        ctx.fill();

        // Veins
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * size * 0.8, Math.sin(angle) * size * 0.8);
          ctx.stroke();
        }

        // Flower with animation
        ctx.shadowBlur = 5;
        ctx.fillStyle = lily.flowerColor;
        
        // Rotate petals when animated
        ctx.rotate(lily.petalRotation);
        
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const petalScale = lily.animation > 0 ? 1 + Math.sin(lily.animation * 0.4 + i) * 0.15 : 1;
          
          ctx.save();
          ctx.rotate(angle);
          ctx.scale(petalScale, petalScale);
          
          ctx.beginPath();
          ctx.ellipse(
            size * 0.3,
            0,
            size * 0.15,
            size * 0.25,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          
          ctx.restore();
        }
        
        // Center with glow effect when animated
        if (lily.animation > 0) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = lily.centerColor;
        }
        ctx.fillStyle = lily.centerColor;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Update animation
        if (lily.animation > 0) {
          lily.animation -= 1;
          lily.petalRotation += 0.05;
        } else {
          lily.petalRotation = 0;
        }
      });
      ctx.shadowBlur = 0;
    };

    // Animation loop
    const animate = () => {
      // Light blue and light green gradient for the pond
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#D4F1F4');     // very light blue
      gradient.addColorStop(0.3, '#C8E9E9');   // light blue-green
      gradient.addColorStop(0.6, '#B8E0D4');   // light green-blue
      gradient.addColorStop(1, '#A8D8D0');     // light aqua
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw water pattern with light blue and green tones
      const time = Date.now() * 0.0001;
      for (let i = 0; i < 6; i++) {
        const radialGradient = ctx.createRadialGradient(
          canvas.width * (0.15 + i * 0.15),
          canvas.height * (0.25 + Math.sin(time + i) * 0.12),
          0,
          canvas.width * (0.15 + i * 0.15),
          canvas.height * (0.25 + Math.sin(time + i) * 0.12),
          canvas.width * 0.35
        );
        
        // Alternating light blue and light green shades
        if (i % 2 === 0) {
          radialGradient.addColorStop(0, 'rgba(175, 238, 238, 0.2)');  // pale turquoise
          radialGradient.addColorStop(1, 'rgba(152, 251, 152, 0)');     // pale green
        } else {
          radialGradient.addColorStop(0, 'rgba(176, 224, 230, 0.2)');  // powder blue
          radialGradient.addColorStop(1, 'rgba(175, 238, 238, 0)');     // pale turquoise
        }
        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw pond decorations
      drawLilyPads();
      drawFountain();

      // Update and draw fish
      fishRef.current.forEach((fish) => {
        // Update position
        fish.x += Math.cos(fish.angle) * fish.speed;
        fish.y += Math.sin(fish.angle) * fish.speed;

        // Boundary checking with smooth turning
        if (fish.x < -50 || fish.x > canvas.width + 50 || fish.y < -50 || fish.y > canvas.height + 50) {
          fish.angle = Math.atan2(canvas.height / 2 - fish.y, canvas.width / 2 - fish.x);
        }

        // Random direction change
        if (Math.random() < 0.01) {
          fish.angle += (Math.random() - 0.5) * 0.5;
        }

        // Update tail and fin animation
        fish.tailPhase += 0.08;
        fish.finPhase += 0.1;

        drawKoi(fish);
      });

      // Update and draw ripples
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius += 2.5;
        ripple.alpha -= 0.008;
        ripple.age += 1;
        
        if (ripple.alpha > 0 && ripple.radius < ripple.maxRadius) {
          drawRipple(ripple);
          return true;
        }
        return false;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if click is on a lily pad
    let clickedOnLily = false;
    lilyPadsRef.current.forEach((lily, index) => {
      const x = canvas.width * lily.x;
      const y = canvas.height * lily.y;
      const size = 40 + index * 5;
      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);

      if (distance < size) {
        // Animate this lily pad
        lily.animation = 50;
        clickedOnLily = true;
        
        // Create special ripples around the lily - smaller and gentler
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const particles = [];
            for (let j = 0; j < 6; j++) {
              particles.push({
                angle: (j / 6) * Math.PI * 2 + Math.random() * 0.3,
                distance: 0,
                speed: 0.8 + Math.random() * 0.4,
                size: 2 + Math.random() * 2,
              });
            }
            ripplesRef.current.push({
              x: x + (Math.random() - 0.5) * size * 0.5,
              y: y + (Math.random() - 0.5) * size * 0.5,
              radius: 0,
              maxRadius: 80,
              alpha: 0.5,
              age: 0,
              particles,
            });
          }, i * 150);
        }
      }
    });

    // If not clicked on lily, create regular ripple with splash particles
    if (!clickedOnLily) {
      const particles = [];
      // Create 12 particles radiating outward
      for (let i = 0; i < 12; i++) {
        particles.push({
          angle: (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.2,
          distance: 0,
          speed: 1.2 + Math.random() * 0.8,
          size: 2 + Math.random() * 3,
        });
      }
      
      ripplesRef.current.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: 120,
        alpha: 0.7,
        age: 0,
        particles,
      });
    }

    // Make nearby fish swim away
    fishRef.current.forEach((fish) => {
      const dx = fish.x - clickX;
      const dy = fish.y - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        fish.angle = Math.atan2(dy, dx);
        fish.speed = 2;
      } else {
        fish.speed = 0.5 + Math.random() * 0.5;
      }
    });
  };

  const toggleAudio = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          // Check if there's a valid source before trying to play
          if (audioRef.current.src && audioRef.current.src !== window.location.href) {
            await audioRef.current.play();
            setIsPlaying(true);
          } else {
            // No audio source available
            alert('Please add an audio file to enable music. See the code comments for instructions.');
          }
        } catch (error) {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        }
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 cursor-pointer"
        style={{
          background: 'linear-gradient(to bottom, #D4F1F4 0%, #C8E9E9 50%, #B8E0D4 100%)',
        }}
      />
      
      {/* Instructions overlay */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
        <h1 className="text-white text-opacity-80 mb-2">Zen Koi Pond</h1>
        <p className="text-white text-opacity-60">Click the water or lily flowers to interact</p>
      </div>

      {/* Audio control */}
      <button
        onClick={toggleAudio}
        className="absolute bottom-8 right-8 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-full backdrop-blur-sm transition-all"
      >
        {isPlaying ? '🔊 Pause Music' : '🔇 Play Music'}
      </button>

      {/* 
        To add your own calming background music:
        1. Place your audio file (MP3, WAV, etc.) in the public folder
        2. Update the src below to point to your audio file
        Example: <audio ref={audioRef} src="/calming-music.mp3" loop />
        
        For free calming music, try:
        - Incompetech (royalty free)
        - YouTube Audio Library
        - Free Music Archive
      */}
      <audio
        ref={audioRef}
        loop
        onEnded={() => setIsPlaying(false)}
      >
        {/* Add your audio source here */}
        {/* <source src="/your-calming-music.mp3" type="audio/mpeg" /> */}
      </audio>

      {/* Timer display */}
      <div className="absolute top-8 right-8 bg-white bg-opacity-20 text-white px-4 py-2 rounded-full backdrop-blur-sm">
        <Timer duration={60} />
      </div>
    </div>
  );
}

function Timer({ duration }: { duration: number }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
