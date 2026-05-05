import { useEditor } from '@tiptap/react'
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

export const useTiptapEditor = () => {
  return useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      // FontFamily,
      Underline,
      Strike,
      Link,
      Image,
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
    content: '<p>내용을 입력하세요</p>',
    immediatelyRender: false,
  })
}