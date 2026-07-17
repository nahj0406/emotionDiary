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
   const [searchCats, setSearchCats] = useState<string[]>([]);
   const [searchTags, setSearchTags] = useState<string[]>([]);
   const searchCatsRef = useRef<string[]>([]);
   const searchTagsRef = useRef<string[]>([]);

   console.log(searchCats);
   console.log(searchTags);

   const handleCats_Change = (category: string) => {
      const current = searchCatsRef.current;

      const next = current.includes(category)
         ? current.filter((item) => item !== category)
         : [...current, category];

      searchCatsRef.current = next;
      setSearchCats(next);
   };

   const handleTags_Change = (tag: string) => {
      const current = searchTagsRef.current;

      const next = current.includes(tag)
         ? current.filter((item) => item !== tag)
         : [...current, tag];

      searchTagsRef.current = next;
      setSearchTags(next);
   };

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


   // 이거 만지는 중임. 
   // 검색 필터로 sort.ts에 모달로 선택한 카테고리랑 성향 태그 같이 보내야 하는 상태.
   // query에 카테고리랑 성향이 들어가도 현재 선택된 sort는 유지되어야 함.
   // 그럴려면 api에 요청하는 방식을 바꾸어야 함.
   const tab_Search = async (cat: string[], tag: string[]) => {
      const params = new URLSearchParams(searchParams?.toString());

      if(cat.length > 0) {
         params.set('cat', cat.join(','));
      } else {
         params.delete('cat')
      }

      if(tag.length > 0) {
         params.set('tag', tag.join(','));
      } else {
         params.delete('tag')
      }

      try {
         router.push(`${pathname}?${params.toString()}`);
         setLoading(true);

         if (keyword) {
            params.set('keyword', keyword);
         }

         const res = await fetch(`/api/post/list/sort?${params.toString()}`)

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

   const CategoryTab_open = ()=> {
      searchCatsRef.current = [];
      searchTagsRef.current = [];


      NiceModal.show(FrameModal, {
         content: (
            <SearchFilter
               tagTab={initialTags}
               catTab={initialCategories}
               onCatsChange={handleCats_Change}
               onTagsChange={handleTags_Change}
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
            list.length === 0 && (<div>일치하는 검색어가 없습니다.</div>)
         }
         {
            !loading ? <PostList list={list} /> : <div>로딩중...</div>
         }
      </>
   )
}