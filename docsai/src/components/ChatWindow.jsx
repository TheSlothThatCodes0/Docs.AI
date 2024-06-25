import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useValue } from './TextEditor';

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
      console.log('Sending request to /api/chat-window');
      const response = await axios.post('http://localhost:5001/api/chat-window', { 
        messages: updatedMessages, 
        value: filteredContent  // Use filteredContent instead of Value
      });
      console.log('Received response:', response.data);
      if (response.data && response.data.reply) {
        setMessages([...updatedMessages, { role: 'assistant', content: response.data.reply }]);
      } else {
        console.error('Unexpected response format:', response.data);
        setMessages([...updatedMessages, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setMessages([...updatedMessages, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed right-2 top-3/4 mt-52 z-50 bg-white text-black px-4 py-2 rounded-l-lg"
      >
        {isVisible ? 'Hide bot' : 'Query Bot'}
      </button>
      {isVisible && (
        <div className="fixed right-0 top-1 w-80 bg-white shadow-lg flex flex-col h-5/6 mt-28 z-40 border rounded-lg">
          <div className="bg-gray-100 p-4 font-bold border rounded-lg">Chat Window</div>
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {message.content}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border rounded-l-lg p-2"
                placeholder="Type a message..."
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 rounded-r-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWindow;