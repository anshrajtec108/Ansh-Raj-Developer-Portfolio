import { PortfolioData } from '../types';
import { seedData } from '../data/seed';

const STORAGE_KEY = 'portfolio:data';
const ENGINEERING_UPGRADE_KEY = 'portfolio:migration:engineering-v1';

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
      if (!localStorage.getItem(ENGINEERING_UPGRADE_KEY)) {
        const apexMatchProject = seedData.projects.find(project => project.slug === 'apexmatch');
        if (apexMatchProject && !parsed.projects.some(project => project.slug === apexMatchProject.slug)) {
          parsed.projects.unshift(apexMatchProject);
        }

        const apexMatchNote = seedData.engineeringNotes.find(note => note.slug === 'apexmatch-atomic-booking');
        if (apexMatchNote && !parsed.engineeringNotes.some(note => note.slug === apexMatchNote.slug)) {
          parsed.engineeringNotes.push(apexMatchNote);
        }

        const ticketDesignNote = parsed.engineeringNotes.find(note => note.slug === 'ticket-booking-system');
        const seedTicketDesignNote = seedData.engineeringNotes.find(note => note.slug === 'ticket-booking-system');
        if (
          ticketDesignNote?.title === 'Ticket Booking System (Theatre)' &&
          ticketDesignNote.finalApproach.startsWith('I chose the Redis-backed reservation with TTL') &&
          seedTicketDesignNote
        ) {
          ticketDesignNote.title = seedTicketDesignNote.title;
          ticketDesignNote.summary = seedTicketDesignNote.summary;
          ticketDesignNote.highlight = seedTicketDesignNote.highlight;
          ticketDesignNote.finalApproach = seedTicketDesignNote.finalApproach;
          ticketDesignNote.architectureNotes = seedTicketDesignNote.architectureNotes;
          ticketDesignNote.conclusion = seedTicketDesignNote.conclusion;
        }

        const newSkills = seedData.skills.filter(skill =>
          ['s9', 's10', 's11', 's12', 's13'].includes(skill.id) &&
          !parsed.skills.some(existingSkill => existingSkill.id === skill.id)
        );
        parsed.skills.push(...newSkills);
        const backendSkill = parsed.skills.find(skill => skill.id === 's3');
        if (backendSkill && !backendSkill.linkedProjectIds.includes('p4')) {
          backendSkill.linkedProjectIds.push('p4');
        }
        parsed.skills = parsed.skills.map(skill => ({
          ...skill,
          category: (skill.category as string) === 'Future Skills' ? 'Currently Learning' : skill.category,
        }));

        if (parsed.profile?.headline === 'MERN Stack Developer · Building Secure, Scalable Web Apps') {
          parsed.profile.headline = seedData.profile.headline;
        }
        if (parsed.profile?.summary === 'Dedicated MERN stack developer with a passion for building secure, scalable, and high-performance web applications. Experienced in freelancing and implementing advanced security practices. Currently pursuing BCA.') {
          parsed.profile.summary = seedData.profile.summary;
        }

        saveData(parsed);
        localStorage.setItem(ENGINEERING_UPGRADE_KEY, 'applied');
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