"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  MessageCircle,
  Share2,
  Heart,
  Lock,
  Globe,
  ImagePlus,
  Settings,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface ChatbotCardProps {
  chatbot: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    visibility: "public" | "private";
    createdAt: string;
    interactions?: number;
    userId?: string;
  };
  currentUserId?: string;
  onImageUpdate?: (chatbotId: string, newImageUrl: string) => Promise<void>;
  onVisibilityToggle?: (
    chatbotId: string,
    newVisibility: "public" | "private"
  ) => Promise<void>;
  onDelete?: (chatbotId: string) => Promise<void>;
}

export function ChatbotCard({
  chatbot,
  currentUserId,
  onImageUpdate,
  onVisibilityToggle,
  onDelete,
}: ChatbotCardProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState(chatbot.imageUrl || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = currentUserId && chatbot.userId === currentUserId;

  // Format date to be more readable
  const formattedDate = new Date(chatbot.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  // Handle image update
  const handleImageUpdate = async () => {
    if (!onImageUpdate) return;

    try {
      setIsUpdating(true);
      await onImageUpdate(chatbot.id, newImageUrl);
      setShowImageDialog(false);
      toast.success("Chatbot image updated successfully!");
    } catch (error) {
      toast.error("Failed to update chatbot image");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle visibility toggle
  const handleVisibilityToggle = async () => {
    if (!onVisibilityToggle) return;

    try {
      const newVisibility =
        chatbot.visibility === "public" ? "private" : "public";
      await onVisibilityToggle(chatbot.id, newVisibility);
      toast.success(`Chatbot is now ${newVisibility}`);
    } catch (error) {
      toast.error("Failed to update visibility");
      console.error(error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(chatbot.id);
      toast.success("Chatbot deleted successfully");
    } catch (error) {
      toast.error("Failed to delete chatbot");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden rounded-xl border-0 bg-black shadow-xl transition-all hover:shadow-2xl">
      {/* Gradient overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>

      {/* Background image or gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
        {chatbot.imageUrl && (
          <Image
            src={chatbot.imageUrl}
            alt={chatbot.name}
            fill
            className="object-cover opacity-80"
            unoptimized={
              chatbot.imageUrl.startsWith("data:") ||
              chatbot.imageUrl.includes("unsplash")
            }
            onError={(e) => {
              console.error("Error loading image:", chatbot.imageUrl);
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>

      {/* Visibility badge */}
      <div className="absolute top-3 right-3 z-20">
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            chatbot.visibility === "public"
              ? "bg-green-900/70 text-green-300"
              : "bg-gray-900/70 text-gray-300"
          }`}
        >
          {chatbot.visibility === "public" ? (
            <>
              <Globe className="h-3 w-3" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              <span>Private</span>
            </>
          )}
        </div>
      </div>

      {/* Settings dropdown (top right) */}
      {isOwner && (
        <div className="absolute top-3 left-3 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 bg-gray-900 text-gray-200 border-gray-800"
            >
              <DropdownMenuItem
                onClick={() => setShowImageDialog(true)}
                className="cursor-pointer hover:bg-gray-800"
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                <span>Change Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleVisibilityToggle}
                className="cursor-pointer hover:bg-gray-800"
              >
                {chatbot.visibility === "public" ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Make Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    <span>Make Public</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <Link href={`/chatbots/${chatbot.id}/edit`} className="w-full">
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-800">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Chatbot</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() => setShowDeleteConfirm(true)}
                className="cursor-pointer text-red-400 hover:bg-red-900/20 hover:text-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Chatbot info */}
      <CardContent className="relative z-20 flex flex-col h-[320px] p-0">
        {/* Top section with name and description */}
        <div className="flex-grow p-5 flex flex-col justify-end">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {chatbot.name}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-2 mb-3">
            {chatbot.description || "No description"}
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 mb-4">
            <div>
              <span className="block text-gray-500">Created</span>
              <span className="text-gray-300">{formattedDate}</span>
            </div>
            <div>
              <span className="block text-gray-500">Interactions</span>
              <span className="text-gray-300">{chatbot.interactions || 0}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <CardFooter className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm p-3 gap-2">
          <Link href={`/chatbots/${chatbot.id}`} className="flex-1">
            <Button
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </Link>

          {isOwner ? (
            <Link href={`/chatbots/${chatbot.id}/settings`} className="flex-1">
              <Button
                variant="outline"
                className="w-full border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              className="flex-1 border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300"
            >
              <Heart className="mr-2 h-4 w-4" />
              Like
            </Button>
          )}
        </CardFooter>
      </CardContent>

      {/* Image Update Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Update Chatbot Image</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a new image URL for your chatbot
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {newImageUrl && (
              <div className="relative w-full h-40 rounded-md overflow-hidden border border-gray-700">
                <Image
                  src={newImageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  onError={() => {
                    toast.error("Invalid image URL");
                    setNewImageUrl("");
                  }}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImageDialog(false)}
              className="border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImageUpdate}
              disabled={isUpdating || !newImageUrl}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? "Updating..." : "Update Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Delete Chatbot</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this chatbot? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Chatbot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
