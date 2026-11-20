import React, { useState } from 'react'
import { useResolvedUrl } from '../lib/store'
import { FALLBACK } from '../lib/assets'

/** Image that resolves local:// uploads and falls back to a guaranteed pic if a remote url dies. */
export function RImg({
  src,
  alt = '',
  className,
  style,
  seed,
  onClick,
  draggable = false,
}: {
  src?: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  seed?: string | number
  onClick?: (e: React.MouseEvent) => void
  draggable?: boolean
}) {
  const resolved = useResolvedUrl(src)
  const [err, setErr] = useState(false)
  if (!src || (!resolved && !err)) {
    return (
      <div
        className={'rimg-ph ' + (className || '')}
        style={{ background: 'linear-gradient(135deg,#123a29,#1c5a40)', ...style }}
        onClick={onClick}
      />
    )
  }
  const finalSrc = resolved && !err ? resolved : FALLBACK(seed ?? alt ?? 'ab-visuals')
  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
      draggable={draggable}
      loading="lazy"
      onError={() => setErr(true)}
    />
  )
}
