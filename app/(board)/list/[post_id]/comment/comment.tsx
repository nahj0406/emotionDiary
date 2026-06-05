'use client'

import {forwardRef, useEffect, useRef, useState } from 'react';
import styles from './comment.module.css'
import { CommentDB } from '@/types/interfaces';


const CommentWrite = ({post_id}: {post_id : string}) => {

   const postComment_handler = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const postId = formData.get(post_id) as string;
      const content = formData.get('content') as string;

      await fetch('/api/post/comment/write', {
         method: 'POST',
         body: JSON.stringify({
            postId,
            content,
         })
      })
   }

  return (
    <form className={styles.write_box} onSubmit={postComment_handler}>
      <textarea name="comment" id="comment" placeholder='욕설, 비방 등은 자제해 주세요.' />
      <button type='submit'>작성하기</button>
   </form>
  );
};

CommentWrite.displayName = "CommentWrite";


export default function Comment ({post_id, comment_list}:{post_id: string; comment_list: CommentDB[]}) {
   
   const [list, setList] = useState(comment_list);

   // useEffect(()=> {


   //    // fetch('/api/post/comment/write?id=' + post_id).then(r=> r.json())
   //    // .then((result)=> {
   //    //    setData(result);
   //    // })
   // }, [post_id])

   return (
      <article className={styles.comment_box}>
         <h5>댓글 </h5>
         <ul className={styles.list}>
            {
               list.length > 0 ?
               list.map((item, i)=> {

                  const createdAt = 
                     new Date(item?.createdAt).toLocaleString('ko-KR');

                  return(
                     <li key={i} className={styles.item}>
                        <p>{item?.nickName}</p>
                        <p>{item?.content}</p>
                        <p>{createdAt}</p>
                        <p>{item?.recommend || 0}개</p>
                        {/* <CommentWrite post_id={post_id} id={item?.parentCommentId} depth={item?.depth} /> */}
                     </li>
                  )
               }) :
               <p>작성된 댓글이 없습니다.</p>
            }
         </ul>

         <CommentWrite post_id={post_id} />
      </article>
   )
}