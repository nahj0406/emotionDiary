"use client";

import styles from "./infoSection.module.css";
import pages from "../page.module.css";
import { useRef, useState } from "react";
import NiceModal from "@ebay/nice-modal-react";
import ConfirmModal from "@/components/modals/ConfirmModal";
import Image from "next/image";
import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/lib/en';
import { sendVerified, verifiedCheck, signupSubmit } from "../services/requester";
import { normalize } from "@/utils/functions";

export default function InfoSection({
  setSteps,
}: {
  setSteps: React.Dispatch<React.SetStateAction<string>>;
}) {
   const [badNames, setBadNames] = useState<boolean>(false);
   const customWords = {
      ...en,
      words: [
         ...en.words,
         '시발', '씨발', '병신', '개새끼','미친놈', '미친년','존나',
         '좆', '좇', '지랄', '염병','쌍놈','걸레','창녀','보지', '자지',
         '후장','딸딸이','ㅅㅂ','ㅂㅅ','ㅈㄴ','ㅈㄹ','ㅊㄴ','새끼','허벌',
         '섹스','씨발놈','씨발롬','시발롬','시발놈',"시발련",'시발년','애미','애비','후장',
         'ㄴㅇㅁ','ㄴㄱ',
      ],
   };

   const filter = new BadWordsNext({
      data: customWords,
   });

   const badNameFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
      const txt = e.target.value;
      const normalized = normalize(txt);
      if(filter.check(normalized)) {
         setBadNames(true)
      } else {
         setBadNames(false)
      }

      console.log(txt);
   }

   console.log(badNames);
   
   const formRef = useRef<HTMLFormElement>(null);
   const [verified_code, setVerified_code] = useState<boolean>(false);
   const [codeValue, setcodeValue] = useState<string>("");
   const [warnings, setWarnings] = useState({
      name: false,
      nickname: false,
   });
   const [showPw, setShowPw] = useState({
      password: false,
      pw_check: false,
   });
   const [pwTxt, setPwTxt] = useState({
      password: "",
      pw_check: "",
   });

   // 비밀번호 일치 확인
   const isMismatch =
      pwTxt.password &&
      pwTxt.pw_check &&
      pwTxt.password !== pwTxt.pw_check;

   const stringFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      const hasSpecial = /[!@#$%^&*]/.test(value);

      setWarnings((prev) => ({
         ...prev,
         [name]: hasSpecial,
      }));
   };

   const inputCodeChanger = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
         setcodeValue(e.target.value);
      }
   };

   // 인증 이메일 요청 api
   const send_verified = async () => {
      if (!formRef.current) return;

      const formData = new FormData(formRef.current);
      const email = formData.get("email") as string;

      if (!email) {
         NiceModal.show(ConfirmModal, {
         message: "이메일을 제대로 입력해 주세요",
         autoClose: 1000,
         });
         return;
      }

      try {
         await sendVerified(email)

         setVerified_code(true);
      } catch (err) {
         await NiceModal.show(ConfirmModal, {
         message: "이미 가입된 이메일입니다.",
         autoClose: 1000,
         });
         console.log(err);
      }
   };

   // 이메일 인증코드 확인 api
   const verified_codeHandler = async () => {
      const code = codeValue;
      if (!code) return;

      const formData = new FormData(formRef.current!);
      const email = formData.get("email") as string;

      try {
         await verifiedCheck({email, code})
      } catch (err) {
         await NiceModal.show(ConfirmModal, {
            message: "일시적 에러가 발생했습니다.",
            autoClose: 1000,
         });
         console.log(err);
      }
   };

   // 최종 요청
   const handleSubmit = async (e: React.MouseEvent) => {
      e.preventDefault();

      if (!formRef.current) return;

      const formData = new FormData(formRef.current);

      const data = {
         name: formData.get("name") as string,
         nickname: formData.get("nickname") as string,
         email: formData.get("email") as string,
         password: formData.get("password") as string,
      };

      // 이름, 닉네임 특수문자 처리
      if (warnings.name || warnings.nickname) {
         return NiceModal.show(ConfirmModal, {
            message: "이름, 닉네임에 특수문자를 포함할 수 없습니다.",
         });
      }

      if (badNames) { // 이름 비속어 처리
         return NiceModal.show(ConfirmModal, {
            message: "사용할 수 없는 이름입니다.",
            autoClose: 1000,
         });
      }

      // 공백 필터링
      const hasEmpty = Object.values(data).some((v) => !v.trim());
      if (hasEmpty) {
         return NiceModal.show(ConfirmModal, {
            message: "필수입력란을 전부 입력해 주세요",
            autoClose: 1000,
         });
      }

      if (isMismatch) {
         return NiceModal.show(ConfirmModal, {
            message: "비밀번호가 일치하지 않습니다.",
            autoClose: 1000,
         });
      }

      try {
         await signupSubmit(data)
         setSteps("COMPLETE");

      } catch (err) {
         await NiceModal.show(ConfirmModal, {
            message: "일시적 에러가 발생했습니다.",
            autoClose: 1000,
         });
         console.log(err);
      }
   };

   return (
      <div className={styles.container}>
         <form ref={formRef} className={styles.form}>
         <div className={styles.input_wrapper}>
            <div className={styles.write_field}>
               <span className={styles.essential}>이름</span>
               <input
                  name="name"
                  type="text"
                  onChange={(e)=> {stringFilter(e); badNameFilter(e);}}
                  placeholder="이름"
               />
                  {warnings.name && <p>특수문자는 이름에 포함할 수 없습니다.</p>}
                  {badNames && <p>사용할 수 없는 이름입니다.</p>}
            </div>

            <div className={styles.write_field}>
               <span className={styles.essential}>닉네임</span>
               <input
                  name="nickname"
                  type="text"
                  onChange={(e)=> {stringFilter(e); badNameFilter(e);}}
                  placeholder="닉네임"
               />
                  {warnings.nickname && <p>특수문자는 이름에 포함할 수 없습니다.</p>}
                  {badNames && <p>사용할 수 없는 이름입니다.</p>}
            </div>

            <div className={styles.write_field}>
               <span className={styles.essential}>이메일</span>
               <div className={styles.unit_box}>
                  <input name="email" type="email" placeholder="이메일" />
                  <button
                     className={pages.ctf_btn}
                     onClick={() => send_verified()}
                     type="button"
                  >
                     이메일 인증하기
                  </button>
               </div>
               {verified_code && (
               <div className={styles.write_field}>
                  <p>
                     이메일로 인증메일을 전송했습니다. 확인 후 인증번호를 입력해
                     주세요.
                  </p>

                  <div className={styles.unit_box}>
                     <input
                        name="email"
                        type="text"
                        onChange={(e) => inputCodeChanger(e)}
                        placeholder="인증번호를 입력해 주세요."
                     />
                     <div className={styles.verifed_count}></div>
                     <button
                        className={pages.ctf_btn}
                        onClick={() => verified_codeHandler()}
                        type="button"
                     >
                        인증 완료
                     </button>
                  </div>
               </div>
               )}
            </div>

            <div className={styles.write_field}>
               <span className={styles.essential}>비밀번호 입력</span>
                  <div className={styles.pw_box}>
                  <div className={styles.pw_input}>
                     <input
                        name="password"
                        type={showPw.password ? "text" : "password"}
                        placeholder="비밀번호를 입력해 주세요."
                        onBlur={(e) =>
                        setPwTxt((prev) => ({
                           ...prev,
                           password: e.target.value,
                        }))
                        }
                     />
                     <button
                        type="button"
                        onClick={() =>
                        setShowPw((prev) => ({
                           ...prev,
                           password: !prev.password,
                        }))
                        }
                     >
                        {showPw.password ? (
                        <Image
                           width={26}
                           height={14}
                           src={"/img/pw_eye_show.svg"}
                           alt={"dk"}
                        />
                        ) : (
                        <Image
                           width={26}
                           height={14}
                           src={"/img/pw_eye.svg"}
                           alt={"dk"}
                        />
                        )}
                     </button>
                  </div>
                  <div className={styles.pw_input}>
                     <input
                        name="pw_check"
                        type={showPw.pw_check ? "text" : "password"}
                        placeholder="비밀번호를 다시 입력해 주세요."
                        onBlur={(e) => {
                        setPwTxt((prev) => ({
                           ...prev,
                           pw_check: e.target.value,
                        }));
                        }}
                     />
                     <button
                        type="button"
                        onClick={() =>
                        setShowPw((prev) => ({
                           ...prev,
                           pw_check: !prev.pw_check,
                        }))
                        }
                     >
                        {showPw.pw_check ? (
                        <Image
                           width={26}
                           height={14}
                           src={"/img/pw_eye_show.svg"}
                           alt={"dk"}
                        />
                        ) : (
                        <Image
                           width={26}
                           height={14}
                           src={"/img/pw_eye.svg"}
                           alt={"dk"}
                        />
                        )}
                     </button>
                  </div>
                  {isMismatch && <p>비밀번호가 일치하지 않습니다.</p>}
               </div>
            </div>
         </div>

         <button type="submit" onClick={(e) => handleSubmit(e)}>
            회원가입 요청
         </button>
         </form>
      </div>
   );
}
