'use client'

import SubmitBtn from "@/components/button/submitBtn/submit_btn";
import { useRouter } from "next/navigation"

export const BackBtn = () => {
   const router = useRouter();

   return (
      <SubmitBtn onClick={()=> router.back()} content={'뒤로 가기'} />
   )
}

BackBtn.displayName = 'BackBtn'