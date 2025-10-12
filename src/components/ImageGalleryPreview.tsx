import ImagePreview from './ImagePreview';

interface ImageGalleryPreviewProps {
  images: string[];
  onRemoveImage?: (index: number) => void;
  maxPreviewWidth?: number;
  maxPreviewHeight?: number;
  className?: string;
  extraImages?: string[];
}

const ImageGalleryPreview = ({ 
  images = [], 
  onRemoveImage,
  maxPreviewWidth = 100,
  maxPreviewHeight = 80,
  className = '',
  extraImages = []
}: ImageGalleryPreviewProps) => {
  const allImages = [...(extraImages || []), ...(images || [])];

  if (!allImages || allImages.length === 0) {
    return (
      <div className={`text-sm text-gray-500 italic ${className}`}>
        No gallery images
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="text-xs text-gray-600 mb-2">Gallery Images ({allImages.length})</div>
      <div className="flex flex-wrap gap-2">
        {allImages.map((imageUrl, index) => (
          <ImagePreview
            key={`${imageUrl}-${index}`}
            src={imageUrl}
            alt={`Gallery image ${index + 1}`}
            width={maxPreviewWidth}
            height={maxPreviewHeight}
            showRemove={!!onRemoveImage && index >= (extraImages?.length || 0)}
            onRemove={() => onRemoveImage?.(index - (extraImages?.length || 0))}
            placeholder={`Image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGalleryPreview;
