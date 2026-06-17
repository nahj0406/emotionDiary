import { Editor, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
// import FontFamily from '@tiptap/extension-font-family'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Blockquote from '@tiptap/extension-blockquote'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import { Extension } from '@tiptap/core'
import { useRef } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import ConfirmModal from '@/components/modals/ConfirmModal'

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      publicId: {
        default: null,
        parseHTML: element => element.getAttribute('data-public-id'),
        renderHTML: attributes => {
          if (!attributes.publicId) return {}

          return {
            'data-public-id': attributes.publicId,
          }
        },
      },
    }
  },
})

export const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}

              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize })
            .run()
        },
    }
  },
})

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {}
              }

              return {
                style: `line-height: ${attributes.lineHeight}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ chain }) => {
          return chain()
            .setNode('paragraph', { lineHeight })
            .run()
        },
    }
  },
})

type UseTiptapEditorProps = {
  editContent?: string
  onUploadImage?: (publicId: string) => void
}

export const useTiptapEditor = ({
  editContent,
  onUploadImage,
}: UseTiptapEditorProps) => {
  const editorRef = useRef<Editor | null>(null)

  const uploadImage = async (
    file: File,
    position?: number
  ) => {
    try {
      if (file.size > 5 * 1024 * 1024) {
         NiceModal.show(ConfirmModal, {
            message: '5MB 이하 이미지만 업로드 가능합니다.',
         })
         return
      }

      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/post/editor/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || '이미지 업로드 실패')
      }

      const editor = editorRef.current
      if (!editor) return

      onUploadImage?.(data.publicId)

      const imageNode = {
        type: 'image',
        attrs: {
          src: data.url,
          publicId: data.publicId,
        },
      }

      if (typeof position === 'number') {
        editor
          .chain()
          .focus()
          .insertContentAt(position, imageNode)
          .run()

        return
      }

      editor
        .chain()
        .focus()
        .insertContent(imageNode)
        .run()
    } catch (error) {
      console.error(error)
      alert('이미지 업로드 중 오류가 발생했습니다.')
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Strike,

      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),

      CustomImage,

      HorizontalRule,
      Blockquote,
      BulletList,
      OrderedList,
      FontSize,
      LineHeight,

      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],

    onCreate({ editor }) {
      editorRef.current = editor
    },

    editorProps: {
      handleDrop(view, event) {
        const files = event.dataTransfer?.files
        if (!files?.length) return false

        const file = files[0]

        if (!file.type.startsWith('image/')) {
          return false
        }

        const coordinates = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })

        uploadImage(file, coordinates?.pos)

        return true
      },

      handlePaste(view, event) {
        const items = event.clipboardData?.items
        if (!items) return false

        for (const item of items) {
          if (!item.type.startsWith('image/')) continue

          const file = item.getAsFile()
          if (!file) continue

          uploadImage(file)

          return true
        }

        return false
      },
    },

    content: editContent ?? '<p>내용을 입력하세요</p>',
    immediatelyRender: false,
  })

  return editor
}