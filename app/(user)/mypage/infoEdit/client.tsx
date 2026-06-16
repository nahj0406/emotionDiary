'use client'

import { nickCheck, TagDTO, UserDB } from "@/types/interfaces";
import { WithId } from "mongodb";
import styles from './page.module.css'
import { signupVal } from "@/utils/validations/signup/infoValidation";
import { useRef, useState } from "react";
import clsx from "clsx";
import TagCheckBoxGroup from "@/components/ui/tab/tag/tagCheckBoxGroup";
import Image from "next/image";
import { badWord_check, inputReplaceFilter, stringLengthBoolean } from "@/utils/functions";
import NiceModal from "@ebay/nice-modal-react";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { getCheckNickName, updateProfile } from "@/utils/requester/requester";
import { useRouter } from "next/navigation";

// 수정 시에도 처음 회원가입때 작성 안되게 막은 것들 그대로 구현해주기.

export function EditFrame({user, tags}:{user: WithId<UserDB> | null, tags: TagDTO[]}) {

   const [inputs, setInputs] = useState({
      name: {
         value: user?.name || '',
         bad_content: false,
         lengthErr: false,
         typeNumber: false,
      },
      nickName: {
         value: user?.nickName || '',
         bad_content: false,
         lengthErr: false,
         duplicate: false,
         typeNumber: false,
      },
      crtPw: {
         value: "",
         bad_content: false,
         lengthErr: false,
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

   console.log(!!inputs.crtPw.value);

   const [nickRes, setNickRes] = useState<nickCheck | null>(null);
   const [tagKeys, setTagKeys] = useState<string[]>(user?.tags ?? []);
   const [isMissMatch, SetIsMissMatch] = useState<boolean>(false);
   const [nickSafeValue, setNickSafeValue] = useState<string>();
   const [file, setFile] = useState<File | null>(null);
   const [preview, setPreview] = useState<string>('');
   const [userThumbnail, setUserThumbnail] = useState<string | undefined>(user?.thumbnail);
   const [removeThumbnail, setRemoveThumbnail] = useState(false);
   const formRef = useRef<HTMLFormElement>(null);
   const [showPw, setShowPw] = useState({
      password: false,
      pwCheck: false,
   });
   const router = useRouter();

  // input onchange 필터
     const safeInput_changer = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
  
        // 비밀번호 또는 텍스트 특수문자 차단
        
        const result = inputReplaceFilter(name, value);
        
        // 숫자로만 이루어진 이름 차단
        const isOnlyNumber = /^\d+$/.test(value);

        const badWord = badWord_check(value);
  
        // 닉네임 지워지면 재중복처리하도록 수정
        if (name === signupVal.nickName.key) {
           if(value !== nickSafeValue) {
              setNickRes(null);
           }
        }
  
        setInputs((prev) => ({
           ...prev,
           [name]: {
              value: result,
              typeNumber: isOnlyNumber,
              bad_content: badWord, // 욕설 필터링
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

   // 닉네임 중복 체크
   const nickNameDuplicate_Handler = async () => {
      const result = inputs.nickName.value;

      if(user?.nickName === result) {
         return NiceModal.show(ConfirmModal, {
            message: '현재 닉네임과 변동이 없습니다.',
            autoClose: 1000,
         })
      }

      if (result === "") {
         return NiceModal.show(ConfirmModal, {
            message: "닉네임이 입력되지 않았습니다.",
            autoClose: 1000,
         });
      }

      try {
         const data = await getCheckNickName(result);

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

   const fileRef = useRef<HTMLInputElement>(null);

   // 썸네일 업로드
   const handleThumbnail = (
      e: React.ChangeEvent<HTMLInputElement>
   ) => {
      const targetFile = e.target.files?.[0];

      if(!targetFile) return;

      if(preview) {
         URL.revokeObjectURL(preview);
      }

      const previewUrl = URL.createObjectURL(targetFile);

      setFile(targetFile);
      setPreview(previewUrl);
   }

   // 저장 전 취소
   const handleRemovePreview = () => {
      if(preview) {
         URL.revokeObjectURL(preview);
      }

      setFile(null);
      setPreview('');
   }

   const handleRemoveThumbnail = () => {
      if(userThumbnail) {
         setUserThumbnail('');
          setRemoveThumbnail(true);
      }
   }

   const duplication_submit = () => {
      return user?.nickName === inputs.nickName.value && 
         user?.tags === tagKeys && 
         !inputs.crtPw.value && 
         !file &&
         !removeThumbnail
   }

   // 최종 요청
   const updateSubmit_handler = async (e: React.MouseEvent) => {
      e.preventDefault();

      if(!formRef.current) return;

      const formData = new FormData(formRef.current);

      if(removeThumbnail) {
         formData.append('removeThumbnail', 'true');
      }

      if (file) {
         formData.append('thumbnail', file);
      }

      if(user?.nickName !== inputs.nickName.value) {
         formData.append('nickName', inputs.nickName.value);
         if(nickRes === null) {
            return NiceModal.show(ConfirmModal, {
               message: "닉네임 중복체크를 진행해 주세요.",
               autoClose: 1000,
            });
         }
      }

      if(inputs.crtPw.value.length > 0) {
         formData.append('crtPw', inputs.crtPw.value);
         formData.append('password', inputs.pwCheck.value);
      }

      tagKeys.forEach(tag => {
         formData.append('tags', tag);
      });

      if(tagKeys.length === 0) {
         return NiceModal.show(ConfirmModal, {
            message: "성향을 최소 1개 선택해 주세요. \n 추천 리스트에 반영을 위해 필수적입니다.",
            autoClose: 1000,
         })
      }

      if (
         inputs.crtPw.value.trim() &&
         inputs.password.value.trim() &&
         inputs.crtPw.value === inputs.password.value
      ) {
         return NiceModal.show(ConfirmModal, {
            message: '변경하려는 비밀번호가 현재 비밀번호와 일치합니다.',
            autoClose: 1000,
         });
      }

      if (isMissMatch || inputs.pwCheck.value.length < 0) {
         return NiceModal.show(ConfirmModal, {
            message: "비밀번호가 일치하지 않습니다.",
            autoClose: 1000,
         });
      }

      try {
         const result = await updateProfile(formData);

         if(result.ok) {
            router.push('/mypage');
         }

      } catch(err) {
         const message =
            err instanceof Error ? err.message : "알 수 없는 오류";

         NiceModal.show(ConfirmModal, {
            message: message,
            autoClose: 1000,
         });
         
         console.log(err);
      }

   }

   return (
      <div className={styles.container}>
         <form ref={formRef} className={styles.form}>
            <figure className={styles.thumbnail}>
               {
                  userThumbnail || preview ?
                     <img src={preview ? preview : userThumbnail} alt='유저 썸네일' />
                  : <img src={'img/user_unknown.png'} alt='no-img' />
               }
            </figure>
            <button type="button" onClick={()=> fileRef.current?.click()}>썸네일 변경</button>
            <input ref={fileRef} type="file" onChange={handleThumbnail} hidden />
            {preview && <button type="button" onClick={handleRemovePreview} >변경 취소</button>}
            {userThumbnail && <button type="button" onClick={handleRemoveThumbnail} >썸네일 삭제</button>}
   
            <article className="itemBox">
               <div className={styles.write_field}>
                  <span className={styles.essential}>닉네임 (한달에 한번만 변경 가능)</span>
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
                     className={clsx(styles.ctf_btn, {
                        [styles.disabled]: 
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
                  <span className={styles.essential}>비밀번호 입력</span>
                  <div className={styles.pw_box}>
   
                     <div className={styles.pw_input}>
                        <input
                           name={'crtPw'}
                           type={showPw.password ? "text" : "password"}
                           value={inputs.crtPw.value}
                           placeholder={`현재 비밀번호 입력`}
                           min={signupVal.pw.min}
                           max={signupVal.pw.max}
                           onBlur={(e) => {
                                 setInputs((prev) => ({
                                    ...prev,
                                    crtPw: {
                                       ...prev.crtPw,
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
                           name={signupVal.pw.key}
                           type={showPw.password ? "text" : "password"}
                           value={inputs.password.value}
                           placeholder={`새 비밀번호: (${signupVal.pw.min}글자 이상, ${signupVal.pw.max}이하)`}
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
                           placeholder="변경하는 비밀번호를 다시 입력해 주세요."
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
   
               <button 
                  type="button" 
                  disabled={duplication_submit()}
                  onClick={updateSubmit_handler}
               >
                     변경사항 저장
               </button>
            </article>
         </form>
      </div>
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