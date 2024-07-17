import { useEffect } from 'react';
import { TweenLite, Circ } from 'gsap';

interface Point {
  x: number;
  y: number;
  originX: number;
  originY: number;
  closest?: Point[];
  active?: number;
  circle?: Circle;
}

class Circle {
  pos: Point;
  radius: number;
  color: string;
  active: number | undefined;

  constructor(pos: Point, radius: number, color: string) {
    this.pos = pos;
    this.radius = radius;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = `rgba(92,77,177,${this.active})`;
    ctx.fill();
  }
}

const AnimatedHeader = () => {
  useEffect(() => {
    let width: number, height: number;
    let largeHeader: HTMLElement | null, canvas: HTMLCanvasElement | null, ctx: CanvasRenderingContext2D | null;
    let points: Point[] = [];
    let target: Point;
    let animateHeader = true;

    function initHeader() {
      width = window.innerWidth;
      height = window.innerHeight;
      target = { x: width / 2, y: height / 2, originX: width / 2, originY: height / 2 };

      largeHeader = document.getElementById('large-header');
      canvas = document.getElementById('demo-canvas') as HTMLCanvasElement;

      if (largeHeader) largeHeader.style.height = `${height}px`;

      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
      }

      points = [];
      for (let x = 0; x < width; x += width / 20) {
        for (let y = 0; y < height; y += height / 20) {
          let px = x + (Math.random() * width) / 20;
          let py = y + (Math.random() * height) / 20;
          let p: Point = { x: px, originX: px, y: py, originY: py };
          points.push(p);
        }
      }

      for (let i = 0; i < points.length; i++) {
        let closest: Point[] = [];
        let p1 = points[i];
        for (let j = 0; j < points.length; j++) {
          let p2 = points[j];
          if (!(p1 === p2)) {
            let placed = false;
            for (let k = 0; k < 5; k++) {
              if (!placed) {
                if (!closest[k]) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }
            for (let k = 0; k < 5; k++) {
              if (!placed) {
                if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }
          }
        }
        p1.closest = closest;
      }

      for (let i in points) {
        let c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
        points[i].circle = c;
      }
    }

    function addListeners() {
      if (!('ontouchstart' in window)) {
        window.addEventListener('mousemove', mouseMove);
      }
      window.addEventListener('scroll', scrollCheck);
      window.addEventListener('resize', resize);
    }

    function mouseMove(e: MouseEvent) {
      let posx = 0, posy = 0;
      if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
      } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      target.x = posx;
      target.y = posy;
    }

    function scrollCheck() {
      animateHeader = document.body.scrollTop <= height;
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (largeHeader) largeHeader.style.height = `${height}px`;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    function initAnimation() {
      animate();
      for (let i in points) {
        shiftPoint(points[i]);
      }
    }

    function animate() {
      if (animateHeader) {
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          for (let i in points) {
            if (Math.abs(getDistance(target, points[i])) < 4000) {
              points[i].active = 0.3;
              points[i].circle!.active = 0.6;
            } else if (Math.abs(getDistance(target, points[i])) < 20000) {
              points[i].active = 0.1;
              points[i].circle!.active = 0.3;
            } else if (Math.abs(getDistance(target, points[i])) < 40000) {
              points[i].active = 0.02;
              points[i].circle!.active = 0.1;
            } else {
              points[i].active = 0;
              points[i].circle!.active = 0;
            }
            drawLines(points[i]);
            points[i].circle!.draw(ctx);
          }
        }
      }
      requestAnimationFrame(animate);
    }

    function shiftPoint(p: Point) {
      TweenLite.to(p, 1 + 1 * Math.random(), {
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100,
        ease: Circ.easeInOut,
        onComplete: function () {
          shiftPoint(p);
        },
      });
    }

    function drawLines(p: Point) {
      if (!p.active || !ctx || !p.closest) return; // Check if p.closest is defined
      for (let point of p.closest) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = `rgba(92,77,177,${p.active})`;
        ctx.stroke();
      }
    }

    function getDistance(p1: Point, p2: Point) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    // Initialization
    largeHeader = document.getElementById('large-header');
    canvas = document.getElementById('demo-canvas') as HTMLCanvasElement;

    if (largeHeader && canvas) {
      initHeader();
      initAnimation();
      addListeners();
    }

    return () => {
      // Cleanup event listeners if needed
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('scroll', scrollCheck);
      window.removeEventListener('resize', resize);
    };
  }, []); // Empty dependency array to run effect only once

  return (
    <div id="large-header">
      <canvas id="demo-canvas"></canvas>
    </div>
  );
};

export default AnimatedHeader;
