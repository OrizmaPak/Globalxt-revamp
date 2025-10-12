import { useEffect, useState } from 'react';
import ImageWithFallback from './ImageWithFallback';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  showRemove?: boolean;
  onRemove?: () => void;
  placeholder?: string;
  caption?: string;
  captionClassName?: string;
}

const ImagePreview = ({
  src,
  alt = 'Preview',
  width = 120,
  height = 80,
  className = '',
  showRemove = false,
  onRemove,
  placeholder = 'No image selected',
  caption,
  captionClassName = 'mt-1 text-[11px] text-slate-600 truncate'
}: ImagePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (src && src.trim() !== '') {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [src]);

  if (!src || src.trim() === '') {
    return (
      <div className={className} style={{ width: `${width}px` }}>
        <div
          className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm`}
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {placeholder}
        </div>
        {caption ? <div className={captionClassName}>{caption}</div> : null}
      </div>
    );
  }

  return (
    <div className={className} style={{ width: `${width}px` }}>
      <div className={`relative inline-block`} style={{ width: `${width}px`, height: `${height}px` }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-xs text-gray-500">Loading...</div>
          </div>
        )}
        <ImageWithFallback
          src={src}
          alt={alt}
          className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          style={{ width: `${width}px`, height: `${height}px` }}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
        {showRemove && onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white transition-colors hover:bg-red-600"
            title="Remove image"
          >
            x
          </button>
        )}
      </div>
      {caption ? <div className={captionClassName}>{caption}</div> : null}
    </div>
  );
};

export default ImagePreview;
