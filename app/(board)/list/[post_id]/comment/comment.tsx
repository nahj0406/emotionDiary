"use client";

import { useMemo, useState } from "react";
import styles from "./comment.module.css";
import { CommentDTO, recommendPostDTO } from "@/types/interfaces";
import NiceModal from "@ebay/nice-modal-react";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { useSessionChecker } from "@/hooks/useSessionChecker";
import { Session } from "next-auth";

const CommentWrite = ({
  post_id,
  parentCommentId,
  depth,
  onAddComment,
  onUpdateComment,
  updateItem,
  setUpdate,
  setOnWrite,
  checkSession,
}: {
  post_id: string;
  parentCommentId?: string | null;
  depth?: number;
  onAddComment: (comment: CommentDTO) => void;
  onUpdateComment: (comment: CommentDTO) => void;
  updateItem?: CommentDTO | null;
  setUpdate?: React.Dispatch<React.SetStateAction<CommentDTO | null>>
  setOnWrite?: React.Dispatch<React.SetStateAction<boolean>>
  checkSession: ()=> boolean;
}) => {

   const WriteComment_handler = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if(!checkSession()) {
         return NiceModal.show(ConfirmModal, {
            message: '로그인하고 이용해 주세요.'
         })
      }

      const form = e.currentTarget;
      const formData = new FormData(e.currentTarget);
      const content = formData.get("content") as string;
      const parentId = parentCommentId ?? null;

      if(!updateItem) { // 신규작성
         try {
            const res = await fetch("/api/post/comment/write", {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({
                  postId: post_id,
                  content,
                  parentId,
                  depth: depth !== undefined ? depth + 1 : 0,
               }),
            });

            const data = await res.json();

            if (!res.ok) {
               return NiceModal.show(ConfirmModal, {
                  message: data.message,
                  autoClose: 1000,
               });
            }

            onAddComment(data.comment);
            form.reset();

            return NiceModal.show(ConfirmModal, {
               message: "댓글이 등록되었습니다.",
               autoClose: 1000,
            });

         } catch (err) {
            console.error(err);
            return NiceModal.show(ConfirmModal, {
               message:
                  err instanceof Error ? err.message : "댓글 작성에 실패했습니다.",
               autoClose: 1000,
            });
         }

      } else { // 수정
         try {
            const res = await fetch("/api/post/comment/update", {
               method: "PUT",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({
                  cmt_id: updateItem?._id,
                  post_id: post_id,
                  content,
                  user_id: updateItem?.user.id,
               }),
            });

            const data = await res.json();

            if (!res.ok) {
               return NiceModal.show(ConfirmModal, {
                  message: data.message,
                  autoClose: 1000,
               });
            }
            setOnWrite?.(false);
            setUpdate?.(null);
            onUpdateComment(data.comment);
            form.reset();

         } catch (err) {
            console.error(err);
            return NiceModal.show(ConfirmModal, {
               message:
                  err instanceof Error ? err.message : "댓글 수정에 실패했습니다.",
               autoClose: 1000,
            });
         }
      }

      
   };

   return (
      <form className={styles.write_box} onSubmit={WriteComment_handler}>
         <textarea
            name="content"
            id="content"
            placeholder="욕설, 비방 등은 자제해 주세요."
            defaultValue={updateItem?.content}
         />
         <button type="submit">작성하기</button>
      </form>
   );
};

CommentWrite.displayName = "CommentWrite";

function CommentItem({
   item,
   post_id,
   comments,
   onAddComment,
   onUpdateComment,
   onDeleteComment,
   checkSession,
}: {
   item: CommentDTO;
   post_id: string;
   comments: CommentDTO[];
   onAddComment: (comment: CommentDTO) => void;
   onUpdateComment: (comment: CommentDTO) => void;
   onDeleteComment: (
      deletedId: string,
      updatedComment?: CommentDTO
   ) => void;
   checkSession: ()=> boolean;
}) {
   const createdAt = new Date(item?.createdAt).toLocaleString("ko-KR");
   const children = comments.filter(
      (comment) => comment.parentCommentId === item._id,
   );

   const [onWrite, setOnWrite] = useState<boolean>(false);
   const [update, setUpdate] = useState<CommentDTO | null>(null);

   const deleteComment_handler = async () => {

      if(!checkSession()) {
         return NiceModal.show(ConfirmModal, {
            message: '로그인하고 이용해 주세요.'
         })
      }

      await NiceModal.show(ConfirmModal, {
         message: '댓글을 삭제하시겠습니까?',
         closeBtn: false,
      })

      try {
         const res = await fetch(`/api/post/comment/delete?cmt_id=${item._id}&user_id=${item.user.id}`, {
            method: 'DELETE',
            headers: {
               "Content-Type": "application/json",
            },
         })

         const data = await res.json();

         if(!res.ok) {
            return NiceModal.show(ConfirmModal, {
               message: data.message,
               autoClose: 1000,
            })
         }

         if(data.type === 'deleted') {
            onDeleteComment(item._id);
         }

         if(data.type === 'softDeleted') {
            onDeleteComment(item._id, data.comment);
         }

         return NiceModal.show(ConfirmModal, {
            message: "댓글이 삭제되었습니다.",
            autoClose: 1000,
         });

      } catch(err) {
         console.error(err);
         return NiceModal.show(ConfirmModal, {
            message:
               err instanceof Error ? err.message : "댓글 삭제에 실패했습니다.",
            autoClose: 1000,
         });
      }
   }


   const [loading, setLoading] = useState<boolean>(false);
   const [liked, setLiked] = useState<boolean>(false);
   const [count, setCount] = useState<number>(item?.recommend || 0);

   const post_good_handler = async () => {
      if(!checkSession()) {
         return NiceModal.show(ConfirmModal, {
            message: '로그인하고 이용해 주세요.'
         })
      }

      if(loading) return

      setLoading(true);

      try {
         if(!liked) {
            setCount(prev => prev + 1)
         } else {
            setCount(prev => prev - 1)
         }

         const res = await fetch('/api/post/comment/recommend', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               id: item._id,
            })
         })

         const result = await res.json();

         if(!res.ok) {
            return console.error('좋아요 기능에 에러가 발생했습니다.');
         }

         setCount(result.recommend);
         setLiked(result.liked);

      } finally {
         setLoading(false);
      }
   }

   return (
      <div className={styles.item} style={{'--depth': `${item.depth}`} as React.CSSProperties}>
         <div className={styles.content_box}>
            <div className={styles.cmt_header}>
               <div className={styles.unit}>
                  <b className={styles.name}>{item?.user.nickName}</b>
                  <p>{createdAt}</p>
               </div>
               <button disabled={loading} onClick={post_good_handler}>
                  좋아요 : {count}개
               </button>
               {!item?.isDeleted && 
                  <>
                     <div className={styles.btn_group}>
                        <button type="button" onClick={()=> {setUpdate(item); setOnWrite(prev=> !prev);}}>수정</button>
                        <button type="button" onClick={deleteComment_handler}>삭제</button>
                     </div>
                     <button type="button" onClick={()=> setOnWrite(prev=> !prev)}>댓글 쓰기</button>
                  </>
               }
            </div>
            {(item?.updatedAt && !item.isDeleted) && <p>[수정됨]</p>}
            <p>{item?.content}</p>
         </div>
         {
            onWrite &&
            <div className={styles.write_frame}>
               <button onClick={()=> setOnWrite(false)}>닫기</button>
               <CommentWrite
                  post_id={post_id}
                  parentCommentId={item._id}
                  depth={item?.depth}
                  onAddComment={onAddComment}
                  onUpdateComment={onUpdateComment}
                  updateItem={update}
                  setUpdate={setUpdate}
                  setOnWrite={setOnWrite}
                  checkSession={checkSession}
               />
            </div>
         }

         {children.map((child) => {
            return (
               <CommentItem
                  key={child._id}
                  item={child}
                  post_id={post_id}
                  comments={comments}
                  onAddComment={onAddComment}
                  onUpdateComment={onUpdateComment}
                  onDeleteComment={onDeleteComment}
                  checkSession={checkSession}
               />
            );
         })}
      </div>
   );
}

export default function Comment({
      post_id,
      comment_list,
      session,
   }: {
      post_id: string;
      comment_list: CommentDTO[];
      session: Session | null;
}) {
   const [list, setList] = useState(comment_list);
   const { checkSession } = useSessionChecker(session);

   const handleAddComment = (comment: CommentDTO) => {
      setList(prev=> [...prev, comment])
   }

   const handleUpdateComment = (updatedComment: CommentDTO) => {
      setList(
         prev=> prev.map(comment =>
               comment._id === updatedComment._id 
               ? {
                     ...comment,
                     ...updatedComment
                  } 
               : comment
      ))
   }

   const handleDeleteComment = (deletedId: string, updatedComment?: CommentDTO) => {
      setList(prev => {
         // 소프트 삭제일때
         if (updatedComment) {
            return prev.map(comment =>
               comment._id === updatedComment._id ? updatedComment : comment
            );
         }
         // 일반 삭제일때
         return prev.filter(comment => comment._id !== deletedId);
      });
   };

   const firstList = useMemo(() => {
     return list.filter(
       comment => comment.parentCommentId === null
     );
   }, [list]);

   const [page, setPage] = useState(1);
   const pageSize = 10;
   const totalPage = Math.max(
      1,
      Math.ceil(firstList.length / pageSize)
   );

   const pageGroup = Math.ceil(page / 10);
   const startPage = (pageGroup - 1) * 10 + 1;

   const endPage = Math.min(startPage + 9, totalPage);

   const pageNumbers = [];

   for(let i = startPage; i <= endPage; i++) {
     pageNumbers.push(i);
   }

   const currentList = firstList.slice((page - 1) * pageSize, page * pageSize);

   return (
      <article className={styles.comment_box}>
         <h5>댓글 {list.length}개</h5>
         <div className={styles.list}>
            {currentList.length > 0 ? (
               currentList.map((item, i) => {
                  return (
                  <CommentItem
                     key={`${i}_${post_id}`}
                     item={item}
                     post_id={post_id}
                     comments={list}
                     onAddComment={handleAddComment}
                     onUpdateComment={handleUpdateComment}
                     onDeleteComment={handleDeleteComment}
                     checkSession={checkSession}
                  />
                  );
               })
            ) : (
               <p>작성된 댓글이 없습니다.</p>
            )}
         </div>

         <CommentWrite 
            post_id={post_id} 
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment} 
            checkSession={checkSession}
         />

         <div className={styles.pagination}>
            {startPage > 1 && (
               <button
                  type="button"
                  onClick={() => setPage(startPage - 1)}
               >
                  이전
               </button>
            )}

            {pageNumbers.map(number => (
               <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  className={
                  page === number
                     ? styles.active
                     : ''
                  }
               >
                  {number}
               </button>
            ))}

            {endPage < totalPage && (
               <button
                  type="button"
                  onClick={() => setPage(endPage + 1)}
               >
                  다음
               </button>
            )}
            </div>
      </article>
   );
}
