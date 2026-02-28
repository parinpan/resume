import type { Skill, SkillItem } from '@/types/resume';
import { skillItemName } from '@/utils/parsers';
import styles from './Skills.module.css';

interface SkillsProps {
    data: Skill[];
}

function renderItem(item: SkillItem, idx: number) {
    if (typeof item === 'string') {
        return <span key={idx}>{item}</span>;
    }
    return (
        <abbr key={idx} title={item.fullForm}>
            {item.name}
        </abbr>
    );
}

export const SkillsTable = ({ data }: SkillsProps) => {
    return (
        <dl className={styles.skills} aria-label="Technical skills">
            {data.map((sk, idx) => (
                <div key={idx} className={styles.row}>
                    <dt>{sk.category}</dt>
                    <dd>
                        {sk.items.map((item, i) => (
                            <span key={i}>
                                {i > 0 && ', '}
                                {renderItem(item, i)}
                            </span>
                        ))}
                    </dd>
                </div>
            ))}
        </dl>
    );
};
