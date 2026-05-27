import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { poppins, pretendard, paperlogy } from "./assets/fonts";
import "./css/globals.css";
import "./css/styles.css";
import styles from './css/page.module.css'
import Header from "../components/layout/header/header";
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
  title: "나누북",
  description: "여러분이 사랑하는 책과 이야기들을 공유하고 나눠보세요",
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
