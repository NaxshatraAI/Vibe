'use client';

import styles from './PromptInput.module.css';
import { FaPaperclip, FaArrowUp } from 'react-icons/fa';
import { SiFigma } from 'react-icons/si';

export default function PromptInput() {
  return (
    <div className={styles.promptWrapper}>
      <div className={styles.promptBox}>
      <textarea
        className={styles.textarea}
        placeholder="What can Trikon create for you today?"
        rows={2}
      />

      <div className={styles.actionRow}>
        <div className={styles.leftGroup}>
          <button className={styles.iconButton}>
            <FaPaperclip />
          </button>

          <button className={styles.importButton}>
            <SiFigma className={styles.figmaIcon} />
            <span>Import</span>
          </button>
        </div>

        <button className={styles.sendButton}>
          <FaArrowUp />
        </button>
      </div>
      </div>
    </div>
  );
}

