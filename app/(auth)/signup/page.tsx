'use client'

import { useEffect, useState } from "react";
import Agree from "./steps/Agree/agree";
import InfoEnter from "./steps/InfoEnter/infoEnter";
import Complete from "./steps/Complete/complete";

export default function SignUp() {

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
      <section className="containerV1">
         {step === 'AGREE' && <Agree setStep={setStep} />}

         {step === 'INFO' && <InfoEnter setStep={setStep} />}

         {step === 'COMPLETE' && <Complete />}
      </section>
   )
}