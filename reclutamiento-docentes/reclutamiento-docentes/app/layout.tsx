import type { Metadata } from "next";
import "./globals.css";
import { cfg } from "@/lib/config";

export const metadata: Metadata = {
  title: "Reclutamiento docente · Maestrías",
  description: "Convocatoria para docentes de maestrías en línea.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>
        <header className="top">
          <a href="/">{cfg().institucion}</a>
          <small>Reclutamiento docente</small>
        </header>
        {children}
      </body>
    </html>
  );
}
