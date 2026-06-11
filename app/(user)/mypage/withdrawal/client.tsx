'use client'

import { UserDB } from '@/types/interfaces'
import styles from './page.module.css'
import SubmitBtn from '@/components/ui/button/submitBtn/submit_btn'
import NiceModal from '@ebay/nice-modal-react'
import ConfirmModal from '@/components/modals/ConfirmModal'
import { signOut } from "next-auth/react";
import { useState, SetStateAction } from 'react'

export function PassowrdLock ({
   setCheckIn,
}: {
   setCheckIn: React.Dispatch<SetStateAction<boolean>>;
}) {

   const [password, setPassword] = useState<string>('');

   const password_check_handler = async () => {
      try {
         const res = await fetch('/api/auth/user/pw_check',
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  code: password,
               })
            }
         );

         if(!res.ok) {
            const error = await res.json();

            return NiceModal.show(ConfirmModal, {
               message: error.message,
               autoClose: 1000,
            });
         }

         const data = await res.json();

         setCheckIn(data.success);


      } catch (err) {
         console.error('비밀번호 조회 실패:', err);

         if (err instanceof Error) {
            console.error('에러 메시지:', err.message);
         }

         return NiceModal.show(ConfirmModal, {
            message: '비밀번호 조회에 실패했습니다. 고객센터에 문의해 주세요.',
            autoClose: 1000,
         });
      }
   }

   return (
      <div>
         <label htmlFor="password">
            <span>비밀번호 입력</span>
            <input 
               type="password" 
               id='password'
               value={password}
               placeholder='비밀번호를 입력해 주세요.' 
               onChange={(e)=> setPassword(e.target.value)}
            />
         </label>

         <button type='button' onClick={password_check_handler}>비밀번호 확인</button>
      </div>
   )
}



export function WithDrawalClient ({userInfo}:{userInfo: UserDB | null}) {

   const [checkIn, setCheckIn] = useState(false);
   const [agreeCheckd, setAgreeCheckd] = useState(false);

   const delete_submit = async () => {

      if(!agreeCheckd) {
         return NiceModal.show(ConfirmModal, {
            message: '탈퇴 약관에 동의해 주세요.'
         })
      }

      if(userInfo === null) {
         return NiceModal.show(ConfirmModal, {
            message: '시스템에 문제가 생겼습니다. 고객센터에 문의해 주세요.'
         })
      }

      try {
         const result = await fetch(
         `/api/auth/user/deleteAccount`,
         {
            method: 'POST',
         });

         const data = await result.json();

         if(!result.ok) {
            return NiceModal.show(ConfirmModal, {
               message: data.message,
            })
         }

         await NiceModal.show(ConfirmModal, {
            message: data.message,
            autoClose: 3000,
         })

         await signOut({
            callbackUrl: '/',
         });

      } catch(err) {
         console.error(err);

         return NiceModal.show(ConfirmModal, {
            message: "회원 탈퇴에 실패했습니다. 고객센터에 문의해 주세요.",
            autoClose: 1000,
         });
      }
   }

   return (
      <>
         {!checkIn && <PassowrdLock setCheckIn={setCheckIn} />}

         {checkIn && 
            <div className={styles.widthDrawal_layer}>
               <h3>정말로 회원 탈퇴를 진행하시겠습니까?</h3>
      
               <p>회원명: {userInfo?.name}</p>
               <p>닉네임: {userInfo?.nickName}</p>
               <p>이메일: {userInfo?.email}</p>
      
               <div className={styles.withDrwal_agree}>
                  <p>아래 내용에 동의해 주세요.</p>
      
                  <p>탈퇴 동의 내용</p>
      
                  <div className={styles.agree_box} >
      
                     <label htmlFor='delete_account' style={{display: 'flex', gap: '10px'}}>
                        <input 
                           type="checkbox" 
                           id={'delete_account'} 
                           checked={agreeCheckd}
                           onChange={(e)=> setAgreeCheckd(e.target.checked)}
                        />
                        <p>위 내용에 동의합니다.</p>
                     </label>
                  </div>
               </div>
      
               <SubmitBtn onClick={delete_submit} content='회원 탈퇴를 진행합니다.' />
            </div>
         }
      </>
   )
}