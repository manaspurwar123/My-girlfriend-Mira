"use client";

import type { Message as MessageType } from '@/types';
import { MiraMessage } from './MiraMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef } from 'react';

interface MiraChatAreaProps {
  messages: MessageType[];
  onDeleteMessage: (id: string) => void;
}

export function MiraChatArea({ messages, onDeleteMessage }: MiraChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef} role="log" aria-live="polite">
      {messages.map((msg) => (
        <MiraMessage key={msg.id} message={msg} onDelete={() => onDeleteMessage(msg.id)} />
      ))}
    </ScrollArea>
  );
}
