import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquare, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import jinnieAvatar from "@/assets/jinnie.png";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "jinnie-conversation-v1";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

const SUGGESTIONS = [
  "How do I start a new valuation model?",
  "When should I use unit economics instead of % based?",
  "What documents do I need to update last quarter's model?",
];

/** Floating Jinnie assistant, available on every page. */
export function JinnieChat() {
  const [open, setOpen] = useState(false);
  const [initial] = useState<UIMessage[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, sendMessage, setMessages, status, error } = useChat({
    id: "jinnie",
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "streaming") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage full or unavailable — history simply won't persist */
    }
  }, [messages, status]);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open, busy]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    void sendMessage({ text: trimmed });
  };

  const clear = () => {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-[13px] font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
        aria-label="Open Jinnie, the valuation assistant"
      >
        <img src={jinnieAvatar} alt="" loading="lazy" width={816} height={816} className="size-6" />
        Ask Jinnie
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex h-[min(620px,calc(100vh-3rem))] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-panel-border bg-card shadow-2xl">
      <header className="flex items-center gap-3 border-b border-panel-border bg-panel/40 px-4 py-3">
        <img
          src={jinnieAvatar}
          alt="Jinnie"
          loading="lazy"
          width={816}
          height={816}
          className="size-8"
        />
        <span className="min-w-0">
          <span className="block font-heading text-[15px] font-bold leading-tight text-navy">
            Jinnie
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            Valuation model assistant
          </span>
        </span>
        <span className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={clear} aria-label="Clear conversation">
            <RotateCcw />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close">
            <X />
          </Button>
        </span>
      </header>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-3 px-3 py-3">
          {messages.length === 0 && (
            <div className="space-y-3 px-1 py-2">
              <p className="text-[13px] leading-relaxed text-navy-soft">
                Hi, I'm Jinnie. Ask me about the workflows, the questionnaire, or DCF valuation in
                general.
              </p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-lg border border-panel-border bg-panel/35 px-3 py-2 text-left text-[12px] font-medium text-navy transition-colors hover:bg-panel"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const text = message.parts
              .map((part) => (part.type === "text" ? part.text : ""))
              .join("");
            if (!text) return null;
            return (
              <Message key={message.id} from={message.role}>
                <MessageContent variant={message.role === "user" ? "contained" : "flat"}>
                  <MessageResponse>{text}</MessageResponse>
                </MessageContent>
              </Message>
            );
          })}

          {status === "submitted" && <Shimmer className="px-1 text-[13px]">Thinking…</Shimmer>}
          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
              Jinnie couldn't answer that request. Please try again.
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-panel-border p-3">
        <PromptInput
          onSubmit={(_message, event) => {
            event.preventDefault();
            send(input);
          }}
        >
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Jinnie…"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={busy || input.trim().length === 0} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
