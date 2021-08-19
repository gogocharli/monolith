/** @jsxImportSource theme-ui */
import React, { useRef, useEffect } from 'react';
import {
  Engine,
  Render,
  Runner,
  Composites,
  Common,
  MouseConstraint,
  Mouse,
  Composite,
  Bodies,
  Body,
  World,
  Events,
} from 'matter-js';
import '../styles/base.css';

// markup
function Composition(props) {
  const engine = useRef(Engine.create());
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const currentEngine = engine.current;
    const world = currentEngine.world;

    const render = Render.create({
      canvas: canvasRef.current,
      engine: currentEngine,
      options: {
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: true,
        showAngleIndicator: true,
        wireframeBackground: '#111',
      },
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, currentEngine);

    const stack = Composites.stack(20, 20, 10, 5, 0, 0, function (x, y) {
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

      switch (Math.round(Common.random(0, 1))) {
        case 0:
          if (Common.random() < 0.8) {
            return Bodies.rectangle(
              x,
              y,
              Common.random(25, 50),
              Common.random(25, 50),
              { chamfer: chamfer },
            );
          } else {
            return Bodies.rectangle(
              x,
              y,
              Common.random(80, 120),
              Common.random(25, 30),
              { chamfer: chamfer },
            );
          }
        case 1:
          return Bodies.polygon(x, y, sides, Common.random(25, 50), {
            chamfer: chamfer,
          });
        default:
          break;
      }
    });

    Composite.add(world, stack);

    // Walls
    const wallThickness = 50;
    const topWall = Bodies.rectangle(
      window.innerWidth / 2,
      -wallThickness / 2,
      window.innerWidth,
      wallThickness,
      { isStatic: true },
    );

    const bottomWall = Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight + wallThickness / 2,
      window.innerWidth,
      wallThickness,
      { isStatic: true },
    );

    const rightWall = Bodies.rectangle(
      window.innerWidth + wallThickness / 2,
      window.innerHeight / 2,
      wallThickness,
      window.innerHeight,
      { isStatic: true },
    );

    const leftWall = Bodies.rectangle(
      -wallThickness / 2,
      window.innerHeight / 2,
      wallThickness,
      window.innerHeight,
      { isStatic: true },
    );

    Composite.add(world, [topWall, bottomWall, rightWall, leftWall]);

    let prevWidth = window.innerWidth;
    let prevHeight = window.innerHeight;
    const handleResize = (event) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      render.canvas.height = h;
      render.canvas.width = w;

      // Resize walls
      Body.setPosition(topWall, { x: w / 2, y: -wallThickness / 2 });
      Body.scale(topWall, w / prevWidth, 1);

      Body.setPosition(bottomWall, {
        x: w / 2,
        y: h + wallThickness / 2,
      });
      Body.scale(bottomWall, w / prevWidth, 1);

      Body.setPosition(leftWall, { x: -wallThickness / 2, y: h / 2 });
      Body.scale(leftWall, 1, h / prevHeight);

      Body.setPosition(rightWall, {
        x: w + wallThickness / 2,
        y: h / 2,
      });
      Body.scale(rightWall, 1, h / prevHeight);

      // Reset widht and height
      prevWidth = w;
      prevHeight = h;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world);
      Engine.clear(currentEngine);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <main sx={{ width: '100vw', height: '100vh' }}>
      <canvas ref={canvasRef}></canvas>
    </main>
  );
}

export default Composition;
