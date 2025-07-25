
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes = "100vw"
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Calculate aspect ratio to prevent layout shift
  const aspectRatio = width && height ? (height / width) * 100 : undefined;

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={{
        width: width || '100%',
        height: height || 'auto',
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
        ...(aspectRatio && !height && { paddingBottom: `${aspectRatio}%` })
      }}
    >
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "hidden"
        )}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
      {hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg"
        >
          Failed to load image
        </div>
      )}
    </div>
  );
}
