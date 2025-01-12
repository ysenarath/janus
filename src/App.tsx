import { useState } from 'react';
import { TimeSection } from './components/TimeSection';
import { SearchSection } from './components/SearchSection';
import { QuickLinks } from './components/QuickLinks';
import { QuoteSection } from './components/QuoteSection';
import { ConfigModal } from './components/ConfigModal';
import ASR from './components/ASR';


export const App = () => {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    interface Quote {
        text: string;
        author: string;
    }

    type Config = {
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

    // Load config from localStorage or use default
    const loadConfig = (): Config => {
        const savedConfig = localStorage.getItem('config');
        if (savedConfig) {
            return JSON.parse(savedConfig);
        }
        return {
            backgroundType: 'url',
            backgroundUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000',
            showQuotes: true,
            quotes: [
                { text: "Love all, trust a few, do wrong to none.", author: "William Shakespeare" },
            ],
            quotesUri: '',
            chatEnabled: false,
            chatApiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
            chatApiKey: '',
            chatModel: 'meta-llama/llama-3.1-8b-instruct'
        };
    };

    const [config, setConfig] = useState<Config>(loadConfig());

    // Save config to localStorage whenever it changes
    const handleConfigSave = (newConfig: Config) => {
        localStorage.setItem('config', JSON.stringify(newConfig));
        setConfig(newConfig);
    };

    const handleBackgroundClick = (e: React.MouseEvent) => {
        // Only focus if clicking the background div itself, not its children
        if (e.target === e.currentTarget) {
            const searchInput = document.getElementById('searchInput') as HTMLInputElement;
            searchInput?.focus();
        }
    };

    return (
        <div className="relative">
            <div
                className="min-h-screen flex justify-center items-center bg-cover bg-center bg-no-repeat"
                onClick={handleBackgroundClick}
                style={{
                    backgroundImage: `url("${config.backgroundUrl}")`,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backgroundBlendMode: 'overlay'
                }}
            >
                <div className="relative text-center p-8 text-white space-y-8">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsConfigOpen(true);
                        }}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 z-50"
                        title="Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <div className="space-y-8">
                        <TimeSection />
                        <SearchSection
                            config={{
                                chatEnabled: config.chatEnabled,
                                chatApiEndpoint: config.chatApiEndpoint,
                                chatApiKey: config.chatApiKey,
                                chatModel: config.chatModel
                            }}
                        />
                        <QuickLinks />
                        {config.showQuotes && <QuoteSection quotes={config.quotes} />}
                    </div>
                </div>
            </div>

            {isConfigOpen && (
                <ConfigModal
                    isOpen={isConfigOpen}
                    onClose={() => setIsConfigOpen(false)}
                    config={config}
                    onSave={handleConfigSave}
                />
            )}

            {config.chatEnabled && (
                <ASR />
            )}
        </div>
    );
};
