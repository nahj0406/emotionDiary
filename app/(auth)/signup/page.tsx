'use client'

import { useState } from "react";
import AgreeSection from "./step_agree/agreeSection";
import InfoSection from "./step_info/infoSection";
import CompleteSection from "./step_complete/completeSection";

export default function SignUp() {

   const [steps, setSteps] = useState('AGREE');
   const ITEMS = ['']

   return (
      <section className="containerV1">
         {steps === 'AGREE' && <AgreeSection setSteps={setSteps} />}

         {steps === 'INFO' && <InfoSection setSteps={setSteps} />}

         {steps === 'COMPLETE' && <CompleteSection />}
      </section>
   )
}