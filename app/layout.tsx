export const metadata = {
  title: 'ZeroDrop Example App',
  description: 'Demo app for ZeroDrop Playwright E2E testing example',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '80px auto', padding: '0 24px' }}>
        {children}
      </body>
    </html>
  );
}
