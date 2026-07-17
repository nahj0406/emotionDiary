'use client'

import { CategoryDTO, TagDTO } from '@/types/interfaces'
import styles from './searchFilter.module.css'
import TagIcon from '@/components/ui/img/svg/icon/tagIcon'


interface Props {
   catTab: CategoryDTO[] | null
   tagTab: TagDTO[] | null
   onCatsChange: (cats: string) => void
   onTagsChange: (tags: string) => void
}

export default function SearchFilter({catTab,tagTab, onCatsChange, onTagsChange}:Props) {
   return (
      <article className={styles.filterTab}>
         <h5 className={styles.title}>검색 필터</h5>

         <div className={styles.itemBox}>
            <h5 className={styles.title}>카테고리</h5>
            <ul className={styles.cat_list}>
               {catTab?.map((item, i)=> {
                  return (
                     <li onClick={()=> onCatsChange(item.name)} key={`cat_${item.slug}`}>{item.name}</li>
                  )
               })}
            </ul>
         </div>
         
         <div className={styles.itemBox}>
            <h5 className={styles.title}>성향</h5>
            <ul className={styles.tag_list}>
               {tagTab?.map((item, i)=> {
                  return (
                     <li key={`cat_${item.slug}`} onClick={()=> onTagsChange(item.name)}>
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