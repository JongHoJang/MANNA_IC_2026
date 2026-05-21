import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';
import { getAdminSessionTokenFromCookieHeader, isAuthorizedAdmin } from '@/lib/admin-session';
import { getAdminParticipant, loadAdminParticipantsData } from '@/lib/repositories/app-data';
import { sortLecturesBySessionNo } from '@/utils/lectures';
import { DAY_ORDER } from '@/utils/tickets';

function formatDownloadTimestamp(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function formatDownloadFilename(date: Date) {
  const seoulDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = String(seoulDate.getFullYear()).slice(-2);
  const month = String(seoulDate.getMonth() + 1).padStart(2, '0');
  const day = String(seoulDate.getDate()).padStart(2, '0');
  const hour = String(seoulDate.getHours()).padStart(2, '0');
  const minute = String(seoulDate.getMinutes()).padStart(2, '0');

  return `${year}${month}${day}-${hour}${minute}`;
}

function getSessionLabel(sessionNo: number | null | undefined) {
  if (sessionNo && sessionNo > 0) {
    return `${sessionNo}.`;
  }

  return '-';
}

export async function GET(request: Request) {
  try {
    const adminParticipant = await getAdminParticipant();
    const token = getAdminSessionTokenFromCookieHeader(request.headers.get('cookie'));

    if (!isAuthorizedAdmin(adminParticipant, token)) {
      return NextResponse.json(
        {
          message: '관리자 권한이 필요합니다.',
        },
        { status: 401 },
      );
    }

    const { lectures, applications } = await loadAdminParticipantsData();
    const sortedLectures = DAY_ORDER.flatMap((day) =>
      sortLecturesBySessionNo(lectures.filter((lecture) => lecture.day === day)),
    );
    const downloadedAt = new Date();
    const downloadedAtLabel = formatDownloadTimestamp(downloadedAt);
    const filenameTimestamp = formatDownloadFilename(downloadedAt);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('선택세션 통계');

    worksheet.columns = [
      { key: 'session', width: 16 },
      { key: 'title', width: 60 },
      { key: 'first', width: 16 },
      { key: 'second', width: 16 },
    ];

    worksheet.addRow(['다운로드 시각', downloadedAtLabel]);
    worksheet.mergeCells('B1:D1');
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF4E7' },
    };
    worksheet.getCell('A1').border = worksheet.getCell('B1').border = {
      top: { style: 'thin', color: { argb: 'FFD8CDBD' } },
      left: { style: 'thin', color: { argb: 'FFD8CDBD' } },
      bottom: { style: 'thin', color: { argb: 'FFD8CDBD' } },
      right: { style: 'thin', color: { argb: 'FFD8CDBD' } },
    };

    worksheet.addRow([]);
    const headerRow = worksheet.addRow(['세션 넘버', '타이틀', '첫번째 참가자 수', '두번째 참가자 수']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9A7B00' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    for (const lecture of sortedLectures) {
      const firstCount = applications.filter((application) => application.lectureId === lecture.id && application.timeSlot === '1타임').length;
      const secondCount = applications.filter((application) => application.lectureId === lecture.id && application.timeSlot === '2타임').length;
      const row = worksheet.addRow([
        `${lecture.day}-${getSessionLabel(lecture.sessionNo).replace(/\.$/, '')}`,
        lecture.title,
        `${firstCount}명`,
        `${secondCount}명`,
      ]);

      const dayColor =
        lecture.day === 'Day1'
          ? 'FFF8F3E2'
          : lecture.day === 'Day2'
            ? 'FFEAF3F9'
            : 'FFF2F0F9';

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE1D8C8' } },
          left: { style: 'thin', color: { argb: 'FFE1D8C8' } },
          bottom: { style: 'thin', color: { argb: 'FFE1D8C8' } },
          right: { style: 'thin', color: { argb: 'FFE1D8C8' } },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 2 ? 'left' : 'center',
        };
        if (colNumber === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: dayColor },
          };
          cell.font = { bold: true };
        }
      });
    }

    worksheet.views = [{ state: 'frozen', ySplit: 3 }];
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="session-count-${filenameTimestamp}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json(
      {
        message: '선택세션 통계 엑셀 생성 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
