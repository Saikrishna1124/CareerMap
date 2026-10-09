import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { streamChatResponse } from '../services/ai';
import { useAuth } from '../context/AuthContext';

export const GlobalChatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hi! I\'m your CareerMap assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Initial AI message placeholder for streaming
    setMessages(prev => [...prev, { role: 'ai', text: '' }]);
    
    try {
      let fullResponse = '';
      const stream = streamChatResponse(userMsg, "Global assistant across CareerMap platform");
      
      for await (const chunk of stream) {
        if (chunk.startsWith('[ERROR]: ')) {
          const errorMsg = chunk.replace('[ERROR]: ', '');
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'ai') {
              lastMsg.text = errorMsg;
            }
            return newMessages;
          });
          return;
        }
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'ai') {
            lastMsg.text = fullResponse;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[190]" />
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 50);
        }}
        animate={{ opacity: isDimmed ? 0.35 : 1 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 z-[200] flex flex-col items-end pointer-events-auto"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-4 w-80 sm:w-96 h-[500px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div 
                className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center cursor-grab active:cursor-grabbing select-none shrink-0"
              >
                <div className="flex items-center gap-2">
                  <div 
                    onDoubleClick={() => setIsDimmed(prev => !prev)}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm shrink-0 cursor-pointer"
                    title="Double click to toggle transparency"
                  >
                    <img 
                      src="https://cdn-icons-png.flaticon.com/128/4712/4712027.png" 
                      alt="AI Assistant" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-semibold select-none">CareerMap AI</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  onPointerDown={(e) => e.stopPropagation()}
                  className="hover:bg-white/20 p-1 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Prevent dragging when interacting with the main content of the chatbot */}
              <div 
                onPointerDown={(e) => e.stopPropagation()}
                className="flex-1 flex flex-col min-h-0 bg-transparent"
              >
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages?.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 shadow-sm">
                          <img 
                            src="https://cdn-icons-png.flaticon.com/128/4712/4712027.png" 
                            alt="AI Assistant" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-normal whitespace-pre-wrap ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.role === 'user' ? (
                          msg.text
                        ) : (
                          <div className="text-left w-full overflow-hidden">
                            <Markdown
                              components={{
                                strong: ({ node, ...props }) => <span className="font-extrabold text-blue-600 dark:text-blue-400" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-200" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2.5 space-y-1.5" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2.5 space-y-1.5 font-bold" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-0.5 text-slate-700 dark:text-stone-300 font-medium" {...props} />,
                                pre: ({ node, ...props }) => <pre className="my-2.5 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-950 text-stone-100 p-3.5 font-mono text-xs leading-normal select-text text-left block" {...props} />,
                                code: ({ node, className, children, ...props }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-slate-200/65 dark:bg-slate-950/65 px-1.5 py-0.5 rounded font-mono text-xs text-rose-500 font-bold" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                              }}
                            >
                              {msg.text}
                            </Markdown>
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/35 flex items-center justify-center shrink-0 overflow-hidden border border-blue-200/50 dark:border-blue-800/30 shadow-sm">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {user?.name ? user.name[0].toUpperCase() : 'U'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-2.5 justify-start animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 shadow-sm">
                        <img 
                          src="https://cdn-icons-png.flaticon.com/128/4712/4712027.png" 
                          alt="AI Assistant" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm text-slate-500 dark:text-slate-400">
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask anything..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={handleSend}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isDragging) return;
            
            if (clickTimeoutRef.current) {
              clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = null;
              setIsDimmed(prev => !prev);
            } else {
              clickTimeoutRef.current = window.setTimeout(() => {
                setIsOpen(prev => !prev);
                clickTimeoutRef.current = null;
              }, 250);
            }
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3.5 rounded-full shadow-lg flex items-center justify-center w-14 h-14 cursor-grab active:cursor-grabbing"
        >
          {isOpen ? (
            <X size={24} />
          ) : (
            <img 
              src="https://cdn-icons-png.flaticon.com/128/4712/4712027.png" 
              alt="AI Assistant" 
              className="w-8 h-8 object-contain"
            />
          )}
        </motion.button>
      </motion.div>
    </>
  );
};
