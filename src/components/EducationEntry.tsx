import type { Education } from '@/types/resume';
import { parseLinks } from '@/utils/parsers';
import styles from './Entry.module.css';

interface EducationEntryProps {
    data: Education;
}

export const EducationEntry = ({ data }: EducationEntryProps) => {
    return (
        <article className={styles.entry}>
            <header className={styles.entryHeader}>
                <div className={styles.entryLeft}>
                    <strong>{data.degree}, {data.institution}</strong>
                    <span style={{ fontWeight: 400 }}> • {data.location}</span>
                </div>
                <time className={styles.entryRight}>{data.period}</time>
            </header>
            <ul className={styles.bulletList}>
                {data.bullets.map((bullet, idx) => (
                    <li key={idx}>{parseLinks(bullet)}</li>
                ))}
            </ul>
        </article>
    );
};
