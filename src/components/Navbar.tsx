"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-black">
      <Link href="/">
        <div className="text-xl font-bold text-white">SPICYCHAT.AI</div>
      </Link>
      <div className="flex items-center gap-4">
        <Button variant="outline" className="text-blue-400 border-blue-400">
          Create Character
        </Button>
        <Button variant="outline" className="text-gray-400">
          EN
        </Button>
        {/* Authentication buttons will be added in the layout file */}
      </div>
    </header>
  );
}
