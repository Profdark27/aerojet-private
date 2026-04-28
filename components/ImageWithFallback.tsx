'use client'
import Image from 'next/image'
import { useState } from 'react'

interface ImageWithFallbackProps {
  /** Path in /public or absolute URL. If undefined, shows fallback immediately. */
  src: string | undefined
  alt: string
  /** Use fill layout — parent must have position:relative and defined dimensions. */
  fill?: boolean
  width?: number
  height?: number
  /** Marks as LCP candidate: disables lazy-loading, sets fetchPriority="high". */
  priority?: boolean
  /** Responsive sizes hint for srcSet selection. Defaults to 100vw for fill. */
  sizes?: string
  objectFit?: 'cover' | 'contain' | 'none'
  /** Rendered when src is missing or fails to load. */
  fallback: React.ReactNode
  style?: React.CSSProperties
}

/**
 * next/image wrapper with graceful CSS fallback.
 *
 * - Shows fallback immediately if src is undefined
 * - Falls back on onError (404, network error)
 * - Crossfades from fallback → image on load (0.5s opacity transition)
 * - The parent is responsible for setting position:relative + dimensions
 *   when using fill mode
 */
export default function ImageWithFallback({
  src,
  alt,
  fill,
  width,
  height,
  priority,
  sizes,
  objectFit = 'cover',
  fallback,
  style,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // No src or already errored — show fallback directly
  if (!src || hasError) {
    return <>{fallback}</>
  }

  return (
    <>
      {/* Fallback visible until image loads, then fades out */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {fallback}
      </div>

      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? '100vw'}
          style={{ objectFit, opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease', ...style }}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 800}
          height={height ?? 500}
          priority={priority}
          sizes={sizes}
          style={{ objectFit, opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease', display: 'block', ...style }}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </>
  )
}
