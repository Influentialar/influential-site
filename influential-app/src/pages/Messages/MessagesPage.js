// src/pages/Messages/MessagesPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './MessagesPage.module.css';
import SidebarMessages from '../../components/SidebarMessages/SidebarMessages';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import { useAuth } from '../../lib/AuthContext';
import { useMessages } from '../../lib/useMessages';

export default function MessagesPage() {
  const { chatId } = useParams();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { conversations, sendMessage, refetch } = useMessages(userId);

  const [activeChatId, setActiveChatId] = useState(chatId ? parseInt(chatId) : null);
  const [searchTerm, setSearchTerm] = useState('');

  // Set active chat from URL or first conversation
  useEffect(() => {
    if (chatId) {
      setActiveChatId(parseInt(chatId));
    } else if (conversations.length > 0 && !activeChatId) {
      setActiveChatId(conversations[0].id);
    }
  }, [chatId, conversations, activeChatId]);

  const activeChat = conversations.find(c => c.id === activeChatId);

  const handleSendMessage = async (text) => {
    if (!text.trim() || !activeChatId) return;
    await sendMessage(activeChatId, text);
  };

  const filteredChats = conversations.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (conversations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>No tenés conversaciones aún</h2>
          <p>Contactá a un influencer, creador o marca para empezar a chatear.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <SidebarMessages
        chats={filteredChats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <ChatWindow
        chat={activeChat}
        onSendMessage={handleSendMessage}
        onDealUpdate={refetch}
      />
    </div>
  );
}
