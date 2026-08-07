import { useState } from 'react';
import { Sparkles, Send, X, Bot } from 'lucide-react';

export const RepoChatDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am RepoSense GraphRAG Assistant. Ask me anything about repository evolution, developer intent, or risk impact.',
    },
  ]);

  const presetQuestions = [
    'Why was Redis introduced?',
    'Which modules depend on jwt_verifier.py?',
    'Who is the primary owner of Auth?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `[GraphRAG Context Traversal]\nTraversed nodes: File(jwt_verifier.py) ➔ Commit(#89a2e) ➔ Dev(Alex R.)\n\nAnswer: ${query.includes('jwt') ? 'jwt_verifier.py was refactored in PR #104 to resolve a race condition during concurrent API logins.' : 'Based on knowledge graph relationships, Alex Rivera authored 78% of modifications in this service.'}`,
        },
      ]);
    }, 800);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all z-50 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>Ask RepoSense AI</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-sm text-slate-100">Repository GraphRAG Chat</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-700 rounded-lg cursor-pointer">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && <Bot className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />}
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed max-w-[80%] whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-slate-800 bg-slate-950/50 flex gap-2 overflow-x-auto">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-full transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-900">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a natural language question..."
              className="flex-1 bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};