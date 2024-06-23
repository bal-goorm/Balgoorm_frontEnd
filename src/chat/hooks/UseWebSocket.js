import { useCallback, useEffect, useRef } from 'react';
import { useMessage } from '../MessageProvider.js';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';
import { useAuth } from '../../user/auth/AuthContext.js';
import SockJS from 'sockjs-client'

const UseWebSocket = () => {
  const { addMessage, setInputValue } = useMessage();
  const { fetchedUser } = useAuth();
  const stompClient = useRef(null);

  const connect = useCallback(() => {
    const socket = new SockJS("http://localhost:8080/api/chat");
    stompClient.current = Stomp.over(socket);
    console.log("socket :", socket);

    stompClient.current.connect({}, (frame) => {
      console.log("connected: ", frame);
      stompClient.current.subscribe("/sub/chat", (message) => {
        const messageBody = message.body.trim();
        const [senderName, chatBody] = messageBody.split(": ");
        const newMessage = {senderName: senderName.trim(), chatBody: chatBody.trim()};
        addMessage(newMessage);
        console.log("Added message: ", newMessage);
      });
    }, (error) => {
      console.error('Connection error: ', error);
    });
  }, [addMessage]);

  const joinChatRoom = useCallback(() => {
    if(stompClient.current && stompClient.current.connected && fetchedUser && fetchedUser?.nickname) {
      const chatMessage = `${fetchedUser.nickname}: 입장하였습니다.`;
      console.log("Joining chat room with message: ", chatMessage);
      stompClient.current.send("pub/join", {}, chatMessage);
    }
  }, [fetchedUser]);

  const disconnect = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.disconnect(() => {
        console.log("Disconnected");
      });
    }
  }, []);

  const sendMessage = (inputValue) => {
    console.log("Sending message: ");
    if (stompClient.current && stompClient.current.connected) {
      const senderName = fetchedUser.nickname;
      const chatMessage = `${senderName}: ${inputValue}`;
      stompClient.current.send("/pub/chat", {}, chatMessage);
      
      // stompClient.current.send("/pub/chat", {}, JSON.stringify(payload));
      console.log("Sending message: ", chatMessage);
      // const newMessage = {
      //   senderName,
      //   chatBody: inputValue,
      //   currentUser: true
      // }
      addMessage(chatMessage);
      setInputValue('');
    }
  };

  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/history');
      const chatHistory = response.data;
      console.log("Fetched chat history: ", chatHistory);

      chatHistory.forEach(message => {
        const [senderName, chatBody] = message.split(": ");
        const newMessage = {
          senderName: senderName.trim(), 
          chatBody: chatBody.trim(), 
          currentUser: fetchedUser.nickname === senderName.trim() 
        }
        console.log('Adding history message:', newMessage);
        addMessage(newMessage);;
      });
    } catch (error) {
      console.error('failed to fetch chat history', error);
    }  
  }, [addMessage, fetchedUser]);

  // 연결을 생성하고 해제하는 로직
  useEffect(() => {
    if(fetchedUser && fetchedUser.nickname) {
      fetchChatHistory();
      joinChatRoom();
    }
    return () => {
      disconnect();
    };
  }, [fetchedUser, connect, fetchChatHistory, joinChatRoom, disconnect]);

  return { sendMessage, connect, disconnect };
}

export default UseWebSocket;