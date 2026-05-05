'use client'
import { UserDB } from '@/utils/types/interfaces';
import styles from './profile.module.css'
import { signOut } from "next-auth/react";
import Link from 'next/link';
import { WithId } from "mongodb";

export default function Profil ({user}: {user:WithId<UserDB> | null}) {
   
   if(!user) return <div>유저 정보 없음</div>

   return (
      <article className={styles.profile}>
         <h5>{user?.name}님</h5>
         <Link href={'/mypage'}>마이페이지</Link>
         <button className={styles.button} onClick={()=> signOut()} type='button'>로그아웃</button>
      </article>
   )
}