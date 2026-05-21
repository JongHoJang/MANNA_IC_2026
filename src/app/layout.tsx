import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: '만나IC 2026 컨퍼런스',
  description: '목회자와 평신도 리더십이 1년에 한 번 모이는 사역의 인터체인지',
  icons: {
    icon: '/pic/fabicon.png',
    shortcut: '/pic/fabicon.png',
    apple: '/pic/fabicon.png',
  },
  openGraph: {
    title: '만나IC 2026 컨퍼런스',
    description: '목회자와 평신도 리더십이 1년에 한 번 모이는 사역의 인터체인지',
    images: [
      {
        url: '/pic/OG_Img.png',
        alt: '만나IC 2026 컨퍼런스',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '만나IC 2026 컨퍼런스',
    description: '목회자와 평신도 리더십이 1년에 한 번 모이는 사역의 인터체인지',
    images: ['/pic/OG_Img.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
