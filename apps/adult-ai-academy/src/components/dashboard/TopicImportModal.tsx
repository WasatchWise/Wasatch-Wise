'use client';

import { useState } from 'react';
import styles from './TopicImportModal.module.css';

type TopicCluster = 'AI Anxiety' | 'Work Automation' | 'Daily AI Use' | 'Personal Productivity';
type ContentStatus = 'Draft' | 'In Progress' | 'Ready for Review' | 'Curriculum Ready' | 'Social Only';
type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

interface ContentItem {
  id: string;
  topic: string;
  cluster: TopicCluster;
  audience: string;
  status: ContentStatus;
  priority: Priority;
  socialHook: string;
}

interface TopicImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: ContentItem[]) => void;
}

export default function TopicImportModal({ isOpen, onClose, onImport }: TopicImportModalProps) {
  const [importMode, setImportMode] = useState<'single' | 'bulk'>('single');
  const [formData, setFormData] = useState({
    topic: '',
    cluster: 'AI Anxiety' as TopicCluster,
    audience: '',
    priority: 'Medium' as Priority,
    socialHook: '',
  });
  const [bulkText, setBulkText] = useState('');

  if (!isOpen) return null;

  const handleSingleImport = () => {
    if (!formData.topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    const newItem: ContentItem = {
      id: Date.now().toString(),
      topic: formData.topic,
      cluster: formData.cluster,
      audience: formData.audience || '35-55 Professionals',
      status: 'Draft',
      priority: formData.priority,
      socialHook: formData.socialHook || `Draft hook for ${formData.topic}`,
    };

    onImport([newItem]);
    handleReset();
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) {
      alert('Please enter topics to import');
      return;
    }

    // Parse bulk text - expecting one topic per line, optionally with metadata
    const lines = bulkText.split('\n').filter(line => line.trim());
    const imported: ContentItem[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Try to parse if it's structured (topic | cluster | audience | hook)
      const parts = trimmed.split('|').map(p => p.trim());
      
      const newItem: ContentItem = {
        id: `${Date.now()}-${index}`,
        topic: parts[0] || trimmed,
        cluster: (parts[1] as TopicCluster) || 'AI Anxiety',
        audience: parts[2] || '35-55 Professionals',
        status: 'Draft',
        priority: (parts[3] as Priority) || 'Medium',
        socialHook: parts[4] || `Draft hook for ${parts[0] || trimmed}`,
      };

      imported.push(newItem);
    });

    if (imported.length > 0) {
      onImport(imported);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      topic: '',
      cluster: 'AI Anxiety',
      audience: '',
      priority: 'Medium',
      socialHook: '',
    });
    setBulkText('');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Import Topics</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${importMode === 'single' ? styles.active : ''}`}
            onClick={() => setImportMode('single')}
          >
            Single Topic
          </button>
          <button
            className={`${styles.modeBtn} ${importMode === 'bulk' ? styles.active : ''}`}
            onClick={() => setImportMode('bulk')}
          >
            Bulk Import
          </button>
        </div>

        {importMode === 'single' ? (
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Topic *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., The Ageless Advantage"
                className={styles.input}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Cluster</label>
                <select
                  value={formData.cluster}
                  onChange={(e) => setFormData({ ...formData, cluster: e.target.value as TopicCluster })}
                  className={styles.select}
                >
                  <option value="AI Anxiety">AI Anxiety</option>
                  <option value="Work Automation">Work Automation</option>
                  <option value="Daily AI Use">Daily AI Use</option>
                  <option value="Personal Productivity">Personal Productivity</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className={styles.select}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Target Audience</label>
              <input
                type="text"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                placeholder="e.g., Senior Managers, Legal Professionals"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Social Hook (Optional)</label>
              <textarea
                value={formData.socialHook}
                onChange={(e) => setFormData({ ...formData, socialHook: e.target.value })}
                placeholder="e.g., 20 years of experience is your moat."
                className={styles.textarea}
                rows={2}
              />
            </div>

            <div className={styles.actions}>
              <button className="btn glass" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSingleImport}>
                Add Topic
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Bulk Topics (one per line)</label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Topic | Cluster | Audience | Priority | Social Hook

Example:
The Ageless Advantage | AI Anxiety | Senior Managers | Critical | 20 years of experience is your moat.
Fridge Inventory & Meal Planning | Daily AI Use | Gen X | High | Stop asking 'What's for dinner'.
Discovery Automation | Work Automation | Legal Professionals | Medium | Automate the discovery, keep the legacy.`}
                className={styles.textarea}
                rows={12}
              />
              <p className={styles.helpText}>
                Format: Topic | Cluster | Audience | Priority | Social Hook<br />
                All fields optional except Topic. Pipe-separated. One topic per line.
              </p>
            </div>

            <div className={styles.actions}>
              <button className="btn glass" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBulkImport}>
                Import {bulkText.split('\n').filter(l => l.trim()).length} Topics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

