'use client'

import styles from './page.module.css'
import { PostCardDTO, UserDB } from "@/types/interfaces";
import clsx from 'clsx';
import { WithId } from "mongodb";
import Link from 'next/link';
import PostList from '@/components/post/list/postList/postList';
import { useState } from 'react';


 
export function Infomation(
   {
      user,
      recommendPosts,
      myPosts,
      recentlyPost,
   }:{
      user:WithId<UserDB> | null
      recommendPosts: PostCardDTO[]
      myPosts: PostCardDTO[]
      recentlyPost: PostCardDTO[]
   }) {
   
   const TAB = {
      RECENTLY: 'recently',
      RECOMMEND: 'recommend',
      MYPOSTS: 'myPosts',
   } as const;

   const [activTab, setActiveTab] = useState<string>(TAB.RECENTLY);

   return (
      <div className={styles.infomation}>
         <div className={styles.user_profile}>
            <div className={styles.thumbnail}>
               {
                  user?.thumbnail 
                  ? <img src={user?.thumbnail} alt='유저 썸네일' />
                  : <img src={'img/unknown.png'} alt='no-img' />
               }
            </div>
            <div className={styles.name_box}>
               <span className={styles.nickName}>
                  {user?.nickName}
               </span>
               <Link href={'/mypage/infoEdit'} className={styles.edit_btn}>
                  <img src={'img/user/edit_icon.png'} alt='edit' />
               </Link>
            </div>
            <span className={styles.email}>
               {user?.email}
            </span>
            <Link href={'/mypage/withdrawal'} type='button'>회원 탈퇴</Link>
         </div>

         <div className={styles.activity_wrapper}>
            <ul className={styles.active_tab}>
               <li 
                  className={
                     clsx(
                        styles.tabItem,
                        {[styles.active]: activTab == TAB.RECENTLY}
                     )
                  }
                  onClick={()=> setActiveTab(TAB.RECENTLY)}
               >
                  최근 본 글
               </li>

               <li 
                  className={
                     clsx(
                        styles.tabItem,
                        {[styles.active]: activTab == TAB.RECOMMEND}
                     )
                  }
                  onClick={()=> setActiveTab(TAB.RECOMMEND)}
               >
                  좋아요한 글
               </li>

               <li 
                  className={
                     clsx(
                        styles.tabItem, 
                        {[styles.active]: activTab == TAB.MYPOSTS}
                     )
                  }
                  onClick={()=> setActiveTab(TAB.MYPOSTS)}
               >
                  내가 쓴 글
               </li>
            </ul>

            <div className={styles.list_wrppaer}>
               {/* 최근 본 글 */}
               {activTab == TAB.RECENTLY && <PostList list={recentlyPost} />}

               {/* 좋아요 */}
               {activTab == TAB.RECOMMEND && <PostList list={recommendPosts} />}

               {/* 내가 쓴 글 */}
               {activTab == TAB.MYPOSTS && <PostList list={myPosts} editMode={true} />}
            </div>
         </div>
      </div>
   )
}
