import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CharacterCardProps {
  imageUrl: string;
  title: string;
  author: string;
  stats: string;
  tags: string[];
}

export function CharacterCard({
  imageUrl,
  title,
  author,
  stats,
  tags,
}: CharacterCardProps) {
  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden group w-[220px]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src="/assets/home/hero-banner-1.jpeg"
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs text-white flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 12h8M12 16V8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          108k
        </div>
      </div>

      <div className="p-2">
        <h3 className="text-sm font-semibold text-white mb-0.5">{title}</h3>
        <p className="text-xs text-gray-400 italic mb-0.5">{author}</p>
        <p className="text-xs text-gray-400 mb-1.5">{stats}</p>

        <div className="flex flex-wrap gap-1 mb-1.5">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant="outline"
              className="h-5 text-xs px-1.5 py-0 bg-transparent border-gray-700 hover:bg-gray-800"
            >
              {tag}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full h-7 text-xs bg-blue-600/10 border-blue-500/20 hover:bg-blue-600/20 text-blue-400"
        >
          Revenge & Betray
        </Button>
      </div>
    </div>
  );
}
