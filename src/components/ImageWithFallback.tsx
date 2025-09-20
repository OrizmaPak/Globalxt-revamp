import { useEffect, useState } from 'react';
import clsx from 'clsx';

export type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

const defaultFallback = 'https://placehold.co/800x600?text=Image+Placeholder';

const ImageWithFallback = ({
  fallbackSrc = defaultFallback,
  src,
  className,
  ...rest
}: ImageWithFallbackProps) => {
  const [currentSrc, setCurrentSrc] = useState(src ?? fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src ?? fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      {...rest}
      src={currentSrc}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
      className={clsx('h-full w-full object-cover', className)}
    />
  );
};

export default ImageWithFallback;
