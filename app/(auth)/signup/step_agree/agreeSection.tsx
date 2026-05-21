"use client";

import { useState } from "react";
import styles from "./agreeSection.module.css";
import pages from "../page.module.css";
import { CheckInput } from "@/components/input/checkbox/checkInput";
import SubmitBtn from "@/components/button/submitBtn/submit_btn";
import { useRouter } from "next/navigation";
import NiceModal from "@ebay/nice-modal-react";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function AgreeSection({
  setStep,
}: {
  setStep: React.Dispatch<React.SetStateAction<string | null>>;
}) {
   const [checks, setChecks] = useState<string[]>([]);
   const ITEMS = ["agree", "privacy"];
   const router = useRouter();

   const handleSingle = (name: string) => {
      setChecks((prev) =>
         prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name],
      );
   };

   const handleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
         setChecks(ITEMS);
      } else {
         setChecks([]);
      }
   };

  const isAllChecked = ITEMS.length === checks.length;

   const stepHandler = () => {
      if (checks.includes("agree") && checks.includes("privacy")) {
         setStep("INFO");
      } else {
         NiceModal.show(ConfirmModal, {
         message: "필수 약관에 모두 동의해 주세요.",
         autoClose: 1000,
         });
      }
   };

   return (
      <div className={styles.container}>
         <h5 className={styles.title}>이용약관</h5>
         <div className={styles.checkBox_group}>
         {/* 전체 */}
         <div className={styles.all_check}>
            <label className={styles.check_box}>
               <CheckInput
               custom={false}
               checked={isAllChecked}
               onChange={handleAll}
               />
               <p>모든 약관에 동의합니다.</p>
            </label>
         </div>

         {/* 이용약관 */}
         <article className={styles.document_box}>
            <label className={styles.check_box}>
               <CheckInput
               custom={false}
               checked={checks.includes("agree")}
               onChange={() => handleSingle("agree")}
               />
               <p>이용약관에 동의합니다.</p>
            </label>

            <div className={styles.content}>
               욕설 및 폭력적인 언어 사용을 자제하며, 
               음란물 유포는 즉각 게시물 관리자 권한으로 
               강제 삭제 조치 및, 회원 탈퇴 대상입니다.
            </div>
         </article>

         {/* 개인정보 */}
         <article className={styles.document_box}>
            <label className={styles.check_box}>
               <CheckInput
               custom={false}
               checked={checks.includes("privacy")}
               onChange={() => handleSingle("privacy")}
               />
               <p>개인정보처리방침에 동의합니다.</p>
            </label>

            <div className={styles.content}>
               이름, 이메일 정보 제공에 대하여 동의합니다.
            </div>
         </article>
         </div>

         <div className={pages.button_box}>
         <SubmitBtn
            content="이전"
            submit={false}
            onClick={() => router.back()}
         />
         <SubmitBtn content="다음" onClick={() => stepHandler()} />
         </div>
      </div>
   );
}
