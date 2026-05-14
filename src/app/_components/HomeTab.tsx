'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { Participant } from '@/types';

const EVENT_INFO_URL = 'https://event-us.kr/2025mmc/event/120383?utm_source=kakao&utm_medium=dm&utm_campaign=oozioetii0';
const CAROUSEL_IMAGES = [
  '/home-carousel/main_poster_1.jpg',
  '/home-carousel/main_poster_2.jpg',
  '/home-carousel/main_poster_3.jpg',
  '/home-carousel/main_poster_4.jpg',
] as const;

export function HomeTab({ currentParticipant }: { currentParticipant: Participant }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  function scrollToSlide(index: number) {
    slideRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
    setActiveIndex(index);
  }

  return (
    <div className="space-y-6 px-1 pb-4 pt-3">
      <section className="px-3 text-center">
        <p className="font-display text-[1.08rem] font-semibold tracking-[0.005em] text-[color:var(--ink)]/62">
          {currentParticipant.name} {currentParticipant.position}님,
        </p>
        <h2 className="mt-3 text-[2rem] font-black leading-[1.2] tracking-[-0.065em] text-[color:var(--ink)] sm:text-[2.25rem]">
          만나IC 2026 컨퍼런스에
          <br />
          오신것을 환영합니다.
        </h2>
      </section>

      <section className="space-y-4">
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const container = event.currentTarget;
            const nextIndex = Math.round(container.scrollLeft / container.clientWidth);
            if (nextIndex !== activeIndex) {
              setActiveIndex(Math.max(0, Math.min(CAROUSEL_IMAGES.length - 1, nextIndex)));
            }
          }}
        >
          <div className="w-[1px] shrink-0" />
          {CAROUSEL_IMAGES.map((src, index) => (
            <div
              key={src}
              ref={(node) => {
                slideRefs.current[index] = node;
              }}
              className="w-[calc(100%-1rem)] shrink-0 snap-center"
            >
              <article className="overflow-hidden rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--paper)] shadow-[4px_4px_0_rgba(36,27,22,0.14)]">
                <div className="relative aspect-[4/5.65] w-full bg-white">
                  <Image
                    src={src}
                    alt={`MANNA IC 2026 홈 캐러셀 이미지 ${index + 1}`}
                    fill
                    sizes="(max-width: 460px) 92vw, 420px"
                    className="object-cover object-top"
                    priority={index === 0}
                  />
                </div>
              </article>
            </div>
          ))}
          <div className="w-[1px] shrink-0" />
        </div>

        <div className="flex items-center justify-center gap-2">
          {CAROUSEL_IMAGES.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => scrollToSlide(index)}
              aria-label={`슬라이드 ${index + 1} 보기`}
              className={[
                'h-2.5 rounded-full transition',
                activeIndex === index ? 'w-7 bg-[color:var(--ink)]' : 'w-2.5 bg-white',
              ].join(' ')}
            />
          ))}
        </div>

        <a
          href={EVENT_INFO_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-[2px] border-[2px] border-[color:var(--ink)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--ink)] shadow-[3px_3px_0_rgba(36,27,22,0.12)] transition hover:translate-y-[1px] hover:shadow-[2px_2px_0_rgba(36,27,22,0.12)]"
        >
          <span>행사소개 바로가기</span>
          <span aria-hidden="true">→</span>
        </a>
      </section>
    </div>
  );
}
