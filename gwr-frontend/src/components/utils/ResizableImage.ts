import { Node, mergeAttributes } from '@tiptap/core';

export interface ResizableImageOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: {
        src: string;
        width: number;
        height?: string;
      }) => ReturnType;
    };
  }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'resizableImage',

  inline: false,
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      src: { default: '' },
      width: { default: 200 },
      height: { default: 'auto' },
    };
  },

  parseHTML() {
    return [{ tag: 'img' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['img', mergeAttributes(node.attrs, HTMLAttributes)];
  },
});
