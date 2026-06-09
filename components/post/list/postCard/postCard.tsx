'use client'
import styles from './postCard.module.css'
import { PostCardDTO } from "@/types/interfaces"
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import deleteOne from '@/lib/mongoDB/deletePostOne';
import NiceModal from '@ebay/nice-modal-react';
import ConfirmModal from '@/components/modals/ConfirmModal';

export default function PostCard({item, editMode}: {item: PostCardDTO; editMode?: boolean}) {
   const router = useRouter();
   const content = item.content.replace(/<[^>]*>/g, ''); // 텍스트 html 태그 제거

   const handle_delete = async (post: PostCardDTO) => {
      try {
         await deleteOne(post);

         NiceModal.show(ConfirmModal, {
            message: '게시물이 성공적으로 삭제되었습니다.',
            autoClose: 1000,
         })

         router.refresh();
      } catch (err) {
         console.error(err);
         return NiceModal.show(ConfirmModal, {
            message: '삭제에 실패했습니다.',
            autoClose: 1000,
         })
      }
   }

   return (
      <article 
         className={styles.postCard}
      >
         <Image 
            className={styles.thumbnail} src={item.thumbnail} fill alt={'책 썸네일'} 
            onClick={()=> router.push(`/list/${item._id}`)}
         />
         {/* no-img 추가해주기 */}
         <div className={styles.thumbnail_txt}>
            <h3>{item.title}</h3>
            {/* <p>{content}</p> */}
            <div className={styles.postInfo}>
               <div className={styles.userInfo}>
                  {
                     item.user?.thumbnail
                        ? <img src={item.user?.thumbnail} alt="유저 썸네일" />
                        : <img src={'/img/unknown.png'} width={20} alt="기본 이미지" />
                  }
                  <h5>{item.user?.nickName}</h5>
               </div>

               <div className={styles.recommend}>
                  좋아요: {item.recommend || 0}
               </div>
            </div>
         </div>
         {
            editMode &&
            <div className={styles.edit_btns}>
               <button type='button' onClick={()=> router.push(`/write?edit=${item._id}`)}>수정</button>
               <button type='button' onClick={()=> handle_delete(item)}>삭제</button>
            </div>
         }
      </article>
   )
}