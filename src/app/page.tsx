
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, Language, Mood } from '@/types';
import { MiraHeader } from '@/components/mira/MiraHeader';
import { MiraChatArea } from '@/components/mira/MiraChatArea';
import { MiraInput } from '@/components/mira/MiraInput';
import { MiraTypingIndicator } from '@/components/mira/MiraTypingIndicator';
import { MiraVideoModal } from '@/components/mira/MiraVideoModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { detectLanguageAndRespond } from '@/ai/flows/detect-language-and-respond';
import { generateFlirtyResponse } from '@/ai/flows/generate-flirty-response';
import { adjustMoodBasedOnContext } from '@/ai/flows/adjust-mood-based-on-context';

const MAX_MESSAGES = 50;
const MOOD_ADJUST_INTERVAL = 5; // Adjust mood every 5 user messages

export default function MiraChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('hi-IN');
  const [currentMood, setCurrentMood] = useState<Mood>('flirty');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [userMessageCountForMoodAdjust, setUserMessageCountForMoodAdjust] = useState(0);

  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('miraChatHistory');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
         setMessages([{
          id: crypto.randomUUID(),
          type: 'ai',
          text: 'Hey Jaan! 💕 Ready to chat? Type something or tap the mic! 🎤',
          timestamp: Date.now(),
          language: 'en-US'
        }]);
      }
      const savedLang = localStorage.getItem('miraPreferredLang');
      if (savedLang === 'hi-IN' || savedLang === 'en-US') {
        setCurrentLanguage(savedLang);
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      toast({ title: "Error", description: "Could not load previous chat.", variant: "destructive" });
    }
  }, [toast]);

  // Save messages and language to localStorage
  useEffect(() => {
    try {
      const messagesToSave = messages.slice(-MAX_MESSAGES);
      localStorage.setItem('miraChatHistory', JSON.stringify(messagesToSave));
    } catch (error) {
      console.error("Error saving messages to localStorage:", error);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('miraPreferredLang', currentLanguage);
    } catch (error) {
      console.error("Error saving language to localStorage:", error);
    }
  }, [currentLanguage]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = currentLanguage;

        recog.onstart = () => setIsListening(true);
        recog.onend = () => setIsListening(false);
        recog.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast({ title: "Mic Error", description: `Speech error: ${event.error}. Check mic permissions.`, variant: "destructive" });
          setIsListening(false);
        };
        recog.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          // Automatically send after speech if there's transcript
          if (transcript.trim()) {
             processAndSendMessage(transcript.trim());
          }
        };
        recognitionRef.current = recog;
      } else {
        toast({ title: "Unsupported", description: "Speech recognition is not supported in your browser.", variant: "destructive" });
      }
    }
  }, [currentLanguage, toast]); // Re-init if language changes


  const addMessage = (message: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { ...message, id: crypto.randomUUID() }]);
  };
  
  const processAndSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    addMessage({ type: 'user', text, timestamp: Date.now(), language: currentLanguage });
    setInputValue('');
    setIsTyping(true);
    setUserMessageCountForMoodAdjust(prev => prev + 1);

    try {
      // Special command check (Simplified for brevity, can be expanded)
      if (text.toLowerCase().includes("photo please") || text.toLowerCase().includes("send pic")) {
        addMessage({
            type: 'ai',
            text: currentLanguage === 'hi-IN' ? 'ये लो, जान, तुम्हारे लिए एक प्यारी सी तस्वीर! 📸' : 'Here you go, cutie, a lovely picture for you! 📸',
            image: `https://placehold.co/300x200.png`, 
            timestamp: Date.now(),
            language: currentLanguage
        });
      } else {
        // AI response generation
        const aiResponse = await generateFlirtyResponse({ text, language: currentLanguage, currentMood });
        addMessage({ type: 'ai', text: aiResponse.responseText, timestamp: Date.now(), language: currentLanguage });

        // Mood adjustment logic
        if (userMessageCountForMoodAdjust >= MOOD_ADJUST_INTERVAL) {
            const conversationHistory = messages.slice(-10).map(m => ({ type: m.type, text: m.text || '' }));
            // Ensure we map language correctly if needed by adjustMoodBasedOnContext, currently it doesn't use language.
            const moodResult = await adjustMoodBasedOnContext({ conversationHistory , currentMood });
            setCurrentMood(moodResult.newMood as Mood);
            setUserMessageCountForMoodAdjust(0); // Reset counter
            toast({ title: "Mira's Mood Updated!", description: `Mira is now feeling ${moodResult.newMood}!`, duration: 2000 });
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({ title: "AI Error", description: "Sorry, I couldn't process that. Try again!", variant: "destructive" });
      addMessage({ type: 'ai', text: "Oops, something went wrong. Can you say that again? 🥺", timestamp: Date.now(), language: currentLanguage });
    } finally {
      setIsTyping(false);
    }
  }, [currentLanguage, currentMood, messages, toast, userMessageCountForMoodAdjust]);


  const handleSendMessage = () => {
    processAndSendMessage(inputValue);
  };

  const handleLanguageToggle = () => {
    setCurrentLanguage(prev => prev === 'hi-IN' ? 'en-US' : 'hi-IN');
    toast({ description: currentLanguage === 'hi-IN' ? "Switched to English!" : "अब हिन्दी में बात करेंगे!" });
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({ title: "Mic Not Ready", description: "Microphone is not available or not supported.", variant: "destructive"});
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputValue(''); // Clear input before starting mic
      recognitionRef.current.start();
    }
  };

  const handleCameraClick = async () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
      setShowVideoModal(false);
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast({ title: "Camera Error", description: "Camera API not supported in your browser.", variant: "destructive"});
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
        setShowVideoModal(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast({ title: "Camera Error", description: "Could not access camera. Check permissions.", variant: "destructive"});
      }
    }
  };

  const handleCapturePhoto = (photoDataUrl: string) => {
    addMessage({ type: 'user', image: photoDataUrl, text: currentLanguage === 'hi-IN' ? 'मेरी फोटो देखो! 😊' : 'Look at my photo! 😊', timestamp: Date.now(), language: currentLanguage });
    setIsTyping(true);
    // Simulate AI response to photo
    setTimeout(() => {
      addMessage({ type: 'ai', text: currentLanguage === 'hi-IN' ? 'वाह, कितनी प्यारी फोटो है! 😍' : 'Wow, what a lovely photo! 😍', timestamp: Date.now(), language: currentLanguage });
      setIsTyping(false);
    }, 1500);
  };
  
  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    toast({ description: "Message deleted." });
  };

  const handleClearChat = () => {
    if (window.confirm(currentLanguage === 'hi-IN' ? 'पक्का सारी चैट हटानी है?' : 'Are you sure you want to clear all chats?')) {
      setMessages([{
          id: crypto.randomUUID(),
          type: 'ai',
          text: 'Chat cleared! Let\'s start fresh. 😘',
          timestamp: Date.now(),
          language: currentLanguage
        }]);
      toast({ description: "Chat cleared!" });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Basic auto-resize for textarea
    const textarea = e.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset height
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 150; // Corresponds to max-h-[150px]
    if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = 'hidden';
    }
  };

  const inputPlaceholder = currentLanguage === 'hi-IN' ? 'मिरा से बात करो...' : 'Chat with Mira...';


  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-b from-[hsl(6,100%,94%)] to-background overflow-hidden">
      <MiraHeader currentLanguage={currentLanguage} onLanguageToggle={handleLanguageToggle} />
      
      <div className="flex-1 relative"> {/* Removed overflow-y-hidden here */}
        <MiraChatArea messages={messages} onDeleteMessage={handleDeleteMessage} />
        {isTyping && <div className="absolute bottom-0 left-0 right-0"><MiraTypingIndicator /></div>}
      </div>
      
      <Button
        onClick={handleClearChat}
        variant="destructive"
        size="icon"
        className="fixed bottom-[120px] right-5 z-20 rounded-full w-12 h-12 shadow-lg sm:bottom-[100px]" // Adjusted bottom position
        title="Clear All Chats"
        aria-label="Clear All Chats"
      >
        <Trash2 className="w-5 h-5" />
      </Button>

      <MiraInput
        inputValue={inputValue}
        onInputChange={handleInputChange} // Updated this prop
        onSendMessage={handleSendMessage}
        onMicClick={handleMicClick}
        onCameraClick={handleCameraClick}
        isListening={isListening}
        isCameraActive={!!videoStream}
        inputPlaceholder={inputPlaceholder}
      />
      
      <MiraVideoModal
        isOpen={showVideoModal}
        onClose={() => {
          if (videoStream) videoStream.getTracks().forEach(track => track.stop());
          setVideoStream(null);
          setShowVideoModal(false);
        }}
        onCapture={handleCapturePhoto}
        videoStream={videoStream}
      />
    </div>
  );
}
