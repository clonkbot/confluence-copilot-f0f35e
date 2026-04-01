import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConfluencePage {
  id: string;
  title: string;
  space: string;
  lastModified: string;
}

const mockPages: ConfluencePage[] = [
  { id: '1', title: '2024 Product Roadmap', space: 'Planning', lastModified: '2일 전' },
  { id: '2', title: 'API Documentation v2', space: 'Engineering', lastModified: '1주 전' },
  { id: '3', title: 'Brand Guidelines', space: 'Design', lastModified: '3일 전' },
  { id: '4', title: 'Onboarding Process', space: 'HR', lastModified: '5일 전' },
  { id: '5', title: 'Q4 Marketing Strategy', space: 'Marketing', lastModified: '어제' },
];

function FloatingNodes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-amber-400/20"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
          }}
          animate={{
            x: [
              Math.random() * 100 + '%',
              Math.random() * 100 + '%',
              Math.random() * 100 + '%',
            ],
            y: [
              Math.random() * 100 + '%',
              Math.random() * 100 + '%',
              Math.random() * 100 + '%',
            ],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {[...Array(6)].map((_, i) => (
          <motion.line
            key={i}
            x1={`${10 + i * 15}%`}
            y1="0%"
            x2={`${50 + i * 10}%`}
            y2="100%"
            stroke="url(#lineGrad)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: i * 0.2 }}
          />
        ))}
      </svg>
    </div>
  );
}

function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50"
    >
      <motion.div
        className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-xs text-slate-400 font-medium">
        {connected ? 'Confluence 연결됨' : '연결 대기중'}
      </span>
    </motion.div>
  );
}

function PageCard({ page, onClick }: { page: ConfluencePage; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left p-3 md:p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/30 hover:border-amber-500/30 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-200 text-sm truncate group-hover:text-amber-300 transition-colors">
            {page.title}
          </h4>
          <p className="text-xs text-slate-500 mt-1">{page.space}</p>
        </div>
        <span className="text-[10px] text-slate-600 whitespace-nowrap">{page.lastModified}</span>
      </div>
    </motion.button>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md'
            : 'bg-slate-800/80 text-slate-200 rounded-2xl rounded-bl-md border border-slate-700/30'
        } px-4 py-3 shadow-lg`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-[10px] mt-2 ${isUser ? 'text-blue-200' : 'text-slate-500'}`}>
          {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

function App() {
  const [connected, setConnected] = useState(false);
  const [confluenceUrl, setConfluenceUrl] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleConnect = () => {
    if (confluenceUrl.trim()) {
      setConnected(true);
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Confluence에 성공적으로 연결되었습니다! 🎉\n\n${mockPages.length}개의 문서를 찾았습니다. 이제 문서를 기반으로 질문하거나, 기획 작업을 도와드릴 수 있어요.\n\n예시 질문:\n• "2024 로드맵을 요약해줘"\n• "API 문서 기반으로 개발 가이드 작성해줘"\n• "마케팅 전략과 브랜드 가이드라인을 연결해서 캠페인 기획해줘"`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `좋은 질문이에요! "${inputValue}"에 대해 관련 문서를 분석해볼게요.\n\n📄 참조된 문서:\n• 2024 Product Roadmap\n• Q4 Marketing Strategy\n\n분석 결과, 현재 문서에서 관련 내용을 찾았습니다. 더 자세한 기획이 필요하시면 말씀해주세요.`,
        `"${inputValue}" 관련해서 Confluence 문서를 확인했어요.\n\n🔍 발견된 인사이트:\n기존 문서에서 유사한 패턴을 발견했습니다. 이를 바탕으로 새로운 기획안을 작성해드릴까요?`,
        `네, 이해했어요! 요청하신 내용을 기존 문서와 연결해서 분석중이에요.\n\n💡 제안:\n현재 가지고 계신 문서들을 조합하면 더 완성도 높은 기획이 가능할 것 같아요. 어떤 방향으로 진행할까요?`,
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 1500);
  };

  const handlePageClick = (page: ConfluencePage) => {
    setInputValue(`"${page.title}" 문서를 기반으로 `);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-950 text-slate-100 relative overflow-hidden">
      <FloatingNodes />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950 pointer-events-none" />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
      />

      <div className="relative z-10 flex flex-col h-screen h-[100dvh]">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 md:px-8 md:py-6 border-b border-slate-800/50"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-serif font-semibold tracking-tight">Confluence Copilot</h1>
              <p className="text-[10px] md:text-xs text-slate-500 hidden sm:block">지식 기반 AI 어시스턴트</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ConnectionStatus connected={connected} />
            {connected && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </motion.button>
            )}
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar - Pages */}
          <AnimatePresence>
            {connected && (
              <>
                {/* Mobile overlay */}
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden fixed inset-0 bg-slate-950/80 z-20"
                  />
                )}

                <motion.aside
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                  } fixed lg:relative z-30 lg:z-auto w-72 md:w-80 h-full border-r border-slate-800/50 bg-slate-950/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-4 md:p-6 flex flex-col transition-transform lg:transition-none`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">연결된 문서</h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="lg:hidden p-1 text-slate-500 hover:text-slate-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {mockPages.map((page, i) => (
                      <motion.div
                        key={page.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <PageCard page={page} onClick={() => handlePageClick(page)} />
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <p className="text-[10px] text-slate-600 text-center">
                      문서를 클릭하면 대화에 추가됩니다
                    </p>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Chat Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {!connected ? (
              /* Connection Screen */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center p-4 md:p-8"
              >
                <div className="w-full max-w-md">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400/20 to-blue-500/20 border border-amber-500/20 flex items-center justify-center">
                      <svg className="w-10 h-10 md:w-12 md:h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-3">Confluence 연결</h2>
                    <p className="text-slate-400 text-sm md:text-base">
                      Confluence 워크스페이스를 연결하고<br />
                      문서 기반 AI 대화를 시작하세요
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <input
                        type="url"
                        value={confluenceUrl}
                        onChange={(e) => setConfluenceUrl(e.target.value)}
                        placeholder="https://your-workspace.atlassian.net"
                        className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm md:text-base"
                      />
                    </div>
                    <motion.button
                      onClick={handleConnect}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 md:py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow text-sm md:text-base"
                    >
                      연결하기
                    </motion.button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30"
                  >
                    <h3 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      이런 작업을 도와드릴 수 있어요
                    </h3>
                    <ul className="space-y-2 text-xs md:text-sm text-slate-500">
                      <li className="flex items-center gap-2">
                        <span className="text-amber-400">•</span>
                        기존 문서 기반 새 기획서 작성
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-400">•</span>
                        여러 문서 내용 요약 및 분석
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-400">•</span>
                        문서 간 연결점 발견 및 인사이트 도출
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              /* Chat Interface */
              <>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2 px-4 py-3 bg-slate-800/50 rounded-2xl rounded-bl-md w-fit border border-slate-700/30"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-slate-500 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
                  <div className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="문서에 대해 질문하거나 기획 요청을 해보세요..."
                      className="flex-1 px-4 md:px-5 py-3 md:py-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm md:text-base"
                    />
                    <motion.button
                      onClick={handleSend}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 md:px-6 py-3 md:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="relative z-10 py-3 md:py-4 text-center border-t border-slate-800/30">
          <p className="text-[10px] md:text-xs text-slate-600">
            Requested by <span className="text-slate-500">@web-user</span> · Built by <span className="text-slate-500">@clonkbot</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
