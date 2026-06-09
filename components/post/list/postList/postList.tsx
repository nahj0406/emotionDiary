'use client'

import styles from './postList.module.css'
import { PostCardDTO } from "@/types/interfaces"
import PostCard from '../postCard/postCard'

export default function PostList ({list, editMode}:{list: PostCardDTO[], editMode?: boolean}) {

   return (
      <div className={styles.list}>

         {
            list.length > 0 ?
               list.map((post: PostCardDTO, i:number) => {
                  return (
                     <PostCard 
                        key={`${post._id}_${i+1}`}
                        item={post}
                        editMode={editMode}
                     />
                  )
               })
            :
             <p>등록된 게시글이 없습니다.</p>
         }
      </div>
   )
}