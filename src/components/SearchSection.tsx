import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SearchSectionProps {
  config: {
    chatEnabled: boolean;
    chatApiEndpoint: string;
    chatApiKey: string;
    chatModel: string;
  };
}

export const SearchSection = ({ config }: SearchSectionProps) => {
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName !== 'INPUT') {
        if (e.key === '/') {
          e.preventDefault();
          setIsChatMode(false);
          inputRef.current?.focus();
        } else if (e.key === 'Tab' && config.chatEnabled) {
          e.preventDefault();
          setIsChatMode(true);
          inputRef.current?.focus();
        }
      } else if (e.key === 'Tab' && config.chatEnabled) {
        e.preventDefault();
        setIsChatMode(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [config.chatEnabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isChatMode) {
      window.location.href = `https://search.brave.com/search?q=${encodeURIComponent(input)}`;
      return;
    }

    if (isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        config.chatApiEndpoint,
        {
          model: config.chatModel,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            ...messages,
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.chatApiKey}`,
            'HTTP-Referer': window.location.href,
            'X-Title': 'Janus',
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const assistantMessage = response.data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.error?.message
        ? error.response.data.error.message
        : 'Sorry, I encountered an error. Please try again.';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`transition-all duration-300 ${isChatMode ? 'h-[28rem]' : 'h-auto'}`}>
      <div className={`relative ${isChatMode ? 'mb-4' : ''}`}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`search-input ${isChatMode ? 'bg-opacity-10' : ''}`}
            placeholder={isChatMode ? "Chat with AI..." : "Search Brave..."}
            autoComplete="off"
            disabled={isLoading}
          />
          {config.chatEnabled && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 text-white/50 text-sm pointer-events-none select-none z-10 w-32 text-right">
              Press Tab to {isChatMode ? 'search' : 'chat'}
            </div>
          )}
        </form>
      </div>

      {isChatMode && (
        <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="h-[22rem] overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
            {[...messages].reverse().map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white bg-opacity-10 text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white bg-opacity-10 text-white rounded-lg p-3 animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};
