'use client'
import styles from './postCard.module.css'
import { PostCardDTO } from "@/types/interfaces"
import Image from 'next/image';
import { useRouter } from 'next/navigation'

export default function PostCard({item}: {item: PostCardDTO}) {
   const router = useRouter();
   const content = item.content.replace(/<[^>]*>/g, ''); // 텍스트 html 태그 제거

   return (
      <article 
         className={styles.postCard}
         onClick={()=> router.push(`/list/${item._id}`)}
      >
         <Image className={styles.thumbnail} src={item.thumbnail} fill alt={'책 썸네일'} />
         {/* no-img 추가해주기 */}
         <div className={styles.thumbnail_txt}>
            <h3>{item.title}</h3>
            {/* <p>{content}</p> */}
            <div className={styles.postInfo}>
               <div className={styles.userInfo}>
                  {
                     item.user?.thumbnail &&
                        <img src={item.user?.thumbnail} alt="유저 썸네일" />
                  }
                  <h5>{item.user?.nickName}</h5>
               </div>

               <div className={styles.recommend}>
                  좋아요: {item.recommend || 0}
               </div>
            </div>
         </div>
      </article>
   )
}