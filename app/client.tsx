'use client'

import styles from './css/page.module.css'
import { PostCardDTO } from "@/types/interfaces"
import PostList from "@/components/post/list/postList/postList";
import SearchBar from '@/components/ui/search/searchBar/searchBar';
import { useState } from 'react';
import clsx from 'clsx';



export default function MainList ({initialPosts}:{initialPosts: PostCardDTO[]}) {
   
   const [list, setList] = useState(initialPosts);
   const tabs = [
      {name: '추천순', key: 'recommend',},
      {name: '인기순', key: 'popular',},
      {name: '최신순', key: 'latest',},
   ]
   const [tabActive, setTabActive] = useState<string>('recommend');
   const [sort, setSort] = useState<string>('');
   const [loading, setLoading] = useState<boolean>(false);

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
      <div className={styles.list_layer}>
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
         
         <SearchBar sort={sort} setList={setList}></SearchBar>
         {
            list.length === 0 && (<div>일치하는 검색어가 없습니다.</div>)
         }
         {
            !loading ? <PostList list={list} /> : <div>로딩중...</div>
         }
      </div>
   )
}