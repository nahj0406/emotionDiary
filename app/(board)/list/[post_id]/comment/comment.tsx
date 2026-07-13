"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./comment.module.css";
import { CommentDTO } from "@/types/interfaces";
import NiceModal from "@ebay/nice-modal-react";
import ConfirmModal from "@/components/modals/confirmModal/ConfirmModal";
import { useSessionChecker } from "@/hooks/useSessionChecker";
import { Session } from "next-auth";
import UserThumbnail from "@/components/ui/img/user_thumbnail/userThumbnail";
import SvgIcon from "@/components/ui/img/svg/icon/svgIcon";
import PagiNation from "@/components/ui/paging/pagination/pagination";
import clsx from "clsx";

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

   const currentList = firstList.slice((page - 1) * pageSize, page * pageSize);

   return (
      <article className={styles.comment_box}>
         <h5>댓글 {list.length}개</h5>

         <div className={styles.first_write}>
            <CommentWrite 
               post_id={post_id} 
               onAddComment={handleAddComment}
               onUpdateComment={handleUpdateComment} 
               checkSession={checkSession}
            />
         </div>

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
                     session={session}
                     idx={i}
                  />
                  );
               })
            ) : (
               <p>작성된 댓글이 없습니다.</p>
            )}
         </div>

         <PagiNation 
            page={page} 
            totalItems={firstList.length}
            pageSize={pageSize}
            onPageChange={setPage}
         />
      </article>
   );
}

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

   const textRef = useRef<HTMLTextAreaElement>(null);

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
      <motion.form 
         className={styles.write_box} 
         onSubmit={WriteComment_handler}

         key="modal-overlay"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.2 }}
      >
         <textarea
            ref={textRef}
            name="content"
            id="content"
            placeholder="욕설, 비방 등은 자제해 주세요."
            defaultValue={updateItem?.content}

            onFocus={()=> {
               if(textRef.current) {
                  textRef.current.classList.add(styles.active)
               }
            }}

            onBlur={()=> {
               if(textRef.current) {
                  textRef.current.classList.remove(styles.active)
               }
            }}
         />
         <div className={styles.btn_box}>
            <button type="button" onClick={()=> {
               if (setOnWrite) {
                  setOnWrite(false);
               } else if (textRef.current) {
                  textRef.current.value = '';
               }

            }} className={styles.cancel}>취소</button>
            <button className={styles.submit} type="submit">작성하기</button>
         </div>
      </motion.form>
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
   session,
   idx,
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
   session: Session | null;
   idx: number;
}) {
   const createdAt = new Date(item?.createdAt).toLocaleString("ko-KR");
   const children = comments.filter(
      (comment) => comment.parentCommentId === item._id,
   );

   const [onWrite, setOnWrite] = useState<boolean>(false);
   const [update, setUpdate] = useState<CommentDTO | null>(null);
   const [loading, setLoading] = useState<boolean>(false);
   const [count, setCount] = useState<number>(item?.recommend || 0);
   const [liked, setLiked] = useState<boolean>(false);
   const [rplyToggle, setRplyToggle] = useState<boolean>(false);

   useEffect(()=> {
      const checkLiked = async () => {
         const res = await fetch('/api/post/comment/recommend/?comment_id=' + item._id);
         const result = await res.json();
         setLiked(result.liked);
      }

      checkLiked();
   }, []);

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
      <motion.div className={
            clsx(
               styles.item, 
               {[styles.child]:item.parentCommentId},
               {[styles.child_container]:children.length > 0}
            )
         }
         style={{'--depth': `${item.depth}`, '--thumnail_size': 30} as React.CSSProperties}

         initial={{ opacity: 0, y: -2 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0 }}
         transition={{ duration: idx * 0.01 }}
      >
         {children.length > 0 && 
            <div className={styles.rply_line}>
               <button type="button" className={styles.rply_toggle} onClick={()=> setRplyToggle((prev)=> !prev)}>
                  {
                     rplyToggle ? '답글 숨기기' : `답글 ${children.length} 개`
                  }
               </button>
            </div>
         }

         <div className={styles.content_box}>

            <div className={styles.cmt_header}>
               <div className={styles.unit}>
                  <UserThumbnail thumbnail={item.user.thumbnail} />
                  <b className={clsx(styles.name, {[styles.own]:session?.user.id === item?.user.id})}>{item?.user.nickName}</b>
               </div>
               <p className={styles.text1}>{createdAt}</p>
               {(item?.updatedAt && !item.isDeleted) && <p className={styles.text1}>[수정됨]</p>}
               
               {!item?.isDeleted && 
                  <div className={styles.edit_status}>
                     {session?.user.id === item.user.id && 
                        <div className={styles.btn_group}>
                           <button type="button" onClick={()=> {setUpdate(item); setOnWrite(prev=> !prev);}}>수정</button>
                           <button type="button" onClick={deleteComment_handler}>삭제</button>
                        </div>
                     }
                  </div>
               }
            </div>

            <div className={styles.content}>
               <p className={clsx(styles.text, {[styles.own]:session?.user.id === item?.user.id})}>{item?.content}</p>

               <div className={styles.content_action}>
                     <button 
                        disabled={loading} 
                        onClick={()=> !item?.isDeleted && post_good_handler()}
                        className={clsx(styles.recommend, {[styles.liked]:liked})}>
                        <SvgIcon name={'heart'} width="18"></SvgIcon> {count}
                     </button>
                  {
                     !item?.isDeleted &&
                     <button 
                        className={styles.rply_btn} 
                        type="button" 
                        onClick={()=> setOnWrite(prev=> !prev)}
                        >
                           답글
                        </button>
                  }
               </div>
            </div>
         </div>
         {
            onWrite &&
               <AnimatePresence>
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
               </AnimatePresence>
         }

         {
            rplyToggle &&
            children.map((child, i) => {
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
                     session={session}
                     idx={i}
                  />
               );
            })
         }
      </motion.div>
   );
}
