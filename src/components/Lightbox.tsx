import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryImage } from '../lib/types';
import { ArrowLeft, ArrowRight, CloseIcon, ZoomIcon } from './Icons';

type Props = {
  images: GalleryImage[];
  index: number;
  title?: string;
  onIndex: (i: number) => void;
  onClose: () => void;
};

export default function Lightbox({ images, index, title, onIndex, onClose }: Props) {
  const [zoom, setZoom] = useState(false);
  const touchX = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const image = images[index];

  const go = useCallback(
    (dir: number) => {
      if (!images.length) return;
      setZoom(false);
      onIndex((index + dir + images.length) % images.length);
    },
    [images.length, index, onIndex]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-idx="${index}"]`);
    el?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  if (!image) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title || 'Project'} photo ${index + 1}`}>
      <div className="lb-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <span className="count">
            {index + 1} / {images.length}
          </span>
          {image.caption ? <span className="cap">{image.caption}</span> : null}
        </div>
        <div className="lb-tools">
          <button type="button" onClick={() => setZoom((z) => !z)} aria-label={zoom ? 'Zoom out' : 'Zoom in'}>
            <ZoomIcon out={zoom} />
          </button>
          <button type="button" onClick={onClose} aria-label="Close lightbox">
            <CloseIcon />
          </button>
        </div>
      </div>

      <div
        className="lb-stage"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 46) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
        onClick={() => setZoom((z) => !z)}
      >
        <img
          key={image.url + index}
          src={image.url}
          alt={image.caption || `${title || 'Project'} photo ${index + 1}`}
          className={zoom ? 'zoomed' : ''}
          draggable={false}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="lb-nav prev"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
            >
              <ArrowLeft />
            </button>
            <button
              type="button"
              className="lb-nav next"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
            >
              <ArrowRight />
            </button>
          </>
        )}
      </div>

      <div className="lb-strip" ref={stripRef}>
        {images.map((img, i) => (
          <button
            key={img.id + i}
            type="button"
            data-idx={i}
            className={i === index ? 'active' : ''}
            onClick={() => {
              setZoom(false);
              onIndex(i);
            }}
            aria-label={`Photo ${i + 1}`}
          >
            <img src={img.url} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
