import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";

import { Inter } from "next/font/google";
import { Providers } from "@/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pinewraps Admin",
  description: "Admin dashboard for Pinewraps e-commerce platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
