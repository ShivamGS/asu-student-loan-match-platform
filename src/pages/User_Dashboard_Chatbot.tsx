import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { chatWebSocketService, ChatMessage } from '../services/chatWebSocket';
import { getCurrentSession } from '../services/auth';

export default function User_Dashboard_Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get user session for ASU ID
  const session = getCurrentSession();
  const asuId = session?.profile.employeeId || '1233606155'; // Fallback to default

  // Suggested quick questions
  const quickQuestions = [
    'How does the employer match work?',
    'What documents do I need to upload?',
    'How much can I save for retirement?',
    'When will my documents be approved?',
    'How do I qualify for the match?'
  ];

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

      if (data.type === 'session_started') {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message || 'Hello! I am your ASU Student Loan Retirement Match assistant. How can I help you today?',
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      } else if (data.type === 'response') {
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

  const handleQuickQuestion = (question: string) => {
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

  const handleReconnect = () => {
    chatWebSocketService.disconnect();
    setTimeout(() => {
      chatWebSocketService.connect();
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header with Connection Status */}
      <div className="bg-gradient-to-r from-asu-maroon to-asu-maroon-dark shadow-lg px-6 py-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-asu-gold rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-asu-maroon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Finance Assistant</h2>
              <p className="text-sm text-asu-gold flex items-center gap-2">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Connected
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    Disconnected
                  </>
                )}
              </p>
            </div>
          </div>
          {!isConnected && (
            <button
              onClick={handleReconnect}
              className="flex items-center gap-2 bg-asu-gold hover:bg-asu-gold/90 text-asu-maroon px-4 py-2 rounded-lg transition-colors text-sm font-semibold shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Reconnect
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <Bot className="w-20 h-20 text-asu-maroon/20 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome to Benefits Assistant
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get personalized advice on retirement savings, student loan repayment, and maximize your employer match benefits.
              </p>
              <p className="text-sm font-semibold text-gray-700 mb-4">Get started with these questions:</p>
              <div className="max-w-2xl mx-auto space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    disabled={!isConnected}
                    className="w-full text-left text-sm bg-white hover:bg-gray-50 text-gray-800 px-4 py-3 rounded-lg transition-all border border-gray-200 hover:border-asu-maroon shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="w-8 h-8 bg-gradient-to-br from-asu-maroon to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-2xl px-5 py-3 rounded-2xl shadow-sm ${
                    message.role === 'user'
                      ? 'bg-asu-maroon text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
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

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-asu-maroon to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="max-w-4xl mx-auto">
          {/* Connection Lost Warning */}
          {!isConnected && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Connection lost. Click reconnect to continue.</span>
            </div>
          )}

          {/* Quick Questions - Only show when there are messages */}
          {messages.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2 font-medium">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    disabled={!isConnected}
                    className="text-xs bg-gray-50 hover:bg-asu-maroon hover:text-white text-gray-700 px-3 py-2 rounded-lg transition-all border border-gray-200 hover:border-asu-maroon disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
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
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
