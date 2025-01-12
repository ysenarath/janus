import { useEffect } from 'react';

export const SearchSection = () => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="mb-8">
      <form action="https://search.brave.com/search" method="get">
        <input
          type="text"
          name="q"
          id="searchInput"
          className="search-input"
          placeholder="Search Brave..."
          autoComplete="off"
        />
      </form>
    </div>
  );
};
