import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useValue } from './TextEditor';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots, faPaperPlane, faTimes } from "@fortawesome/free-solid-svg-icons";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const { filteredContent } = useValue();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/chat-window', { 
        messages: updatedMessages, 
        value: filteredContent
      });
      if (response.data && response.data.reply) {
        setMessages([...updatedMessages, { role: 'assistant', content: response.data.reply }]);
      } else {
        setMessages([...updatedMessages, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...updatedMessages, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed right-6 bottom-6 z-50 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300 border border-gray-200"
        aria-label="Toggle chat"
      >
        <FontAwesomeIcon icon={isVisible ? faTimes : faCommentDots} className="w-6 h-6" />
      </button>
      {isVisible && (
        <div className="fixed right-6 top-32 bottom-20 w-96 bg-white shadow-lg flex flex-col rounded-lg overflow-hidden z-40 border border-gray-200">
          <div className="bg-white text-gray-800 p-4 font-bold text-lg flex justify-between items-center border-b border-gray-200">
            <span>Chat Window</span>
            <button onClick={() => setIsVisible(false)} className="text-gray-600 hover:text-gray-800">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-gray-200 text-gray-800' 
                    : 'bg-white text-gray-800 border border-gray-300'
                }`}>
                  {message.content}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Type a message..."
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-white text-gray-600 p-2 rounded-r-lg hover:bg-gray-100 transition-colors duration-300 border border-gray-300 border-l-0"
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faPaperPlane} className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWindow;