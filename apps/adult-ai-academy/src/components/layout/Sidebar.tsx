import Link from 'next/link';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const menuItems = [
        { name: 'Production Hub', icon: '🏭', href: '/' },
        { name: 'Synthesis Lab', icon: '🧪', href: '/synthesis' },
        { name: 'Asset Library', icon: '🖼️', href: '/library' },
        { name: 'Topic Clusters', icon: '📂', href: '/clusters' },
        { name: 'Curriculum Repo', icon: '📚', href: '/curriculum' },
        { name: 'Content Factory', icon: '🤖', href: '/factory' },
    ];

    return (
        <aside className={`${styles.sidebar} glass`}>
            <div className={styles.branding}>
                <h1 className={`${styles.title} glow-text`}>
                    CONTENT FACTORY
                </h1>
                <p className={styles.subtitle}>V1.0</p>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <Link key={item.name} href={item.href} className={styles.menuItem}>
                        <span>{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className={styles.footer}>
                <div className={styles.statusCard}>
                    <p className={styles.statusTitle}>Factory Status</p>
                    <div className={styles.statusIndicator}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusText}>n8n: Connected</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
