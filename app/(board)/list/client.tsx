'use client'

import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { postType } from "@/utils/types/interfaces"

export function ListContainer({ result }: { result: postType[] }) {

   const router = useRouter();

   return (
      <div className={styles.list}>
         {result.map((post: postType, i:number) => {

            const content = post.content.replace(/<[^>]*>/g, ''); // 텍스트 html 태그 제거

            return (
               <div className={styles.post} key={`${post._id}_${i+1}`}>
                  <h3 onClick={()=> router.push(`/list/${post._id}`)}>{post.title}</h3>
                  <p>{content}</p>
               </div>
            )
         })}
      </div>
   )
}