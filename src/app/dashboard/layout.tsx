import Sidebar from '../../components/Sidebar';
import { DashboardProvider } from '@/context/DashboardContext';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className={styles.layout}>
        <Sidebar />
        <div className={styles.mainWrapper}>
          <div className={styles.content}>
            <main className={styles.mainContent}>
              {children}
            </main>
            {/* 🛡️ Chatbot removed for production build stability */}
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}
