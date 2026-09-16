"use client";

import React, { useState } from "react";
import { API_BASE_URL } from "@/context/AuthContext";

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your Smart School IoT Conversational AI Assistant powered by Google Gemini. Ask me any operational questions regarding attendance trends, bus delays, overspeed violations, or device health.",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const presetQuestions = [
    "Which bus had the most delays this week?",
    "Which class has the lowest attendance?",
    "Show buses with repeated overspeed violations.",
    "Summarize today's school operations.",
    "Which routes have recurring delays?",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputPrompt;
    if (!textToSend.trim()) return;

    const userMsg = { sender: "user" as const, text: textToSend, time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputPrompt("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt: textToSend }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: data.data.answer, time: new Date().toLocaleTimeString() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "I encountered an error processing your query. Please try again.", time: new Date().toLocaleTimeString() },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Network error connecting to AI Assistant engine.", time: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            Powered by Google Gemini 2.5 AI
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversational AI Assistant</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Query live telemetry, student punctuality, fleet delays, and safety violations in plain English.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
          💡 Quick Suggested Operational Queries
        </span>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 flex flex-col h-[480px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  🤖
                </div>
              )}
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs space-y-1 ${
                  msg.sender === "user"
                    ? "bg-brand-500 text-white font-medium rounded-tr-none"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-200 dark:border-gray-700"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                <span className="block text-[9px] opacity-60 text-right font-mono">{msg.time}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 animate-pulse">
                🤖
              </div>
              <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 italic">
                AI is querying ground truth application data and synthesizing answer...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask a question about school operations, buses, or attendance..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            Ask AI 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
