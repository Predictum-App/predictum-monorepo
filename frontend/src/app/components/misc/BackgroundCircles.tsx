"use client";

import React, { useState, useEffect } from "react";

interface FloatingCircle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

export const BackgroundCircles: React.FC = () => {
  const [circles, setCircles] = useState<FloatingCircle[]>([]);

  // Generate random circle
  const generateCircle = (id: number): FloatingCircle => ({
    id,
    x: Math.random() * 100, // Random x position (0-100%)
    y: Math.random() * 100, // Random y position (0-100%)
    size: Math.random() * 200 + 150, // Random size (150-350px)
    opacity: Math.random() * 0.2 + 0.1, // Random opacity (0.1-0.3)
    duration: Math.random() * 10 + 15, // Random duration (15-25s)
    delay: Math.random() * 5, // Random delay (0-5s)
  });

  // Initialize circles and set up regeneration
  useEffect(() => {
    // Create initial circles
    const initialCircles = Array.from({ length: 4 }, (_, i) => generateCircle(i));
    setCircles(initialCircles);

    // Regenerate circles periodically
    const interval = setInterval(() => {
      setCircles((prevCircles) => {
        const newCircles = prevCircles.map((circle) => ({
          ...generateCircle(circle.id),
        }));
        return newCircles;
      });
    }, 8000); // Regenerate every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {circles.map((circle) => (
        <div
          key={circle.id}
          className="absolute bg-sei-400 rounded-full blur-2xl animate-float-slow transition-all duration-1000 ease-in-out"
          style={{
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            opacity: circle.opacity,
            animationDuration: `${circle.duration}s`,
            animationDelay: `${circle.delay}s`,
            transform: `translate(-50%, -50%)`,
          }}
        />
      ))}
    </div>
  );
};
