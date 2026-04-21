'use client'
import { EditorContent, type Editor } from '@tiptap/react'
import styles from './Tiptap.module.css'

const TiptapEditor = ({editor}:{editor: Editor | null}) => {

  if (!editor) return null

  const addImage = () => {
    const url = prompt('이미지 URL을 입력하세요')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className={styles.editor_wrapper}>
      {/* 🔥 툴바 */}
      <div className={styles.toolBar}>
        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>

        {/* Image */}
        <button onClick={addImage}>
          Image
        </button>
      </div>

      {/* 에디터 */}
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor