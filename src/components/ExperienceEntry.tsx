import type { Experience } from '@/types/resume';
import { parsePeriod } from '@/utils/parsers';
import styles from './Entry.module.css';

interface ExperienceEntryProps {
    data: Experience;
}

export const ExperienceEntry = ({ data }: ExperienceEntryProps) => {
    const period = parsePeriod(data.period);

    return (
        <article className={styles.entry}>
            <header className={styles.entryHeader}>
                <div className={styles.entryLeft}>
                    <span className={styles.jobTitle}>{data.title}</span>
                    <span className={styles.atSep}> at </span>
                    <span className={styles.company}>{data.company}</span>
                    <span style={{ fontWeight: 400 }}> • {data.location}</span>
                </div>
                <div className={styles.entryRight}>
                    {period.map((p, i) => (
                        <span key={i}>
                            {i > 0 && ' - '}
                            <time dateTime={p.datetime}>{p.label}</time>
                        </span>
                    ))}
                </div>
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
