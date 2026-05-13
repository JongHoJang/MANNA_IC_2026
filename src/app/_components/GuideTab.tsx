 'use client';

import { useState } from 'react';

const notices = [
  {
    title: '셔틀 버스 운행 안내',
    body: '주요 역에서 행사장까지 왕복 셔틀버스를 운행합니다. 시간표를 미리 확인하고 출발 10분 전까지 탑승 위치에 도착해 주세요.',
    icon: ShuttleIcon,
    actionLabel: '셔틀 시간표 확인',
  },
  {
    title: '주차 및 교통 안내',
    body: '행사장 내 주차 공간이 협소하오니 가급적 대중교통을 이용해 주세요. 자차 이용 시 임시 주차 구역과 출차 동선을 현장 안내에 따라 이용합니다.',
    icon: ParkingIcon,
    actionLabel: '주차 안내 확인',
  },
  {
    title: '외부 제휴 숙소 안내',
    body: '숙박권을 이용하는 분들은 제휴 숙소 체크인 시간과 셔틀 연계 노선을 함께 확인해 주세요. 객실 배정 관련 문의는 운영 채널에서 안내합니다.',
    icon: StayIcon,
    actionLabel: '숙소 정보 확인',
  },
];

const faqs = [
  {
    question: '강의 신청은 현장에서 변경할 수 있나요?',
    answer: '잔여 좌석이 있는 경우에만 앱에서 직접 변경할 수 있으며, 마감된 세션은 운영팀 안내에 따라 대기 등록만 가능합니다.',
  },
  {
    question: '식사 장소와 시간은 어디서 확인하나요?',
    answer: '타임테이블의 BREAK TIME 구간과 현장 표지판에서 식사 위치와 운영 시간을 함께 안내합니다.',
  },
  {
    question: '숙소 체크인 전에 짐을 맡길 수 있나요?',
    answer: '등록 데스크 옆 운영 부스에서 간단한 짐 보관 안내를 받을 수 있습니다. 귀중품은 개별 보관이 원칙입니다.',
  },
];

export function GuideTab() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-4">
      <section className="px-2 pt-2 text-center">
        <h2 className="text-[3.2rem] font-black leading-none tracking-[-0.08em] text-[color:var(--ink)]">안내 및 문의</h2>
        <p className="mx-auto mt-5 max-w-[17rem] text-[1.1rem] leading-8 text-[color:var(--ink)]/74">
          행사 참여에 필요한 주요 정보와 궁금한 점을 확인하세요.
        </p>
      </section>

      <section className="relative rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[#f7f4f0] px-6 pb-7 pt-14 shadow-[3px_3px_0_rgba(36,27,22,0.12)]">
        <div className="absolute left-[-4px] top-[-14px] flex h-14 w-14 -rotate-[8deg] items-center justify-center rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--accent)] shadow-[2px_2px_0_rgba(36,27,22,0.1)]">
          <MegaphoneIcon />
        </div>

        <div className="pl-2">
          <h3 className="text-[2.9rem] font-black leading-none tracking-[-0.08em] text-[color:var(--ink)]">공지사항</h3>
        </div>

        <div className="mt-10 space-y-10">
          {notices.map((notice) => {
            const Icon = notice.icon;

            return (
              <article key={notice.title} className="flex gap-4">
                <div className="pt-1 text-[#8a6800]">
                  <Icon />
                </div>
                <div>
                  <h4 className="text-[1.15rem] font-extrabold leading-8 tracking-[-0.04em] text-[color:var(--ink)]">
                    {notice.title}
                  </h4>
                  <p className="mt-3 text-[0.98rem] leading-8 text-[color:var(--ink)]/74">{notice.body}</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--paper)] px-4 text-sm font-bold text-[color:var(--ink)] shadow-[2px_2px_0_rgba(36,27,22,0.08)]"
                  >
                    {notice.actionLabel}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <h3 className="text-[1.7rem] font-black tracking-[-0.05em] text-[color:var(--ink)]">자주 묻는 질문</h3>
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
                <p className="text-[0.95rem] font-black uppercase tracking-[0.12em] text-[#8a6800]">Q{index + 1}</p>
                <h4 className="mt-2 text-[1.02rem] font-extrabold leading-7 tracking-[-0.03em] text-[color:var(--ink)]">
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
                  <p className="text-[0.95rem] leading-7 text-[color:var(--ink)]/74">{item.answer}</p>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <section className="rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--ink)] px-5 py-6 text-[color:var(--paper)] shadow-[3px_3px_0_rgba(36,27,22,0.12)]">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[color:var(--accent)]">Contact</p>
        <h3 className="mt-3 text-[1.65rem] font-black leading-tight tracking-[-0.05em]">문의가 필요하면 운영 채널로 연락해 주세요</h3>
        <p className="mt-3 text-[0.96rem] leading-7 text-[color:var(--paper)]/78">
          셔틀, 주차, 숙소, 등록, 분실물 관련 문의는 운영 카카오톡 채널에서 가장 빠르게 답변받을 수 있습니다.
        </p>
        <button
          type="button"
          className="mt-5 flex h-14 w-full items-center justify-center rounded-[2px] border-[2px] border-[color:var(--paper)] bg-[color:var(--accent)] px-4 text-base font-black text-[color:var(--ink)]"
        >
          카카오톡 채널 열기
        </button>
        <div className="mt-4 rounded-[2px] bg-white/10 px-4 py-4 text-sm leading-7 text-[color:var(--paper)]/78">
          운영 문의 가능 시간: 오전 9시 - 오후 8시
          <br />
          현장 문의 데스크: 1층 안내데스크 옆 운영 부스
        </div>
      </section>
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

function MegaphoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-8 w-8 fill-none stroke-current">
      <path d="M10 24h8l14-8v16l-14-8h-8z" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M18 28l2 8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M34 18v12" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M38 20l2-2" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M38 28l2 2" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function ShuttleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className="h-9 w-9 fill-none stroke-current">
      <rect x="8" y="7" width="24" height="21" rx="5" strokeWidth="3.2" />
      <path d="M8 15h24" strokeWidth="3.2" />
      <path d="M12 22h5M23 22h5" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M13 29v4M27 29v4" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function ParkingIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      className="h-9 w-9"
    >
      <path
        d="M12 32V8h10.5c5.2 0 8.5 3.1 8.5 7.9 0 5.1-3.5 8.2-8.7 8.2h-5.2V32zM17.1 19.8h4.2c2.6 0 4.4-1.3 4.4-3.8 0-2.3-1.6-3.7-4.3-3.7h-4.3z"
        fill="currentColor"
      />
    </svg>
  );
}

function StayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className="h-9 w-9 fill-none stroke-current">
      <path d="M6 28h28" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M9 28v-9h8a5 5 0 0 1 5 5v4" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M22 17h7a5 5 0 0 1 5 5v6" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M13 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeWidth="3.2" />
    </svg>
  );
}
