import type { Metadata } from "next";
import { Nunito, Sacramento } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nunito",
});

const sacramento = Sacramento({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-sacramento",
});

export const metadata: Metadata = {
  title: "DIY Recipe Finder",
  description: "Find delicious recipes with ingredients you have at home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${sacramento.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
