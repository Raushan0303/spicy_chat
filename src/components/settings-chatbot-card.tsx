"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  MoreVertical,
  Trash,
  Upload,
  Eye,
  EyeOff,
  Settings,
  Wand,
  MessageSquare,
  Globe,
  Lock,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Chatbot = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  visibility: "public" | "private";
  createdAt: string;
  interactions?: number;
};

type SettingsChatbotCardProps = {
  chatbot: Chatbot;
  onVisibilityToggle: (
    chatbotId: string,
    newVisibility: "public" | "private"
  ) => Promise<void>;
  onDelete: (chatbotId: string) => Promise<void>;
};

export function SettingsChatbotCard({
  chatbot,
  onVisibilityToggle,
  onDelete,
}: SettingsChatbotCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle visibility toggle
  const handleVisibilityToggle = async () => {
    try {
      const newVisibility =
        chatbot.visibility === "public" ? "private" : "public";
      await onVisibilityToggle(chatbot.id, newVisibility);
      toast.success(`Chatbot is now ${newVisibility}`);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(chatbot.id);
      toast.success("Chatbot deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      toast.error("Failed to delete chatbot");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-xl border border-gray-700/50 bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-blue-900/20 hover:border-blue-900/50">
      {/* Card Header with Name and Status Badge */}
      <div className="p-5 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{chatbot.name}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {chatbot.description || "No description provided"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge
            variant={chatbot.visibility === "public" ? "default" : "secondary"}
            className={`${
              chatbot.visibility === "public"
                ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
            } cursor-pointer`}
            onClick={handleVisibilityToggle}
          >
            {chatbot.visibility === "public" ? "Public" : "Private"}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-5 pb-5">
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-1 text-gray-400">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">
              {chatbot.interactions || 0} interactions
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700 text-gray-200"
            >
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Chatbot</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete {chatbot.name}? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
