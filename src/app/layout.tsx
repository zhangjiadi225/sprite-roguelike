import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '精灵肉鸽',
  description: '像素风格的肉鸽宝可梦游戏',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
