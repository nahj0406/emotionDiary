"use client";

import { useState } from "react";
import styles from "./comment.module.css";
import { CommentDTO } from "@/types/interfaces";
import NiceModal from "@ebay/nice-modal-react";
import ConfirmModal from "@/components/modals/ConfirmModal";

const CommentWrite = ({
  post_id,
  parentCommentId,
  depth,
  onAddComment,
  onUpdateComment,
  updateItem,
  setUpdate,
  setOnWrite,
}: {
  post_id: string;
  parentCommentId?: string | null;
  depth?: number;
  onAddComment: (comment: CommentDTO) => void;
  onUpdateComment: (comment: CommentDTO) => void;
  updateItem?: CommentDTO | null;
  setUpdate?: React.Dispatch<React.SetStateAction<CommentDTO | null>>
  setOnWrite?: React.Dispatch<React.SetStateAction<boolean>>
}) => {

   const WriteComment_handler = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

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
}) {
   const createdAt = new Date(item?.createdAt).toLocaleString("ko-KR");
   const children = comments.filter(
      (comment) => comment.parentCommentId === item._id,
   );

   const [onWrite, setOnWrite] = useState<boolean>(false);
   const [update, setUpdate] = useState<CommentDTO | null>(null);

   const deleteComment_handler = async () => {

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

   return (
      <div className={styles.item} style={{'--depth': `${item.depth}`} as React.CSSProperties}>
         <div className={styles.content_box}>
            <div className={styles.cmt_header}>
               <div className={styles.unit}>
                  <b className={styles.name}>{item?.user.nickName}</b>
                  <p>{createdAt}</p>
               </div>
               <p>{item?.recommend || 0}개</p>
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
               />
            );
         })}
      </div>
   );
}

export default function Comment({
      post_id,
      comment_list,
   }: {
      post_id: string;
      comment_list: CommentDTO[];
}) {
   const [list, setList] = useState(comment_list);

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

   const firstList = list.filter((comment) => comment.parentCommentId === null);

   return (
      <article className={styles.comment_box}>
         <h5>댓글 {list.length}개</h5>
         <div className={styles.list}>
            {firstList.length > 0 ? (
               firstList.map((item, i) => {
                  return (
                  <CommentItem
                     key={`${i}_${post_id}`}
                     item={item}
                     post_id={post_id}
                     comments={list}
                     onAddComment={handleAddComment}
                     onUpdateComment={handleUpdateComment}
                     onDeleteComment={handleDeleteComment}
                  />
                  );
               })
            ) : (
               <p>작성된 댓글이 없습니다.</p>
            )}
         </div>

         <CommentWrite post_id={post_id} onAddComment={handleAddComment} onUpdateComment={handleUpdateComment} />
      </article>
   );
}
