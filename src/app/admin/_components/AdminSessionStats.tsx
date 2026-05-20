import { ModalPortal } from '@/app/_components/ModalPortal';
import { useState } from 'react';
import type { Lecture } from '@/types';
import { formatLectureSpeakerMeta, sortLecturesBySessionNo } from '@/utils/lectures';
import { DAY_ORDER } from '@/utils/tickets';

type ApplicantSummary = {
  id: string;
  name: string;
  position: string;
  organization: string | null;
};

function getLectureDisplayTitle(lecture: Lecture) {
  if (lecture.sessionNo && lecture.sessionNo > 0) {
    return `${lecture.sessionNo}. ${lecture.title}`;
  }

  return lecture.title;
}

function getDayHeading(day: Lecture['day']) {
  return day.replace('Day', 'DAY ') + '.';
}

function SessionCard({
  lecture,
  count,
  applicants,
  onOpen,
}: {
  lecture: Lecture;
  count: number;
  applicants: { first: ApplicantSummary[]; second: ApplicantSummary[] };
  onOpen: () => void;
}) {
  const selectionCountLabel =
    lecture.capacity && lecture.capacity > 0
      ? (value: number) => `${value}/${lecture.capacity}명`
      : (value: number) => `${value}명`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-[10px] border border-[#ddd7cc] bg-white px-5 py-5 text-left transition hover:border-[#cfc8bb] hover:bg-[#fcfbf8]"
    >
      <div>
        <h3 className="truncate text-[1.08rem] font-semibold leading-8 text-[#232425]">{getLectureDisplayTitle(lecture)}</h3>
        <p className="mt-2 text-[15px] text-[#6f6258]">{formatLectureSpeakerMeta(lecture.speaker, lecture.position)}</p>
        <p className="mt-1 text-[15px] text-[#6f6258]">{lecture.location}</p>
      </div>

      <div className="mt-7">
        <div className="grid grid-cols-3 gap-2 text-[15px]">
          <div className="rounded-[8px] bg-[#f7f7f5] px-3 py-3">
            <p className="text-[12px] text-[#6f6258]">첫번째 선택</p>
            <p className="mt-1 text-[1.15rem] font-semibold text-[#232425]">{selectionCountLabel(applicants.first.length)}</p>
          </div>
          <div className="rounded-[8px] bg-[#f7f7f5] px-3 py-3">
            <p className="text-[12px] text-[#6f6258]">두번째 선택</p>
            <p className="mt-1 text-[1.15rem] font-semibold text-[#232425]">{selectionCountLabel(applicants.second.length)}</p>
          </div>
          <div className="rounded-[8px] bg-[#f7f7f5] px-3 py-3">
            <p className="text-[12px] text-[#6f6258]">합계</p>
            <p className="mt-1 text-[1.15rem] font-semibold text-[#232425]">{count}명</p>
          </div>
        </div>
      </div>
    </button>
  );
}

export function AdminSessionStats({
  lectures,
  countMap,
  applicantMap,
}: {
  lectures: Lecture[];
  countMap: Record<string, number>;
  applicantMap: Record<string, { first: ApplicantSummary[]; second: ApplicantSummary[] }>;
}) {
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const selectedLecture = lectures.find((lecture) => lecture.id === selectedLectureId) ?? null;
  const selectedApplicants = selectedLecture ? applicantMap[selectedLecture.id] ?? { first: [], second: [] } : null;

  return (
    <>
      <section className="space-y-8">
        {DAY_ORDER.map((day) => {
          const dayLectures = sortLecturesBySessionNo(lectures.filter((lecture) => lecture.day === day));

          if (dayLectures.length === 0) {
            return null;
          }

          return (
            <section key={day}>
              <div className="border-b border-[#d8d2c7] pb-3">
                <h2 className="text-[1.75rem] font-semibold tracking-[-0.05em] text-[#232425]">{getDayHeading(day)}</h2>
              </div>
              <div className="mt-5 grid gap-5 xl:grid-cols-3">
                {dayLectures.map((lecture) => (
                  <SessionCard
                    key={lecture.id}
                    lecture={lecture}
                    count={countMap[lecture.id] ?? 0}
                    applicants={applicantMap[lecture.id] ?? { first: [], second: [] }}
                    onOpen={() => setSelectedLectureId(lecture.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </section>

      {selectedLecture && selectedApplicants ? (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(33,36,39,0.42)] px-4 py-8">
            <div className="absolute inset-0" onClick={() => setSelectedLectureId(null)} />
            <section className="relative z-[101] max-h-[90vh] w-full max-w-[860px] overflow-y-auto rounded-[16px] border border-[#ddd7cc] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
              <div className="flex items-start justify-between gap-3 border-b border-[#ebe7df] px-6 py-5">
                <div>
                  <h2 className="text-[1.12rem] font-semibold text-[#232425]">{getLectureDisplayTitle(selectedLecture)}</h2>
                  <p className="mt-1 text-[13px] text-[#6f6258]">
                    {formatLectureSpeakerMeta(selectedLecture.speaker, selectedLecture.position)}
                    {' · '}
                    {selectedLecture.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLectureId(null)}
                  className="rounded-full p-2 text-[#6f6258] transition hover:bg-[#f3f3f1]"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-5 px-6 py-5 lg:grid-cols-2">
                {[
                  { key: 'first', label: '첫번째 선택 신청자', items: selectedApplicants.first },
                  { key: 'second', label: '두번째 선택 신청자', items: selectedApplicants.second },
                ].map((section) => (
                  <div key={section.key} className="rounded-[10px] border border-[#ddd7cc] bg-[#faf9f6] p-4">
                    <div className="flex items-center justify-between gap-3 border-b border-[#ebe7df] pb-3">
                      <h3 className="text-[15px] font-semibold text-[#232425]">{section.label}</h3>
                      <span className="text-[13px] text-[#6f6258]">{section.items.length}명</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {section.items.length === 0 ? (
                        <p className="text-[15px] text-[#6f6258]">신청자가 없습니다.</p>
                      ) : (
                        section.items.map((applicant) => (
                          <div key={`${section.key}-${applicant.id}`} className="rounded-[8px] border border-[#e7e2d8] bg-white px-3 py-3">
                            <p className="text-[15px] font-medium text-[#232425]">
                              {applicant.name}
                              <span className="ml-2 text-[13px] font-medium text-[#6f6258]">
                                · {applicant.position} / {(applicant.organization ?? '소속 미입력')}
                              </span>
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ModalPortal>
      ) : null}
    </>
  );
}
