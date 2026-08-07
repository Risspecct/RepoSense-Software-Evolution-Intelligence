import { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';

interface ClassSelectorProps {
  onClassSelected: (classId: string) => void;
  isLoading?: boolean;
}

export const ClassSelector = ({ onClassSelected, isLoading }: ClassSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      // Search for class by name using the existing endpoint
      const response = await fetch(`http://127.0.0.1:8000/graph/classes/${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const classData = await response.json();
        setSearchResults([classData]);
        setError(null);
      } else if (response.status === 404) {
        setSearchResults([]);
        setError(`No class found with name "${searchQuery}". Try: User, UserController, BlogPlatformApplication, etc.`);
      } else {
        throw new Error(`Search failed: ${response.status}`);
      }
    } catch (err) {
      console.error('Class search error:', err);
      setError('Failed to search for class. Check backend connection.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#243B6B]/10 rounded-2xl mb-4">
            <Search className="w-8 h-8 text-[#243B6B]" />
          </div>
          <h2 className="text-2xl font-bold text-[#171A21]">
            Repository Indexed Successfully
          </h2>
          <p className="text-sm text-[#5B5F6B] max-w-lg mx-auto">
            Search for a class name to explore its subgraph. Common examples: <strong>User</strong>, <strong>UserController</strong>, <strong>Application</strong>
          </p>
        </div>

        {/* Search Input */}
        <div className="bg-white border border-[#E4E1D8] rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-3 bg-[#F8F7F4] border border-[#E4E1D8] px-4 py-3 rounded-xl">
              <Search className="w-5 h-5 text-[#5B5F6B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter class name (e.g., User, UserController)..."
                className="flex-1 bg-transparent text-sm font-mono-code focus:outline-none text-[#171A21] placeholder-[#5B5F6B]"
                disabled={isSearching || isLoading}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || isLoading || !searchQuery.trim()}
              className="px-6 py-3 bg-[#243B6B] hover:bg-[#1E293B] text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Common Suggestions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-[#5B5F6B] font-mono-code">Quick search:</span>
            {['User', 'UserController', 'UserService', 'Application', 'Main'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setSearchQuery(suggestion);
                  setTimeout(() => handleSearch(), 100);
                }}
                disabled={isSearching || isLoading}
                className="px-2.5 py-1 bg-[#F8F7F4] hover:bg-[#E4E1D8] border border-[#E4E1D8] text-xs font-mono-code text-[#171A21] rounded-lg transition disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#B5442C]/10 border border-[#B5442C]/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#B5442C] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#B5442C]">Not Found</h3>
              <p className="text-xs text-[#171A21] mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white border border-[#E4E1D8] rounded-2xl shadow-sm divide-y divide-[#E4E1D8]">
            {searchResults.map((classData, idx) => (
              <button
                key={idx}
                onClick={() => onClassSelected(classData.id)}
                disabled={isLoading}
                className="w-full p-4 hover:bg-[#F8F7F4] transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-bold text-[#171A21] font-mono-code">
                      {classData.name}
                    </h3>
                    <p className="text-xs text-[#5B5F6B] font-mono-code">
                      {classData.id}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className="px-2 py-0.5 bg-[#243B6B]/10 text-[#243B6B] text-[10px] font-mono-code font-bold rounded">
                        {classData.type}
                      </span>
                      {classData.modifiers?.map((mod: string) => (
                        <span key={mod} className="px-2 py-0.5 bg-[#F8F7F4] border border-[#E4E1D8] text-[#5B5F6B] text-[10px] font-mono-code rounded">
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className="px-3 py-1.5 bg-[#243B6B] text-white text-xs font-bold rounded-lg">
                      View Graph →
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="text-center text-xs text-[#5B5F6B] font-mono-code space-y-1">
          <p>💡 Tip: Search by simple class name (e.g., "User" not "com.example.User")</p>
          <p>The graph will show the class and its immediate dependencies</p>
        </div>
      </div>
    </div>
  );
};
