import type { Education } from '@/types/resume';
import { parseLinks, parsePeriod } from '@/utils/parsers';
import styles from './Entry.module.css';

interface EducationEntryProps {
    data: Education;
}

export const EducationEntry = ({ data }: EducationEntryProps) => {
    const period = parsePeriod(data.period);

    return (
        <article className={styles.entry}>
            <header className={styles.entryHeader}>
                <div className={styles.entryLeft}>
                    <span className={styles.degree}>{data.degree}</span>
                    <span className={styles.atSep}>, </span>
                    <span className={styles.institution}>{data.institution}</span>
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
                    <li key={idx}>{parseLinks(bullet)}</li>
                ))}
            </ul>
        </article>
    );
};
