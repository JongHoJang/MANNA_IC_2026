import type { ReactNode } from 'react';

export type AppTab = 'home' | 'timetable' | 'my-lectures' | 'guide';

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'whitespace-nowrap rounded-2xl px-2 py-2.5 text-xs font-semibold transition sm:px-3 sm:py-3 sm:text-sm',
        active ? 'bg-[color:var(--ink)] text-[color:var(--paper)]' : 'bg-white text-[color:var(--muted)]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto w-full max-w-[460px] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="rounded-[26px] border border-[color:var(--line)] bg-[color:var(--panel)]/96 px-3 py-2 shadow-[0_-10px_30px_rgba(37,24,17,0.08)] backdrop-blur">
          <div className="grid grid-cols-4 gap-2">
            <TabButton active={activeTab === 'home'} onClick={() => onChange('home')}>
              홈
            </TabButton>
            <TabButton active={activeTab === 'timetable'} onClick={() => onChange('timetable')}>
              시간표
            </TabButton>
            <TabButton active={activeTab === 'my-lectures'} onClick={() => onChange('my-lectures')}>
              내 세션
            </TabButton>
            <TabButton active={activeTab === 'guide'} onClick={() => onChange('guide')}>
              안내
            </TabButton>
          </div>
        </div>
      </div>
    </div>
  );
}
