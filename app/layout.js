import './globals.css';

export const metadata = {
  title: 'Flashcards Bíblicos',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg' },
};
export const viewport = { themeColor: '#14213d', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
