import React from 'react';

const Img = ({ src, variant, className, onLoad }) => {
  if (typeof src === 'object' && !('name' in src)) console.warn(`WARNING: Image with empty {}: ${variant} ${className || ''}`);

  if (typeof src === 'object' && ('name' in src) && (src.name.includes('.svg') || src.name.includes('.gif'))) return (<img src={src.urls.original} alt={src.alt} className={className} onLoad={onLoad} />);
  if (typeof src === 'object' && ('name' in src)) return (<img src={src.urls[variant]} alt={src.alt} className={className} onLoad={onLoad} />);
  if (typeof src === 'string') return (<img src={src} alt={src} className={className} onLoad={onLoad} />);

  return null;
};

export default Img;
