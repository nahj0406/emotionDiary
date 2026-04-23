'use client'

import styles from './login.module.css'
import Link from 'next/link';

export default function Login() {

   return (
      <article className={styles.login}>
         <div className={styles.input_box}>
            <span>이메일</span>
            <input type="email" name='email' placeholder='이메일을 입력하세요.' />
         </div>
         <div className={styles.input_box}>
            <span>비밀번호</span>
            <input type="password" name="password" placeholder='비밀번호를 입력하세요.' />
         </div>

         <div className={styles.button_box}>
            <button className={styles.submit} type='button'>로그인</button>
            <Link href={'/signup'} className={styles.signUp} type='button'>회원가입</Link>
         </div>
      </article>
   )
}