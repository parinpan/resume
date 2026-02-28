import type { SkillItem } from '@/types/resume';

/**
 * Extract the display name from a SkillItem.
 * Plain strings return as-is; objects return their `name` property.
 */
export function skillItemName(item: SkillItem): string {
    return typeof item === 'string' ? item : item.name;
}

export const parseLinks = (text: string) => {
    const urlRegex = /(https?:\/\/\S+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            return (
                <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#222222' }}>
                    {part}
                </a>
            );
        }
        return part;
    });
};

/**
 * Month abbreviation to ISO month number mapping.
 */
const MONTH_MAP: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04',
    May: '05', Jun: '06', Jul: '07', Aug: '08',
    Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

/**
 * Convert a human-readable date token like "Oct 2023", "2016", or "Present"
 * into an ISO 8601 partial date string (e.g. "2023-10", "2016").
 * Returns an empty string for "Present" or unparseable values.
 */
export function toDatetime(token: string): string {
    const trimmed = token.trim();
    if (trimmed.toLowerCase() === 'present') return '';

    // "Oct 2023" -> "2023-10"
    const monthYear = trimmed.match(/^([A-Za-z]{3})\s+(\d{4})$/);
    if (monthYear) {
        const month = MONTH_MAP[monthYear[1]];
        if (month) return `${monthYear[2]}-${month}`;
    }

    // "2016" -> "2016"
    const yearOnly = trimmed.match(/^(\d{4})$/);
    if (yearOnly) return yearOnly[1];

    return '';
}

/**
 * Parse a period string like "Oct 2023 - Present" into start/end tokens.
 * Returns an array of { label, datetime } objects.
 * For single dates (e.g. "2016"), returns a single element.
 */
export function parsePeriod(period: string): { label: string; datetime: string }[] {
    const parts = period.split(/\s*[-–—]\s*/);
    return parts.map((part) => ({
        label: part.trim(),
        datetime: toDatetime(part),
    }));
}
