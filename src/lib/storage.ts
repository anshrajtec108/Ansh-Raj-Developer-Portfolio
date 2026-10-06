import { PortfolioData } from '../types';
import { seedData } from '../data/seed';

const STORAGE_KEY = 'portfolio:data';

export const loadData = (): PortfolioData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as PortfolioData;
      // Migrate existing data to include proofs
      if (!parsed.proofs) {
        parsed.proofs = [];
      }
      if (!parsed.engineeringNotes) {
        parsed.engineeringNotes = seedData.engineeringNotes || [];
      }
      if (parsed.skills) {
        parsed.skills = parsed.skills.map(skill => ({
          ...skill,
          linkedProofIds: skill.linkedProofIds || [],
        }));
      }
      if (parsed.certifications) {
        parsed.certifications = parsed.certifications.map(cert => ({
          ...cert,
          slug: cert.slug || cert.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          shortDescription: cert.shortDescription || "Certification completion.",
          whatLearned: cert.whatLearned || "Completed certification requirements.",
          skillsGained: cert.skillsGained || [],
          application: cert.application || "Applied in daily engineering tasks.",
          relatedProblems: cert.relatedProblems || [],
          relatedProjectIds: cert.relatedProjectIds || [],
          futureLearningPlan: cert.futureLearningPlan || "Continue learning in this domain.",
        }));
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading portfolio data from localStorage', error);
  }
  // Fallback to seed data if nothing in storage or parse error
  saveData(seedData);
  return seedData;
};

export const saveData = (data: PortfolioData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving portfolio data to localStorage', error);
  }
};

export const exportData = (data: PortfolioData): void => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = 'portfolio-data.json';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};