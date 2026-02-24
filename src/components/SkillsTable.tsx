import type { Skill } from '@/types/resume';
import styles from './Skills.module.css';

interface SkillsProps {
    data: Skill[];
}

export const SkillsTable = ({ data }: SkillsProps) => {
    return (
        <table className={styles.skills} aria-label="Technical skills">
            <tbody>
                {data.map((sk, idx) => (
                    <tr key={idx}>
                        <td>{sk.category}</td>
                        <td>{sk.items.join(', ')}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
