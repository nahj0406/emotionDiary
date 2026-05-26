'use client'

import { useEffect, useState } from 'react';
import styles from './comment.module.css'

export default function Comment ({post_id}:{post_id:string}) {
   
   const [data, setData] = useState([]);

   useEffect(()=> {
      fetch('/api/post/comment/list?id=' + post_id).then(r=> r.json())
      .then((result)=> {
         setData(result);
      })
   }, [post_id])

   return (
      <article className={styles.comment_box}>
         <h5>댓글 </h5>
         <ul className={styles.list}>
            {
               data.length > 0 ?
               data.map((item, i)=> {
                  return(
                     <li key={i} className={styles.item}>
                        {/* <p>{item?.name}</p> */}
                        {/* <p>{item?.content}</p> */}
                     </li>
                  )
               }) :
               <p>작성된 댓글이 없습니다.</p>
            }
         </ul>

         <div className={styles.write_box}>
            <textarea name="comment" id="comment" placeholder='욕설, 비방 등은 자제해 주세요.' />
            <button type='button'>작성하기</button>
         </div>
      </article>
   )
}