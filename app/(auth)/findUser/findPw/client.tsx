'use client'

import { useEmailVerfication } from "@/hooks/useEmailVerfication"
import styles from './page.module.css'
import clsx from "clsx";
import NiceModal from "@ebay/nice-modal-react";
import ConfirmModal from "@/components/modals/confirmModal/ConfirmModal";
import { useRef, useState } from "react";
import Image from "next/image";
import { signupVal } from "@/utils/validations/signup/infoValidation";
import { badWord_check, inputReplaceFilter, stringLengthBoolean } from "@/utils/functions";
import {updatePassword} from "@/utils/requester/requester";
import { useRouter } from "next/navigation";


export function ClientLayer () {

   // 이메일 
   const [checkMail, setCheckMail] = useState<boolean>(false);
   const [okMail, setOkMail] = useState<string>('');
   
   return (
      <div>
         {/* 비번 재설전 전에 이메일 인증 */}
         {!checkMail && <Mail_verification setCheckMail={setCheckMail} setOkMail={setOkMail} />}

         {/* 이메일 인증 후 비번 재설정 */}
         {(checkMail && okMail) && <ResetPwForm okMail={okMail} />}
      </div>
   )
}


export function Mail_verification ({
   setCheckMail,
   setOkMail,
}:{
   setCheckMail: React.Dispatch<React.SetStateAction<boolean>>;
   setOkMail: React.Dispatch<React.SetStateAction<string>>;
}) {
   const formRef = useRef<HTMLFormElement>(null);

   const {
      verified_mail,
      mailRetry,
      verifiedCode,
      mailPassOK,
      remain_Count,
      verifiedDate,
      sendCode,
      setVerifiedCode,
      verfiyCode,
   } = useEmailVerfication();

   const createMailcode_handler = async () => {
      if (!formRef.current) return;

      const formData = new FormData(formRef.current);
      const email = formData.get('email') as string;

      if (!email) {
         NiceModal.show(ConfirmModal, {
            message: "이메일을 제대로 입력해 주세요",
            autoClose: 1000,
         });
         
         return;
      }
      
      try {
         await sendCode(email);

         NiceModal.show(ConfirmModal, {
            message: "인증코드가 전송되었습니다.",
            autoClose: 500,
         });

      } catch (err) {
         if (err instanceof Error) {
            NiceModal.show(ConfirmModal, {
               message: err.message,
               autoClose: 1000,
            });
            console.log(err);
         }
      }
   }

   const getVerifiedCode_handler = async () => {
      const code = verifiedCode;
      if(!code) return;
      if (!formRef.current) return;

      const formData = new FormData(formRef.current);
      const email = formData.get('email') as string;

      try {
         const reuslt = await verfiyCode(email);

         if(reuslt) {
            await NiceModal.show(ConfirmModal, {
               message: '인증이 완료되었습니다.',
            })

            setCheckMail(reuslt);
            setOkMail(email);
         }
         
      } catch(err) {
         if (err instanceof Error) {
            if (err.message === "INCORRECT_CODE") {
               if (verifiedDate && new Date(verifiedDate).getTime() < Date.now()) {
                  NiceModal.show(ConfirmModal, {
                  message: "인증코드가 만료되었습니다.",
                  autoClose: 1000,
                  });
               } else {
                  NiceModal.show(ConfirmModal, {
                  message: "코드가 올바르지 않습니다.",
                  autoClose: 1000,
                  });
               }
               console.log("에러내용", err);
            }

            if (err.message === "EXPIRATION_CODE") {
               NiceModal.show(ConfirmModal, {
                  message: "인증코드가 만료되었습니다.",
                  autoClose: 1000,
               });
               console.log("에러내용", err);
            }
         }
      }
   }

   // 인증메일 코드 getVerifiedCode_handler 전달용
   const mailcodePoster = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
         setVerifiedCode(e.target.value);
      }
   };

   return (
      <form ref={formRef} className={styles.form}>
         <div className={styles.write_field}>
            <span className={styles.essential}>이메일</span>
            <div className={styles.unit_box}>
               <input
                  name={'email'}
                  type="email"
                  onInput={(e) => {
                     e.currentTarget.value = e.currentTarget.value.replace(
                     /\s/g,
                     "",
                     );
                  }}
                  placeholder="이메일을 적어주세요."
               />
               {!mailPassOK && (
                  <button
                     className={clsx(styles.ctf_btn, {
                     [styles.disabled]: mailRetry,
                     })}
                     disabled={mailRetry}
                     onClick={() => createMailcode_handler()}
                     type="button"
                  >
                     이메일 인증하기
                  </button>
               )}
            </div>
            {verified_mail &&
            (!mailPassOK ? (
               <div className={styles.write_field}>
                  <p>
                  이메일로 인증메일을 전송했습니다. 확인 후 인증번호를 입력해
                  주세요.
                  </p>
   
                  <div className={styles.unit_box}>
                  <input
                     name="email"
                     type="text"
                     onChange={(e) => mailcodePoster(e)}
                     placeholder="인증번호를 입력해 주세요."
                  />
                  <div className={styles.verifed_count}>{remain_Count}</div>
                  <button
                     className={styles.ctf_btn}
                     onClick={() => getVerifiedCode_handler()}
                     type="button"
                  >
                     인증 완료
                  </button>
                  </div>
               </div>
            ) : (
               <div>메일 인증이 완료되었습니다!</div>
            ))}
         </div>
      </form>
   )
}


export function ResetPwForm ({okMail}:{okMail: string}) {

   const lostPwMail = okMail;
   const formRef = useRef<HTMLFormElement>(null);
   const router = useRouter();

   const [showPw, setShowPw] = useState({
      password: false,
      pwCheck: false,
   });

   const [inputs, setInputs] = useState({
      password: {
         value: "",
         bad_content: false,
         lengthErr: false,
      },
      pwCheck: {
         value: "",
         bad_content: false,
         lengthErr: false,
      },
   })

   const [isMissMatch, SetIsMissMatch] = useState<boolean>(false);

   // input onchange 필터
   const safeInput_changer = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      // 비밀번호 또는 텍스트 특수문자 차단
      const result = inputReplaceFilter(name, value);
      
      // 숫자로만 이루어진 이름 차단
      const isOnlyNumber = /^\d+$/.test(value);

      setInputs((prev) => ({
         ...prev,
         [name]: {
            value: result,
            typeNumber: isOnlyNumber,
            bad_content: badWord_check(value), // 욕설 필터링
         },
      }));
   };
   

   // 문자열 길이 체크
   const lengthCheck_handler = (
      e: React.FocusEvent<HTMLInputElement>,
      minLength: number,
      maxLength: number,
   ) => {

      const {name, value } = e.target;

      const errBoolean = 
         stringLengthBoolean(value, minLength, maxLength);

      setInputs((prev) => {
         const key = name as keyof typeof prev;

         return {
            ...prev,
            [key]: {
               ...prev[key],
               lengthErr: errBoolean,
            }
         }
      })
   }

   // 최종 요청
   const createSubmit_handler = async (e: React.MouseEvent) => {
      e.preventDefault();

      if (!formRef.current) return;

      const formData = new FormData(formRef.current);

      const data = {
         email: lostPwMail,
         password: formData.get(signupVal.pwCheck.key) as string,
      }

      if (isMissMatch || inputs.pwCheck.value.length < 0) {
         return NiceModal.show(ConfirmModal, {
         message: "비밀번호가 일치하지 않습니다.",
         autoClose: 1000,
         });
      }

      try {
         const res = await updatePassword(data);

         if(res.ok) {
            await NiceModal.show(ConfirmModal, {
               message: '비밀번호 변경이 완료되었습니다.',
               autoClose: 3000,
            });

            return router.push('/');
         }

      } catch (err) {
         const message =
            err instanceof Error ? err.message : "알 수 없는 오류";

         NiceModal.show(ConfirmModal, {
            message: message,
            autoClose: 1000,
         });
         
         console.log(err);
      }
   };

   // 이제 인증완료된 메일이랑 새 비밀번호 api 보내서 updateOne 처리하고 다시 로그인 페이지로
   // 보내면 끝.

   if(!lostPwMail) return <p>인증 완료된 메일을 찾을 수 없습니다.</p>

   return (
      <form ref={formRef}>
         <div className={styles.write_field}>
            <span className={styles.essential}>비밀번호 입력</span>
            <div className={styles.pw_box}>
               <div className={styles.pw_input}>
                  <input
                  name={signupVal.pw.key}
                  type={showPw.password ? "text" : "password"}
                  value={inputs.password.value}
                  placeholder={`(${signupVal.pw.min}글자 이상, ${signupVal.pw.max}이하)`}
                  min={signupVal.pw.min}
                  max={signupVal.pw.max}
                  onBlur={(e) => {
                        setInputs((prev) => ({
                           ...prev,
                           password: {
                              ...prev.password,
                              value: e.target.value,
                           },
                        }));
                        lengthCheck_handler(e, signupVal.pw.min, signupVal.pw.max);
                     }
                  }
                  onChange={(e) => safeInput_changer(e)}
                  />
               <PwShow_Button
                  type={'password'}
                  showPw={showPw.password}
                  setShowPw={setShowPw}
               />
               {
                  inputs.password.lengthErr && 
                     <p>{`${signupVal.pw.min}글자 이상, ${signupVal.pw.max}이하로 작성해 주세요.`}</p>
               }
               </div>
               <div className={styles.pw_input}>
                  <input
                  name={signupVal.pwCheck.key}
                  type={showPw.pwCheck ? "text" : "password"}
                  value={inputs.pwCheck.value}
                  placeholder="비밀번호를 다시 입력해 주세요."
                  onBlur={(e) => {
                     setInputs((prev) => ({
                        ...prev,
                        pwCheck: {
                           ...prev.pwCheck,
                           value: e.target.value,
                        },
                     }));
                     SetIsMissMatch(inputs.password.value !== inputs.pwCheck.value);
                  }}
                  onChange={(e) => safeInput_changer(e)}
                  />
                  <PwShow_Button
                     type={'pwCheck'}
                     showPw={showPw.pwCheck}
                     setShowPw={setShowPw}
                  />
               </div>
               {isMissMatch && <p>비밀번호가 일치하지 않습니다.</p>}
            </div>
         </div>

         <button type='submit' onClick={(e) => createSubmit_handler(e)}>
            비밀번호 변경
         </button>
      </form>
   )
}

type ShowPwType = {
  password: boolean
  pwCheck: boolean
}

function PwShow_Button({
  type,
  showPw,
  setShowPw,
}: {
  type: keyof ShowPwType
  showPw: boolean
  setShowPw: React.Dispatch<
    React.SetStateAction<ShowPwType>
  >
}) {
  return (
    <button
      type="button"
      onClick={() =>
        setShowPw((prev) => ({
          ...prev,

          [type]: !prev[type],
        }))
      }
    >
      {showPw ? (
        <Image
          width={26}
          height={14}
          src={"/img/pw_eye_show.svg"}
          alt="show"
        />
      ) : (
        <Image
          width={26}
          height={14}
          src={"/img/pw_eye.svg"}
          alt="hide"
        />
      )}
    </button>
  )
}