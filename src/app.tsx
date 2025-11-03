import { useEffect, useState, useRef, useCallback, use } from "react";
import { useAgent } from "agents/react";
import { isToolUIPart } from "ai";
import { useAgentChat } from "agents/ai-react";
import type { UIMessage } from "@ai-sdk/react";
import type { tools } from "./tools";

// Component imports
import { Button } from "@/components/button/Button";
// import { Card } from "@/components/card/Card";
// import { Avatar } from "@/components/avatar/Avatar";
import { Toggle } from "@/components/toggle/Toggle";
import { Textarea } from "@/components/textarea/Textarea";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { ToolInvocationCard } from "@/components/tool-invocation-card/ToolInvocationCard";

// Icon imports
import {
  Bug,
  Moon,
  Sun,
  Trash,
  PaperPlaneTilt,
  Stop,
  Sparkle
} from "@phosphor-icons/react";

// List of tools that require human confirmation
// NOTE: this should match the tools that don't have execute functions in tools.ts
const toolsRequiringConfirmation: (keyof typeof tools)[] = [
];

export default function Chat() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    // Check localStorage first, default to dark if not found
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as "dark" | "light") || "dark";
  });
  const [showDebug, setShowDebug] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Apply theme class on mount and when theme changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Scroll to bottom on mount
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const agent = useAgent({
    agent: "chat"
  });

  const [agentInput, setAgentInput] = useState("");
  const handleAgentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAgentInput(e.target.value);
  };

  const handleAgentSubmit = async (
    e: React.FormEvent,
    extraData: Record<string, unknown> = {}
  ) => {
    e.preventDefault();
    if (!agentInput.trim()) return;

    const message = agentInput;
    setAgentInput("");

    // Send message to agent
    await sendMessage(
      {
        role: "user",
        parts: [{ type: "text", text: message }]
      },
      {
        body: extraData
      }
    );
  };

  const {
    messages: agentMessages,
    addToolResult,
    clearHistory,
    status,
    sendMessage,
    stop
  } = useAgentChat<unknown, UIMessage<{ createdAt: string }>>({
    agent
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    agentMessages.length > 0 && scrollToBottom();
  }, [agentMessages, scrollToBottom]);

  const pendingToolCallConfirmation = agentMessages.some((m: UIMessage) =>
    m.parts?.some(
      (part) =>
        isToolUIPart(part) &&
        part.state === "input-available" &&
        // Manual check inside the component
        toolsRequiringConfirmation.includes(
          part.type.replace("tool-", "") as keyof typeof tools
        )
    )
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-[100vh] w-full flex justify-center items-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 overflow-hidden">
      <HasOpenAIKey />
      <div className="h-[calc(100vh-3rem)] w-full mx-auto max-w-4xl flex flex-col backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 rounded-3xl overflow-hidden relative border border-neutral-200/50 dark:border-neutral-800/50 shadow-2xl shadow-neutral-900/10 dark:shadow-black/40">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200/50 dark:border-neutral-800/50 flex items-center gap-4 sticky top-0 z-10 backdrop-blur-xl bg-white/90 dark:bg-neutral-900/90">
          <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-br from-[#F48120] to-[#ff6b35] shadow-lg shadow-orange-500/20">
            <Sparkle size={20} className="text-white" weight="fill" />
          </div>

          <div className="flex-1">
            <h2 className="font-bold text-lg bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent"> Retrieve all your Canvas assignments & courses! </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Ask for assignments for courses by name!</p>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2 py-1">
            <Bug size={14} className="text-neutral-500 dark:text-neutral-400" />
            <Toggle
              toggled={showDebug}
              aria-label="Toggle debug mode"
              onClick={() => setShowDebug((prev) => !prev)}
            />
          </div>

          <Button
            variant="ghost"
            size="md"
            shape="square"
            className="rounded-full h-10 w-10 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={18} weight="fill" className="text-amber-400" /> : <Moon size={18} weight="fill" className="text-indigo-600" />}
          </Button>

          <Button
            variant="ghost"
            size="md"
            shape="square"
            className="rounded-full h-10 w-10 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
            onClick={clearHistory}
          >
            <Trash size={18} />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32 max-h-[calc(100vh-14rem)]">
          {agentMessages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="max-w-md mx-auto text-center space-y-6 py-12">
                <div className="space-y-2">
                  <h3 className="font-bold text-2xl bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">Welcome!</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">Let's start a conversation. I can help you with:</p>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">📚</span>
                    </div>
                    <span className="text-left text-neutral-700 dark:text-neutral-300">Ask for assignments for all your canvas courses!</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">🔍</span>
                    </div>
                    <span className="text-left text-neutral-700 dark:text-neutral-300">Look for all your courses!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {agentMessages.map((m, index) => {
            const isUser = m.role === "user";
            const showAvatar =
              index === 0 || agentMessages[index - 1]?.role !== m.role;

            return (
              <div key={m.id}>
                {showDebug && (
                  <pre className="text-xs text-muted-foreground overflow-scroll mb-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    {JSON.stringify(m, null, 2)}
                  </pre>
                )}
                <div
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {showAvatar && !isUser ? (
                      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-[#F48120] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Sparkle size={16} className="text-white" weight="fill" />
                      </div>
                    ) : (
                      !isUser && <div className="w-9" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="space-y-2">
                        {m.parts?.map((part, i) => {
                          if (part.type === "text") {
                            return (
                              // biome-ignore lint/suspicious/noArrayIndexKey: immutable index
                              <div key={i}>
                                <div
                                  className={`p-4 rounded-2xl ${
                                    isUser
                                      ? "bg-gradient-to-br from-[#F48120] to-[#ff6b35] text-white shadow-lg shadow-orange-500/20"
                                      : "bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50"
                                  } ${
                                    part.text.startsWith("scheduled message")
                                      ? "ring-2 ring-accent/30"
                                      : ""
                                  } relative backdrop-blur-sm`}
                                >
                                  {part.text.startsWith(
                                    "scheduled message"
                                  ) && (
                                    <span className="absolute -top-3 -left-2 text-xl">
                                      🕒
                                    </span>
                                  )}
                                  <div className={isUser ? "text-white" : ""}>
                                    <MemoizedMarkdown
                                      id={`${m.id}-${i}`}
                                      content={part.text.replace(
                                        /^scheduled message: /,
                                        ""
                                      )}
                                    />
                                  </div>
                                </div>
                                <p
                                  className={`text-xs text-neutral-400 dark:text-neutral-500 mt-1.5 ${
                                    isUser ? "text-right" : "text-left"
                                  }`}
                                >
                                  {formatTime(
                                    m.metadata?.createdAt
                                      ? new Date(m.metadata.createdAt)
                                      : new Date()
                                  )}
                                </p>
                              </div>
                            );
                          }

                          if (
                            isToolUIPart(part)
                            // m.id.startsWith("assistant")
                          ) {
                            const toolCallId = part.toolCallId;
                            const toolName = part.type.replace("tool-", "");
                            const needsConfirmation =
                              toolsRequiringConfirmation.includes(
                                toolName as keyof typeof tools
                              );

                            // Skip rendering the card in debug mode
                            // if (showDebug) return null;

                            return (
                              <ToolInvocationCard
                                // biome-ignore lint/suspicious/noArrayIndexKey: using index is safe here as the array is static
                                key={`${toolCallId}-${i}`}
                                toolUIPart={part}
                                toolCallId={toolCallId}
                                needsConfirmation={needsConfirmation}
                                onSubmit={({ toolCallId, result }) => {
                                  addToolResult({
                                    tool: part.type.replace("tool-", ""),
                                    toolCallId,
                                    output: result
                                  });
                                }}
                                addToolResult={(toolCallId, result) => {
                                  addToolResult({
                                    tool: part.type.replace("tool-", ""),
                                    toolCallId,
                                    output: result
                                  });
                                }}
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAgentSubmit(e, {
              annotations: {
                hello: "world"
              }
            });
            setTextareaHeight("auto"); // Reset height after submission
          }}
          className="p-6 absolute bottom-0 left-0 right-0 z-10 border-t border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-xl bg-white/90 dark:bg-neutral-900/90"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                disabled={pendingToolCallConfirmation}
                placeholder={
                  pendingToolCallConfirmation
                    ? "Please respond to the tool confirmation above..."
                    : "Type your message..."
                }
                className="w-full border-0 bg-neutral-100 dark:bg-neutral-800 px-5 py-4 ring-offset-background placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F48120] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 text-base min-h-[56px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl pr-14 transition-all duration-200"
                value={agentInput}
                onChange={(e) => {
                  handleAgentInputChange(e);
                  // Auto-resize the textarea
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  setTextareaHeight(`${e.target.scrollHeight}px`);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    handleAgentSubmit(e as unknown as React.FormEvent);
                    setTextareaHeight("auto"); // Reset height on Enter submission
                  }
                }}
                rows={1}
                style={{ height: textareaHeight }}
              />
              <div className="absolute bottom-2 right-2">
                {status === "submitted" || status === "streaming" ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="h-10 w-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 flex items-center justify-center transition-all duration-200 shadow-sm"
                    aria-label="Stop generation"
                  >
                    <Stop size={18} weight="fill" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F48120] to-[#ff6b35] hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-md disabled:shadow-none"
                    disabled={pendingToolCallConfirmation || !agentInput.trim()}
                    aria-label="Send message"
                  >
                    <PaperPlaneTilt size={18} weight="fill" className="text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const hasOpenAiKeyPromise = fetch("/check-open-ai-key").then((res) =>
  res.json<{ success: boolean }>()
);

function HasOpenAIKey() {
  const hasOpenAiKey = use(hasOpenAiKeyPromise);

  if (!hasOpenAiKey.success) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/10 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/50 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-linear-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/20">
                <svg
                  className="w-6 h-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-labelledby="warningIcon"
                >
                  <title id="warningIcon">Warning Icon</title>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                  OpenAI API Key Not Configured
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-2 text-sm">
                  Requests to the API, including from the frontend UI, will not
                  work until an OpenAI API key is configured.
                </p>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                  Please configure an OpenAI API key by setting a{" "}
                  <a
                    href="https://developers.cloudflare.com/workers/configuration/secrets/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 dark:text-red-400 hover:underline font-medium"
                  >
                    secret
                  </a>{" "}
                  named{" "}
                  <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-red-600 dark:text-red-400 font-mono text-xs">
                    OPENAI_API_KEY
                  </code>
                  . <br />
                  You can also use a different model provider by following these{" "}
                  <a
                    href="https://github.com/cloudflare/agents-starter?tab=readme-ov-file#use-a-different-ai-model-provider"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 dark:text-red-400 hover:underline font-medium"
                  >
                    instructions.
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}