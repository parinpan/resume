import type { Certification } from '@/types/resume';
import { toDatetime } from '@/utils/parsers';
import styles from './Entry.module.css';

interface CertificationsListProps {
    data: Certification[];
}

export const CertificationsList = ({ data }: CertificationsListProps) => {
    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.map((cert, idx) => (
                <li key={idx} className={styles.entryHeader} style={{ marginBottom: '6pt' }}>
                    <div className={styles.entryLeft}>
                        <strong>{cert.name}, {cert.issuer}</strong>
                    </div>
                    <time className={styles.entryRight} dateTime={toDatetime(cert.year)}>{cert.year}</time>
                </li>
            ))}
        </ul>
    );
};
