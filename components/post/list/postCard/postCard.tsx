'use client'
import styles from './postCard.module.css'
import { PostCardDTO } from "@/types/interfaces"
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import { deletePostOne } from '@/utils/requester/requester';
import NiceModal from '@ebay/nice-modal-react';
import ConfirmModal from '@/components/modals/confirmModal/ConfirmModal';
import SvgIcon from '@/components/ui/img/svg/icon/svgIcon';

export default function PostCard({item, editMode}: {item: PostCardDTO; editMode?: boolean}) {
   const router = useRouter();
   const content = item.content.replace(/<[^>]*>/g, ''); // 텍스트 html 태그 제거

   const handle_delete = async (postId: string) => {
      const lastCheck = await NiceModal.show(ConfirmModal, {
         message: '게시물을 삭제하시겠습니까?\n한번 삭제되면 복구가 불가능합니다.',
         closeBtn: true,
      })

      if(!lastCheck) return

      try {
         await deletePostOne(postId);

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
         onClick={()=> router.push(`/list/${item._id}`)}
      >
         <Image 
            className={styles.thumbnail} src={item.thumbnail} fill alt={'책 썸네일'} 
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
                  <SvgIcon name='heart' width='18px' /> {item.recommend || 0}
               </div>
            </div>
         </div>
         {
            editMode &&
            <div className={styles.edit_btns}>
               <button type='button' onClick={()=> router.push(`/write?edit=${item._id}`)}>수정</button>
               <button type='button' onClick={()=> handle_delete(item._id)}>삭제</button>
            </div>
         }
      </article>
   )
}