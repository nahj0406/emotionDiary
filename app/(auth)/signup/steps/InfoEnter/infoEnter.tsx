"use client";

import styles from "./infoEnter.module.css";
import pages from "../../page.module.css";
import { useEffect, useRef, useState } from "react";
import NiceModal from "@ebay/nice-modal-react";
import ConfirmModal from "@/components/modals/ConfirmModal";
import Image from "next/image";
import {
  createMailcode,
  getVerifiedCode,
  createSubmit,
} from "../../services/requester";
import { normalize } from "@/utils/functions";
import clsx from "clsx";
import { BAD_WORDS, customWords } from "@/lib/badWords/badWords";
import { signupVal } from "@/utils/validations/signup/infoValidation";
import { TagDTO } from "@/types/interfaces";
import TagCheckBoxGroup from "@/components/ui/tab/tag/tagCheckBoxGroup";

type nickCheck = {
  available: boolean;
  message: string;
}

export default function InfoEnter({
  setStep,
  tags,
}: {
  setStep: React.Dispatch<React.SetStateAction<string | null>>;
  tags: TagDTO[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [nickRes, setNickRes] = useState<nickCheck | null>(null);
  const [nickSafeValue, setNickSafeValue] = useState<string>();
  const [isMissMatch, SetIsMissMatch] = useState<boolean>(false);
  const [verified_mail, setVerified_mail] = useState<boolean>(false);
  const [verifiedCode, setVerifiedCode] = useState<string>("");
  const [mailRetry, setMailRetry] = useState<boolean>(false);
  const [verificationDB_Id, setVerificationDB_Id] = useState<string>("");
  const [verifiedDate, setVerifiedDate] = useState<Date | null>(null);
  const [remain_Count, setRemain_Count] = useState<string>("");
  const [mailPassOK, setMailPassOk] = useState<boolean>(false);
  const [tagKeys, setTagKeys] = useState<string[]>([]);

  const [inputs, setInputs] = useState({
    name: {
      value: "",
      bad_content: false,
      lengthErr: false,
      typeNumber: false,
    },
    nickName: {
      value: "",
      bad_content: false,
      lengthErr: false,
      duplicate: false,
      typeNumber: false,
    },
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
  });

  const [showPw, setShowPw] = useState({
    password: false,
    pwCheck: false,
  });

  // input onchange 필터
  const safeInput_changer = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      const result = 
         [signupVal.pw.key, signupVal.pwCheck.key].includes(name)
            ? value.replace(/[^a-zA-Z0-9!@#$%^&*]/g, "")
            : value.replace(/[\s!@#$%^&*()+=\[\]{};:'",<>/?\\|`~_-]/g, "");
      
      // 숫자로만 이루어진 이름 차단
      const isOnlyNumber = /^\d+$/.test(value);

      // 닉네임 지워지면 재중복처리하도록 수정
      if (name === signupVal.nickName.key) {
         if(value !== nickSafeValue) {
            setNickRes(null);
         }
      }

      // 욕설 필터링
      const normalized = normalize(value);
      const isBadContent =
      BAD_WORDS.check(normalized) ||
      customWords.words.some((w) => normalized.includes(w));

      setInputs((prev) => ({
         ...prev,
         [name]: {
            value: result,
            typeNumber: isOnlyNumber,
            bad_content: isBadContent,
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
         (value.length < minLength || value.length > maxLength) 
         && value.length !== 0;

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

  // 닉네임 중복 체크
  const nickNameDuplicate_Handler = async () => {
      const result = inputs.nickName.value;

      if (result === "") {
         return NiceModal.show(ConfirmModal, {
            message: "닉네임이 입력되지 않았습니다.",
            autoClose: 1000,
         });
      }

      try {
         const data = await fetch(
            "/api/auth/user/nickname_duplication?nickname=" + result
         ).then((r) => r.json());

         setNickRes(data);

         if (data?.available) {
            setNickSafeValue(result);
         }

      } catch (error) {
         console.error(error);

         NiceModal.show(ConfirmModal, {
            message: "중복 확인 중 오류가 발생했습니다.",
            autoClose: 1000,
         });
      }
   };


  // 메일인증 verificationDb id 조회해서 만료시간 요청
  useEffect(() => {
    if (verificationDB_Id) {
      fetch("/api/auth/user/mail_verification?id=" + verificationDB_Id)
        .then((r) => r.json())
        .then((result) => {
          // result를 인증카운트시간에 넣고서 카운트 돌리면 끝!
          setVerifiedDate(result.expiresAt);
        });
    }
  }, [verificationDB_Id]);

  // 만료시간 카운트다운
  useEffect(() => {
    if (verifiedDate === null) return;

    const expire = new Date(verifiedDate).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((expire - now) / 1000);

      if (diff <= 0) {
        setRemain_Count("종료");
        clearTimeout(timer);

        return;
      }

      const minutes = Math.floor(diff / 60);

      const seconds = diff % 60;

      if (minutes <= 0) {
        setRemain_Count(`${seconds}초`);
      } else {
        setRemain_Count(`${minutes}분 ${seconds}초`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [verifiedDate]);

  useEffect(() => {
    // 메일 재인증 시도 시간차 걸기
    if (mailRetry) {
      const timer = setTimeout(() => {
        setMailRetry(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [mailRetry]);

  // 인증 이메일 요청 api
  const createMailcode_handler = async () => {
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
      const mail_id = await createMailcode(email);
      setVerified_mail(true);
      setMailRetry(true);
      setVerificationDB_Id(mail_id);
      NiceModal.show(ConfirmModal, {
        message: "인증코드가 전송되었습니다.",
        autoClose: 500,
      });

      console.log("인증 id", verificationDB_Id);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "DUPLICATION_MAIL") {
          await NiceModal.show(ConfirmModal, {
            message: "이미 가입된 이메일입니다.",
            autoClose: 1000,
          });
          console.log(err);
        }
      }
    }
  };

  // 인증메일 코드 getVerifiedCode_handler 전달용
  const mailcodePoster = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setVerifiedCode(e.target.value);
    }
  };

  // 이메일 인증코드 확인 api
  const getVerifiedCode_handler = async () => {
    const code = verifiedCode;
    if (!code) return;

    const formData = new FormData(formRef.current!);
    const email = formData.get("email") as string;

    try {
      const result = await getVerifiedCode({ email, code });
      setMailPassOk(result);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "INCORRECT_CODE") {
          if (verifiedDate && new Date(verifiedDate).getTime() < Date.now()) {
            await NiceModal.show(ConfirmModal, {
              message: "인증코드가 만료되었습니다.",
              autoClose: 1000,
            });
          } else {
            await NiceModal.show(ConfirmModal, {
              message: "코드가 올바르지 않습니다.",
              autoClose: 1000,
            });
          }
          console.log("에러내용", err);
        }

        if (err.message === "EXPIRATION_CODE") {
          await NiceModal.show(ConfirmModal, {
            message: "인증코드가 만료되었습니다.",
            autoClose: 1000,
          });
          console.log("에러내용", err);
        }
      }
    }
  };

  

  // 최종 요청
  const createSubmit_handler = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    const data = {
      name: formData.get(signupVal.name.key) as string,
      nickName: formData.get(signupVal.nickName.key) as string,
      tags: tagKeys,
      email: formData.get(signupVal.email.key) as string,
      password: formData.get(signupVal.pwCheck.key) as string,
    };

    if(nickRes === null) {
      return NiceModal.show(ConfirmModal, {
        message: "닉네임 중복체크를 진행해 주세요.",
        autoClose: 1000,
      });
    }

    if(tagKeys.length === 0) {
      return NiceModal.show(ConfirmModal, {
         message: "성향을 최소 1개 선택해 주세요. \n 추천 리스트에 반영을 위해 필수적입니다.",
         autoClose: 1000,
      })
    }

    if (isMissMatch || inputs.pwCheck.value.length < 0) {
      return NiceModal.show(ConfirmModal, {
        message: "비밀번호가 일치하지 않습니다.",
        autoClose: 1000,
      });
    }

    try {
      await createSubmit(data);
      setStep("COMPLETE");

    } catch (err) {
      const message =
         err instanceof Error ? err.message : "알 수 없는 오류";

      await NiceModal.show(ConfirmModal, {
        message: message,
        autoClose: 1000,
      });
      
      console.log(err);
    }
  };

  useEffect(()=> {
   console.log(tagKeys);
  }, [tagKeys])

  return (
    <div className={styles.container}>
      <form ref={formRef} className={styles.form}>
        <div className={styles.input_wrapper}>
          <div className={styles.write_field}>
            <span className={styles.essential}>이름</span>
            <input
              name={signupVal.name.key}
              type="text"
              value={inputs.name.value}
              onChange={(e) => {
                safeInput_changer(e);
              }}
              min={signupVal.name.min}
              max={signupVal.name.max}
              onBlur={(e)=> lengthCheck_handler(e, signupVal.name.min, signupVal.name.max)}
              placeholder={`이름(${signupVal.name.min}글자 이상, ${signupVal.name.max}이하)`}
            />
            {inputs.name.bad_content && <p>사용할 수 없는 이름입니다.</p>}
            {inputs.name.typeNumber && <p>숫자로만 작성된 이름은 사용할 수 없습니다.</p>}
            {
               inputs.name.lengthErr && 
                  <p>{`${signupVal.name.min}글자 이상, ${signupVal.name.max}이하로 작성해 주세요.`}</p>
            }
          </div>

          <div className={styles.write_field}>
            <span className={styles.essential}>닉네임</span>
            <input
               name={signupVal.nickName.key}
               type="text"
               value={inputs.nickName.value}
               onChange={(e) => {
                  safeInput_changer(e);
               }}
               min={signupVal.nickName.min}
               max={signupVal.nickName.max}
               onBlur={(e)=> {
                  lengthCheck_handler(e, signupVal.nickName.min, signupVal.nickName.max)
               }}
              placeholder={`닉네임(${signupVal.nickName.min}글자 이상, ${signupVal.nickName.max}이하)`}
            />
            {inputs.nickName.bad_content && <p>사용할 수 없는 이름입니다.</p>}
            {inputs.nickName.typeNumber && <p>숫자로만 작성된 이름은 사용할 수 없습니다.</p>}
            {nickRes?.available ? <p>{nickRes?.message}</p> : <p>{nickRes?.message}</p>}
            {
               inputs.nickName.lengthErr && 
                  <p>{`${signupVal.nickName.min}글자 이상, ${signupVal.nickName.max}이하로 작성해 주세요.`}</p>
            }
            <button
              type="button"
              className={clsx(pages.ctf_btn, {
                 [pages.disabled]: 
                 inputs.nickName.lengthErr || inputs.nickName.typeNumber,
               })}
              onClick={nickNameDuplicate_Handler}
               disabled={
                  inputs.nickName.lengthErr || 
                  inputs.nickName.typeNumber
               }
            >
              중복 확인
            </button>
          </div>

          <div className={styles.write_field}>
            <span className={styles.essential}>독서 성향 선택</span>
            <TagCheckBoxGroup tagKeys={tagKeys} setTagKeys={setTagKeys} list={tags} />
          </div>

          <div className={styles.write_field}>
            <span className={styles.essential}>이메일</span>
            <div className={styles.unit_box}>
              <input
                name={signupVal.email.key}
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
                  className={clsx(pages.ctf_btn, {
                    [pages.disabled]: mailRetry,
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
                      className={pages.ctf_btn}
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
        </div>

        <button type="submit" onClick={(e) => createSubmit_handler(e)}>
          회원가입 요청
        </button>
      </form>
    </div>
  );
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
