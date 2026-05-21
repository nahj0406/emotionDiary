'use client'

import styles from './page.module.css'
import { UserDB } from "@/utils/types/interfaces";
import { WithId } from "mongodb";
import Link from 'next/link';


 
export function Infomation({user}:{user:WithId<UserDB> | null}) {

   return (
      <div className={styles.infomation}>
         <div className={styles.thumbnail}>
            {
               user?.thumbnail ?
                  <img src={user?.thumbnail} alt='유저 썸네일' />
               : <img src={'img/user_unknown.png'} alt='no-img' />
            }
         </div>
         <span className={styles.nickName}>{user?.nickName}</span>
         <Link href={'/infoEdit'}>개인정보 수정</Link>
      </div>
   )
}