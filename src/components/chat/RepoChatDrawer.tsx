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
    'What changed in PR #104?',
  ];


  const mockQuestionAnswers = [
    {
      question: "Why was Redis introduced?",
      answer:
        "Redis was introduced to cache authentication sessions and frequently accessed user data. This reduced repeated database queries and improved response latency during peak traffic.",
    },
    {
      question: "Which modules depend on jwt_verifier.py?",
      answer:
        "The Auth module, Session Service, API Gateway, and Token Refresh Service directly depend on jwt_verifier.py.",
    },
    {
      question: "Who owns the Auth module?",
      answer:
        "Based on commit history and pull requests, Alex Rivera is the primary contributor and maintainer of the Auth module.",
    },
    {
      question: "What changed in PR #104?",
      answer:
        "PR #104 refactored jwt_verifier.py to eliminate a race condition during concurrent authentication requests and added additional unit tests.",
    },
    {
      question: "Explain the authentication flow.",
      answer:
        "Incoming requests reach the API Gateway, which invokes jwt_verifier.py. Valid tokens are forwarded to the Auth Service, where user roles and permissions are validated before the request reaches downstream services.",
    },
    {
      question: "Which classes are related to authentication?",
      answer:
        "AuthService, JwtVerifier, TokenProvider, UserRepository, SessionManager, and AuthenticationController participate in the authentication workflow.",
    },
    {
      question: "Which files changed the most?",
      answer:
        "jwt_verifier.py, auth_service.py, session_manager.py, and token_provider.py have the highest number of commits in the repository.",
    },
    {
      question: "Which developer contributed the most?",
      answer:
        "Risspecct contributed the largest number of commits, followed by Shresth-Agarwal and disha2211.",
    },
    {
      question: "Which files are most risky?",
      answer:
        "jwt_verifier.py and auth_service.py have the highest change frequency and dependency count, making them the highest-risk files.",
    },
    {
      question: "What is the dependency chain of Auth?",
      answer:
        "AuthenticationController → AuthService → JwtVerifier → UserRepository → RedisCache.",
    },
    {
      question: "What happens during login?",
      answer:
        "Credentials are validated, a JWT is generated, the session is cached in Redis, and the access token is returned to the client.",
    },
    {
      question: "How is JWT validated?",
      answer:
        "JwtVerifier validates the token signature, expiration time, issuer, and user claims before allowing the request to continue.",
    },
    {
      question: "Which module imports SessionManager?",
      answer:
        "AuthService, LoginController, RefreshTokenService, and SessionCleanupJob import SessionManager.",
    },
    {
      question: "Show the impact of modifying JwtVerifier.",
      answer:
        "Changing JwtVerifier affects authentication, authorization, session validation, API Gateway routing, and token refresh workflows.",
    },
    {
      question: "Summarize the repository.",
      answer:
        "This repository implements a JWT-based authentication platform using Redis for session caching. The architecture is modular, with dedicated services for authentication, session management, and token generation.",
    },
    {
      question: "What does AuthService do?",
      answer:
        "AuthService authenticates users, validates credentials, generates JWT tokens, and coordinates session creation.",
    },
    {
      question: "Which tests cover authentication?",
      answer:
        "AuthServiceTest, JwtVerifierTest, AuthenticationControllerTest, and SessionManagerTest cover the authentication subsystem.",
    },
    {
      question: "Explain repository architecture.",
      answer:
        "The repository follows a layered architecture consisting of Controllers, Services, Repositories, Utility Classes, and Infrastructure components.",
    },
    {
      question: "How is Redis used?",
      answer:
        "Redis stores active sessions, refresh tokens, authentication metadata, and frequently accessed user information to reduce database load.",
    },
    {
      question: "How does RepoSense answer questions?",
      answer:
        "RepoSense performs semantic retrieval, expands repository relationships through the graph, builds repository context, and then generates grounded answers using an LLM.",
    },
  ];

  const normalizeQuestion = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  const getMockAnswer = (query: string) => {
    const normalizedQuery = normalizeQuestion(query);

    const directMatch = mockQuestionAnswers.find(({ question }) => normalizeQuestion(question) === normalizedQuery);
    if (directMatch) {
      return directMatch.answer;
    }

    const keywordMatch = mockQuestionAnswers.find(({ question }) => {
      const normalizedQuestion = normalizeQuestion(question);
      return normalizedQuery.includes(normalizedQuestion) || normalizedQuestion.includes(normalizedQuery);
    });

    if (keywordMatch) {
      return keywordMatch.answer;
    }

    return 'I do not have a answer for that question yet. Try one of the suggested prompts to see the canned responses.';
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInput('');

    setTimeout(() => {
      const mockAnswer = getMockAnswer(query);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `[RepoSense Answer]\n\n${mockAnswer}`,
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