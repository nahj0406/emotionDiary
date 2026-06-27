"use client";

import NiceModal from "@ebay/nice-modal-react";
import styles from "./login.module.css";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/components/modals/confirmModal/ConfirmModal";
import MainLogoIcon from "@/components/ui/svg/mainLogo/mainLogo";
import SubmitBtn from "@/components/ui/button/submitBtn/submit_btn";

export default function Login({modalClose}: {modalClose?: ()=> void}) {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const router = useRouter();
   const searchParams = useSearchParams();

   const handleLogin = async () => {

      const res = await signIn("credentials", {
         email,
         password,
         redirect: false,
      });

      const callbackUrl = searchParams?.get('callbackUrl') || '/';
      if(modalClose) {
         modalClose();
      }
      router.push(callbackUrl);
      

      if (res?.error) {
         return NiceModal.show(ConfirmModal, {
            message: res?.error,
         });
      }
   };

   return (
      <article className={styles.login}>
         <figure className={styles.logo}>
            <MainLogoIcon width="143" />
         </figure>
         <article className={styles.input_box}>
            <div className={styles.input_standard}>
               <span>이메일</span>
               <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요."
               />
            </div>
            <div className={styles.input_standard}>
               <span>비밀번호</span>
               <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") {
                        handleLogin();
                     }
                  }}
                  placeholder="비밀번호를 입력하세요."
               />
            </div>
         </article>

         <p className={styles.find_pw}>
            비밀번호를 잊으셨나요?
         </p>

         <div className={styles.progress_box}>
            <SubmitBtn onClick={handleLogin} content="로그인" />

            <div className={styles.signup}>
               <p>NANUBOOK이 처음이신가요?</p>

               <Link href={"/signup"} className={styles.signUp} type="button">
                  회원가입
               </Link>
            </div>
         </div>
      </article>
   );
}
