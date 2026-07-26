'use client'

import styles from './css/page.module.css'
import { CategoryDTO, PostCardDTO, TagDTO, UserDTO } from "@/types/interfaces"
import PostList from "@/components/post/list/postList/postList";
import { useRef, useState } from 'react';
import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SvgIcon from '@/components/ui/img/svg/icon/svgIcon';
import FrameModal from '@/components/modals/frameModal/FrameModal';
import NiceModal from '@ebay/nice-modal-react';
import TagIcon from '@/components/ui/img/svg/icon/tagIcon';
import SearchFilter from '@/components/layout/searchFilter/searchFilter';



export default function MainList ({
   initialPosts, 
   user,
   initialTags,
   initialCategories,
}:{
   initialPosts: PostCardDTO[];
   user: UserDTO | null;
   initialTags: TagDTO[];
   initialCategories: CategoryDTO[];
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

   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();
   // const [valueCats, setValueCats] = useState<string[]>([]);
   // const [valueTags, setValueTags] = useState<string[]>([]);
   const searchCatsRef = useRef<string[]>([]);
   const searchTagsRef = useRef<string[]>([]);
   const [viewCats, setViewCats] = useState<string[]>([]);
   const [viewTags, setViewTags] = useState<string[]>([]);

   const keyword = searchParams?.get('keyword') ?? '';

   // 추천,인기,최신 핸들러
   // 이걸 지금 바꿔야 함. 클릭 시 url searchparams로 작동하도록.
   // 지금은 url에 표시가 안되서 헷갈림
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

   // 탭 검색 필터
   const tab_Search = async (
      cat: string[],
      tag: string[]
   ) => {
      const params = new URLSearchParams(
         searchParams?.toString()
      );

      if (cat.length > 0) {
         params.set('cat', cat.join(','));
      } else {
         params.delete('cat');
      }

      if (tag.length > 0) {
         params.set('tag', tag.join(','));
      } else {
         params.delete('tag');
      }

      if (keyword) {
         params.set('keyword', keyword);
      } else {
         params.delete('keyword');
      }

      // key가 없으면 최신순을 기본값으로 사용
      if (!params.get('key')) {
         params.set('key', 'latest');
      }

      const query = params.toString();

      try {
         setLoading(true);

         router.push(`${pathname}?${query}`);

         const res = await fetch(
            `/api/post/list/sort?${query}`
         );

         if (!res.ok) {
            const errorData = await res.json();

            throw new Error(
            errorData.message ??
            `HTTP Error: ${res.status}`
            );
         }

         const data = await res.json();

         setList(
            Array.isArray(data)
            ? data
            : initialPosts
         );
         

      } catch (error) {
         console.error(error);
         setList(initialPosts);
      } finally {
         setLoading(false);
      }
   };

   // 카테고리 탭 오픈 모달
   const CategoryTab_open = ()=> {
      searchCatsRef.current = [...viewCats];
      searchTagsRef.current = [...viewTags];


      NiceModal.show(FrameModal, {
         content: (
            <SearchFilter
               tagTab={initialTags}
               catTab={initialCategories}
               searchCatsRef={searchCatsRef}
               searchTagsRef={searchTagsRef}
               viewCats={viewCats}
               viewTags={viewTags}
               setViewCats={setViewCats}
               setViewTags={setViewTags}
            />
         ),
         onClick: () => tab_Search(searchCatsRef.current, searchTagsRef.current),
      })
   }

   return (
      <>
         <div className={styles.top_bar}>
            <button 
               className={styles.category_btn} 
               type='button'
               onClick={CategoryTab_open}
            >
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
            initialCategories.filter((cat) => viewCats.includes(String(cat.slug))).map((item, i)=> {
               return (
                  <div key={`${item.slug}_${i}`}>{item.name}</div>
               )
            })
         }
         {
            initialTags.filter((tag) => viewTags.includes(String(tag.slug))).map((item, i)=> {
               return (
                  <div key={`${item.slug}_${i}`}>{item.name}</div>
               )
            })
         }

         {
            list.length === 0 && (<div>일치하는 검색어가 없습니다.</div>)
         }
         {
            !loading ? <PostList list={list} /> : <div>로딩중...</div>
         }
      </>
   )
}