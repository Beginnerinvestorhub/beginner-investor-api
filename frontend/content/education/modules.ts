export interface Lesson {
  slug: string;
  title: string;
  videoUrl?: string;
  summary: string;
  points: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  badgeId: string;
  lessons: Lesson[];
}

// Initial three modules with placeholder lessons
export const modules: Module[] = [
  {
    id: 'stocks-101',
    title: 'What Is a Stock?',
    description: 'Learn the fundamentals of equity ownership and how stocks trade.',
    badgeId: 'bootcamp_starter',
    lessons: [
      {
        slug: 'stocks-overview',
        title: 'Stocks Overview',
        videoUrl: '',
        summary: 'Definition, shareholder rights, and why companies issue stock.',
        points: 50,
      },
    ],
  },
  {
    id: 'compound-interest',
    title: 'How Compound Interest Works',
    description: 'See how time and rate grow your money exponentially.',
    badgeId: 'compound_pro',
    lessons: [
      {
        slug: 'compound-basics',
        title: 'Compound Interest Basics',
        videoUrl: '',
        summary: 'Principal, rate, time, and compounding frequency.',
        points: 50,
      },
    ],
  },
  {
    id: 'risk-vs-reward',
    title: 'Understanding Risk vs. Reward',
    description: 'Balance potential gains with acceptable risk levels.',
    badgeId: 'risk_master',
    lessons: [
      {
        slug: 'risk-basics',
        title: 'Risk Basics',
        videoUrl: '',
        summary: 'Volatility, diversification, and personal tolerance.',
        points: 50,
      },
    ],
  },
];
