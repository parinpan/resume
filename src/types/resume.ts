export interface Contact {
    location: string;
    phone: string;
    email: string;
    website: string;
    github: string;
    linkedin: string;
}

export interface Bullet {
    text: string;
    tech?: string[];
}

export interface Experience {
    title: string;
    company: string;
    location: string;
    period: string;
    pageBreakBefore?: boolean;
    bullets: Bullet[];
}

export interface Education {
    degree: string;
    institution: string;
    location: string;
    period: string;
    bullets: string[];
}

export interface Skill {
    category: string;
    items: string[];
}

export interface ShortCourse {
    title: string;
    location: string;
    period: string;
    description: string;
}

export interface Certification {
    name: string;
    issuer: string;
    year: string;
}

// --- Section discriminated union ---

interface ProfileSection {
    type: 'profile';
    title: string;
    data: string;
}

interface ExperiencesSection {
    type: 'experiences';
    title: string;
    data: Experience[];
}

interface EducationSection {
    type: 'education';
    title: string;
    data: Education[];
}

interface SkillsSection {
    type: 'skills';
    title: string;
    data: Skill[];
}

interface ShortCoursesSection {
    type: 'shortCourses';
    title: string;
    data: ShortCourse[];
}

interface CertificationsSection {
    type: 'certifications';
    title: string;
    data: Certification[];
}

export type ResumeSection =
    | ProfileSection
    | ExperiencesSection
    | EducationSection
    | SkillsSection
    | ShortCoursesSection
    | CertificationsSection;

export interface ResumeData {
    name: string;
    title: string;
    contact: Contact;
    sections: ResumeSection[];
}
