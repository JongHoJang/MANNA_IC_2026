'use client';

import { useLayoutEffect, useRef } from 'react';
import rough from 'roughjs/bin/rough';

type RoughBorderProps = {
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  bowing?: number;
  inset?: number;
};

export function RoughBorder({
  stroke = 'rgba(36,27,22,0.88)',
  strokeWidth = 1.8,
  roughness = 1.1,
  bowing = 1.2,
  inset = 1.5,
}: RoughBorderProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'h-full w-full');
    svg.setAttribute('preserveAspectRatio', 'none');
    host.replaceChildren(svg);

    const generator = rough.svg(svg);
    let frame = 0;

    const draw = () => {
      frame = 0;

      const width = host.clientWidth;
      const height = host.clientHeight;

      if (!width || !height) {
        return;
      }

      svg.replaceChildren();
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      const shape = generator.rectangle(inset, inset, Math.max(width - inset * 2, 0), Math.max(height - inset * 2, 0), {
        stroke,
        strokeWidth,
        roughness,
        bowing,
        fill: 'transparent',
        preserveVertices: true,
      });

      svg.appendChild(shape);
    };

    const scheduleDraw = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      frame = window.requestAnimationFrame(draw);
    };

    scheduleDraw();

    const observer = new ResizeObserver(() => {
      scheduleDraw();
    });

    observer.observe(host);

    return () => {
      observer.disconnect();

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [bowing, inset, roughness, stroke, strokeWidth]);

  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" />;
}
