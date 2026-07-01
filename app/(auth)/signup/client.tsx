'use client'

import { useEffect, useState } from "react";
import Agree from "./steps/Agree/agree";
import InfoEnter from "./steps/InfoEnter/infoEnter";
import Complete from "./steps/Complete/complete";
import { AuthModalPage, TagDTO } from "@/types/interfaces";
import MainLogoIcon from "@/components/ui/svg/mainLogo/mainLogo";
import styles from './page.module.css'

type TagListProps = {
  initialTags: TagDTO[];
  setPage?: React.Dispatch<React.SetStateAction<AuthModalPage>>; 
};

export default function SignUp({ initialTags, setPage }: TagListProps) {

   const [step, setStep] = useState<string | null>(null);

   useEffect(() => {
      const saved =
         sessionStorage.getItem("signUpStep") || "AGREE";
         
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(saved);

      return ()=> {
         sessionStorage.removeItem('signUpStep');
      }
   }, []);

   useEffect(() => {
      if (step) {
         sessionStorage.setItem("signUpStep", step);
      }
   }, [step]);

   if (!step) return null;


   return (
      <section className={styles.signIn}>
         <div className={styles.title_box}>
            <MainLogoIcon width={step !== 'COMPLETE' ? "72px" : "143px"} textHidden={step !== 'COMPLETE' && true} />
            <h4>
               {step === 'AGREE' && '나누북에 오신걸 환영해요.'}
               {step === 'INFO' && '개인정보 입력'}
               {step === 'COMPLETE' && '회원가입 완료'}
            </h4>
            <p>
               {step === 'AGREE' && '여러분의 멋진 독서 경험을 함께 나눠주세요.'}
               {step === 'INFO' && '이메일을 인증 받고 회원님의 정보를 입력해 주세요.'}
               {step === 'COMPLETE' && '가입이 완료되었습니다. \n 여러분의 멋진 독서 경험을 함께 나눠주세요.'}
            </p>
         </div>
         
         {step === 'AGREE' && <Agree setStep={setStep} modalSetPage={setPage} />}

         {step === 'INFO' && <InfoEnter setStep={setStep} tags={initialTags} />}

         {step === 'COMPLETE' && <Complete />}
      </section>
   )
}