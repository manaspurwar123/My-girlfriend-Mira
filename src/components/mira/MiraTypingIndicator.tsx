"use client";

export function MiraTypingIndicator() {
  return (
    <div className="px-4 py-2 text-sm text-muted-foreground italic flex items-center">
      Mira is typing
      <span className="typing-dots ml-0.5">
        <span>.</span><span>.</span><span>.</span>
      </span>
    </div>
  );
}
