'use client'

import Link from "next/link";
import styles from './header.module.css';
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import SideBar from '../sideBar/sideBar';
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { UserDB } from "@/utils/types/interfaces";
import { WithId } from "mongodb";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const MenuLink = ({href, children}:{href: string, children: React.ReactNode;}) => {
   const pathname = usePathname();
   const isActive = pathname === href;
   return (
      <Link className={clsx({[styles.active]:isActive})} href={href}>{children}</Link>
   )
}

export function SignWrapper({user}:{user:WithId<UserDB> | null}) {
   const [sideOpen, setSideOpen] = useState<boolean>(false);
   const { data: sesstion, status } = useSession();
   const router = useRouter();

   const searchParams = useSearchParams();
   const isAuthRequired = searchParams?.get('auth') === 'required';

   useEffect(() => {
      if (!isAuthRequired) return

      setSideOpen(true);

      // 처리 후 URL 정리
      router.replace('/')
   }, [isAuthRequired, router])

   // console.log(sideOpen);

   

   if(status === 'loading') return <p>로딩중...</p>

   return (
      <>
         <div className={styles.sign_box}>
           {
            sesstion ?
               <>
                  <Link href={'/mypage'} className={styles.user_thumbnail}>
                     {
                        user?.thumbnail ? 
                           <img src={user?.thumbnail} alt="유저 썸네일" />
                        : <img src="img/user_unknown.png" alt="no-img" />
                     }
                  </Link>
                  <button onClick={()=> {signOut(); router.push('/');}} className={styles.button} type='button'>로그아웃</button>
               </>
               :
               <button onClick={()=> setSideOpen(true)} className={styles.button} type='button'>로그인</button>
           }
         </div>
         
         {!sesstion && <SideBar user={user} openKey={sideOpen} keyUpdate={setSideOpen} />}
      </>
   )
}