import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '🐰 재구의 특별한 선물 💝',
  description: '재구가 여러분을 위해 준비한 특별한 선물이 도착했어요! ✨',
  openGraph: {
    title: '🐰 재구의 특별한 선물 💝',
    description: '재구가 여러분을 위해 준비한 특별한 선물이 도착했어요! ✨',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '재구의 특별한 선물'
      }
    ]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}