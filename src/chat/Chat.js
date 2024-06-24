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
  const { message, addMessage, handleKeyDown, setInputValue, inputValue} = useMessage();
  const { sendMessage } = UseWebSocket();

  const handleSendMessage = useCallback(() => {
    if (inputValue.trim() !== '') {
      const newMessage = {
        senderName: fetchedUser.nickname,
        chatBody: inputValue,
        currentUser: true
      };
      sendMessage(newMessage); // 직접 메시지를 추가
      addMessage(newMessage);
      setInputValue(''); // 입력 필드 초기화
    }
  }, [inputValue, addMessage, setInputValue, fetchedUser, sendMessage]);

  useEffect(() => {
    console.log("Current messages: ", message); // 상태 변경 시 메시지 로그
  }, [message]);
  
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
          onKeyDown={handleKeyDown} 
          />
          </Form.Group>
          <Button variant="primary" className='button-inline' onClick={sendMessage}>전송</Button>
      </Form>
    </Container> 
  </div>
  )
}

export default Chat;