'use client'

import Link from "next/link";
import styles from './header.module.css'
import { usePathname } from "next/navigation";
import clsx from "clsx";
import SideBar from '../sideBar/sideBar';
import { useState } from 'react';

export const MenuLink = ({href, children}:{href: string, children: React.ReactNode;}) => {
   const pathname = usePathname();
   const isActive = pathname === href;
   return (
      <Link className={clsx({[styles.active]:isActive})} href={href}>{children}</Link>
   )
}

export function SignWrapper() {
   const [sideOpen, setSideOpen] = useState<boolean>(false);

   return (
      <>
         <div className={styles.sign_box}>
           <button onClick={()=> setSideOpen(true)} className={styles.button} type='button'>로그인</button>
           <button className={styles.button} type='button'>로그아웃</button>
         </div>

         <SideBar openKey={sideOpen} keyUpdate={setSideOpen} />
      </>
   )
}