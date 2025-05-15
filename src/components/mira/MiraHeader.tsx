
"use client";

import type { Language } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

interface MiraHeaderProps {
  currentLanguage: Language;
  onLanguageToggle: () => void;
}

export function MiraHeader({ currentLanguage, onLanguageToggle }: MiraHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center p-3 shadow-md bg-primary text-primary-foreground">
      <Avatar className="w-11 h-11 mr-3 border-2 border-primary-foreground transition-transform hover:scale-110">
        <AvatarImage src="https://placehold.co/60x60.png" alt="Mira's Profile Picture" data-ai-hint="girl portrait"/>
        <AvatarFallback>मि</AvatarFallback>
      </Avatar>
      <h2 className="text-xl font-semibold">मिरा 💕</h2>
      <Button
        id="lang-toggle"
        onClick={onLanguageToggle}
        variant="secondary"
        size="sm"
        className="ml-auto bg-primary-foreground text-primary hover:bg-pink-100 rounded-full px-3 py-1 text-sm"
        aria-label="Toggle Language"
      >
        <Languages className="w-4 h-4 mr-1.5" />
        {currentLanguage === 'hi-IN' ? 'हिन्दी' : 'English'}
      </Button>
    </header>
  );
}
