'use client'

import { useEffect, useState } from "react";
import AgreeSection from "./step_agree/agreeSection";
import InfoSection from "./step_info/infoSection";
import CompleteSection from "./step_complete/completeSection";

export default function SignUp() {

   const [step, setStep] = useState<string | null>(null);

   useEffect(() => {
      const saved =
         sessionStorage.getItem("signUpStep") || "AGREE";

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
      <section className="containerV1">
         {step === 'AGREE' && <AgreeSection setStep={setStep} />}

         {step === 'INFO' && <InfoSection setStep={setStep} />}

         {step === 'COMPLETE' && <CompleteSection />}
      </section>
   )
}