// WebSocket service for AI chatbot
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: string;
  message?: string;
  session_id?: string;
  timestamp?: string;
}

class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private messageCallbacks: ((message: WebSocketMessage) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.ws = new WebSocket('wss://yrorziuas2.execute-api.us-east-1.amazonaws.com/dev');

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnectionCallbacks(true);
        
        // Send start action to begin session
        this.sendMessage({ action: 'start' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data);

          // Store session_id if provided
          if (data.session_id) {
            this.sessionId = data.session_id;
          }

          // Notify all message callbacks
          this.messageCallbacks.forEach(callback => callback(data));
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.notifyConnectionCallbacks(false);
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.sessionId = null;
    this.reconnectAttempts = 0;
  }

  sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('Sent:', message);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  sendUserMessage(userMessage: string, asuId?: string) {
    const message: any = {
      action: 'message',
      message: userMessage,
    };

    if (asuId) {
      message.user_data = {
        asu_id: asuId,
      };
    }

    this.sendMessage(message);
  }

  onMessage(callback: (message: WebSocketMessage) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}

export const chatWebSocketService = new ChatWebSocketService();
