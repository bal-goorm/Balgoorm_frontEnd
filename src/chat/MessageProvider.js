import React, { createContext, useCallback, useContext, useState } from 'react';
import UseWebSocket from './hooks/UseWebSocket';

const MessageContext = createContext({
    message: [],
    addMessage: () => {},
    handleKeyDown: () => {},
    inputValue: '',
    setInputValue: () => {}
});

export const MessageProvider = ({ children }) => {
    const { sendMessage } = UseWebSocket();
    const [inputValue, setInputValue] = useState(''); // 사용자 입력 저장 변수
    const [message, setMessage] = useState([]);
    
    const addMessage = useCallback((newMessage) => {
        setMessage((prevMessage) => {
            const updatedMessages = [...prevMessage, newMessage];
            // console.log('previous message: ', prevMessage);
            console.log('Updated messages:', updatedMessages);
            return updatedMessages;
        });
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(inputValue);
            setInputValue('');
        }
    };
    
    return (
    <MessageContext.Provider value =
    {{ message, setMessage, addMessage, 
    handleKeyDown, inputValue, setInputValue }}>
        {children}
    </MessageContext.Provider>
    );
};

export const useMessage = () => useContext(MessageContext);
