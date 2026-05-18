'use client';

import { useState } from 'react';
import { ModalPortal } from './ModalPortal';

type NoticeItem = {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  actionType?: 'modal' | 'link';
};

const notices: NoticeItem[] = [
  {
    title: '1. 야탑역에서 교회 셔틀버스 이용',
    body: '야탑역 4번 출구에서 나온 방향으로 횡단보도를 건너면 도보 1분 거리에 공항버스 승강장 안내배너가 보이는 곳에서 셔틀버스를 타실 수 있습니다.',
    actionLabel: '셔틀 시간표 확인',
    actionType: 'modal',
  },
  {
    title: '2. 야탑역에서 도보 이용',
    body: '야탑역 4번 출구에서 도보 13분 (770m)에 위치해있습니다.',
  },
  {
    title: '3. 자차 이용',
    body: '만나교회 주차공간이 협소하여 주변 대형 주차장을 추천드립니다. (탄천종합운동장 주차장, 성남시청 주차장)',
  },
  {
    title: '4. 외부 제휴 숙소 안내',
    body: '호텔 스카이파크 센트럴 서울 판교에서 할인가로 이용하실 수 있습니다.',
    actionLabel: '호텔 바로가기',
    actionHref: 'https://naver.me/5YFcmbeg',
    actionType: 'link',
  },
];

const INSTAGRAM_URL = 'https://www.instagram.com/manna_ic?igsh=MThpZm1lNzM1MXNuaw==';

const faqs = [
  {
    question: '현장 접수가 가능한가요?',
    answer: '온라인 사전 신청으로 선착순 마감 예정입니다.',
  },
  {
    question: '온라인 참석도 가능한가요? 온라인 중계도 하나요?',
    answer: '오프라인 현장에서만 진행합니다.',
  },
  {
    question: '숙소가 지원되나요?',
    answer: '숙소 지원은 되지 않습니다. 다만 만나IC 컨퍼런스에서 제휴한 호텔 스카이파크 센트럴 서울판교에서 할인가로 제공합니다.',
  },
];

export function GuideTab() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [showShuttleModal, setShowShuttleModal] = useState(false);

  return (
    <div className="space-y-6 pb-4">
      <section className="space-y-4 px-1 pt-1">
        <h2 className="max-w-[15ch] text-[2rem] font-semibold leading-[1.06] tracking-tight text-[color:var(--ink)] sm:text-[2.15rem]">
          안내 및 문의를
          <br />
          확인해보세요.
        </h2>
      </section>

      <section className="rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[#f7f4f0] px-6 pb-7 pt-8 shadow-[3px_3px_0_rgba(36,27,22,0.12)]">
        <div className="space-y-8">
          {notices.map((notice) => {
            return (
              <article key={notice.title}>
                <div>
                  <h4 className="text-[18px] font-bold leading-[1.5] tracking-[-0.02em] text-[color:var(--ink)]">
                    {notice.title}
                  </h4>
                  <p className="mt-2 text-[15px] leading-7 text-[color:var(--ink)]/74">{notice.body}</p>
                  {notice.actionType === 'modal' ? (
                    <button
                      type="button"
                      onClick={() => setShowShuttleModal(true)}
                      className="mt-3 inline-flex h-10 items-center justify-center rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--paper)] px-4 text-[14px] font-semibold tracking-[0.01em] text-[color:var(--ink)] shadow-[2px_2px_0_rgba(36,27,22,0.08)]"
                    >
                      {notice.actionLabel}
                    </button>
                  ) : null}
                  {notice.actionType === 'link' && notice.actionHref ? (
                    <a
                      href={notice.actionHref}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex h-10 items-center justify-center rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--paper)] px-4 text-[14px] font-semibold tracking-[0.01em] text-[color:var(--ink)] shadow-[2px_2px_0_rgba(36,27,22,0.08)]"
                    >
                      {notice.actionLabel}
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <h3 className="text-[27px] font-bold tracking-tight text-[color:var(--ink)]">FAQ / 자주 묻는 질문</h3>
        </div>

        {faqs.map((item, index) => (
          <article
            key={item.question}
            className="rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--paper)] shadow-[3px_3px_0_rgba(36,27,22,0.08)]"
          >
            <button
              type="button"
              onClick={() => {
                setOpenQuestion((current) => (current === item.question ? null : item.question));
              }}
              className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left"
              aria-expanded={openQuestion === item.question}
            >
              <div className="min-w-0">
                <p className="text-[13px] font-bold uppercase tracking-normal text-[#8a6800]">Q{index + 1}</p>
                <h4 className="mt-2 text-[17px] font-bold leading-7 tracking-tight text-[color:var(--ink)]">
                  {item.question}
                </h4>
              </div>
              <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center border-[2px] border-[#8a6800] bg-white text-[#8a6800]">
                <ArrowIcon open={openQuestion === item.question} />
              </span>
            </button>

            {openQuestion === item.question ? (
              <div className="px-5 pb-5 pt-1">
                <div className="ml-0 w-[calc(100%-3.5rem)] border-t-[2px] border-[#8a6800]/35 pt-4">
                  <p className="text-[15px] leading-7 text-[color:var(--ink)]/74">{item.answer}</p>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <section className="rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--ink)] px-5 py-6 text-[color:var(--paper)] shadow-[3px_3px_0_rgba(36,27,22,0.12)]">
        <p className="text-[13px] font-bold uppercase tracking-normal text-[color:var(--accent)]">Contact</p>
        <h3 className="mt-3 text-[27px] font-bold leading-[1.2] tracking-tight">각종 문의는 만나IC 카카오톡 채널로 연락해 주세요</h3>
        <p className="mt-3 text-[15px] leading-7 text-[color:var(--paper)]/78">
          셔틀, 주차, 숙소, 등록, 분실물 관련 문의는 만나IC 카카오톡 채널에서 가장 빠르게 답변받을 수 있습니다.
        </p>
        <button
          type="button"
          className="mt-5 flex h-14 w-full items-center justify-center rounded-[2px] border-[2px] border-[color:var(--paper)] bg-[color:var(--accent)] px-4 text-[16px] font-bold tracking-[0.01em] text-[color:var(--ink)]"
        >
          카카오톡 채널 열기
        </button>
        <div className="mt-4 rounded-[2px] bg-white/10 px-4 py-4 text-[14px] leading-7 text-[color:var(--paper)]/78">
          운영 문의 가능 시간: 오전 9시 - 오후 8시
          <br />
          현장 문의 데스크: 1층 안내데스크 옆 운영 부스
        </div>

        <div className="mt-10 border-t border-[color:var(--paper)]/18 pt-8 text-[color:var(--paper)]">
          <div className="px-1">
            <h4 className="text-[18px] font-bold leading-7 tracking-tight">
              만나IC 새로운 소식은 인스타그램에서 알려드려요
            </h4>
            <p className="mt-2 text-[15px] leading-7 text-[color:var(--paper)]/78">
              자세한 세션 소개, 만나IC를 만들어가는 과정을 인스타그램에서 제일 먼저 만나보실 수 있습니다.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex h-12 w-full items-center justify-center rounded-[2px] border-[2px] border-[color:var(--paper)] bg-transparent px-4 text-[15px] font-semibold tracking-[0.01em] text-[color:var(--paper)]"
            >
              만나IC 인스타그램 열기
            </a>
          </div>
        </div>
      </section>

      {showShuttleModal ? (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-4 pt-10 backdrop-blur-[2px] sm:items-center">
            <div className="w-full max-w-[420px] rounded-[28px] border-[2px] border-[color:var(--ink)] bg-[color:var(--panel)] p-5 shadow-[6px_6px_0_rgba(36,27,22,0.2)]">
              <p className="font-display text-[13px] uppercase tracking-normal text-[color:var(--muted)]">셔틀버스 운영시간</p>
              <h3 className="mt-3 text-[24px] font-bold leading-tight tracking-tight">야탑역 &gt; 만나교회</h3>
              <div className="mt-4 rounded-[2px] bg-[rgba(238,202,126,0.26)] px-4 py-4 text-[15px] leading-8 text-[color:var(--ink)]">
                <p>6.23 화 9:30-10:00</p>
                <p>6.24 수 13:00-13:30</p>
                <p>6.25 목 9:30-10:00</p>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowShuttleModal(false)}
                  className="w-full rounded-[2px] bg-[color:var(--ink)] px-4 py-3 text-[14px] font-semibold tracking-[0.01em] text-[color:var(--paper)]"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}
    </div>
  );
}

function ArrowIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={['h-4 w-4 transition-transform', open ? 'rotate-180' : 'rotate-0'].join(' ')}
      fill="none"
    >
      <path d="M4 7l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}
