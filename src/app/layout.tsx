import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NiranjanOS v1.0 - Terminal Portfolio",
  description: "NiranjanOS: An interactive Linux terminal portfolio for Niranjan Sharma, B.Tech CSE Student and Full Stack Developer.",
  keywords: ["Niranjan Sharma", "Terminal Portfolio", "Software Engineer Portfolio", "B.Tech CSE Student", "Jaipur Developer"],
  authors: [{ name: "Niranjan Sharma" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${firaCode.variable} font-mono antialiased`}>
        {children}
      </body>
    </html>
  );
}
