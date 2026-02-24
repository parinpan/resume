import type { Contact } from '@/types/resume';
import styles from './Header.module.css';

interface HeaderProps {
    name: string;
    title: string;
    contact: Contact;
}

export const Header = ({ name, title, contact }: HeaderProps) => {
    return (
        <header className={styles.header}>
            <h1 className={styles.name}>
                {name}, {title}
            </h1>
            <address className={styles.address}>
                <div className={styles.contact}>
                    {contact.location} <span className={styles.sep}>•</span>{' '}
                    <a href={`tel:${contact.phone}`} style={{ color: '#222222', textDecoration: 'none' }}>{contact.phone}</a>{' '}
                    <span className={styles.sep}>•</span>{' '}
                    <a href={`mailto:${contact.email}`} style={{ color: '#222222', textDecoration: 'none' }}>{contact.email}</a>
                </div>
                <div className={styles.contact}>
                    <a href={contact.website}>{contact.website}</a>{' '}
                    <span className={styles.sep}>•</span>{' '}
                    <a href={contact.github}>{contact.github}</a>{' '}
                    <span className={styles.sep}>•</span>{' '}
                    <a href={contact.linkedin}>{contact.linkedin}</a>
                </div>
            </address>
        </header>
    );
};
