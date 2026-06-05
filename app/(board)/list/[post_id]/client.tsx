'use client'
import { useEffect, useState } from 'react';
import styles from './page.module.css'
import DOMPurify from 'isomorphic-dompurify'; 
import { recommendPostDTO } from '@/types/interfaces';
import { Session } from 'next-auth';
import { useSessionChecker } from '@/hooks/useSessionChecker';
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
         const res = await fetch('/api/post/recommend/?postId=' + postItem._id);
         const result = await res.json();
         console.log(result);
         setLiked(result.liked);
      }
      checkLiked();
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

         const res = await fetch('/api/post/recommend', {
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