/**
 * Role-specific content for Knowledge Hub.
 * Each role gets tailored guidance—not generic bullets.
 */

export type PersonaId = 'parent' | 'educator' | 'administrator' | 'student' | 'just_learning';

export interface RoleSectionContent {
  intro: string;
  bullets: { strong: string; text: string }[];
  ctaLabel?: string;
  ctaHref?: string;
}

export interface RoleAppsContent {
  heading: string;
  subheading: string;
  intro: string;
  bullets: { strong: string; text: string }[];
  links: { label: string; href: string; external?: boolean }[];
}

export interface RoleStateLawsContent {
  heading: string;
  subheading: string;
  intro: string;
  ctaLabel: string;
  ctaHref: string;
  footer: string;
}

export interface RoleAdvocateContent {
  heading: string;
  subheading: string;
  intro: string;
  bullets: { strong: string; text: string }[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

const APPS_BY_ROLE: Record<PersonaId, RoleAppsContent> = {
  parent: {
    heading: 'Understand apps — from a parent\'s perspective',
    subheading: 'What to ask about the apps your kids use at school',
    intro: 'As a parent, you have the right to know what apps touch your child\'s data. Here\'s what matters and how to get real answers—not reassurance.',
    bullets: [
      { strong: 'Ask the school for a list.', text: 'Request a list of apps used in your child\'s classes. Districts often maintain this; you have a right to see it.' },
      { strong: 'Ask what data each app collects.', text: 'Names, emails, grades, behavior notes—get specifics. Under FERPA, you can request this information.' },
      { strong: 'Check the SDPC Registry.', text: 'The Student Data Privacy Consortium registry shows which vendors have signed standard agreements. Many districts use it—we link to the source so you can verify.' },
      { strong: 'Don\'t accept "it\'s fine."', text: 'You deserve facts, not hand-waving. If an answer is vague, ask again in writing.' },
    ],
    links: [
      { label: 'SDPC Registry & resources', href: 'https://privacy.a4l.org', external: true },
      { label: 'Ask WiseBot about a specific app', href: '/tools/wisebot' },
    ],
  },
  educator: {
    heading: 'Understand apps — from an educator\'s perspective',
    subheading: 'How to vet tools before you use them in your classroom',
    intro: 'As an educator, you need to know the rules and how to vet tools—fact-based, so you\'re not guessing or putting student data at risk.',
    bullets: [
      { strong: 'Ask before you add a new tool.', text: 'Check with your tech or privacy lead before using any app that collects student data. Don\'t rely on "everyone uses it."' },
      { strong: 'Traffic light thinking.', text: 'Green = vetted and approved; Yellow = use with caution or after review; Red = not approved. Know your district\'s criteria.' },
      { strong: 'Avoid personal accounts for school work.', text: 'Using consumer ChatGPT or similar with student data violates FERPA. Use district-approved tools only.' },
      { strong: 'SDPC Registry.', text: 'Many states use the Student Data Privacy Consortium registry. Your district may use it—we link to the source so you can confirm.' },
    ],
    links: [
      { label: 'SDPC Registry & resources', href: 'https://privacy.a4l.org', external: true },
      { label: 'App vetting certification', href: '/certification' },
      { label: 'Ask WiseBot a question', href: '/tools/wisebot' },
    ],
  },
  administrator: {
    heading: 'Understand apps — from an administrator\'s perspective',
    subheading: 'Procedures, roles, and compliance for your district',
    intro: 'As an administrator, you need to run a tight ship—procedures, roles, and compliance requirements that you can show and defend.',
    bullets: [
      { strong: 'Establish a vetting workflow.', text: 'Who approves new apps? Who maintains the metadata dictionary? Document it and train staff.' },
      { strong: 'Use the NDPA framework.', text: 'The National Data Privacy Agreement (NDPA) and state variants give you a standard. Ensure vendors sign before use.' },
      { strong: 'Track Exhibit H for AI tools.', text: 'AI tools that process student data may require Exhibit H (generative AI addendum). Know which products use it and why.' },
      { strong: 'SDPC Registry.', text: 'The Student Data Privacy Consortium registry is the industry standard. Ensure your district leverages it for procurement.' },
    ],
    links: [
      { label: 'SDPC Registry & resources', href: 'https://privacy.a4l.org', external: true },
      { label: 'State ecosystem & procedures', href: '/ecosystem' },
      { label: 'Ask WiseBot about policy', href: '/tools/wisebot' },
    ],
  },
  student: {
    heading: 'Understand apps — from a student\'s perspective',
    subheading: 'Your data, your rights, and what to ask',
    intro: 'Your school uses apps that touch your data. You\'re not in the dark—here\'s what you can ask and what your rights are.',
    bullets: [
      { strong: 'You have rights.', text: 'FERPA gives you (and your parents) rights over your education records. Apps that collect your data fall under that.' },
      { strong: 'Ask what apps collect.', text: 'If a teacher asks you to sign up for something, you can ask what data it collects. You don\'t have to just accept it.' },
      { strong: 'Be careful with AI.', text: 'Don\'t put your personal info into consumer AI tools (ChatGPT, etc.) for school work. Use district-approved tools only.' },
      { strong: 'Know the traffic lights.', text: 'Green = approved; Yellow = caution; Red = not allowed. Your school has a list—ask for it.' },
    ],
    links: [
      { label: 'SDPC Registry (what vendors have agreed to)', href: 'https://privacy.a4l.org', external: true },
      { label: 'Ask WiseBot a question', href: '/tools/wisebot' },
    ],
  },
  just_learning: {
    heading: 'Understand apps',
    subheading: 'What to ask before you (or your kids) use an app',
    intro: 'It\'s reasonable to want to verify before you trust. Here\'s what actually matters and where to check.',
    bullets: [
      { strong: 'Ask before you download.', text: 'Parents: ask the school what apps they use and what data they collect. Educators: ask your tech lead before adding a new tool.' },
      { strong: 'Traffic light thinking.', text: 'Green = vetted and approved; Yellow = use with caution; Red = not approved. We give you the criteria so you (or your district) can decide.' },
      { strong: 'SDPC Registry.', text: 'Many states use the Student Data Privacy Consortium registry to see which vendors have signed standard agreements. We link to the source so you can confirm.' },
    ],
    links: [
      { label: 'SDPC Registry & resources', href: 'https://privacy.a4l.org', external: true },
      { label: 'App vetting certification (educators)', href: '/certification' },
      { label: 'Ask WiseBot', href: '/tools/wisebot' },
    ],
  },
};

const STATE_LAWS_BY_ROLE: Record<PersonaId, RoleStateLawsContent> = {
  parent: {
    heading: 'State laws & procedures — for parents',
    subheading: 'What applies where you live',
    intro: 'Federal laws (FERPA, PPRA) and state-specific laws govern how schools handle your child\'s data. Different states have different roles (Data Manager, Security Officer) and requirements. Pick your state to see what actually applies—and who to contact if you have questions.',
    ctaLabel: 'View your state\'s ecosystem',
    ctaHref: '/ecosystem',
    footer: 'We\'re adding full ecosystem guides state by state. Utah is available now as a model.',
  },
  educator: {
    heading: 'State laws & procedures — for educators',
    subheading: 'Compliance requirements in your state',
    intro: 'Your state may have specific roles (Data Manager, Security Officer), workflows, and deadlines. Federal laws (FERPA, PPRA) apply everywhere; state laws add requirements. Pick your state to see who does what and what you need to know.',
    ctaLabel: 'View your state\'s ecosystem',
    ctaHref: '/ecosystem',
    footer: 'We\'re adding full ecosystem guides state by state. Utah is available now as a model.',
  },
  administrator: {
    heading: 'State laws & procedures — for administrators',
    subheading: 'Roles, laws, and workflows by state',
    intro: 'You need to know exactly what\'s required—not summaries. Federal laws (FERPA, PPRA), state-specific laws, who does what (Data Manager, Security Officer), and what your state requires. Pick your state for details you can cross-reference with official sources.',
    ctaLabel: 'View all states & pick yours',
    ctaHref: '/ecosystem',
    footer: `${50}+ states are SDPC members; we're adding full ecosystem guides state by state. Utah is available now as a model.`,
  },
  student: {
    heading: 'State laws & procedures — for students',
    subheading: 'What the law says about your data',
    intro: 'Federal and state laws protect your education records. Your state may have additional rules about who can see your data and how it\'s stored. Pick your state to learn what applies—and who at your school is responsible for protecting your privacy.',
    ctaLabel: 'View your state\'s ecosystem',
    ctaHref: '/ecosystem',
    footer: 'We\'re adding full guides state by state. Utah is available now.',
  },
  just_learning: {
    heading: 'State laws & procedures',
    subheading: 'Federal and state privacy laws, workflows, and compliance by state',
    intro: 'If you want to know exactly what\'s required in your state—roles, laws, and workflows—we lay it out. Federal laws (FERPA, PPRA), state-specific laws, who does what, and what your state actually requires. Pick your state and get the details.',
    ctaLabel: 'View all states & pick yours',
    ctaHref: '/ecosystem',
    footer: `${50}+ states are SDPC members; we're adding full ecosystem guides state by state. Utah is available now as a model.`,
  },
};

const ADVOCATE_BY_ROLE: Record<PersonaId, RoleAdvocateContent> = {
  parent: {
    heading: 'Be an advocate — as a parent',
    subheading: 'What you can do with what you know',
    intro: 'Knowing the facts gives you power. You can ask the right questions, document answers, and push for better practices—without relying on reassurance.',
    bullets: [
      { strong: 'Learn.', text: 'Use this hub and your state\'s ecosystem page so you know what laws apply and who\'s responsible.' },
      { strong: 'Ask.', text: 'Ask your school what apps they use, what data they collect, and how they vet new tools. Request answers in writing when it matters.' },
      { strong: 'Share.', text: 'Tell other parents to ask before they app. One habit, scaled.' },
      { strong: 'Join a PTA or advocacy group.', text: 'Collective voice matters. Many states have parent-led privacy groups.' },
    ],
    primaryCtaLabel: 'View your state\'s ecosystem',
    primaryCtaHref: '/ecosystem',
    secondaryCtaLabel: 'Ask WiseBot',
    secondaryCtaHref: '/tools/wisebot',
  },
  educator: {
    heading: 'Be an advocate — as an educator',
    subheading: 'Advocate from a position of knowledge',
    intro: 'Knowing the facts reduces guesswork and gives you a clear role. Get certified, then advocate for better practices in your school or district.',
    bullets: [
      { strong: 'Learn.', text: 'Use this hub and your state\'s ecosystem page so you know what laws and procedures apply.' },
      { strong: 'Get certified.', text: 'Our free NDPA-focused certification teaches the same language districts use—so you can advocate from knowledge, not just concern.' },
      { strong: 'Ask.', text: 'Ask your tech or privacy lead before adding tools. Document answers. Push for a clear vetting workflow.' },
      { strong: 'Share.', text: 'Tell colleagues to ask before they app. One habit, scaled.' },
    ],
    primaryCtaLabel: 'Free certification for educators',
    primaryCtaHref: '/certification',
    secondaryCtaLabel: 'Your state\'s ecosystem',
    secondaryCtaHref: '/ecosystem',
  },
  administrator: {
    heading: 'Be an advocate — as an administrator',
    subheading: 'Lead from the front on privacy',
    intro: 'You set the tone. Establish clear procedures, train staff, and show that privacy is a priority—not an afterthought.',
    bullets: [
      { strong: 'Establish procedures.', text: 'Document who approves apps, who maintains the metadata dictionary, and how parents can get answers.' },
      { strong: 'Train staff.', text: 'Ensure educators know the rules and don\'t use unapproved tools with student data.' },
      { strong: 'Be transparent.', text: 'Publish your data governance plan. Link to the SDPC and state resources.' },
      { strong: 'Engage your state alliance.', text: 'Many states have SDPC-aligned alliances. Join them and leverage shared resources.' },
    ],
    primaryCtaLabel: 'State ecosystem & procedures',
    primaryCtaHref: '/ecosystem',
    secondaryCtaLabel: 'Ask WiseBot about policy',
    secondaryCtaHref: '/tools/wisebot',
  },
  student: {
    heading: 'Be an advocate — as a student',
    subheading: 'Your voice matters',
    intro: 'You can ask questions and push for clarity. You don\'t have to accept vague answers about your data.',
    bullets: [
      { strong: 'Learn your rights.', text: 'FERPA gives you and your parents rights over your education records. Know what that means.' },
      { strong: 'Ask.', text: 'Ask teachers or the tech office what apps collect and how they\'re vetted. You have a right to know.' },
      { strong: 'Share with peers.', text: 'Tell friends to ask before they app. One habit, scaled.' },
      { strong: 'Talk to your parents.', text: 'If something feels off, tell a parent or guardian. They can advocate for you.' },
    ],
    primaryCtaLabel: 'Your state\'s ecosystem',
    primaryCtaHref: '/ecosystem',
    secondaryCtaLabel: 'Ask WiseBot',
    secondaryCtaHref: '/tools/wisebot',
  },
  just_learning: {
    heading: 'Be an advocate & steward',
    subheading: 'Increase your knowledge and push for better practices',
    intro: 'Knowing the facts reduces guesswork and gives you a clear role. We\'re not here to calm you down—we\'re here to give you what you need to act.',
    bullets: [
      { strong: 'Learn.', text: 'Use this hub and your state\'s ecosystem page so you know what laws and procedures apply where you live or work.' },
      { strong: 'Ask.', text: 'Ask your school, district, or employer what they do with data and how they vet apps. Document answers when it matters.' },
      { strong: 'Share.', text: 'Tell others to ask before they app. One habit, scaled.' },
      { strong: 'Get certified (educators).', text: 'Our free NDPA-focused certification teaches the same language districts use—so you can advocate from knowledge, not just concern.' },
    ],
    primaryCtaLabel: 'Free certification for educators',
    primaryCtaHref: '/certification',
    secondaryCtaLabel: 'Your state\'s ecosystem',
    secondaryCtaHref: '/ecosystem',
  },
};

export function getAppsContent(role: PersonaId): RoleAppsContent {
  return APPS_BY_ROLE[role];
}

export function getStateLawsContent(role: PersonaId): RoleStateLawsContent {
  return STATE_LAWS_BY_ROLE[role];
}

export function getAdvocateContent(role: PersonaId): RoleAdvocateContent {
  return ADVOCATE_BY_ROLE[role];
}

export function getRolePersonaId(who: string | null): PersonaId | null {
  if (!who) return null;
  const normalized = who.toLowerCase().replace(/\s/g, '_');
  if (normalized === 'parent' || normalized === 'educator' || normalized === 'administrator' ||
      normalized === 'student' || normalized === 'just_learning') {
    return normalized as PersonaId;
  }
  return null;
}
