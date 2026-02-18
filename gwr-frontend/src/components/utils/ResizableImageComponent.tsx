import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';

export const ResizableImageComponent = ({ node, updateAttributes }: any) => {
  const [width, setWidth] = useState(node.attrs.width || 200);

  const handleResize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10);
    setWidth(newWidth);
    updateAttributes({ width: newWidth });
  };

  return (
    <NodeViewWrapper
      style={{
        position: 'relative',
        display: 'inline-block',
        maxWidth: '100%',
      }}
    >
      <img
        src={node.attrs.src}
        width={width}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '4px',
        }}
      />

      {/* 슬라이더 컨테이너 */}
      <div
        style={{
          position: 'absolute',
          bottom: '-25px',
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '0 5px',
        }}
      >
        <input
          type="range"
          min={50}
          max={800}
          value={width}
          onChange={handleResize}
          style={{
            width: '100%',
            cursor: 'pointer',
          }}
        />
      </div>
    </NodeViewWrapper>
  );
};
