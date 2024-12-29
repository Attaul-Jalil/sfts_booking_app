import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import io from 'socket.io-client';
import Toast from 'react-native-toast-message';

const DriverChat = () => {
  const [messages, setMessages] = useState([]);
  const socket = io('http://192.168.194.148:5000'); // Backend server URL
  const room = 'user-driver-room-1';

  const generateUniqueId = () => `${Date.now()}-${Math.random()}`;

  useEffect(() => {
    socket.emit('joinRoom', room);

    const handleReceiveMessage = (message) => {
      const uniqueMessage = { ...message, _id: generateUniqueId() };
      setMessages((prevMessages) => GiftedChat.append(prevMessages, uniqueMessage));

      // Show a notification
      Toast.show({
        type: 'info',
        text1: 'New Message',
        text2: message.text,
      });
    };

    const loadPreviousMessages = (data) => {
      const formattedMessages = data.map((msg) => ({
        _id: msg.id,
        text: msg.text,
        createdAt: new Date(msg.created_at),
        user: {
          _id: msg.sender_id,
          name: msg.sender_name,
        },
      }));
      setMessages((prevMessages) => GiftedChat.append(prevMessages, formattedMessages));
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('loadMessages', loadPreviousMessages);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('loadMessages', loadPreviousMessages);
      socket.disconnect();
    };
  }, [room]);

  const onSend = useCallback((newMessages = []) => {
    const uniqueMessages = newMessages.map((msg) => ({
      ...msg,
      _id: generateUniqueId(),
    }));
    setMessages((prevMessages) => GiftedChat.append(prevMessages, uniqueMessages));
    socket.emit('sendMessage', { room, message: uniqueMessages[0] });
  }, [room]);

  return (
    <>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 2, // Driver's ID
          name: 'Driver',
        }}
      />
      <Toast />
    </>
  );
};

export default DriverChat;
