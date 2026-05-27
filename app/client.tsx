'use client'
import { useRouter } from 'next/navigation'
import styles from './css/page.module.css'
import { postType } from "@/types/interfaces"



export default function MainList ({list}:{list: postType[]}) {
   const router = useRouter();

   return (
      <div className={styles.list}>
         {list.map((post: postType, i:number) => {

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