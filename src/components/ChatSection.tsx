import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatSectionProps {
    config: {
        apiEndpoint: string;
        apiKey: string;
        model: string;
    };
}

export const ChatSection = ({ config }: ChatSectionProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const payload = {
                model: config.model,
                messages: [
                    { role: 'system', content: 'You are a helpful AI assistant.' },
                    ...messages,
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
            };

            console.log('Request payload:', payload);
            console.log('Request headers:', {
                'Authorization': `Bearer ${config.apiKey.substring(0, 5)}...`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Janus',
                'Content-Type': 'application/json'
            });

            const response = await axios.post(
                config.apiEndpoint,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiKey}`,
                        'HTTP-Referer': window.location.href,
                        'X-Title': 'Janus',
                        'Content-Type': 'application/json'
                    },
                }
            );

            console.log('Response:', response.data);

            if (!response.data?.choices?.[0]?.message?.content) {
                throw new Error('Invalid response format from API');
            }

            const assistantMessage = response.data.choices[0].message.content;
            console.log('Assistant message:', assistantMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            console.error('Chat error:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response status:', error.response?.status);
                console.error('Response data:', error.response?.data);
                console.error('Response headers:', error.response?.headers);
            }
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
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-96 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-black'
                                    }`}
                            >
                                {message.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 p-2 border rounded"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
