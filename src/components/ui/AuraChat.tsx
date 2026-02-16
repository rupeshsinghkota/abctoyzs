"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, ChevronDown, Sparkles } from "lucide-react";

type Message = {
    role: "user" | "model";
    text: string;
};

export function AuraChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", text: "I'm Aura, your automated assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [handover, setHandover] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    async function handleSend() {
        if (!input.trim() || loading || handover) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setLoading(true);

        try {
            // Prepare history for API (excluding the last user message we just added locally)
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    history: history
                })
            });

            const data = await res.json();

            if (data.error) {
                console.error(data.error);
                setMessages(prev => [...prev, { role: "model", text: "I'm having trouble accessing the database right now. Please try again." }]);
            } else {
                setMessages(prev => [...prev, { role: "model", text: data.response }]);
                if (data.handover) {
                    setHandover(true);
                }
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "model", text: "Connection error. Please check your internet." }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-4 z-40 p-4 bg-zinc-900 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all hover:scale-105 flex items-center gap-2"
                >
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-sm hidden md:inline">Ask Aura</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-4 right-4 z-50 w-[90vw] md:w-96 h-[500px] max-h-[80vh] bg-white border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold">Aura</h3>
                                <p className="text-xs text-zinc-400">Automated Operations Lead</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === "user"
                                            ? "bg-zinc-900 text-white rounded-tr-none"
                                            : "bg-white border shadow-sm rounded-tl-none text-zinc-800"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75" />
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t">
                        {handover ? (
                            <div className="p-3 bg-amber-50 text-amber-800 text-xs font-bold text-center rounded-lg border border-amber-200">
                                Conversation handed over to human support.
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 bg-zinc-100 border-transparent focus:bg-white border focus:border-zinc-300 rounded-xl text-sm outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
