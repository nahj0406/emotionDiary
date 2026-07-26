'use client'

import { CategoryDTO, TagDTO } from '@/types/interfaces'
import styles from './searchFilter.module.css'
import TagIcon from '@/components/ui/img/svg/icon/tagIcon'
import clsx from 'clsx'
import { useState } from 'react'


interface Props {
   catTab: CategoryDTO[] | null
   tagTab: TagDTO[] | null
   searchCatsRef: React.RefObject<string[]>
   searchTagsRef: React.RefObject<string[]>
   viewCats: string[];
   viewTags: string[];
   setViewCats: React.Dispatch<React.SetStateAction<string[]>>;
   setViewTags: React.Dispatch<React.SetStateAction<string[]>>;
   // onCatsChange: (cats: string) => void
   // onTagsChange: (tags: string) => void
}

export default function SearchFilter({
   catTab, 
   tagTab, 
   searchCatsRef, 
   searchTagsRef,
   viewCats,
   viewTags,
   setViewCats, 
   setViewTags

}:Props) {
   const [searchCats, setSearchCats] = useState<string[]>(viewCats);
   const [searchTags, setSearchTags] = useState<string[]>(viewTags);

   const handleCats_Change = (category: string) => {
      const current = searchCatsRef.current;

      const next = current.includes(category)
         ? current.filter((item) => item !== category)
         : [...current, category];

      searchCatsRef.current = next;
      setSearchCats(next);
      setViewCats(next);
   };

   const handleTags_Change = (tag: string) => {
      const current = searchTagsRef.current;

      const next = current.includes(tag)
         ? current.filter((item) => item !== tag)
         : [...current, tag];

      searchTagsRef.current = next;
      setSearchTags(next);
      setViewTags(next);
   };

   return (
      <article className={styles.filterTab}>
         <h5 className={styles.title}>검색 필터</h5>

         <div className={styles.itemBox}>
            <h5 className={styles.title}>카테고리</h5>
            <ul className={clsx(styles.cat_list, styles.list)}>
               {catTab?.map((item, i)=> {
                  const categorySlug = String(item.slug);
                  const catActive = searchCats.some(
                    (cat) => cat === categorySlug
                  );
                  return (
                     <li className={clsx({[styles.active]:catActive})}  onClick={()=> handleCats_Change(categorySlug)} key={`cat_${item.slug}`}>{item.name}</li>
                  )
               })}
            </ul>
         </div>
         
         <div className={styles.itemBox}>
            <h5 className={styles.title}>성향</h5>
            <ul className={clsx(styles.tag_list, styles.list)}>
               {tagTab?.map((item, i)=> {
                  const tagSlug = String(item.slug);
                  const catActive = searchTags.some(
                    (tag) => tag === tagSlug
                  );
                  return (
                     <li className={clsx({[styles.active]:catActive})} key={`cat_${item.slug}`} onClick={()=> handleTags_Change(tagSlug)}>
                        <TagIcon name={item.name} width={'40px'} />
                        <span>{item.name}</span>
                     </li>
                  )
               })}
            </ul>
         </div>
      </article>
   )
}