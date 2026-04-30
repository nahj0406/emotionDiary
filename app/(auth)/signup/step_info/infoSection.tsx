'use client'

import styles from './infoSection.module.css'
import pages from '../page.module.css'
import { useRef, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import ConfirmModal from '@/components/modals/ConfirmModal';

export default function InfoSection({
  setSteps,
}: {
  setSteps: React.Dispatch<React.SetStateAction<string>>;
}) {

   const formRef = useRef<HTMLFormElement>(null);
   const [verified_code, setVerified_code] = useState<boolean>(false);
   const [codeValue, setcodeValue] = useState<string>('');

   // 인증 이메일 요청 api
   const send_verified = async () => {
      if(!formRef.current) return

      const formData = new FormData(formRef.current);
      const email = formData.get('email');

      if(!email) {
         NiceModal.show(ConfirmModal, {
            message: '이메일을 제대로 입력해 주세요',
            autoClose: 1000,
         })
         return
      }

      try {
         const res = await fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({email}),
         })

         const result = await res.json(); // 디버깅용

         if (!res.ok) {
            console.log('❌ 서버 응답:', result);
            throw new Error(result.message || '에러');
         }

         setVerified_code(true);

      } catch(err) {
         await NiceModal.show(ConfirmModal, {
            message: '이미 가입된 이메일입니다.',
            autoClose: 1000,
         })
         console.log(err);
      }
   }

   const inputCodeChanger = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.value) {
         setcodeValue(e.target.value);
      }
   }

   // 이메일 인증코드 확인 api 
   const verified_codeHandler = async () => {
      const code = codeValue;
      if(!code) return 

      const formData = new FormData(formRef.current!);
      const email = formData.get('email');

      try {
         const res = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, code}),
         })

         const result = await res.json(); // 🔥 추가

         if (!res.ok) {
            console.log('❌ 서버 응답:', result); // 🔥 핵심
            throw new Error(result.message || '에러');
         }

      
      } catch(err) {
         await NiceModal.show(ConfirmModal, {
            message: '일시적 에러가 발생했습니다.',
            autoClose: 1000,
         })
         console.log(err);
      }
   }

   const handleSubmit = async (e: React.MouseEvent) => {
      e.preventDefault();

      if(!formRef.current) return 

      const formData = new FormData(formRef.current);

      const data = {
         name: formData.get('name') as string,
         nickname: formData.get('nickname') as string,
         email: formData.get('email') as string,
         password: formData.get('password') as string,
      }

      try {
         const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         })

         const result = await res.json(); // 🔥 추가

         if (!res.ok) {
            console.log('❌ 서버 응답:', result); // 🔥 핵심
            throw new Error(result.message || '에러');
         }
         
         setSteps('COMPLETE');

      } catch (err) {
         await NiceModal.show(ConfirmModal, {
            message: '일시적 에러가 발생했습니다.',
            autoClose: 1000,
         })
         console.log(err);
      }
   }

   return (
      <div className={styles.container}>
         <form ref={formRef} className={styles.form}>
            <div className={styles.input_wrapper}>
               <div className={styles.write_field}>
                  <span className={styles.essential}>이름</span>
                  <input name="name" type="text" placeholder="이름" />
               </div>

               <div className={styles.write_field}>
                  <span className={styles.essential}>닉네임</span>
                  <input name="nickname" type="text" placeholder="닉네임" />
               </div>

               <div className={styles.write_field}>
                  <span className={styles.essential}>이메일</span>
                  <div className={styles.unit_box}>
                     <input name="email" type="text" placeholder="이메일" />
                     <button className={pages.ctf_btn} onClick={()=> send_verified()} type='button'>이메일 인증하기</button>
                  </div>
                  {
                     verified_code &&
                     <div className={styles.write_field}>
                        <p>이메일로 인증메일을 전송했습니다. 확인 후 인증번호를 입력해 주세요.</p>

                        <div className={styles.unit_box}>
                           <input name="email" type="text" onChange={(e)=> inputCodeChanger(e)} placeholder="인증번호를 입력해 주세요." />
                           <button className={pages.ctf_btn} onClick={()=> verified_codeHandler()} type='button'>인증 완료</button>
                        </div>
                     </div>
                  }
               </div>

               <div className={styles.write_field}>
                  <span className={styles.essential}>비밀번호 입력</span>
                  <div className={styles.pw_box}>
                     <input name="password" type="password" placeholder="비밀번호를 입력해 주세요." />
                     <input name="pw_check" type="password" placeholder="비밀번호를 다시 입력해 주세요." />
                  </div>
               </div>
            </div>
            
            <button type="submit" onClick={(e)=> handleSubmit(e)}>회원가입 요청</button>
         </form>
      </div>
   )
}