'use client';

import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';
import '@/components/tiptap-templates/simple/simple-editor.scss';

interface ContentProps {
  content: string | undefined;
}

const ToptabContent = ({ content }: ContentProps) => {
  if (!content) return null;

  return (
    <div
      className="tiptap ProseMirror simple-editor"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default ToptabContent;
