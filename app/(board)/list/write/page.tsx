'use client'
import SubmitBtn from "@/components/button/submitBtn/submit_btn"
import { useRouter } from "next/navigation"
import styles from './page.module.css'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TiptapEditor from "@/components/Editor/Tiptap";
import clsx from "clsx";
import { useRef } from "react"
import ConfirmModal from '@/components/modals/ConfirmModal';
import NiceModal from "@ebay/nice-modal-react";

export default function Write() {

   const router = useRouter();
   const formRef = useRef<HTMLFormElement>(null);


   const editor = useEditor({
    content: '<p>내용을 입력해 주세요.</p>',
    extensions: [
      StarterKit,
      Image,
    ],
    immediatelyRender: false,
  })

  const handleSubmit = async (e: React.MouseEvent) => {
   e.preventDefault();

   if(!formRef.current || !editor) return

   const formData = new FormData(formRef.current)

   const data = {
      title: formData.get('title'),
      content: editor?.getHTML(),
   }

   try {
      const res = await fetch('/api/post/write', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })

      await NiceModal.show(ConfirmModal, {
        message: "글이 등록되었습니다.",
        autoClose: 1000,
      });

      if (!res.ok) throw new Error('에러')
   } catch (err) {
      await NiceModal.show(ConfirmModal, {
        message: "작성이 실패했습니다.",
        autoClose: 1000,
      });
      console.error(err)
   }
  }

   return (
      <section className={clsx(styles.layer_box, 'containerV1')}>
         <h4 className={styles.title}>글 작성하기</h4>

         <form ref={formRef} className={styles.form}>
            <div className={styles.content}>
               <input className={styles.input} type="text" name="title" placeholder="제목을 입력해 주세요." />
               <TiptapEditor editor={editor}></TiptapEditor>
            </div>

            <div className={styles.buttonBox}>
               <SubmitBtn content={'취소'} submit={false} onClick={()=> router.back()}/>
               <SubmitBtn content={'작성 완료'} onClick={(e)=> {handleSubmit(e)}}/>
            </div>
         </form>
      </section>
   )
}