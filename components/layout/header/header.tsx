"use client";

import Login from "@/app/(auth)/login/login";
import styles from "./header.module.css";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
// import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import SvgIcon from "@/components/ui/img/svg/icon/svgIcon";

import NiceModal from '@ebay/nice-modal-react';
import AuthModal from '@/components/modals/AuthModal/AuthModal';
import { FindPw } from "@/app/(auth)/findUser/findPw/client";
import SignUp from "@/app/(auth)/signup/client";
import { TagDTO, UserDTO } from "@/types/interfaces";
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
   

   return (
      <div className={clsx(styles.header)}>  

         <SearchBar />

         {/* <div className={styles.login_box} ref={refBody}>
            <figure 
               className={styles.user_thumbnail}
               onClick={()=> {
                  if(user) {
                     router.push('/mypage');
                  } else {
                     NiceModal.show(AuthModal, {
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
                        },
                     })
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
         </div> */}
      </div>
   );
}
