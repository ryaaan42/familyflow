import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "Planille",
  description:
    "Application familiale pour organiser les taches, piloter le budget et visualiser les economies."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${serif.variable}`}>
      <body
        className="font-[family-name:var(--font-sans)] antialiased selection:bg-[rgba(109,94,244,0.18)]"
      >
        {children}
      </body>
    </html>
  );
}

