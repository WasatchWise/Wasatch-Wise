'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./page.module.css";
import ScriptModal from "@/components/dashboard/ScriptModal";
import TopicImportModal from "@/components/dashboard/TopicImportModal";

type ContentStatus = 'Draft' | 'In Progress' | 'Ready for Review' | 'Curriculum Ready' | 'Social Only';

interface ContentItem {
  id: string;
  topic: string;
  cluster: string;
  audience: string;
  status: ContentStatus;
  priority: string;
  socialHook: string;
}

interface ModalData {
  script?: string;
  painState?: string;
  industryHook?: string;
  videoIdea?: string;
}

export default function Home() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [activeData, setActiveData] = useState<ModalData>({});
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: "1",
      topic: "The Ageless Advantage",
      cluster: "AI Anxiety",
      audience: "Senior Managers",
      status: "Curriculum Ready",
      priority: "Critical",
      socialHook: "20 years of experience is your moat.",
    },
    {
      id: "2",
      topic: "Fridge Inventory & Meal Planning",
      cluster: "Daily AI Use",
      audience: "Regular People / Gen X",
      status: "Social Only",
      priority: "High",
      socialHook: "Stop asking 'What's for dinner'.",
    },
    {
      id: "3",
      topic: "Discovery Automation for Attorneys",
      cluster: "Work Automation",
      audience: "Legal Professionals",
      status: "Draft",
      priority: "Medium",
      socialHook: "Attorneys: Automate the discovery, keep the legacy.",
    },
    {
      id: "4",
      topic: "AI as a Cognitive Buffer",
      cluster: "Personal Productivity",
      audience: "Overwhelmed Professionals",
      status: "Draft",
      priority: "High",
      socialHook: "Don't manage your schedule. Let AI buffer the noise.",
    },
  ]);

  // Navigate to Content Studio with pre-filled topic
  const handleStartSynthesis = (content: ContentItem) => {
    const params = new URLSearchParams({
      topic: `${content.topic}\n\nTarget Audience: ${content.audience}\nCluster: ${content.cluster}\nSocial Hook: ${content.socialHook}`,
    });
    router.push(`/synthesis?${params.toString()}`);
  };

  // Mark content as ready for curriculum
  const handleMarkAsReady = (content: ContentItem) => {
    setContentItems(items =>
      items.map(item =>
        item.id === content.id
          ? { ...item, status: 'Curriculum Ready' as ContentStatus }
          : item
      )
    );
  };

  // View details in modal (for curriculum-ready items)
  const handleViewDetails = (content: ContentItem) => {
    setActiveData({
      script: `Content: "${content.topic}"\n\nStatus: ${content.status}\nCluster: ${content.cluster}\nAudience: ${content.audience}`,
      painState: content.cluster,
      industryHook: content.socialHook,
      videoIdea: `Video Idea: "Hey ${content.audience}, let's talk about ${content.topic}."`
    });
    setModalOpen(true);
  };

  // Handle topic import
  const handleImport = (items: ContentItem[]) => {
    setContentItems(prev => [...items, ...prev]);
    setImportModalOpen(false);
  };

  // Get action button based on status
  const getActionButton = (content: ContentItem) => {
    switch (content.status) {
      case 'Draft':
        return (
          <button className="btn btn-primary" onClick={() => handleStartSynthesis(content)}>
            Start Synthesis
          </button>
        );
      case 'In Progress':
        return (
          <button className="btn btn-primary" onClick={() => handleStartSynthesis(content)}>
            Continue Editing
          </button>
        );
      case 'Ready for Review':
        return (
          <button className="btn btn-primary" onClick={() => handleMarkAsReady(content)}>
            Mark as Ready
          </button>
        );
      case 'Curriculum Ready':
      case 'Social Only':
        return (
          <button className="btn glass" onClick={() => handleViewDetails(content)}>
            View Details
          </button>
        );
      default:
        return (
          <button className="btn btn-primary" onClick={() => handleStartSynthesis(content)}>
            Start Synthesis
          </button>
        );
    }
  };

  // Get status emoji
  const getStatusEmoji = (status: ContentStatus) => {
    switch (status) {
      case 'Draft': return '📝';
      case 'In Progress': return '🔄';
      case 'Ready for Review': return '👁️';
      case 'Curriculum Ready': return '✅';
      case 'Social Only': return '📱';
      default: return '📝';
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.title}>Content Dashboard</h2>
            <p className={styles.subtitle}>Manage your content pipeline from idea to curriculum</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn glass"
              onClick={() => setImportModalOpen(true)}
              style={{ border: '1px solid var(--border)' }}
            >
              📥 Import Topics
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/synthesis')}
            >
              + Create New Content
            </button>
          </div>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Content</p>
          <p className={styles.statValue}>{contentItems.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Drafts</p>
          <p className={styles.statValue}>{contentItems.filter(i => i.status === 'Draft').length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Curriculum Ready</p>
          <p className={styles.statValue}>{contentItems.filter(i => i.status === 'Curriculum Ready').length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Social Only</p>
          <p className={styles.statValue}>{contentItems.filter(i => i.status === 'Social Only').length}</p>
        </div>
      </section>

      <div className={styles.feed}>
        {contentItems.map((item) => (
          <div key={item.id} className={`${styles.opportunityCard} card`}>
            <div className={styles.oppInfo}>
              <h3 className={styles.oppTitle}>
                {item.topic}
                <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem', opacity: 0.6 }}>[{item.cluster}]</span>
              </h3>
              <div className={styles.oppMeta}>
                <span>🎯 {item.audience}</span>
                <span className={`${styles.tag} ${
                  item.status === 'Curriculum Ready' ? styles.tagSuccess :
                  item.status === 'Social Only' ? styles.tagWarning :
                  item.status === 'Ready for Review' ? styles.tagInfo :
                  styles.tagDraft
                }`}>
                  {getStatusEmoji(item.status)} {item.status}
                </span>
                <span className={`${styles.tag} glass`}>{item.priority}</span>
              </div>
              <p className={styles.hookPreview}>&ldquo;{item.socialHook}&rdquo;</p>
            </div>
            <div className={styles.oppActions}>
              {getActionButton(item)}
              {item.status === 'Draft' && (
                <button
                  className="btn glass"
                  onClick={() => handleViewDetails(item)}
                  style={{ border: '1px solid var(--border)' }}
                >
                  Preview
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ScriptModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        script={activeData.script || ''}
        painState={activeData.painState || ''}
        industryHook={activeData.industryHook}
        videoIdea={activeData.videoIdea}
      />

      <TopicImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
