import '@/app/globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GradeTrack Dashboard',
  description: 'Course and Grade Manager',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}