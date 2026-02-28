import type { Contact } from '@/types/resume';
import styles from './Header.module.css';

interface HeaderProps {
    name: string;
    contact: Contact;
}

export const Header = ({ name, contact }: HeaderProps) => {
    return (
        <header className={styles.header}>
            <h1 className={styles.name}>{name}</h1>
            <address className={styles.address}>
                <div className={styles.contact}>
                    <span className="sr-only">Location: </span>{contact.location}{' '}
                    <span className={styles.sep}>•</span>{' '}
                    <span className="sr-only">Phone: </span>
                    <a href={`tel:${contact.phone}`} style={{ color: '#222222', textDecoration: 'none' }}>{contact.phone}</a>{' '}
                    <span className={styles.sep}>•</span>{' '}
                    <span className="sr-only">Email: </span>
                    <a href={`mailto:${contact.email}`} style={{ color: '#222222', textDecoration: 'none' }}>{contact.email}</a>{' '}
                </div>
                <div className={styles.contact}>
                    <span className="sr-only">Website: </span>
                    <a href={contact.website}>{contact.website}</a>{' '}
                    <span className={styles.sep}>•</span>{' '}
                    <span className="sr-only">GitHub: </span>
                    <a href={contact.github}>{contact.github}</a>{' '}
                    <span className={styles.sep}>•</span>{' '}
                    <span className="sr-only">LinkedIn: </span>
                    <a href={contact.linkedin}>{contact.linkedin}</a>
                </div>
            </address>
        </header>
    );
};
