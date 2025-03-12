"use client";

import { useState } from "react";
import Image from "next/image";

interface UserAvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
}

export function UserAvatar({
  src,
  alt,
  fallback,
  className = "h-8 w-8",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div
        className={`${className} rounded-full bg-gray-700 flex items-center justify-center text-white font-medium`}
      >
        {fallback.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      className={`${className} rounded-full object-cover border border-gray-600`}
      src={src}
      alt={alt}
      width={40}
      height={40}
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
    />
  );
}
