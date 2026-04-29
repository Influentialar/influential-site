// src/components/SidebarMessages/SidebarMessages.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowLeft } from '../../assets/icon-arrow-left.svg';
import { ReactComponent as SearchIcon } from '../../assets/icon-search.svg';
import styles from './SidebarMessages.module.css';

export default function SidebarMessages({
  chats = [],
  activeChatId,
  onSelectChat,
  searchTerm,
  onSearchChange,
}) {
  const navigate = useNavigate();

  // Obtener el último mensaje de cada chat
  const getLastMessage = (chat) => {
    if (chat.messages.length === 0) return { text: 'Sin mensajes', time: '' };
    const last = chat.messages[chat.messages.length - 1];
    const prefix = last.from === 'me' ? 'Vos: ' : '';
    const text = prefix + (last.text.length > 35 ? last.text.slice(0, 35) + '...' : last.text);
    return { text, time: last.time };
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <ArrowLeft />
        </button>
        <h2>Mensajes</h2>
      </div>

      <div className={styles.searchWrapper}>
        <SearchIcon className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar conversación..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <ul className={styles.chatList}>
        {chats.map(chat => {
          const last = getLastMessage(chat);
          const isActive = chat.id === activeChatId;
          return (
            <li
              key={chat.id}
              className={`${styles.chatItem} ${isActive ? styles.chatItemActive : ''}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className={styles.avatarWrapper}>
                <img src={chat.avatar} alt={chat.name} className={styles.avatar} />
                {chat.type === 'ugc' && <span className={styles.ugcDot}>UGC</span>}
              </div>
              <div className={styles.chatInfo}>
                <div className={styles.chatTopRow}>
                  <span className={styles.chatName}>{chat.name}</span>
                  <span className={styles.chatTime}>{last.time}</span>
                </div>
                <span className={styles.chatLast}>{last.text}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
