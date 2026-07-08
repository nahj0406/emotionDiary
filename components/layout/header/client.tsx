'use client'

import Link from "next/link";
import styles from './header.module.css';
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import SideBar from '../sideBar/sideBar';
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { UserDB } from "@/types/interfaces";
import { WithId } from "mongodb";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import SvgIcon from '@/components/ui/img/svg/icon/svgIcon';

export const MenuLink = ({
   href, 
   children,
}:{
   href: string 
   children: React.ReactNode;
}) => {
   const pathname = usePathname();
   const isActive = pathname === href;
   return (
      <Link 
         className={clsx({[styles.active]:isActive})} 
         href={href}
      >
         {children}
      </Link>
   )
}

export const MenuOuter = () => {

   return (
      <nav className={styles.outer}>
         <MenuLink href={'/'}>
            <SvgIcon name={'menu_home'} />
         </MenuLink>

         <MenuLink href={'/write'}>
            <SvgIcon name={'menu_write'} />
         </MenuLink>

         <MenuLink href={'/mypage?tab=bookMark'}>
            <SvgIcon name={'menu_bookMark'} />
         </MenuLink>

         <MenuLink href={'/mypage?tab=recommend'}>
            <SvgIcon name={'menu_recommend'} />
         </MenuLink>

         <MenuLink href={'/mypage?tab=recently'}>
            <SvgIcon name={'menu_recently'} />
         </MenuLink>

         {/* <MenuLink href={'/mypage'}>
            <SvgIcon name={'menu_recently'} />
         </MenuLink> */}
      </nav>
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSideOpen(true);

      // 처리 후 URL 정리
      // router.replace('/')
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