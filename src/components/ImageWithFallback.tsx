import { useEffect, useState } from 'react';
import clsx from 'clsx';

export type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

import fallbackPlaceholder from '../assets/images/placeholder.jpg';

const defaultFallback = fallbackPlaceholder;

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
      className={clsx('h-full w-full object-cover11', className)}
    />
  );
};

export default ImageWithFallback;
