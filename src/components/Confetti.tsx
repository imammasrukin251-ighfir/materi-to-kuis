/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  dx: number;
  dy: number;
}

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ["#eab308", "#22c55e", "#3b82f6", "#ec4899", "#a855f7", "#f97316"];
    const initialParticles: Particle[] = Array.from({ length: 80 }).map((_, idx) => ({
      id: idx,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
      rotation: Math.random() * 360,
      dx: Math.random() * 6 - 3,
      dy: Math.random() * 5 + 4,
    }));

    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.dx,
            y: p.y + p.dy,
            rotation: p.rotation + p.dx * 2,
          }))
          .filter((p) => p.y < window.innerHeight + 20)
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            rotate: p.rotation,
            borderRadius: p.id % 3 === 0 ? "50%" : p.id % 3 === 1 ? "4px" : "0px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  );
}
