import resumeDataRaw from '../../resume-data.json';
import type { ResumeData, ResumeSection } from '@/types/resume';

import { Header } from '@/components/Header';
import { Section } from '@/components/Section';
import { ExperienceEntry } from '@/components/ExperienceEntry';
import { EducationEntry } from '@/components/EducationEntry';
import { SkillsTable } from '@/components/SkillsTable';
import { CourseEntry } from '@/components/CourseEntry';
import { CertificationsList } from '@/components/CertificationsList';
import { Toolbar } from '@/components/Toolbar';
import styles from './page.module.css';

const DATA: ResumeData = resumeDataRaw as ResumeData;

function buildJsonLd(data: ResumeData) {
  const skillsSection = data.sections.find((s) => s.type === 'skills');
  const allSkills =
    skillsSection?.type === 'skills'
      ? skillsSection.data.flatMap((s) => s.items)
      : [];

  const experiencesSection = data.sections.find((s) => s.type === 'experiences');
  const currentJob =
    experiencesSection?.type === 'experiences' ? experiencesSection.data[0] : null;

  const educationSection = data.sections.find((s) => s.type === 'education');
  const education =
    educationSection?.type === 'education' ? educationSection.data : [];

  const certificationsSection = data.sections.find((s) => s.type === 'certifications');
  const certifications =
    certificationsSection?.type === 'certifications' ? certificationsSection.data : [];

  const profileSection = data.sections.find((s) => s.type === 'profile');
  const profileText = profileSection?.type === 'profile' ? profileSection.data : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntity: {
      '@type': 'Person',
      name: data.name,
      jobTitle: data.title,
      description: profileText,
      url: data.contact.website,
      email: data.contact.email,
      telephone: data.contact.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: data.contact.location.split(', ')[0],
        addressCountry: data.contact.location.split(', ')[1],
      },
      sameAs: [data.contact.github, data.contact.linkedin, data.contact.website],
      knowsAbout: allSkills,
      ...(currentJob && {
        worksFor: {
          '@type': 'Organization',
          name: currentJob.company,
        },
      }),
      alumniOf: education.map((edu) => ({
        '@type': 'EducationalOrganization',
        name: edu.institution,
      })),
      hasCredential: certifications.map((cert) => ({
        '@type': 'EducationalOccupationalCredential',
        name: cert.name,
        credentialCategory: 'certificate',
        recognizedBy: {
          '@type': 'Organization',
          name: cert.issuer,
        },
      })),
    },
  };
}

function renderSection(section: ResumeSection, idx: number) {
  switch (section.type) {
    case 'profile':
      return (
        <Section key={idx} title={section.title}>
          <p className={styles.profile}>{section.data}</p>
        </Section>
      );

    case 'experiences':
      return (
        <Section key={idx} title={section.title}>
          {section.data.map((exp, i) => (
            <div key={i} className={exp.pageBreakBefore ? styles.pageBreakBefore : undefined}>
              <ExperienceEntry data={exp} />
            </div>
          ))}
        </Section>
      );

    case 'education':
      return (
        <Section key={idx} title={section.title}>
          {section.data.map((edu, i) => (
            <EducationEntry key={i} data={edu} />
          ))}
        </Section>
      );

    case 'skills':
      return (
        <Section key={idx} title={section.title}>
          <SkillsTable data={section.data} />
        </Section>
      );

    case 'shortCourses':
      return (
        <Section key={idx} title={section.title}>
          {section.data.map((course, i) => (
            <CourseEntry key={i} data={course} />
          ))}
        </Section>
      );

    case 'certifications':
      return (
        <Section key={idx} title={section.title}>
          <CertificationsList data={section.data} />
        </Section>
      );
  }
}

export default function Home() {
  const jsonLd = buildJsonLd(DATA);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Toolbar />
      <main>
        <article className="page" id="page">
          <Header name={DATA.name} title={DATA.title} contact={DATA.contact} />
          {DATA.sections.map((section, idx) => renderSection(section, idx))}
        </article>
      </main>
    </>
  );
}
