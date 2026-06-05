'use client'

import styles from './postList.module.css'
import { PostCardDTO } from "@/types/interfaces"
import PostCard from '../postCard/postCard'
import { useState } from 'react';

export default function PostList ({list}:{list: PostCardDTO[]}) {

   return (
      <div className={styles.list}>
         {list.map((post: PostCardDTO, i:number) => {
            return (
               <PostCard 
                  key={`${post._id}_${i+1}`}
                  item={post}
               />
            )
         })}
      </div>
   )
}