
"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Changed from Input
import { Mic, Camera, Send } from "lucide-react";
import type React from 'react';
import { cn } from "@/lib/utils";

interface MiraInputProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // Changed event type
  onSendMessage: () => void;
  onMicClick: () => void;
  onCameraClick: () => void;
  isListening: boolean;
  isCameraActive: boolean;
  inputPlaceholder: string;
}

export function MiraInput({
  inputValue,
  onInputChange,
  onSendMessage,
  onMicClick,
  onCameraClick,
  isListening,
  isCameraActive,
  inputPlaceholder,
}: MiraInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { // Changed event type
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) { // Allow Shift+Enter for new line
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-card p-3 flex items-start gap-2 border-t border-border shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-10">
      <Textarea // Changed from Input
        id="textInput"
        value={inputValue}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}
        placeholder={inputPlaceholder}
        aria-label="Chat input"
        className="flex-1 px-3 py-2 rounded-md bg-input border-input focus:border-primary focus:ring-primary text-base resize-none min-h-[40px] max-h-[150px]" // Adjusted styling, added resize-none and max-h
        rows={1} // Start with 1 row, will expand with min/max height
      />
      <div className="flex flex-col gap-2">
        <Button
          id="mic"
          variant="ghost"
          size="icon"
          onClick={onMicClick}
          className={cn(
            "rounded-full text-primary hover:bg-primary/10 w-10 h-10",
            isListening && "text-accent animate-pulse-strong"
          )}
          aria-label={isListening ? "Stop listening" : "Tap to speak"}
          title={isListening ? "Stop listening" : "Tap to speak"}
        >
          <Mic className="w-5 h-5" />
        </Button>
        <Button
          id="camera"
          variant="ghost"
          size="icon"
          onClick={onCameraClick}
          className={cn(
            "rounded-full text-primary hover:bg-primary/10 w-10 h-10",
            isCameraActive && "text-accent animate-pulse-strong"
          )}
          aria-label={isCameraActive ? "Close camera" : "Open camera"}
          title={isCameraActive ? "Close camera" : "Open camera"}
        >
          <Camera className="w-5 h-5" />
        </Button>
      </div>
       <Button
        variant="default"
        size="icon"
        onClick={onSendMessage}
        disabled={!inputValue.trim()}
        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground w-10 h-10 self-end" // Aligned send button
        aria-label="Send message"
        title="Send message"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}
