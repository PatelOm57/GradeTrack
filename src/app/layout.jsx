import './globals.css';

export const metadata = {
  title: 'GradeTrack Dashboard',
  description: 'Course and Grade Manager',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 min-h-screen">
        {children}
      </body>
    </html>
  );
}