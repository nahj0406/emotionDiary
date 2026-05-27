'use client'

import SubmitBtn from "@/components/ui/button/submitBtn/submit_btn"
import pages from "../../page.module.css";
import { useRouter } from "next/navigation";

export default function Complete() {

   const router = useRouter();

   return (
      <div>
         <p>회원가입이 완료되었습니다.</p>

         <div className={pages.button_box}>
            <SubmitBtn content="메인 페이지로 이동" onClick={()=> router.push('/')} />
         </div>
      </div>
   )
}