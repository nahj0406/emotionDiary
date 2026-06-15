'use client'

import { useEffect, useState } from "react";
import {
  resetPw_mailCode,
  getVerifiedCode,
} from "@/utils/requester/requester";

export function useEmailVerfication() {
   const [verified_mail, setVerified_mail] = useState<boolean>(false);
   const [mailRetry, setMailRetry] = useState<boolean>(false);
   const [verificationDB_Id, setVerificationDB_Id] = useState<string>("");
   const [verifiedCode, setVerifiedCode] = useState<string>("");

   const [verifiedDate, setVerifiedDate] = useState<Date | null>(null);
   const [remain_Count, setRemain_Count] = useState<string>("");

   const [mailPassOK, setMailPassOk] = useState<boolean>(false);


   // 메일인증 verificationDb id 조회해서 만료시간 요청
   useEffect(() => {
      if (verificationDB_Id) {
         fetch("/api/auth/user/mail_verification?id=" + verificationDB_Id)
         .then((r) => r.json())
         .then((result) => {
            // result를 인증카운트시간에 넣고서 카운트 돌리면 끝!
            setVerifiedDate(result.expiresAt);
         });
      }
   }, [verificationDB_Id]);


   // 만료시간 카운트다운
   useEffect(() => {
      if (verifiedDate === null) return;

      const expire = new Date(verifiedDate).getTime();

      const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((expire - now) / 1000);

      if (diff <= 0) {
         setRemain_Count("종료");
         clearTimeout(timer);

         return;
      }

      const minutes = Math.floor(diff / 60);

      const seconds = diff % 60;

      if (minutes <= 0) {
         setRemain_Count(`${seconds}초`);
      } else {
         setRemain_Count(`${minutes}분 ${seconds}초`);
      }
      }, 1000);

      return () => clearInterval(timer);
   }, [verifiedDate]);

   useEffect(() => {
      // 메일 재인증 시도 시간차 걸기
      if (mailRetry) {
      const timer = setTimeout(() => {
         setMailRetry(false);
      }, 10000);

      return () => clearTimeout(timer);
      }
   }, [mailRetry]);

   // 이메일에 코드 발송
   const sendCode = async (email: string) => {
      if(!email) {
         throw new Error('입력된 이메일 값이 없습니다.')
      }

      const mail_id = await resetPw_mailCode(email);

      setVerified_mail(true);
      setMailRetry(true);
      setVerificationDB_Id(mail_id);
   }

   // 이메일 확인 요청
   const verfiyCode = async (email: string) => {
      const code = verifiedCode;
      const result = await getVerifiedCode({ email, code});
      setMailPassOk(result);

      return result;
   }

   return {
      verified_mail,
      mailRetry,
      verificationDB_Id,
      verifiedCode,
      mailPassOK,
      remain_Count,
      verifiedDate,
      sendCode,
      setVerifiedCode,
      verfiyCode,
   }
}