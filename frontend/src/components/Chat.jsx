import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000', // Update this with your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Styled Components
const ChatContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(145deg, #1a1a2e, #16213e);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  color: #fff;
`;

const ChatHeader = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
    background: linear-gradient(90deg, #f72585, #FFD700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    margin: 0.5rem 0 0;
    opacity: 0.8;
    font-size: 0.9rem;
  }
`;

const MessagesList = styled.div`
  height: 400px;
  overflow-y: auto;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.1);
`;

const MessageItem = styled.div`
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const UserMessage = styled.div`
  background: rgba(101, 101, 241, 0.2);
  border: 1px solid rgba(101, 101, 241, 0.3);
  border-radius: 12px 12px 0 12px;
  padding: 1rem;
  margin-left: auto;
  max-width: 80%;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    right: -8px;
    top: 0;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-left-color: rgba(101, 101, 241, 0.3);
    border-right: 0;
    border-top: 0;
    margin-top: 0;
    margin-right: -8px;
  }
`;

const AdminReply = styled.div`
  background: rgba(241, 101, 101, 0.2);
  border: 1px solid rgba(241, 101, 101, 0.3);
  border-radius: 12px 12px 12px 0;
  padding: 1rem;
  margin-right: auto;
  max-width: 80%;
  margin-top: 0.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    left: -8px;
    top: 0;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-right-color: rgba(241, 101, 101, 0.3);
    border-left: 0;
    border-top: 0;
    margin-top: 0;
    margin-left: -8px;
  }
`;

const MessageMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 0.3rem;
`;

const MessageForm = styled.form`
  display: flex;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  resize: none;
  font-family: inherit;
  font-size: 0.9rem;
  min-height: 50px;
  outline: none;
  transition: all 0.3s;
  
  &:focus {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 2px rgba(114, 9, 183, 0.5);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SubmitButton = styled.button`
  margin-left: 1rem;
  padding: 0 1.5rem;
  background: linear-gradient(90deg, #f72585, #FFD700);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.8rem;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(247, 37, 133, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  opacity: 0.6;
  
  svg {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  p {
    max-width: 70%;
    margin: 0.5rem 0;
  }
`;

const LoginPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
  
  button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(90deg, #f72585, #7209b7);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(247, 37, 133, 0.4);
    }
  }
`;

// Main Component
const Chat = () => {
  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for token on component mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchMessages();
    }
  }, [token]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/chats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Ensure messages is always an array
      setMessages(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load messages. Please try again.');
      console.error(err);
      setMessages([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.post('/chat', {
        content: newMessage
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Ensure we're always working with an array
      setMessages(prev => Array.isArray(prev) ? [response.data, ...prev] : [response.data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h2>Nael Production Support</h2>
        <p>Share your ideas and get feedback from our team</p>
      </ChatHeader>
      
      {!token ? (
        <MessagesList>
          <LoginPrompt>
            <p>Please login to access the chat</p>
            <button onClick={handleLogin}>Login</button>
          </LoginPrompt>
        </MessagesList>
      ) : (
        <>
          <MessagesList>
            {isLoading && messages.length === 0 ? (
              <EmptyState>
                <p>Loading your messages...</p>
              </EmptyState>
            ) : messages.length === 0 ? (
              <EmptyState>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p>No messages yet. Share your ideas with us!</p>
              </EmptyState>
            ) : (
              Array.isArray(messages) && messages.map(message => (
                <MessageItem key={message.id || message._id || Math.random()}>
                  <MessageMeta>
                    <span>You</span>
                    <span>{formatDate(message.createdAt)}</span>
                  </MessageMeta>
                  <UserMessage>
                    {message.content}
                  </UserMessage>
                  
                  {message.reply && (
                    <>
                      <MessageMeta>
                        <span>Nael Production Team</span>
                        <span>{formatDate(message.updatedAt)}</span>
                      </MessageMeta>
                      <AdminReply>
                        {message.reply}
                      </AdminReply>
                    </>
                  )}
                </MessageItem>
              ))
            )}
            {error && <p style={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</p>}
          </MessagesList>
          
          <MessageForm onSubmit={handleSubmit}>
            <MessageInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your ideas with Nael Production..."
              disabled={isLoading || !token}
            />
            <SubmitButton 
              type="submit" 
              disabled={isLoading || !newMessage.trim() || !token}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </SubmitButton>
          </MessageForm>
        </>
      )}
    </ChatContainer>
  );
};

export default Chat;