import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { poppins, pretendard, paperlogy } from "./fonts";
import "./globals.css";
import "./styles.css";
import styles from './page.module.css'
import Header from "./shares/header/header";
import ModalProvider from "./layout_client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "추억은 만남보다 밈에 남아",
  description: "추억속의 밈들을 공유해 보세요. 추억은 만남보다 밈에 남아",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${pretendard.className} ${poppins.variable} ${paperlogy.variable} antialiased`}>
        <ModalProvider>
          <Header />
          
          <div className={styles.wrapper}>
            {children}
          </div>
        </ModalProvider>
      </body>
    </html>
  );
}
