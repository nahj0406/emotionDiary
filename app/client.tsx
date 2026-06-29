'use client'

import styles from './css/page.module.css'
import { PostCardDTO, UserDB } from "@/types/interfaces"
import PostList from "@/components/post/list/postList/postList";
import SearchBar from '@/components/ui/search/searchBar/searchBar';
import { useState } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import NiceModal from '@ebay/nice-modal-react';
import Login from './(auth)/login/login';
import AuthModal from '@/components/modals/AuthModal/AuthModal';
import SvgIcon from '@/components/ui/svg/icon/svgIcon';
import { signOut } from "next-auth/react";
import { FindPw } from './(auth)/findUser/findPw/client';



export default function MainList ({initialPosts, user}:{initialPosts: PostCardDTO[]; user: UserDB | null}) {
   
   const [list, setList] = useState(initialPosts);
   const tabs = [
      {name: '추천순', key: 'recommend',},
      {name: '인기순', key: 'popular',},
      {name: '최신순', key: 'latest',},
   ]
   const [tabActive, setTabActive] = useState<string>('recommend');
   const [sort, setSort] = useState<string>('');
   const [loading, setLoading] = useState<boolean>(false);
   const router = useRouter();

   const sort_Change_handler = async (type: string) => {
      try {
         setLoading(true);
         setSort(type);

         const res = await fetch(`/api/post/list/sort?key=${type}`);

         if(!res.ok) {
            throw new Error(`HTTP Error: ${res.status}`);
         }

         const data = await res.json();
         
         setList(Array.isArray(data) ? data : initialPosts);
      } catch (error) {
         console.error(error);
         setList(initialPosts);

      } finally {
         setLoading(false);
      }
      
   }

   return (
      <>
         <div className={styles.top_bar}>
            <div className={styles.search_box}>
               <SearchBar sort={sort} setList={setList} />
      
               <ul className={styles.list_tab}>
                  {
                     tabs.map((item, i)=> {
                        return (
                           <li 
                              key={`${item.key}_${i}`} 
                              onClick={()=> {
                                 sort_Change_handler(item.key);
                                 setTabActive(item.key);
                              }}
                              className={clsx({[styles.active]:tabActive == item.key})}
                           >
                              {item.name}
                           </li>
                        )
                     })
                  }
               </ul>
            </div>

            <div className={styles.login_box}>
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
                                       // <FindPw 
                                       //    modalClose={close}
                                       //    setPage={setPage}
                                       // />
                                       <div>11</div>
                                 )
                              }
                           },
                        })
                     }
                  }}
               >
                  {
                     user 
                        ? <img src={user.thumbnail ? user.thumbnail : '/img/unknown.png'} alt="유저 썸네일" />
                        : <img src="/img/user_unknown.png" alt="유저_썸네일 없음" />
                  }
               </figure>
               <div className={styles.more_btn}>
                  <SvgIcon name={'arrow_bottom'} />
                  <button onClick={()=> {signOut(); router.push('/');}} className={styles.button} type='button'>로그아웃</button>
               </div>
            </div>
         </div>

         {
            list.length === 0 && (<div>일치하는 검색어가 없습니다.</div>)
         }
         {
            !loading ? <PostList list={list} /> : <div>로딩중...</div>
         }
      </>
   )
}