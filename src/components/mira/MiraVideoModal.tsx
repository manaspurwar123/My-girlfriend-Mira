"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type React from 'react';
import { useEffect, useRef } from "react";

interface MiraVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  videoStream: MediaStream | null;
}

export function MiraVideoModal({ isOpen, onClose, onCapture, videoStream }: MiraVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play().catch(err => console.error("Error playing video: ", err));
    }
  }, [isOpen, videoStream]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const photoDataUrl = canvas.toDataURL('image/png');
      onCapture(photoDataUrl);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-card-foreground">Say Cheese! 📸</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          {videoStream ? (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-auto rounded-md border border-border aspect-video bg-black"></video>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-muted rounded-md text-muted-foreground">
              Starting camera...
            </div>
          )}
        </div>
        <DialogFooter className="p-6 pt-0 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleCapture} disabled={!videoStream} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            Capture Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
