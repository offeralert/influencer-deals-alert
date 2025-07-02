
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes = "100vw",
  quality = 85,
  blurDataURL
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Generate optimized image sources
  const generateSrcSet = (originalSrc: string) => {
    // For Lovable uploads, we can't generate different sizes, but we can optimize format
    if (originalSrc.includes('/lovable-uploads/')) {
      return originalSrc;
    }
    
    // For other images, generate responsive sizes
    const sizes = [640, 768, 1024, 1280, 1536];
    return sizes
      .map(size => `${originalSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ');
  };

  const shouldLoad = priority || isInView;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !hasError && !blurDataURL && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"
          style={{ width, height }}
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={shouldLoad ? src : undefined}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={shouldLoad ? generateSrcSet(src) : undefined}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "hidden",
          className
        )}
      />
      
      {/* Error state */}
      {hasError && (
        <div 
          className="flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg text-sm"
          style={{ width, height }}
        >
          Failed to load image
        </div>
      )}
    </div>
  );
}
