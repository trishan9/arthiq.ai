import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  User,
  Paperclip,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useDocuments } from "@/hooks/useDocuments";
import { useCredibilityScore } from "@/hooks/use-credibility-score";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: SpeechRecognition, ev: Event & { error: string }) => void)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const suggestedQuestions = [
  "How can I improve my credibility score?",
  "What documents should I upload to build trust?",
  "How do I reach Trust Tier 3?",
  "What are Nepal's VAT compliance requirements?",
  "How can my business become loan-ready?",
  "What financial documents do lenders look for?",
  "How to reduce anomalies in my records?",
  "What makes a strong credibility packet?",
];

const CHAT_URL = `${
  import.meta.env.VITE_SUPABASE_URL
}/functions/v1/financial-advisor`;

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "नमस्ते! I'm your Credibility Advisor. I help SMEs like yours improve financial credibility under Nepal's rules.\n\nAsk me how to boost your trust tier, become loan-ready, or meet compliance requirements for your business type.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechLang, setSpeechLang] = useState<"en-US" | "ne-NP">("en-US");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const { metrics } = useFinancialData();
  const { documents } = useDocuments();
  const { credibilityScore } = useCredibilityScore();

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setSpeechSupported(true);
    }
  }, []);

  const startRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast({
        title: "Voice Input Not Supported",
        description:
          "Your browser doesn't support voice input. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    // Create fresh instance each time
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = speechLang;

    recognition.onstart = () => {
      console.log("Speech recognition started with language:", speechLang);
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      recognitionRef.current = null;

      if (event.error === "not-allowed") {
        toast({
          title: "Microphone Access Denied",
          description: "Please enable microphone access to use voice input.",
          variant: "destructive",
        });
      } else if (event.error === "no-speech") {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking again.",
        });
      } else if (event.error === "network") {
        toast({
          title: "Network Error",
          description: "Voice recognition requires an internet connection.",
          variant: "destructive",
        });
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setInput((prev) => prev + finalTranscript);
      } else if (interimTranscript) {
        setInput(interimTranscript);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      toast({
        title: speechLang === "ne-NP" ? "सुन्दैछु..." : "Listening...",
        description:
          speechLang === "ne-NP"
            ? "अहिले बोल्नुहोस्।"
            : "Speak now. Click the mic again to stop.",
      });
    } catch (error) {
      console.error("Failed to start recognition:", error);
      toast({
        title: "Error",
        description: "Failed to start voice input. Please try again.",
        variant: "destructive",
      });
    }
  }, [speechLang, toast]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      stopRecognition();
    } else {
      setInput("");
      startRecognition();
    }
  }, [isListening, startRecognition, stopRecognition]);

  const toggleLanguage = useCallback(() => {
    const newLang = speechLang === "en-US" ? "ne-NP" : "en-US";
    setSpeechLang(newLang);
    toast({
      title: newLang === "ne-NP" ? "नेपाली भाषा" : "English",
      description:
        newLang === "ne-NP"
          ? "Voice input set to Nepali"
          : "Voice input set to English",
    });
  }, [speechLang, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = useCallback(
    async (
      userMessages: { role: "user" | "assistant"; content: string }[],
      onDelta: (deltaText: string) => void,
      onDone: () => void,
      onError: (error: string) => void
    ) => {
      try {
        const netProfit = metrics.totalRevenue - metrics.totalExpenses;
        const profitMargin =
          metrics.totalRevenue > 0
            ? (netProfit / metrics.totalRevenue) * 100
            : 0;

        // Build credibility context for the AI
        const hasBankStatements = documents.some(
          (d) => d.document_type === "bank_statement"
        );
        const hasVatDocs = documents.some(
          (d) =>
            d.document_type === "tax_document" ||
            d.file_name?.toLowerCase().includes("vat") ||
            d.file_name?.toLowerCase().includes("pan")
        );

        // Count months of data from documents
        const monthsSet = new Set<string>();
        documents.forEach((doc) => {
          if (doc.created_at) {
            monthsSet.add(doc.created_at.substring(0, 7));
          }
        });

        const credibilityContext = {
          score: credibilityScore.totalScore,
          tier: credibilityScore.trustTier.tier,
          tierLabel: credibilityScore.trustTier.label,
          documentCount: documents.length,
          proofCount: credibilityScore.dataPoints,
          anomalyCount: credibilityScore.anomalies.length,
          hasVatDocs,
          hasBankStatements,
          monthsOfData: monthsSet.size,
          financialHealth: metrics.financialHealthScore,
          evidenceQuality: credibilityScore.evidenceQuality.score,
          stabilityGrowth: credibilityScore.stabilityGrowth.score,
          complianceReadiness: credibilityScore.complianceReadiness.score,
        };

        const financialContext = {
          metrics: {
            totalRevenue: metrics.totalRevenue,
            totalExpenses: metrics.totalExpenses,
            netProfit,
            profitMargin,
            outstandingReceivables: 0,
            financialHealthScore: metrics.financialHealthScore,
            documentCount: metrics.documentCount,
            monthlyData: metrics.monthlyData,
            expenseCategories: metrics.expenseCategories,
          },
          documents: documents.map((d) => ({
            file_name: d.file_name,
            document_type: d.document_type,
            status: d.status,
          })),
          recentTransactions: metrics.recentTransactions.slice(0, 20),
        };

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
            }`,
          },
          body: JSON.stringify({
            messages: userMessages,
            financialContext,
            credibilityContext,
          }),
        });

        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Request failed with status ${resp.status}`
          );
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as
                | string
                | undefined;
              if (content) onDelta(content);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Final flush
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as
                | string
                | undefined;
              if (content) onDelta(content);
            } catch {
              /* ignore */
            }
          }
        }

        onDone();
      } catch (error) {
        onError(
          error instanceof Error ? error.message : "Failed to get response"
        );
      }
    },
    [metrics, documents, credibilityScore]
  );

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    const conversationHistory = [...messages, userMessage]
      .filter((m) => m.id !== "1") // Skip initial greeting
      .map((m) => ({ role: m.role, content: m.content }));

    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id.startsWith("stream-")) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: `stream-${Date.now()}`,
            role: "assistant" as const,
            content: assistantContent,
            timestamp: new Date(),
          },
        ];
      });
    };

    await streamChat(
      conversationHistory,
      upsertAssistant,
      () => setIsLoading(false),
      (error) => {
        setIsLoading(false);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "I apologize, but I encountered an error processing your request. Please try again.",
            timestamp: new Date(),
          },
        ]);
      }
    );
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "नमस्ते! I'm your Credibility Advisor. I help SMEs like yours improve financial credibility under Nepal's rules.\n\nAsk me how to boost your trust tier, become loan-ready, or meet compliance requirements for your business type.",
        timestamp: new Date(),
      },
    ]);
  };

  const hasDocuments = documents.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        title="Credibility Advisor"
        subtitle="Get personalized advice to improve your business credibility under Nepal's financial rules"
        showSearch={false}
      />

      <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full">
        {/* Context Banner */}
        {!hasDocuments && (
          <div className="mb-4 p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Upload documents to get personalized credibility advice
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload bank statements, VAT returns, and invoices so I can
                analyze your business and suggest specific improvements.
              </p>
            </div>
          </div>
        )}

        {hasDocuments && (
          <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
                analyzed
              </p>
              <p className="text-xs text-muted-foreground">
                Financial Health Score: {metrics.financialHealthScore}/100
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearChat}>
              <RefreshCw className="w-4 h-4 mr-1" />
              New Chat
            </Button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4",
                message.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  message.role === "assistant"
                    ? "bg-gradient-accent"
                    : "bg-primary"
                )}
              >
                {message.role === "assistant" ? (
                  <Sparkles className="w-5 h-5 text-accent-foreground" />
                ) : (
                  <User className="w-5 h-5 text-primary-foreground" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-5 py-4",
                  message.role === "assistant"
                    ? "bg-card border border-border"
                    : "bg-primary text-primary-foreground"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p
                  className={cn(
                    "text-xs mt-2",
                    message.role === "assistant"
                      ? "text-muted-foreground"
                      : "text-primary-foreground/70"
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-foreground animate-pulse" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-5 py-4">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-3">
              Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSuggestionClick(question)}
                  className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-full text-foreground transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-card border border-border rounded-2xl p-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder={
                  isListening
                    ? speechLang === "ne-NP"
                      ? "सुन्दैछु..."
                      : "Listening..."
                    : "Ask how to improve credibility for your business..."
                }
                className="w-full bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground py-3"
              />
              {isListening && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <span className="text-xs text-destructive font-medium">
                    {speechLang === "ne-NP" ? "रेकर्डिङ" : "Recording"}
                  </span>
                </div>
              )}
            </div>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={toggleLanguage}
              disabled={!speechSupported}
              title={`Switch to ${
                speechLang === "en-US" ? "Nepali" : "English"
              }`}
            >
              <span className="text-xs font-bold">
                {speechLang === "en-US" ? "EN" : "ने"}
              </span>
            </Button>

            {/* Mic Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "transition-colors",
                isListening
                  ? "text-destructive bg-destructive/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={toggleVoiceInput}
              disabled={!speechSupported}
              title={
                speechSupported
                  ? isListening
                    ? "Stop recording"
                    : "Start voice input"
                  : "Voice input not supported"
              }
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="accent"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-3">
          Your Credibility Advisor provides guidance based on your documents and
          Nepal's financial regulations. Always verify important decisions with
          a certified professional.
        </p>
      </div>
    </div>
  );
};

export default Assistant;
