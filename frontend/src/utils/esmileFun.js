// src/utils/esmileFun.js
// Random developer news, trending tech topics, and greetings/humour to bring a smile

export const SMILE_FUN_FEED = [
  {
    id: 1,
    category: 'Trending in Tech',
    icon: '🚀',
    text: 'Vite & Rolldown are revolutionizing frontend toolchains with sub-millisecond bundling and instant HMR.',
    tag: 'Tech Pulse',
  },
  {
    id: 2,
    category: 'Developer Humour',
    icon: '😄',
    text: 'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
    tag: 'Smile Fun',
  },
  {
    id: 3,
    category: 'Developer Wisdom',
    icon: '✨',
    text: 'Code is like humor. When you have to explain it, it is bad.',
    author: 'Cory House',
    tag: 'Quote',
  },
  {
    id: 4,
    category: 'Trending in Tech',
    icon: '🤖',
    text: 'Autonomous AI agents and MCP protocols are redefining ERP and enterprise dashboard workflows.',
    tag: 'AI Trends',
  },
  {
    id: 5,
    category: 'Developer Humour',
    icon: '☕',
    text: 'A programmer is a machine that turns caffeine and documentation into working software.',
    tag: 'Dev Life',
  },
  {
    id: 6,
    category: 'Developer Wisdom',
    icon: '💡',
    text: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
    tag: 'Best Practice',
  },
  {
    id: 7,
    category: 'Trending in Tech',
    icon: '⚡',
    text: 'TypeScript continues to lead enterprise adoption with strict mode and optimized inferencing.',
    tag: 'TypeScript',
  },
  {
    id: 8,
    category: 'Developer Humour',
    icon: '🔍',
    text: 'Debugging is like being the detective in a mystery movie where you also happen to be the culprit.',
    tag: 'Smile Fun',
  },
  {
    id: 9,
    category: 'Developer Greeting',
    icon: '👋',
    text: 'May your build succeed on the first try and your merge conflicts resolve smoothly today!',
    tag: 'Good Vibes',
  },
  {
    id: 10,
    category: 'Developer Wisdom',
    icon: '🎯',
    text: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
    tag: 'Engineering',
  },
  {
    id: 11,
    category: 'Trending in Tech',
    icon: '📦',
    text: 'Tailwind CSS v4 engine brings zero-runtime cascade layers and native CSS variables support.',
    tag: 'Frontend',
  },
  {
    id: 12,
    category: 'Developer Humour',
    icon: '💾',
    text: 'There are 10 types of people in the world: those who understand binary, and those who do not.',
    tag: 'Classics',
  },
];

export function getRandomSmileFun(excludeId = null) {
  const filtered = excludeId ? SMILE_FUN_FEED.filter((item) => item.id !== excludeId) : SMILE_FUN_FEED;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || SMILE_FUN_FEED[0];
}
