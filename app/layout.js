import './globals.css';
import ToastProvider from '../app/components/ToastProvider';

export const metadata = {
  title: 'OAU Post-UTME CBT Practice Portal',
  description: 'Practice past questions, take weekly mock challenges, and climb the leaderboard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}