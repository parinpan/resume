import type { Experience } from '@/types/resume';
import styles from './Entry.module.css';

interface ExperienceEntryProps {
    data: Experience;
}

export const ExperienceEntry = ({ data }: ExperienceEntryProps) => {
    return (
        <article className={styles.entry}>
            <header className={styles.entryHeader}>
                <div className={styles.entryLeft}>
                    <strong>{data.title} @ {data.company}</strong>
                    <span style={{ fontWeight: 400 }}> • {data.location}</span>
                </div>
                <time className={styles.entryRight}>{data.period}</time>
            </header>
            <ul className={styles.bulletList}>
                {data.bullets.map((bullet, idx) => (
                    <li key={idx}>
                        {bullet.text}
                        {bullet.tech && bullet.tech.length > 0 && (
                            <> <b>Tech: {bullet.tech.join(', ')}</b></>
                        )}
                    </li>
                ))}
            </ul>
        </article>
    );
};
