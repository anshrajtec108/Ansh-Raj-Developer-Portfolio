export interface Profile {
  name: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  profilePhotoUrl: string;
  resumeUrl: string;
}

export type SkillCategory = 'Frontend' | 'Backend' | 'Tools & DevOps' | 'Future Skills';

export interface Skill {
  id: string;
  category: SkillCategory;
  name: string;
  proficiency: number; // 1-100
  linkedProjectIds: string[];
  linkedProofIds: string[];
  notes: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longOverview: string;
  problem: string;
  solution: string;
  techStack: string[];
  keyFeatures: string[];
  securityFeatures: string[];
  screenshotUrls: string[];
  demoVideoUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  challenges: string;
  learnings: string;
  thumbnailUrl: string;
  featured: boolean;
}

export interface Certification {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  date: string;
  shortDescription: string;
  thumbnailUrl?: string;
  fullImageUrl?: string;
  whatLearned: string;
  skillsGained: string[];
  application: string;
  relatedProblems: string[];
  relatedProjectIds: string[];
  futureLearningPlan: string;
  verificationUrl?: string;
  proofUrl?: string;
}

export type ProofType = 'document' | 'certificate' | 'code' | 'screenshot' | 'link' | 'video' | 'article';

export interface Proof {
  id: string;
  title: string;
  slug: string;
  type: ProofType;
  shortDescription: string;
  description: string;
  imageUrl?: string;
  documentUrl?: string;
  externalUrl?: string;
  videoUrl?: string;
  codeSnippet?: string;
  codeLanguage?: string;
  tags: string[];
  date: string;
  issuer?: string;
  linkedProjectIds: string[];
}

export interface ApproachOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface EngineeringNote {
  id: string;
  slug: string;
  title: string;
  summary: string;
  highlight: string;
  tags: string[];
  thoughtProcess: string;
  approaches: ApproachOption[];
  finalApproach: string;
  tradeoffs: string;
  architectureNotes?: string;
  realWorldApplicability: string;
  conclusion: string;
  visible: boolean;
  order: number;
}

export interface PortfolioData {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  proofs: Proof[];
  engineeringNotes: EngineeringNote[];
}
