// src/components/ParticlesBackground.jsx
import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadStarsPreset } from 'tsparticles-preset-stars';

function ParticlesBackground({ id = "tsparticles" }) {
  const particlesInit = useCallback(async (engine) => {
    await loadStarsPreset(engine);
  }, []);

  return (
    <Particles
      id={id}
      init={particlesInit}
      options={{
        preset: "stars",
        background: {
          color: "#f9fafa",
        },
        particles: {
          color: {
            value: "#2563eb"  
          },
          move: {
            speed: 4 
          }
        }
      }}
    />
  );
}

export default ParticlesBackground;
