import { useEffect, useState } from 'react';

interface Quote {
    text: string;
    author: string;
}

interface Props {
    quotes: Quote[];
}

export const QuoteSection = ({ quotes }: Props) => {
    const [quote, setQuote] = useState<Quote | null>(null);

    const CHAR_LIMIT = 150; // Maximum characters for quote text

    const truncateText = (text: string) => {
        if (text.length <= CHAR_LIMIT) return text;
        return text.substring(0, CHAR_LIMIT) + "...";
    };

    const getRandomQuote = () => {
        if (quotes.length === 0) {
            setQuote({ text: "Add quotes in settings", author: "System" });
            return;
        }
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote({
            text: truncateText(randomQuote.text),
            author: randomQuote.author
        });
    };

    useEffect(() => {
        getRandomQuote();
    }, [quotes]); // Re-run when quotes change

    if (!quote) return null;

    return (
        <div className="mt-8 w-[600px] flex flex-col items-center">
            <div className="mb-4 w-full h-[120px] flex flex-col items-center justify-center">
                <p className="text-lg italic mb-2 text-center">"{quote.text}"</p>
                <p className="text-sm opacity-80 text-center">— {quote.author}</p>
            </div>
            <button 
                onClick={getRandomQuote}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
                New Quote
            </button>
        </div>
    );
};
