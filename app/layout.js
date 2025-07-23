// app/layout.js
import './globals.css';
import { Inter, Geist, Geist_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ['latin'] });

export const metadata = {
  title: 'JKJ 리워드 허브',
  description: '재구 친구들을 위한 리워드 페이지',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} ${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
