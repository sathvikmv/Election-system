import Sidebar from '../../components/Sidebar';
import { DashboardProvider } from '@/context/DashboardContext';
import ChatPanel from '../../components/ChatPanel';
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
          <div className={styles.contentAndChat}>
            <main className={styles.mainContent}>
              {children}
            </main>
            <ChatPanel />
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}
