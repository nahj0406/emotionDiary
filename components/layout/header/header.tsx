"use client";

import Login from "@/app/(auth)/login/login";
import styles from "./header.module.css";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
// import { Dispatch, SetStateAction } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SvgIcon from "@/components/ui/img/svg/icon/svgIcon";

import NiceModal from '@ebay/nice-modal-react';
import AuthModal from '@/components/modals/AuthModal/AuthModal';
import { FindPw } from "@/app/(auth)/findUser/findPw/client";
import SignUp from "@/app/(auth)/signup/client";
import { TagDTO, UserDB, UserDTO } from "@/types/interfaces";
import UserThumbnail from "@/components/ui/img/user_thumbnail/userThumbnail";
import SearchBar from "@/components/ui/search/searchBar/searchBar";
import LoginProfile from "../loginProfile/loginProfile";
import { AnimatePresence } from "framer-motion";

export default function Header({
   user,
   initialTags
}:{
   user: UserDTO | null;
   initialTags: TagDTO[];
}) {

   const router = useRouter();
   const [open, setOpen] = useState<boolean>(false);
   const refBody = useRef<HTMLDivElement>(null);
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const AuthModalOpened = useRef(false);

   useEffect(()=> {
      if(!open) return

      const outsideClick = (e: PointerEvent) => {
         const profileBody = refBody.current;
         const clickElement = e.target as Node;

         if(profileBody && !profileBody.contains(clickElement)) {
            setOpen(false);
         }
      }

      document.addEventListener('pointerdown', outsideClick);

      return () => {
         document.removeEventListener('pointerdown', outsideClick);
      }

   }, [open, setOpen]);

   // 모달 열고 닫기
   const showAuthModal = () => {
      return NiceModal.show(AuthModal, {
         content: ({close, page, setPage}) => {
            switch (page) {
               case 'login':
                  return (
                  <Login 
                     modalClose={close}
                     setPage={setPage}
                  />
               )

               case 'findPw':
                  return (
                     <FindPw 
                        setPage={setPage}
                     />
               )

               case 'signIn':
                  return (
                     <SignUp 
                        initialTags={initialTags}
                        setPage={setPage}
                     />
               )
            }
         }
      })
   }

   // 비회원이 토큰 필요 페이지 접근할때 로그인 모달 띄우기
   useEffect(()=> {
      if (!pathname) return;
      if (searchParams?.get('auth') !== 'required') return;
      if (AuthModalOpened.current) return;

      AuthModalOpened.current = true;

      showAuthModal().finally(()=> {
         const params = new URLSearchParams(searchParams.toString());

         params.delete('auth');
         params.delete('callbackUrl');

         const query = params.toString();

         router.replace(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
         });

         AuthModalOpened.current = false;

      })
   }, [pathname, router, searchParams]);
   

   return (
      <div className={clsx(styles.header)}>  

         <SearchBar />

         <div className={styles.login_box} ref={refBody}>
            <figure 
               className={styles.user_thumbnail}
               onClick={()=> {
                  if(user) {
                     router.push('/mypage');
                  } else {
                     showAuthModal();
                  }
               }}
            >
               <UserThumbnail thumbnail={user?.thumbnail} size={45}></UserThumbnail>
            </figure>

            <div className={styles.more_btn} onClick={()=> setOpen((prev)=> !prev)}>
               <SvgIcon name={'arrow_bottom'} />
            </div>
            <AnimatePresence>
               {open &&
                  <LoginProfile user={user} tagList={initialTags} />
               }
            </AnimatePresence>
         </div>
      </div>
   );
}
