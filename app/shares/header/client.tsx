'use client'

import Link from "next/link";
import styles from './header.module.css'
import { usePathname } from "next/navigation";
import clsx from "clsx";
import SideBar from '../sideBar/sideBar';
import { useState } from 'react';
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export const MenuLink = ({href, children}:{href: string, children: React.ReactNode;}) => {
   const pathname = usePathname();
   const isActive = pathname === href;
   return (
      <Link className={clsx({[styles.active]:isActive})} href={href}>{children}</Link>
   )
}

export function SignWrapper() {
   const [sideOpen, setSideOpen] = useState<boolean>(false);
   const { data: sesstion, status } = useSession();

   console.log(sesstion);

   if(status === 'loading') return <p>로딩중...</p>

   return (
      <>
         <div className={styles.sign_box}>
           <button onClick={()=> setSideOpen(true)} className={styles.button} type='button'>로그인</button>
           {sesstion && (
               <>
                  <p>환영합니다{sesstion.user.name}</p>
                  <button className={styles.button} onClick={()=> signOut()} type='button'>로그아웃</button>
               </>
           )}
         </div>

         <SideBar openKey={sideOpen} keyUpdate={setSideOpen} />
      </>
   )
}