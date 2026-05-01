"use client";

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'isomorphic-dompurify';
import { useDashboard } from '@/context/DashboardContext';
import styles from '../app/dashboard/page.module.css';

export default function ChatPanel() {
  const { messages, isTyping, inputValue, setInputValue, handleSendMessage } = useDashboard();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <aside className={styles.rightPanel}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 style={{fontSize: '1rem', fontWeight: 600}}>AI Civic Assistant</h3>
        </div>
        <div className={styles.chatMessages}>
          {messages.map(m => (
            <div key={m.id} className={`${styles.message} ${styles[m.role]}`}>
              <ReactMarkdown>{DOMPurify.sanitize(String(m.content), { ALLOWED_TAGS: [] })}</ReactMarkdown>
            </div>
          ))}
          {isTyping && (
            <div className={`${styles.message} ${styles.bot}`}>
              <div className={styles.typingIndicator}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className={styles.chatInputArea}>
          <form onSubmit={handleSendMessage} className={styles.inputWrapper}>
            <input 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              placeholder="Ask about registration, deadlines..."
              disabled={isTyping}
            />
            <button type="submit" className="btn btn-primary" disabled={isTyping || !inputValue.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
