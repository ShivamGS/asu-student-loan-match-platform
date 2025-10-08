import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle, RefreshCw } from 'lucide-react';
import { chatWebSocketService, ChatMessage } from '../services/chatWebSocket';

export default function AIAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [asuId, setAsuId] = useState('1233606155'); // Default ASU ID
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    chatWebSocketService.connect();

    // Subscribe to connection changes
    const unsubscribeConnection = chatWebSocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Subscribe to messages
    const unsubscribeMessages = chatWebSocketService.onMessage((data) => {
      setIsTyping(false);

      if (data.type === 'session_started' || data.type === 'response') {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message || '',
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMessage]);
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeConnection();
      unsubscribeMessages();
      chatWebSocketService.disconnect();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Send message via WebSocket
    chatWebSocketService.sendUserMessage(inputMessage, asuId);

    // Clear input and show typing indicator
    setInputMessage('');
    setIsTyping(true);
  };

  const handleReconnect = () => {
    chatWebSocketService.disconnect();
    setTimeout(() => {
      chatWebSocketService.connect();
    }, 500);
  };

  const suggestedQuestions = [
    "Suggest best plans for maximum retirement savings",
    "Ask questions based on my personal profile",
    "General information & FAQs",
    "What is SECURE 2.0?",
    "How can I maximize my employer match?",
  ];

  const handleSuggestedClick = (question: string) => {
    if (!isConnected) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Send message via WebSocket
    chatWebSocketService.sendUserMessage(question, asuId);

    // Show typing indicator
    setIsTyping(true);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          {/* Connection Status Bar - Inside scrollable area */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-asu-maroon to-asu-maroon-dark shadow-lg px-6 py-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-asu-gold rounded-full flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-asu-maroon" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI Financial Advisor</h2>
                  <p className="text-xs text-asu-gold">
                    {isConnected ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        Disconnected
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {!isConnected && (
                <button
                  onClick={handleReconnect}
                  className="flex items-center gap-2 bg-asu-gold hover:bg-asu-gold/90 text-asu-maroon px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reconnect
                </button>
              )}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-20">
              <Bot className="w-20 h-20 text-asu-maroon/20 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-asu-gray-900 mb-3">
                Welcome to ASU Financial Advisor
              </h3>
              <p className="text-asu-gray-600 mb-8 max-w-md mx-auto">
                Get personalized advice on retirement savings, student loan repayment, and maximize your employer match benefits.
              </p>
              <p className="text-sm font-semibold text-asu-gray-700 mb-4">Get started with these questions:</p>
              <div className="max-w-2xl mx-auto space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedClick(question)}
                    disabled={!isConnected}
                    className="w-full text-left text-sm bg-white hover:bg-asu-gray-50 text-asu-gray-800 px-4 py-3 rounded-lg transition-all border border-asu-gray-200 hover:border-asu-maroon shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-asu-maroon rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-2xl px-5 py-3 rounded-2xl shadow-sm ${
                    message.role === 'user'
                      ? 'bg-asu-maroon text-white rounded-br-sm'
                      : 'bg-white text-asu-gray-900 border border-asu-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-asu-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-asu-gold rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-asu-maroon" />
                  </div>
                )}
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-asu-maroon rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-asu-gray-200 px-5 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-asu-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-asu-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-asu-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="flex-shrink-0 bg-white border-t border-asu-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {!isConnected && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Connection lost. Click reconnect to continue.</span>
            </div>
          )}

          {/* Suggested Questions - Above Input */}
          {messages.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-asu-gray-600 mb-2 font-medium">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedClick(question)}
                    disabled={!isConnected}
                    className="text-xs bg-asu-gray-50 hover:bg-asu-maroon hover:text-white text-asu-gray-700 px-3 py-2 rounded-lg transition-all border border-asu-gray-200 hover:border-asu-maroon disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1 px-4 py-3 border border-asu-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent disabled:bg-asu-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!isConnected || !inputMessage.trim()}
              className="bg-asu-maroon hover:bg-asu-maroon-dark text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
