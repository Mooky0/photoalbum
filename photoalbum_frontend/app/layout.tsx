import Navbar from "./components/navbar"; // Ügyelj az elérési útra

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}