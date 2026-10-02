import type { SkillItem } from '@/types/resume';

/**
 * Extract the display name from a SkillItem.
 * Plain strings return as-is; objects return their `name` property.
 */
export function skillItemName(item: SkillItem): string {
    return typeof item === 'string' ? item : item.name;
}

type Segment = { type: 'text'; value: string } | { type: 'link'; label: string; url: string };

/**
 * Tokenize a string into text segments and link segments.
 *
 * Supports two link syntaxes:
 * 1. Markdown links: [label](url) — renders <a> with label as visible text.
 * 2. Bare URLs: https://example.com — auto-linked with the URL as visible text.
 *
 * Tokenization is done with a hand-written character scanner (no regex)
 * to keep the logic transparent and easy to maintain.
 */
function tokenize(text: string): Segment[] {
    const segments: Segment[] = [];
    let buffer = '';
    let i = 0;

    const flushBuffer = () => {
        if (buffer) {
            segments.push({ type: 'text', value: buffer });
            buffer = '';
        }
    };

    while (i < text.length) {
        // ── Markdown link: [label](url) ──
        if (text[i] === '[') {
            const closeBracket = text.indexOf(']', i + 1);
            if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
                const closeParen = text.indexOf(')', closeBracket + 2);
                if (closeParen !== -1) {
                    const label = text.slice(i + 1, closeBracket);
                    const url = text.slice(closeBracket + 2, closeParen);
                    if (label && url) {
                        flushBuffer();
                        segments.push({ type: 'link', label, url });
                        i = closeParen + 1;
                        continue;
                    }
                    // Invalid markdown link (e.g. empty label) — consume the
                    // entire bracket+paren span as plain text so any URL inside
                    // the parentheses is not picked up by the bare URL detector.
                    buffer += text.slice(i, closeParen + 1);
                    i = closeParen + 1;
                    continue;
                }
            }
        }

        // ── Bare URL: http:// or https:// ──
        if (text[i] === 'h' && (text.startsWith('http://', i) || text.startsWith('https://', i))) {
            let end = i;
            while (end < text.length && !/\s/.test(text[end])) {
                end++;
            }
            // Trim trailing punctuation that's unlikely part of the URL
            while (end > i + 8 && /[.,;:!?\])}>'"]/.test(text[end - 1])) {
                end--;
            }
            if (end > i) {
                flushBuffer();
                segments.push({ type: 'link', label: text.slice(i, end), url: text.slice(i, end) });
                i = end;
                continue;
            }
        }

        buffer += text[i];
        i++;
    }

    flushBuffer();
    return segments;
}

export const parseLinks = (text: string) => {
    return tokenize(text).map((seg, index) => {
        if (seg.type === 'link') {
            return (
                <a key={index} href={seg.url} target="_blank" rel="noopener noreferrer" style={{ color: '#222222' }}>
                    {seg.label}
                </a>
            );
        }
        return seg.value;
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
