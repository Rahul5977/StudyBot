import React, { useState, useEffect, useRef } from "react";
import { chatWithAI } from "../utils/api";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);

    try {
      const response = await chatWithAI(userMessage, sessionId);

      // Update session ID if this is the first message
      if (!sessionId) {
        setSessionId(response.session_id);
      }

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: response.response,
          contextChunks: response.context_chunks,
          agentSteps: response.agent_steps,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatContextChunks = (chunks) => {
    if (!chunks || chunks.length === 0) return null;

    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 max-h-40 overflow-y-auto">
        <p className="text-sm font-medium text-blue-800 mb-2">
          📚 Sources ({chunks.length} relevant chunks):
        </p>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {chunks.map((chunk, index) => (
            <div
              key={index}
              className="text-xs text-blue-700 p-2 bg-white rounded border"
            >
              <div className="font-medium mb-1">
                📄 {chunk.metadata?.source_file || "Unknown"}
                {chunk.page && ` - Page ${chunk.page}`}
                <span className="ml-2 text-blue-600">
                  (Score: {(chunk.score * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="text-gray-600 line-clamp-2">
                {chunk.text.length > 150
                  ? `${chunk.text.substring(0, 150)}...`
                  : chunk.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              🤖 StudyBuddy Chat
            </h2>
            <p className="text-blue-100 mt-1">
              Ask questions about your uploaded documents
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              🗑️ Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages Container - This is the scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-lg">Start a conversation!</p>
            <p className="text-sm mt-2">
              Upload some documents first, then ask me anything about them.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-3xl rounded-lg px-4 py-3 ${
                message.type === "user"
                  ? "bg-blue-600 text-white ml-8"
                  : message.type === "error"
                  ? "bg-red-100 text-red-800 mr-8"
                  : "bg-gray-100 text-gray-800 mr-8"
              }`}
            >
              {message.type === "user" && (
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium">You</span>
                </div>
              )}

              {message.type === "ai" && (
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    🤖 StudyBuddy
                  </span>
                </div>
              )}

              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>

              {message.type === "ai" &&
                formatContextChunks(message.contextChunks)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-3xl mr-8">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-blue-600">
                  🤖 StudyBuddy
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-gray-500 text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="border-t p-4 flex-shrink-0 bg-white">
        <div className="flex space-x-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your documents..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex-shrink-0"
          >
            Send
          </button>
        </div>

        {sessionId && (
          <p className="text-xs text-gray-500 mt-2">
            Session ID: {sessionId.substring(0, 8)}...
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
