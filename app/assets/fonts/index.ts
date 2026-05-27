import localFont from "next/font/local";
import { Poppins } from "next/font/google";


export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
});

export const pretendard = localFont({
  src: [
    { path: "./Pretendard-Black.woff2", weight: "900", style: "normal" },
    { path: "./Pretendard-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./Pretendard-Bold.woff2", weight: "700", style: "normal" },
    { path: "./Pretendard-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./Pretendard-Medium.woff2", weight: "500", style: "normal" },
    { path: "./Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "./Pretendard-Light.woff2", weight: "300", style: "normal" },
    { path: "./Pretendard-Thin.woff2", weight: "200", style: "normal" },
  ],
  display: "swap",
  variable: "--font-pretendard", // 선택
});


export const paperlogy = localFont({
  src: [
    { path: "./Paperlogy-9Black.woff2", weight: "900", style: "normal" },
    { path: "./Paperlogy-8ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./Paperlogy-7Bold.woff2", weight: "700", style: "normal" },
    { path: "./Paperlogy-6SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./Paperlogy-5Medium.woff2", weight: "500", style: "normal" },
    { path: "./Paperlogy-4Regular.woff2", weight: "400", style: "normal" },
    { path: "./Paperlogy-3Light.woff2", weight: "300", style: "normal" },
    { path: "./Paperlogy-2ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "./Paperlogy-1Thin.woff2", weight: "100", style: "normal" },
  ],
  display: "swap",
  variable: "--font-paperlogy", // 선택
});