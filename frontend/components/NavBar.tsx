// components/NavBar/navConfig.ts
export interface NavItem {
  href: string;
  label: string;
  subItems?: NavItem[];
}

export const NAV_LINKS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'My Journey' },
  {
    href: '/learn',
    label: 'Learn',
    subItems: [
      { href: '/learn/my-path', label: 'My Learning Path' },
      { href: '/learn/challenges', label: 'Challenges' },
      { href: '/learn', label: 'Content Library' },
      { href: '/learn/glossary', label: 'Glossary' },
    ],
  },
  {
    href: '/practice',
    label: 'Practice',
    subItems: [
      { href: '/portfolio-monitor', label: 'Virtual Portfolio' },
      { href: '/practice/sandbox', label: 'Investment Sandbox' },
    ],
  },
  {
    href: '/tools',
    label: 'Tools',
    subItems: [
      {
        href: '/fractional-share-calculator',
        label: 'Fractional Share Calculator',
      },
      { href: '/risk-assessment', label: 'Risk Assessment' },
      { href: '/esg-screener', label: 'ESG Screener' },
    ],
  },
  {
    href: '/community',
    label: 'Community',
    subItems: [
      { href: '/community/leaderboards', label: 'Leaderboards' },
      { href: '/community/achievements', label: 'Achievements' },
      { href: '/community/discussions', label: 'Discussions' },
    ],
  },
];
