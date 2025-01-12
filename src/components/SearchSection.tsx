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
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                setIsChatMode(false);
                inputRef.current?.focus();
            } else if (e.key === 'Tab' && config.chatEnabled) {
                e.preventDefault();
                if (document.activeElement?.tagName !== 'INPUT') {
                    setIsChatMode(true);
                    inputRef.current?.focus();
                } else {
                    setIsChatMode(prev => !prev);
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [config.chatEnabled]);

    // Keep focus on input after messages update or loading state changes
    useEffect(() => {
        if (isChatMode) {
            inputRef.current?.focus();
        }
    }, [messages, isLoading, isChatMode]);

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
        <div className={`transition-all duration-300 min-h-[3.5rem] ${isChatMode ? 'h-[28rem]' : 'h-[3.5rem]'} max-w-2xl mx-auto px-4`}>
            <div className="relative h-[3.5rem] flex items-center">
                <form onSubmit={handleSubmit} className="relative w-full">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className={`search-input w-full ${isChatMode ? 'bg-opacity-10' : ''}`}
                        placeholder={isChatMode ? "Chat with AI..." : "Search Brave..."}
                        autoComplete="off"
                        disabled={isLoading}
                    />
                    {config.chatEnabled && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-sm pointer-events-none select-none z-10">
                            Press Tab to {isChatMode ? 'search' : 'chat'}
                        </div>
                    )}
                </form>
            </div>

            {isChatMode && (
                <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-lg overflow-hidden">
                    <div className="h-[21rem] overflow-y-auto p-4 space-y-4 flex flex-col">
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white bg-opacity-10 text-white rounded-lg p-3 animate-pulse">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        {[...messages].reverse().map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white bg-opacity-10 text-white'
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}
        </div>
    );
};
