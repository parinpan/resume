import { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
    title: string;
    children: ReactNode;
}

export const Section = ({ title, children }: SectionProps) => {
    return (
        <section className={styles.section} aria-label={title}>
            <h2 className={styles.title}>{title}</h2>
            {children}
        </section>
    );
};
