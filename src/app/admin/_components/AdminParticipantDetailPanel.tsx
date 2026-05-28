import { ModalPortal } from '@/app/_components/ModalPortal';
import type { DayKey, Participant, TimeSlot, Lecture } from '@/types';
import { getLectureEligibilityMessage, getLectureTimeSlotRestrictionMessage, TIME_SLOTS } from '@/utils/lectures';
import { DAY_ORDER, SESSION_DAY_LABELS, TICKET_DAY_LABELS } from '@/utils/tickets';

type FormState = {
  name: string;
  phone: string;
  position: string;
  ticketInfo: string;
  email: string;
  organization: string;
  day1: boolean;
  day2: boolean;
  day3: boolean;
};

type SessionDraft = Record<DayKey, Record<TimeSlot, string>>;
type LectureOptionsByDay = Record<DayKey, Lecture[]>;
const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  '1타임': '첫번째 선택세션',
  '2타임': '두번째 선택세션',
};

function isDayActive(form: FormState, day: DayKey) {
  if (day === 'Day1') {
    return form.day1;
  }

  if (day === 'Day2') {
    return form.day2;
  }

  return form.day3;
}

function getLectureOptionLabel(lecture: Lecture) {
  if (lecture.sessionNo && lecture.sessionNo > 0) {
    return `선택세션 ${lecture.sessionNo}. ${lecture.title}`;
  }

  return lecture.title;
}

function getRestrictedLectureOptionLabel(lecture: Lecture, message: string | null) {
  if (!message) {
    return getLectureOptionLabel(lecture);
  }

  return `${getLectureOptionLabel(lecture)} (${message})`;
}

export function AdminParticipantDetailPanel({
  participant,
  form,
  sessionDraft,
  lectureOptionsByDay,
  saving,
  open,
  onClose,
  onDayToggle,
  onSessionChange,
  onSave,
}: {
  participant: Participant | null;
  form: FormState;
  sessionDraft: SessionDraft;
  lectureOptionsByDay: LectureOptionsByDay;
  saving: boolean;
  open: boolean;
  onClose: () => void;
  onDayToggle: (day: DayKey, checked: boolean) => void;
  onSessionChange: (day: DayKey, timeSlot: TimeSlot, lectureId: string) => void;
  onSave: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(33,36,39,0.42)] px-4 py-8">
        <div className="absolute inset-0" onClick={onClose} />
        <section className="relative z-[101] max-h-[90vh] w-full max-w-[820px] overflow-y-auto rounded-[16px] border border-[#ddd7cc] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#ebe7df] px-6 py-5">
            <h2 className="text-[1.15rem] font-semibold text-[#232425]">참가자 상세정보</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#6f6258] transition hover:bg-[#f3f3f1]"
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-5">
            {!participant ? (
              <div className="rounded-xl border border-dashed border-[#ddd7cc] bg-[#fafafa] px-4 py-8 text-[15px] text-[#6f6258]">
                참가자를 선택하세요.
              </div>
            ) : (
              <div className="space-y-5">
                <section className="rounded-[12px] border border-[#ebe7df] bg-[#fcfbf8] p-5">
                  <h3 className="text-[1.02rem] font-semibold text-[#232425]">기본 정보</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-[15px]">
                      <span className="mb-2 block font-medium">이름</span>
                      <input
                        name="name"
                        value={form.name}
                        readOnly
                        className="w-full rounded-[8px] border border-[#d8d4ca] bg-[#f5f5f3] px-4 py-3 text-[#6f6258] outline-none"
                      />
                    </label>
                    <label className="text-[15px]">
                      <span className="mb-2 block font-medium">소속</span>
                      <input
                        name="organization"
                        value={form.organization}
                        readOnly
                        className="w-full rounded-[8px] border border-[#d8d4ca] bg-[#f5f5f3] px-4 py-3 text-[#6f6258] outline-none"
                      />
                    </label>
                    <label className="text-[15px]">
                      <span className="mb-2 block font-medium">직분</span>
                      <input
                        name="position"
                        value={form.position}
                        readOnly
                        className="w-full rounded-[8px] border border-[#d8d4ca] bg-[#f5f5f3] px-4 py-3 text-[#6f6258] outline-none"
                      />
                    </label>
                    <label className="text-[15px]">
                      <span className="mb-2 block font-medium">연락처</span>
                      <input
                        name="phone"
                        value={form.phone}
                        readOnly
                        className="w-full rounded-[8px] border border-[#d8d4ca] bg-[#f5f5f3] px-4 py-3 text-[#6f6258] outline-none"
                      />
                    </label>
                    <label className="text-[15px] sm:col-span-2">
                      <span className="mb-2 block font-medium">이메일</span>
                      <input
                        name="email"
                        value={form.email}
                        readOnly
                        className="w-full rounded-[8px] border border-[#d8d4ca] bg-[#f5f5f3] px-4 py-3 text-[#6f6258] outline-none"
                      />
                    </label>
                  </div>
                  <p className="mt-4 text-[13px] text-[#6f6258]">* 기본 정보 수정은 스프레드 시트에서만 가능합니다.</p>
                </section>

                <section className="rounded-[12px] border border-[#ebe7df] bg-[#fcfbf8] p-5">
                  <h3 className="text-[1.02rem] font-semibold text-[#232425]">구매한 티켓 정보</h3>
                  <p className="mt-1 text-[13px] text-[#6f6258]">토글 버튼 on/off를 통해 구매한 티켓을 변경할 수 있습니다.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {DAY_ORDER.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => onDayToggle(day, !isDayActive(form, day))}
                        className={[
                          'rounded-full px-4 py-2 text-[15px] font-medium transition',
                          isDayActive(form, day)
                            ? 'bg-[#9a7b00] text-white'
                            : 'border border-[#d8d4ca] bg-white text-[#6f6258]',
                        ].join(' ')}
                      >
                        {TICKET_DAY_LABELS[day]}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-[12px] border border-[#ebe7df] bg-[#fcfbf8] p-5">
                  <h3 className="text-[1.08rem] font-semibold text-[#232425]">선택세션 관리</h3>
                  <div className="mt-4 space-y-3">
                    {DAY_ORDER.map((day) => (
                      <div
                        key={day}
                        className={[
                          'relative overflow-hidden rounded-[10px] px-4 py-4 transition',
                          isDayActive(form, day)
                            ? 'bg-[#f7f7f5]'
                            : 'border border-dashed border-[#d8d4ca] bg-[#f1f1ef] opacity-70',
                        ].join(' ')}
                      >
                        <div
                          className={[
                            'grid items-start gap-4 transition',
                            isDayActive(form, day) ? '' : 'opacity-40',
                          ].join(' ')}
                        >
                          <p className="font-medium text-[#232425]">{SESSION_DAY_LABELS[day]}</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {TIME_SLOTS.map((timeSlot) => {
                              const options = lectureOptionsByDay[day];

                              return (
                                <label key={timeSlot} className="text-[15px]">
                                  <span className="mb-2 block font-medium text-[#4f4b45]">{TIME_SLOT_LABELS[timeSlot]}</span>
                                  <select
                                    value={sessionDraft[day][timeSlot]}
                                    onChange={(event) => onSessionChange(day, timeSlot, event.target.value)}
                                    disabled={!isDayActive(form, day)}
                                    className="w-full rounded-[8px] border border-[#d8d4ca] bg-white px-4 py-3 text-[15px] outline-none disabled:bg-[#f5f5f3] disabled:text-[#9b9b97]"
                                  >
                                    <option value="">선택 안함</option>
                                    {options.map((lecture) => {
                                      const timeSlotRestrictionMessage = getLectureTimeSlotRestrictionMessage(lecture, timeSlot);
                                      const eligibilityMessage = getLectureEligibilityMessage(lecture, form.position);
                                      const restrictionMessage = timeSlotRestrictionMessage ?? eligibilityMessage;

                                      return (
                                        <option
                                          key={lecture.id}
                                          value={lecture.id}
                                          disabled={Boolean(restrictionMessage)}
                                        >
                                          {getRestrictedLectureOptionLabel(lecture, restrictionMessage)}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        {!isDayActive(form, day) ? (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <p className="rounded-full bg-white/88 px-4 py-2 text-[15px] font-semibold text-[#6f6258] shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
                              {TICKET_DAY_LABELS[day]} 티켓 미구매
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex items-center justify-end gap-3 border-t border-[#ebe7df] pt-5">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-[15px] text-[#6f6258]">
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="rounded-[8px] bg-[#9a7b00] px-5 py-3 text-[15px] font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? '저장 중...' : '변경사항 저장'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </ModalPortal>
  );
}
