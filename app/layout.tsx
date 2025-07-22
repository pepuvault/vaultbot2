export const metadata = {
  title: 'VaultAI Bot',
  description: 'Frage den KI-Bot zu $Vault, Tokenpreis und Onchain-Daten.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
