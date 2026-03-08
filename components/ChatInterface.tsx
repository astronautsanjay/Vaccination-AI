
import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, MessageRole } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import Spinner from './Spinner';
import { logoBase64 } from '../assets/logo';

// Fix: Add type definition for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
  start: () => void;
  stop: () => void;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  loadingTask: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, loadingTask }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for browser support
    // Fix: Cast window to 'any' to access non-standard SpeechRecognition properties.
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
    }
  };
  
  const signatureString = 'This AI Chatbot is created by DR ABHISHEK SINGH';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-sky-50">
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const hasSignature = msg.role === MessageRole.BOT && msg.text.includes(signatureString);
            const textParts = hasSignature ? msg.text.split(`\n\n${signatureString}`) : [msg.text];
            const mainText = textParts[0];

            return (
              <div key={index} className={`flex items-start gap-3 sm:gap-4 ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
                {msg.role === MessageRole.BOT && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl sm:text-2xl" role="img" aria-label="Bot">💉</span>
                  </div>
                )}
                <div className={`max-w-[85%] md:max-w-xl p-3 sm:p-4 rounded-2xl shadow-sm ${msg.role === MessageRole.USER ? 'bg-sky-100 text-gray-800 rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                  {msg.role === MessageRole.USER ? (
                    <p className="whitespace-pre-wrap text-sm sm:text-base">{mainText}</p>
                  ) : (
                    <div className="markdown-content text-sm sm:text-base">
                      <Markdown remarkPlugins={[remarkGfm]}>{mainText}</Markdown>
                    </div>
                  )}
                   {hasSignature && (
                     <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-200/80">
                      <p className="text-xs text-gray-500 font-medium">{signatureString}</p>
                      <img src={logoBase64} alt="Creator Logo" className="w-3 h-3 rounded-full" />
                    </div>
                  )}
                </div>
                {msg.role === MessageRole.USER && (
                   <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-start gap-3 sm:gap-4 justify-start">
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl" role="img" aria-label="Bot">💉</span>
                </div>
              <div className="max-w-xl p-3 sm:p-4 rounded-2xl bg-white border border-gray-200 rounded-bl-none flex items-center space-x-3">
                <Spinner/>
                <span className="text-gray-500 animate-pulse text-sm sm:text-base">{loadingTask}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-2 sm:p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 sm:space-x-4">
          <button
            type="button"
            onClick={handleToggleListening}
            disabled={isLoading}
            className={`p-2 sm:p-3 rounded-full transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            <MicrophoneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="कृपया अपना प्रश्न यहाँ लिखें or use mic"
            disabled={isLoading}
            className="flex-grow px-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow disabled:bg-gray-100 text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 sm:p-3 bg-sky-600 text-white rounded-full hover:bg-sky-700 disabled:bg-sky-300 disabled:cursor-not-allowed transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 flex-shrink-0"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
