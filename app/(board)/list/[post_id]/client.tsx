'use client'
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import DOMPurify from 'isomorphic-dompurify'; 
import { PostDTO, recommendPostDTO } from '@/types/interfaces';
import { Session } from 'next-auth';
import { useSessionChecker } from '@/hooks/useSessionChecker';
import { deletePostOne } from '@/utils/requester/requester';
import NiceModal from '@ebay/nice-modal-react';
import ConfirmModal from '@/components/modals/confirmModal/ConfirmModal';
import { useRouter } from 'next/navigation';
// html 렌더링 할때 필요. 원래는 dompurify만 써도 되는데 이게 브라우저 전용이라
// next.js는 서버환경도 같이 하다 보니 에러가 나서 둘 다 적용 가능한 isomorphic-dompurify 이걸로 바꿈
// dangerouslySetInnerHTML 리액트에 탑재된 html 렌더링용 코드

export function ContentBox ({contentDB}:{contentDB: {content : string}}) {
   return (
      <div className={styles.content}>
         <div
            dangerouslySetInnerHTML={{
               __html: DOMPurify.sanitize(contentDB.content),
            }}
         />
      </div>
   )
}


export function DeleteBtn ({postId}:{postId: string}) {

   const router = useRouter();


   const handle_delete = async (item: string) => {
      const lastCheck = await NiceModal.show(ConfirmModal, {
         message: '게시물을 삭제하시겠습니까?\n한번 삭제되면 복구가 불가능합니다.',
         closeBtn: true,
      })

      if(!lastCheck) return

      try {
         if(item) {
            await deletePostOne(item);

            NiceModal.show(ConfirmModal, {
               message: '게시물이 성공적으로 삭제되었습니다.',
               autoClose: 1000,
            })

            router.back();
         } else {
            NiceModal.show(ConfirmModal, {
               message: '게시물 삭제를 위한 데이터를 불러오지 못했습니다.',
               autoClose: 1000,
            })
         }
         
      } catch (err) {
         console.error(err);
         return NiceModal.show(ConfirmModal, {
             message: err instanceof Error
               ? err.message
               : '게시물 삭제에 실패했습니다.',
            autoClose: 1000,
         })
      }
   }

   return (
      <button type='button' onClick={()=> handle_delete(postId)}>삭제</button>
   )
}


export function Recommend (
   {
      session,
      postItem
   }:{
      session: Session | null;
      postItem: recommendPostDTO;
   }
) {
   const [liked, setLiked] = useState<boolean>(false);
   const [count, setCount] = useState<number>(postItem?.recommend || 0);
   const [loading, setLoading] = useState<boolean>(false);
   const { checkSession } = useSessionChecker(session);

   useEffect(()=> {
      const checkLiked = async () => {
         const res = await fetch('/api/post/list/view/recommend/?postId=' + postItem._id);
         const result = await res.json();
         setLiked(result.liked);
      }

      checkLiked();

      const Checkrecently = async () => {
         const res = await fetch(
            '/api/post/list/view/recently',
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  postId: postItem._id,
               })
            }
         );
         const result = await res.json();
      }
      Checkrecently();

   }, [postItem._id]);



   const post_good_handler = async () => {

      if (!checkSession()) return; // 로그인 안하면 버튼 비활성 처리

      if(loading) return

      setLoading(true);

      try {
         if(!liked) { // ui 표시용
            setCount(prev => prev +1)
         } else {
            setCount(prev => prev -1)
         }

         const res = await fetch('/api/post/list/view/recommend', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               id: postItem._id,
            })
         });

         const result = await res.json();

         setCount(result.recommend);
         setLiked(result.liked);

      } finally {
         setLoading(false);
      }

   }

   return (
      <div className={styles.good_box}>
         <button disabled={loading} onClick={post_good_handler} className={styles.recommend_btn}>
            {liked ? '❤️' : '🤍'} 좋아요 {count}
         </button>
      </div>
   )
}