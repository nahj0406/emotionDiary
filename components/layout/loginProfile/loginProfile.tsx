'use client'

import { TagDTO, UserDTO } from '@/types/interfaces'
import styles from './loginProfile.module.css'
import UserThumbnail from '@/components/ui/img/user_thumbnail/userThumbnail'
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import TagIcon from '@/components/ui/img/svg/icon/tagIcon';
import { motion } from "framer-motion";
import { useEffect, useRef } from 'react';

interface ProfileProps {
   user: UserDTO | null;
   tagList: TagDTO[];
}

export default function LoginProfile({user, tagList}:ProfileProps) {

   const router = useRouter();

   const findTagByName = (
      items: { _id: string; name: string }[],
      id: string
   ) => items.find(item => item._id === id)?.name ?? '';


   return (
      <motion.article 
         className={styles.profile}
         initial={{ opacity: 0, y: -2 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.2 }}
      >
         <UserThumbnail thumbnail={user?.thumbnail} size={60} />
         <p>{user?.nickName}</p>
         <p>{user?.email}</p>
         <ul className={styles.tags}>
            {user?.tags.map((tag, i)=> {
               return (
                  <li key={`${tag}_${i}`}>
                     <TagIcon name={findTagByName(tagList, tag)} width='30px' />
                     <span>{findTagByName(tagList, tag)}</span>
                  </li>
               )
            })}
         </ul>

         <button 
            onClick={()=> {signOut(); router.push('/');}} 
            className={styles.button}
            type='button'
         >
            로그아웃
         </button>
      </motion.article>
   )
}