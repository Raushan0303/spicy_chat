"use client";

import { useState } from "react";
import Image from "next/image";

export function ProfileImage({
  src,
  alt,
  fallback,
  width = 80,
  height = 80,
  className = "",
}: {
  src: string;
  alt: string;
  fallback: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`${className} overflow-hidden`}>
      {imgError ? (
        <div className="w-full h-full flex items-center justify-center">
          {fallback}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="object-cover w-full h-full"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}
