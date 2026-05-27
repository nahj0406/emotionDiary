import { SignupRequest } from "@/types/interfaces";

export async function createMailcode (email: string) {
   const res = await fetch("/api/auth/get_verificationMail", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
   });

   const result = await res.json(); // 디버깅용

   if (!res.ok) {
      console.log("서버 응답:", result);
      throw new Error(result.message || "에러");
   }

   return result.verificationId;
}


export async function getVerifiedCode ({email, code}:{email: string, code: string}) {
   const res = await fetch("/api/auth/verify-mailCheck", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
   });

   const result = await res.json(); // 🔥 추가

   if (!res.ok) {
      console.log("❌ 서버 응답:", result); // 🔥 핵심
      throw new Error(result.message || "에러");
   }

   return result;
}


export async function createSubmit (data: SignupRequest) {
   const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
   });

   const result = await res.json(); // 🔥 추가

   if (!res.ok) {
      console.log("❌ 서버 응답:", result); // 🔥 핵심
      throw new Error(result.message || "에러");
   }
}