/**
 * 채팅 페이지
 * STOMP 라이브러리로 연결
 */

import React, { useCallback, useEffect } from 'react'
import { Button, Container, Form } from 'react-bootstrap';
import { useMessage } from './MessageProvider';
import './Chat.css'
import { useAuth } from '../user/auth/AuthContext';
import UseWebSocket from './hooks/UseWebSocket';

function Chat() {
  const { fetchedUser } = useAuth();
  const { message, setInputValue, inputValue} = useMessage();
  const { sendMessage, connect, disconnect, fetchChatHistory, joinChatRoom } = UseWebSocket();

  useEffect(() => {
    connect();
    fetchChatHistory();
    return() => {
      disconnect();
    }
  }, [connect, disconnect, joinChatRoom, fetchChatHistory]);

  const handleSendMessage = useCallback(() => {
    // joinChatRoom();
    if (inputValue.trim() !== "") {
      sendMessage(inputValue);
      setInputValue(""); // 메시지 전송 후 입력 필드 초기화
    }
  }, [inputValue, sendMessage, setInputValue]);
  
  return (
  <div>
    <Container className='chatting-container'>
      {message.map((msg, index) => (
        <div className={`message-box ${msg.currentUser ? 'right' : 'left'}`} key={index}>
          {msg.currentUser ? (
            <>
              <div className='message-content'>{msg.chatBody}</div>
              <span className='user-badge'>{msg.senderName}</span>
            </>
          ) : (
            <>
              <span className='user-badge'>{msg.senderName}</span>
              <div className='message-content'>{msg.chatBody}</div>
            </>
          )}
        </div>
      ))}
      <Form className='chatting-form mt-3'>
        <Form.Group className="mb-3 form-group-inline" controlId="chatMessageInput">
          <Form.Control className='form-control-inline'
          type="text" 
          placeholder="메시지 입력" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }} 
          />
          </Form.Group>
          <Button variant="primary" className='button-inline' onClick={handleSendMessage}>전송</Button>
      </Form>
    </Container> 
  </div>
  )
}

export default Chat;