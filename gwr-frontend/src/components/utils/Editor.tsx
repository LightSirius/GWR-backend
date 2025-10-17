'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: '<p>Hello World! 🌎️</p>',
    editorProps: {
      attributes: {
        class: 'border p-3 rounded min-h-[150px]',
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div>
      {/* 툴바 */}
      <div className="flex gap-2 mb-2 flex-wrap">
        {/* 텍스트 스타일 */}
        <button
          onClick={() => editor.chain().toggleBold().focus().run()}
          disabled={!editor.can().chain().toggleBold().focus().run()}
          className={`inline-block px-3 py-2 border rounded-md text-sm text-center hover:bg-gray-100
            ${editor.isActive('bold') ? 'bg-indigo-500 text-white' : 'bg-white text-gray-800'} 
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'italic text-blue-600' : ''}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={
            editor.isActive('underline') ? 'underline text-blue-600' : ''
          }
        >
          U
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={
            editor.isActive('strike') ? 'line-through text-blue-600' : ''
          }
        >
          S
        </button>

        {/* 헤딩 */}
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive('heading', { level: 1 }) ? 'text-blue-600' : ''
          }
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive('heading', { level: 2 }) ? 'text-blue-600' : ''
          }
        >
          H2
        </button>

        {/* 리스트 */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'text-blue-600' : ''}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'text-blue-600' : ''}
        >
          1. List
        </button>

        {/* 링크 */}
        <button
          onClick={() => {
            const url = prompt('Enter link URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={editor.isActive('link') ? 'text-blue-600' : ''}
        >
          Link
        </button>

        {/* 이미지 */}
        <button
          onClick={() => {
            const url = prompt('Enter image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          Image
        </button>
      </div>

      {/* 에디터 */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
