import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';
import { getAdminSessionTokenFromCookieHeader, isAuthorizedAdmin } from '@/lib/admin-session';
import { getAdminParticipant, loadAdminParticipantsData } from '@/lib/repositories/app-data';
import { getApplicationsByDayForParticipant, getMissingDaysForParticipant, getParticipantActiveDays } from '@/utils/applications';
import type { DayKey, TimeSlot } from '@/types';
import { DAY_ORDER } from '@/utils/tickets';

function parseCompletion(value: string | null) {
  if (value === 'complete' || value === 'incomplete') {
    return value;
  }

  return 'incomplete';
}

function parseDayFilter(value: string | null): DayKey | 'all' {
  if (value === 'Day1' || value === 'Day2' || value === 'Day3') {
    return value;
  }

  return 'all';
}

function parseDayFilters(value: string | null): DayKey[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is DayKey => item === 'Day1' || item === 'Day2' || item === 'Day3');
}

function formatPhoneWithLeadingZero(phone: string) {
  const digits = phone.replace(/[^\d]/g, '');

  if (!digits) {
    return '';
  }

  const normalized = digits.replace(/^0+/, '');
  return normalized ? `0${normalized}` : '0';
}

function formatTicketDays(days: DayKey[]) {
  return DAY_ORDER.filter((day) => days.includes(day)).join(' | ');
}

function formatSelectionStatus(
  applications: ReturnType<typeof getApplicationsByDayForParticipant>,
  ticketDays: DayKey[],
) {
  const slots: TimeSlot[] = ['1타임', '2타임'];

  return DAY_ORDER.filter((day) => ticketDays.includes(day)).map((day) => {
    const dayApplications = applications[day];
    const slotFlags = slots.map((slot) => (dayApplications.some((application) => application.timeSlot === slot) ? '1' : '0'));
    return `${day} ${slotFlags.join('/')}`;
  }).join(' | ');
}

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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase() ?? '';
    const ticket = parseDayFilters(searchParams.get('ticket'));
    const completion = parseCompletion(searchParams.get('completion'));
    const missingDay = parseDayFilter(searchParams.get('missingDay'));
    const { participants, applications } = await loadAdminParticipantsData();

    const rows = participants.filter((participant) => {
      const haystack = [
        participant.name,
        participant.phone,
        participant.email ?? '',
        participant.organization ?? '',
      ]
        .join(' ')
        .toLowerCase();
      const missingDays = getMissingDaysForParticipant(applications, participant);
      const isComplete = missingDays.length === 0;

      if (query && !haystack.includes(query)) {
        return false;
      }

      if (ticket.length > 0 && !ticket.some((day) => (participant.ticketInfo ?? participant.ticketText).includes(day))) {
        return false;
      }

      if (completion === 'complete' && !isComplete) {
        return false;
      }

      if (completion === 'incomplete' && isComplete) {
        return false;
      }

      if (missingDay !== 'all' && !missingDays.includes(missingDay)) {
        return false;
      }

      return true;
    });

    if (rows.length === 0) {
      return NextResponse.json(
        {
          message: '다운로드할 미신청 대상이 없습니다.',
        },
        { status: 400 },
      );
    }

    const downloadedAt = new Date();
    const downloadedAtLabel = formatDownloadTimestamp(downloadedAt);
    const filenameTimestamp = formatDownloadFilename(downloadedAt);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('미신청자 명단');

    worksheet.columns = [
      { key: 'name', width: 16 },
      { key: 'organization', width: 24 },
      { key: 'position', width: 18 },
      { key: 'phone', width: 18 },
      { key: 'ticket', width: 18 },
      { key: 'status', width: 34 },
    ];

    worksheet.addRow(['다운로드 시각', downloadedAtLabel]);
    worksheet.mergeCells('B1:F1');
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF4E7' },
    };

    worksheet.addRow([]);
    const headerRow = worksheet.addRow(['이름', '소속', '직분', '연락처', '티켓정보', '선택세션 상태']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9A7B00' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    for (const participant of rows) {
      const byDay = getApplicationsByDayForParticipant(applications, participant.id);
      const ticketDays = getParticipantActiveDays(participant);
      const row = worksheet.addRow([
        participant.name,
        participant.organization ?? '',
        participant.position,
        formatPhoneWithLeadingZero(participant.phone),
        formatTicketDays(ticketDays),
        formatSelectionStatus(byDay, ticketDays),
      ]);

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE1D8C8' } },
          left: { style: 'thin', color: { argb: 'FFE1D8C8' } },
          bottom: { style: 'thin', color: { argb: 'FFE1D8C8' } },
          right: { style: 'thin', color: { argb: 'FFE1D8C8' } },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 2 || colNumber === 6 ? 'left' : 'center',
        };
      });

      const phoneCell = row.getCell(4);
      phoneCell.numFmt = '@';
      phoneCell.value = formatPhoneWithLeadingZero(participant.phone);
    }

    worksheet.views = [{ state: 'frozen', ySplit: 3 }];
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="missing-session-${filenameTimestamp}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json(
      {
        message: '엑셀 생성 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
