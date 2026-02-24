import type { ShortCourse } from '@/types/resume';
import styles from './Entry.module.css';

interface CourseEntryProps {
    data: ShortCourse;
}

export const CourseEntry = ({ data }: CourseEntryProps) => {
    return (
        <article className={styles.entry}>
            <header className={styles.entryHeader}>
                <div className={styles.entryLeft}>
                    <strong>{data.title}</strong>
                    <span style={{ fontWeight: 400 }}> • {data.location}</span>
                </div>
                <time className={styles.entryRight}>
                    {data.period}
                </time>
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
