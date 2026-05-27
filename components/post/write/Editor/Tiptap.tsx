'use client'
import { EditorContent, Editor } from '@tiptap/react'
import styles from './Tiptap.module.css'

type Props = {
  editor: Editor | null
}

const TiptapEditor = ({ editor }: Props) => {
  if (!editor) return null

  const addImage = () => {
    const url = prompt('이미지 URL 입력')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const url = prompt('링크 URL')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const insertSymbol = (symbol: string) => {
    editor.chain().focus().insertContent(symbol).run()
  }

  return (
    <div className={styles.editor_wrapper}>
      <div className={styles.toolBar}>
        
        {/* 글꼴 */}
        {/* <select onChange={(e) =>
          editor.chain().focus().setFontFamily(e.target.value).run()
        }>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times</option>
        </select> */}

        {/* 폰트 사이즈 */}
        <select 
          defaultValue="14px"
          onChange={(e) =>
            editor.chain().focus().setFontSize(e.target.value).run()
        }>
          <option value="12px">12</option>
          <option value="13px">13</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="24px">24</option>
          <option value="32px">32</option>
        </select>

        {/* 줄 간격 */}
        <select onChange={(e) =>
          editor.chain().focus().setLineHeight(e.target.value).run()
        }>
          <option value="1">1</option>
          <option value="1.5">1.5</option>
          <option value="2">2</option>
        </select>

        {/* 스타일 */}
        <button type='button' onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type='button' onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type='button' onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button type='button' onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>

        {/* 색상 */}
        <input
          type="color"
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
        />

        <button type='button' onClick={() => insertSymbol('★')}>★</button>
        <button type='button' onClick={() => insertSymbol('→')}>→</button>

        {/* 전체 서식 제거 */}
        <button type='button' onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          Clear
        </button>

        {/* 정렬 */}
        <button type='button' onClick={() => editor.chain().focus().setTextAlign('left').run()}>왼쪽정렬</button>
        <button type='button' onClick={() => editor.chain().focus().setTextAlign('center').run()}>중앙정렬</button>
        <button type='button' onClick={() => editor.chain().focus().setTextAlign('right').run()}>오른쪽정렬</button>
        <button type='button' onClick={() => editor.chain().focus().setTextAlign('justify').run()}>양쪽정렬</button>

        {/* 리스트 */}
        <button type='button' onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          OL
        </button>
        <button type='button' onClick={() => editor.chain().focus().toggleBulletList().run()}>
          UL
        </button>

        {/* 들여쓰기 */}
        <button type='button' onClick={() => editor.chain().focus().sinkListItem('listItem').run()}>
          Tab
        </button>

        {/* 링크 */}
        <button type='button' onClick={setLink}>링크</button>

        {/* 인용문 */}
        <button type='button' onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          인용문
        </button>

        {/* 구분선 */}
        <button type='button' onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          구분선
        </button>

        {/* 이미지 */}
        <button type='button' onClick={addImage}>외부이미지 삽입</button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor