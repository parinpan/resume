import type { Course } from '@/types/resume';
import { parsePeriod } from '@/utils/parsers';
import styles from './Entry.module.css';

interface CourseEntryProps {
    data: Course;
}

export const CourseEntry = ({ data }: CourseEntryProps) => {
    const period = parsePeriod(data.period);

    return (
        <article className={styles.entry}>
            <header className={styles.entryHeader}>
                <div className={styles.entryLeft}>
                    <strong>{data.title}</strong>
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
            <p style={{
                fontSize: 'var(--sz-body)',
                lineHeight: 'var(--lh)',
                marginTop: '2pt',
                textAlign: 'justify',
                textAlignLast: 'left'
            }}>
                {data.description}
            </p>
        </article>
    );
};
