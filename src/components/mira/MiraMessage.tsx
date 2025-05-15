"use client";

import type { Message as MessageType } from '@/types';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface MiraMessageProps {
  message: MessageType;
  onDelete: () => void;
}

export function MiraMessage({ message, onDelete }: MiraMessageProps) {
  const isUser = message.type === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={cn(
        "group relative max-w-[75%] my-2 mx-1 p-3 rounded-2xl shadow-sm animate-slide-in",
        isUser ? "bg-muted ml-auto text-right rounded-br-md text-muted-foreground" : "bg-card mr-auto rounded-bl-md text-card-foreground border border-border"
      )}
      role="listitem"
    >
      {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
      {message.image && (
        <div className="mt-2">
          <Image
            src={message.image}
            alt={isUser ? "User uploaded image" : "Image from Mira"}
            width={isUser ? 200 : 300}
            height={isUser ? 150 : 200}
            className="rounded-lg object-cover"
            data-ai-hint={!isUser ? "cute romantic" : undefined}
          />
        </div>
      )}
      <div className={cn("text-xs mt-1.5", isUser ? "text-muted-foreground/70" : "text-muted-foreground/70")}>
        {time}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-70 hover:opacity-100 focus:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
        onClick={onDelete}
        aria-label="Delete message"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
