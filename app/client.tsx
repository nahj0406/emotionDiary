'use client'

import styles from './css/page.module.css'
import { PostCardDTO, TagDTO, UserDTO } from "@/types/interfaces"
import PostList from "@/components/post/list/postList/postList";
import { useState } from 'react';
import clsx from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';
import SvgIcon from '@/components/ui/img/svg/icon/svgIcon';



export default function MainList ({
   initialPosts, 
   user,
   initialTags,
}:{
   initialPosts: PostCardDTO[];
   user: UserDTO | null;
   initialTags: TagDTO[];
}) {
   
   const [list, setList] = useState(initialPosts);

   const tabs = [
      {name: '추천 피드', key: 'recommend',},
      {name: '인기 피드', key: 'popular',},
      {name: '최신 피드', key: 'latest',},
   ]
   const [tabActive, setTabActive] = useState<string>('recommend');
   // const [sort, setSort] = useState<string>('');
   const [loading, setLoading] = useState<boolean>(false);
   // const router = useRouter();

   const searchParams = useSearchParams();
   const keyword = searchParams?.get('keyword') ?? '';

   const sort_Change_handler = async (type: string) => {
      try {
         setLoading(true);
         // setSort(type);

         const params = new URLSearchParams({
            key: type,
         });

         if (keyword) {
            params.set('keyword', keyword);
         }

         const res = await fetch(`/api/post/list/sort?${params.toString()}`);

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
            <button className={styles.category_btn} type='button'>
               <SvgIcon name={'categoryTab'} />
            </button>
            <ul className={styles.feed_tab}>
               {
                  tabs.map((item, i)=> {
                     return (
                        <li 
                           key={`${item.key}_${i}`}
                           onClick={()=> {
                              sort_Change_handler(item.key);
                              setTabActive(item.key);
                           }}
                           className={clsx('paperLogy',{[styles.active]:tabActive == item.key})}
                        >
                           {item.name}
                        </li>
                     )
                  })
               }
            </ul>
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