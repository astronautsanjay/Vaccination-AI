
import React, { useState, useCallback, useEffect } from 'react';
import { ChatMessage, MessageRole } from './types';
import { streamAnswer } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import { preloadedKnowledgeBase } from './knowledgeBase';

const App: React.FC = () => {
  const knowledgeBase = preloadedKnowledgeBase;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<string>('');

  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('messages');
      
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        if (parsedMessages.length > 0) {
          setMessages(parsedMessages);
        } else {
           const greetingMessage: ChatMessage = {
            role: MessageRole.BOT,
            text: 'नमस्ते! मैं वैक्सीन मित्र हूँ। मैं टीकाकरण के संबंध में आपको जानकारी दे सकता हूँ, कृपया अपना प्रश्न पूछें।\n\nHello! I am Vaccine Mitra. I can provide information regarding immunization, please ask your question.',
          };
          setMessages([greetingMessage]);
          localStorage.setItem('messages', JSON.stringify([greetingMessage]));
        }
      } else {
        const greetingMessage: ChatMessage = {
          role: MessageRole.BOT,
          text: 'नमस्ते! मैं वैक्सीन मित्र हूँ। मैं टीकाकरण के संबंध में आपको जानकारी दे सकता हूँ, कृपया अपना प्रश्न पूछें।\n\nHello! I am Vaccine Mitra. I can provide information regarding immunization, please ask your question.',
        };
        setMessages([greetingMessage]);
        localStorage.setItem('messages', JSON.stringify([greetingMessage]));
      }
    } catch (err) {
      console.error("Failed to load state from local storage:", err);
      localStorage.removeItem('messages');
       const greetingMessage: ChatMessage = {
            role: MessageRole.BOT,
            text: 'नमस्ते! मैं वैक्सीन मित्र हूँ। मैं टीकाकरण के संबंध में आपको जानकारी दे सकता हूँ, कृपया अपना प्रश्न पूछें।',
          };
      setMessages([greetingMessage]);
    }
  }, []);
  
  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: MessageRole.USER, text: userInput };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setIsLoading(true);
    setCurrentTask('हैंडबुक का विश्लेषण और उत्तर तैयार किया जा रहा है... (Analyzing handbook and preparing answer...)');
    setError(null);

    try {
      const signatureString = 'This AI Chatbot is created by DR ABHISHEK SINGH';
      let hasStartedTyping = false;
      
      const fullResponse = await streamAnswer(
        knowledgeBase,
        messages,
        userInput,
        (chunk) => {
          if (!hasStartedTyping) {
            setIsLoading(false); // Hide global spinner
            setMessages(prev => [...prev, { role: MessageRole.BOT, text: chunk }]);
            hasStartedTyping = true;
          } else {
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === MessageRole.BOT) {
                last.text = chunk;
              }
              return updated;
            });
          }
        }
      );

      // Final update with signature and persistence
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === MessageRole.BOT) {
          last.text = `${fullResponse}\n\n${signatureString}`;
        }
        localStorage.setItem('messages', JSON.stringify(updated));
        return updated;
      });

    } catch (err) {
      console.error(err);
      setIsLoading(false);
      const errorMessage = 'क्षमा करें, उत्तर प्राप्त करने का प्रयास करते समय मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुन: प्रयास करें।\n\nSorry, I encountered an error while trying to get an answer. Please try again.\n\nThis AI Chatbot is created by DR ABHISHEK SINGH';
      
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === MessageRole.BOT && last.text === '') {
           const updated = [...prev];
           updated[updated.length - 1].text = errorMessage;
           return updated;
        }
        return [...prev, { role: MessageRole.BOT, text: errorMessage }];
      });
      setError('क्षमा करें, उत्तर प्राप्त करने का प्रयास करते समय मुझे एक त्रुटि का सामना करना पड़ा।');
    } finally {
      setIsLoading(false);
      setCurrentTask('');
    }
  }, [knowledgeBase, messages, isLoading]);
  
  const resetError = () => {
    setError(null);
  }

  return (
    <div className="w-full h-full flex flex-col bg-white sm:max-w-4xl sm:mx-auto sm:my-4 sm:rounded-2xl sm:shadow-lg sm:border sm:border-gray-200 sm:h-auto sm:max-h-[calc(100vh-2rem)]">
      <header className="p-3 sm:p-4 flex-shrink-0 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-3xl sm:text-4xl font-bold text-sky-700">वैक्सीन मित्र</h1>
      </header>
      
      <main className="flex-1 flex flex-col">
        {error && (
          <div className="m-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg text-center">
            <p className="font-bold">एक त्रुटि हुई</p>
            <p>{error}</p>
            <button
              onClick={resetError}
              className="mt-2 px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              ठीक है
            </button>
          </div>
        )}

        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          loadingTask={currentTask}
        />
      </main>
    </div>
  );
};

export default App;
