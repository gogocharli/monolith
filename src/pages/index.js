/** @jsxImportSource theme-ui */
import React, { useRef, useEffect, useState } from 'react';
import { Engine, Render, Runner, Common, Bodies, Body, World } from 'matter-js';
import { Button } from '@theme-ui/components';
import '../styles/base.css';

const STATIC_DENSITY = 20;

function Composition(props) {
  const engine = useRef(Engine.create());
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [constraints, setConstraints] = useState(null);
  const [scene, setScene] = useState(null);
  const [particles, setParticles] = useState(0);

  const handleResize = () => {
    setConstraints(containerRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const currentEngine = engine.current;
    const world = currentEngine.world;

    const render = Render.create({
      element: containerRef.current,
      canvas: canvasRef.current,
      engine: currentEngine,
      options: {
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#111',
      },
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, currentEngine);

    const floor = Bodies.rectangle(0, 0, 0, STATIC_DENSITY, {
      isStatic: true,
    });
    World.add(world, floor);

    setConstraints(containerRef.current.getBoundingClientRect());
    setScene(render);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world);
      Engine.clear(currentEngine);
    };
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (constraints) {
      const { width, height } = constraints;

      // Dynamically update canvas and bounds
      scene.bounds.max.x = width;
      scene.bounds.max.y = height;
      scene.options.width = width;
      scene.options.height = height;
      scene.canvas.width = width;
      scene.canvas.height = height;

      // Dynamically update floor
      const floor = engine.current.world.bodies[0];

      if (floor) {
        Body.setPosition(floor, {
          x: width / 2,
          y: height + STATIC_DENSITY / 2,
        });

        Body.setVertices(floor, [
          { x: 0, y: height },
          { x: width, y: height },
          { x: width, y: height + STATIC_DENSITY },
          { x: 0, y: height + STATIC_DENSITY },
        ]);
      }
    }
  }, [scene, constraints]);

  useEffect(() => {
    if (scene) {
      const { width } = constraints;

      let x = Common.random(0, width);
      let y = 0; // Always fall from the top

      let sides = Math.round(Common.random(1, 8));

      // triangles can be a little unstable, so avoid until fixed
      sides = sides === 3 ? 4 : sides;

      // round the edges of some bodies
      let chamfer = null;
      if (sides > 2 && Common.random() > 0.7) {
        chamfer = {
          radius: 10,
        };
      }

      // Randomize shape
      let body = null;
      switch (Math.round(Common.random(0, 1))) {
        case 0:
          if (Common.random() < 0.8) {
            body = Bodies.rectangle(
              x,
              y,
              Common.random(10, 15),
              Common.random(10, 15),
              { chamfer: chamfer },
            );
          } else {
            body = Bodies.rectangle(
              x,
              y,
              Common.random(20, 60),
              Common.random(10, 20),
              { chamfer: chamfer, restitution: 1.05 },
            );
          }
          break;
        case 1:
          body = Bodies.polygon(x, y, sides, Common.random(10, 15), {
            chamfer: chamfer,
            restitution: 0.95,
          });
          break;
        default:
          break;
      }

      World.add(engine.current.world, body);
    }
    /** Slight issue with dependecy list but it would require a more complex solution */
  }, [particles]);

  return (
    <main
      sx={{
        backgroundColor: '#fff',
        color: '#111',
        display: 'grid',
        height: '100vh',
        placeContent: 'center',
        position: 'relative',
        width: '100vw',
      }}
    >
      <Button
        sx={{
          backgroundColor: '#fff',
          color: '#111',
          zIndex: 1,
        }}
        onClick={() => setParticles((prevCount) => prevCount + 1)}
      >
        Make it Rain
      </Button>
      <div
        ref={containerRef}
        sx={{
          height: '100%',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      >
        <canvas ref={canvasRef}></canvas>
      </div>
    </main>
  );
}

export default Composition;
