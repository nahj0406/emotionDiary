import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { poppins, pretendard, paperlogy } from "./assets/fonts";
import "./css/globals.css";
import "./css/styles.css";
import styles from './css/page.module.css'
import ModalProvider from "./layout_client";
import SideBar from "../components/layout/sideBar/sideBar";
import Header from "@/components/layout/header/header";
import { getUserById } from "@/lib/mongoDB/getUserById";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import getCollectionItems from "@/lib/mongoDB/getCollectionItems";
import Footer from "@/components/layout/footer/footer";

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

// async function measure<T>(
//   label: string,
//   callback: () => Promise<T>
// ): Promise<T> {
//   const start = performance.now();

//   try {
//     return await callback();
//   } finally {
//     const duration = performance.now() - start;
//     console.log(`[성능] ${label}: ${duration.toFixed(1)}ms`);
//   }
// }

// const session = getServerSession(authOptions);

// const userId = session?.user.id;

// const userInfo = userId
//   ? getUserById(userId)
//   : null;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

   const getTag = await getCollectionItems('tags');
   const getSession = await getServerSession(authOptions);

   const [tags, session] = await Promise.all([getTag, getSession]);

   const userInfo = 
      session?.user.id 
      ? await getUserById(session.user.id)
      : null;

  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${pretendard.className} ${poppins.variable} ${paperlogy.variable} antialiased`}>
        <ModalProvider>
          <div className={styles.wrapper}>
            <SideBar />
            <div className={styles.main_container}>
               <Header user={userInfo} initialTags={tags} />
               {children}
            </div>
            <Footer />
          </div>
        </ModalProvider>
      </body>
    </html>
  );
}
