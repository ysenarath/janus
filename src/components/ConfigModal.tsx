import { useState, useEffect } from 'react';

const CHAR_LIMIT = 150; // Maximum characters for quote text

interface Quote {
    text: string;
    author: string;
}

interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: {
        backgroundType: 'url' | 'unsplash';
        backgroundUrl: string;
        showQuotes: boolean;
        quotes: Quote[];
        quotesUri: string;
        chatEnabled: boolean;
        chatApiEndpoint: string;
        chatApiKey: string;
        chatModel: string;
    };
    onSave: (newConfig: {
        backgroundType: 'url' | 'unsplash';
        backgroundUrl: string;
        showQuotes: boolean;
        quotes: Quote[];
        quotesUri: string;
        chatEnabled: boolean;
        chatApiEndpoint: string;
        chatApiKey: string;
        chatModel: string;
    }) => void;
}

export const ConfigModal = ({ isOpen, onClose, config, onSave }: ConfigModalProps) => {
    const [tempConfig, setTempConfig] = useState({ ...config });

    // Reset tempConfig when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempConfig({ ...config });
        }
    }, [isOpen, config]);
    const [activeTab, setActiveTab] = useState<'general' | 'quotes' | 'chat'>('general');

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(tempConfig);
        onClose();
    };

    const handleAddQuote = () => {
        setTempConfig({
            ...tempConfig,
            quotes: [...tempConfig.quotes, { text: '', author: '' }]
        });
    };

    const handleRemoveQuote = (index: number) => {
        setTempConfig({
            ...tempConfig,
            quotes: tempConfig.quotes.filter((_, i) => i !== index)
        });
    };

    const handleQuoteChange = (index: number, field: 'text' | 'author', value: string) => {
        const newQuotes = [...tempConfig.quotes];
        newQuotes[index] = { ...newQuotes[index], [field]: value };
        setTempConfig({
            ...tempConfig,
            quotes: newQuotes
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]" onClick={onClose}>
            <div className="bg-white text-black p-6 rounded-lg w-[800px]" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Settings</h2>

                <div className="flex gap-4 mb-4 border-b">
                    <button
                        className={`px-4 py-2 ${activeTab === 'general' ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'quotes' ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab('quotes')}
                    >
                        Quotes
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'chat' ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        Chat
                    </button>
                </div>

                {activeTab === 'general' ? (
                    <div>
                        <div className="space-y-4">
                            <label className="block mb-2">Background Type</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={tempConfig.backgroundType}
                                onChange={(e) => setTempConfig({
                                    ...tempConfig,
                                    backgroundType: e.target.value as 'url' | 'unsplash'
                                })}
                            >
                                <option value="url">Custom URL</option>
                                <option value="unsplash">Unsplash</option>
                            </select>
                        </div>

                        {tempConfig.backgroundType === 'url' && (
                            <div className="mb-4">
                                <label className="block mb-2">Background URL</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={tempConfig.backgroundUrl}
                                    onChange={(e) => setTempConfig({
                                        ...tempConfig,
                                        backgroundUrl: e.target.value
                                    })}
                                    placeholder="Enter image URL"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={tempConfig.showQuotes}
                                    onChange={(e) => setTempConfig({
                                        ...tempConfig,
                                        showQuotes: e.target.checked
                                    })}
                                    className="mr-2"
                                />
                                Show Quotes
                            </label>
                        </div>
                    </div>

                ) : activeTab === 'quotes' ? (
                    <div className="space-y-4">
                        <div className="mb-4">
                            <label className="block mb-2">Quotes URI</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border rounded"
                                    value={tempConfig.quotesUri}
                                    onChange={(e) => setTempConfig({
                                        ...tempConfig,
                                        quotesUri: e.target.value
                                    })}
                                    placeholder="Enter URI for quotes JSON"
                                />
                                <button
                                    onClick={async () => {
                                        try {
                                            // Ensure we're requesting JSON format
                                            const uri = new URL(tempConfig.quotesUri);
                                            uri.searchParams.set('format', 'json');

                                            const response = await fetch(uri.toString());
                                            if (!response.ok) {
                                                throw new Error(`HTTP error! status: ${response.status}`);
                                            }

                                            const data = await response.json();

                                            let quotes: Quote[] = [];

                                            if (data.quotes) {
                                                // Handle paginated /quotes response
                                                quotes = data.quotes.map((q: any) => ({
                                                    text: q.text,
                                                    author: q.author
                                                }));
                                            } else if (data.text && data.author) {
                                                // Handle single quote response from /random-quote
                                                quotes = [{ text: data.text, author: data.author }];
                                            } else if (Array.isArray(data)) {
                                                // Handle array of quotes
                                                quotes = data.map((q: any) => ({
                                                    text: q.text,
                                                    author: q.author
                                                }));
                                            } else {
                                                throw new Error('Unexpected response format');
                                            }

                                            if (quotes.length === 0) {
                                                throw new Error('No quotes found in response');
                                            }

                                            setTempConfig({
                                                ...tempConfig,
                                                quotes
                                            });
                                            alert(`Successfully loaded ${quotes.length} quote${quotes.length === 1 ? '' : 's'}`);
                                        } catch (err) {
                                            const error = err as Error;
                                            alert(
                                                'Failed to fetch quotes. Please ensure:\n\n' +
                                                '1. The URI is valid and accessible\n' +
                                                '2. The endpoint returns either:\n' +
                                                '   - A paginated response with a quotes array\n' +
                                                '   - A single quote object with text and author\n' +
                                                '   - An array of quote objects with text and author\n\n' +
                                                `Error: ${error.message}`
                                            );
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    disabled={!tempConfig.quotesUri}
                                >
                                    Fetch Quotes
                                </button>
                            </div>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto space-y-4">
                            {tempConfig.quotes.map((quote, index) => (
                                <div key={index} className="p-4 border rounded relative">
                                    <button
                                        onClick={() => handleRemoveQuote(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block mb-1">Quote Text</label>
                                            <div>
                                                <textarea
                                                    value={quote.text}
                                                    onChange={(e) => handleQuoteChange(index, 'text', e.target.value)}
                                                    className={`w-full p-2 border rounded ${quote.text.length > CHAR_LIMIT ? 'border-red-500' : ''}`}
                                                    rows={2}
                                                />
                                                <div className={`text-sm mt-1 ${quote.text.length > CHAR_LIMIT ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {quote.text.length}/{CHAR_LIMIT} characters
                                                    {quote.text.length > CHAR_LIMIT && (
                                                        <span className="ml-2">
                                                            Quote will be truncated when displayed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-1">Author</label>
                                            <input
                                                type="text"
                                                value={quote.author}
                                                onChange={(e) => handleQuoteChange(index, 'author', e.target.value)}
                                                className="w-full p-2 border rounded"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddQuote}
                            className="w-full p-2 border-2 border-dashed rounded hover:bg-gray-50"
                        >
                            + Add Quote
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={tempConfig.chatEnabled}
                                    onChange={(e) => setTempConfig({
                                        ...tempConfig,
                                        chatEnabled: e.target.checked
                                    })}
                                    className="mr-2"
                                />
                                Enable Chat
                            </label>
                        </div>

                        {tempConfig.chatEnabled && (
                            <>
                                <div className="mb-4">
                                    <label className="block mb-2">API Endpoint</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded"
                                        value={tempConfig.chatApiEndpoint}
                                        onChange={(e) => setTempConfig({
                                            ...tempConfig,
                                            chatApiEndpoint: e.target.value
                                        })}
                                        placeholder="https://openrouter.ai/api/v1/chat/completions"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2">API Key</label>
                                    <input
                                        type="password"
                                        className="w-full p-2 border rounded"
                                        value={tempConfig.chatApiKey}
                                        onChange={(e) => setTempConfig({
                                            ...tempConfig,
                                            chatApiKey: e.target.value
                                        })}
                                        placeholder="Enter your API key"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2">Model</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded"
                                        value={tempConfig.chatModel}
                                        onChange={(e) => setTempConfig({
                                            ...tempConfig,
                                            chatModel: e.target.value
                                        })}
                                        placeholder="meta-llama/llama-3.1-8b-instruct"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
