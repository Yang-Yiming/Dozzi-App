
import { Translations, Creature } from './types';

export const EMOJIS = ['✨', '🌙', '⭐', '🌊', '🌸', '🍬', '🎹', '🚀', '🎨', '🧸', '🔮', '🎵', '🐱', '🦋', '🌈', '🍦', '💎', '🎈'];
export const NIGHTMARE_EMOJIS = ['⚡', '🔥', '🥀', '👁️', '🌑', '🦴', '🔪'];
export const REACTION_EMOJIS = ['👍', '😊', '🤣', '😂'];

export const COLORS = [
  'bg-dream-100',
  'bg-dream-200',
  'bg-dream-300',
  'bg-pink-300',
  'bg-purple-300',
  'bg-indigo-300',
  'bg-teal-200',
];

export const TEXTS: Record<'en' | 'zh', Translations> = {
  en: {
    brain: 'Brain',
    focus: 'Focus',
    forum: 'Forum',
    archive: 'Archive',
    settings: 'Settings',
    startFocus: 'Start Focus',
    giveUp: 'Give Up',
    focusing: 'Focusing...',
    timeRemaining: 'Time Remaining',
    creatureBorn: 'A new Dream Creature is born!',
    nightmareBorn: 'A Nightmare has appeared...',
    share: 'Share to Forum',
    language: 'Language',
    selectLanguage: 'Select Language',
    minutes: 'minutes',
    myCreatures: 'My Creatures',
    noCreatures: 'Your mind is empty. Focus to create dreams.',
    nightmareDesc: 'A manifestation of lost focus.',
    dreamDesc: 'A beautiful focus memory.',
    writeCaption: 'Write something about this creature...',
    post: 'Post',
    cancel: 'Cancel',
    selectCreature: 'Select a Creature',
    noCreaturesToShare: 'You have no creatures to share! Go focus.',
    creatureSize: 'Creature Size',
    addToArchive: 'Add to Archive',
    dissolve: 'Dissolve',
    dissolveConfirm: 'Let this creature fade away?',
    noArchivedCreatures: 'No archived creatures yet. Archive your favorites to keep them forever!',
    archivedOn: 'Archived on',
    willDissolveIn: 'Will dissolve in',
    dissolving: 'Dissolving...',
    removeFromArchive: 'Remove from Archive',
  },
  zh: {
    brain: '大脑',
    focus: '专注',
    forum: '广场',
    archive: '收藏',
    settings: '设置',
    startFocus: '开始专注',
    giveUp: '放弃',
    focusing: '专注中...',
    timeRemaining: '剩余时间',
    creatureBorn: '一个新的梦境生物诞生了！',
    nightmareBorn: '一个噩梦出现了...',
    share: '分享到广场',
    language: '语言',
    selectLanguage: '选择语言',
    minutes: '分钟',
    myCreatures: '我的生物',
    noCreatures: '你的大脑空空如也。去专注创造梦境吧。',
    nightmareDesc: '专注被打断的产物。',
    dreamDesc: '美好的专注记忆。',
    writeCaption: '写点什么...',
    post: '发布',
    cancel: '取消',
    selectCreature: '选择一个生物',
    noCreaturesToShare: '你还没有生物可以分享！去专注吧。',
    creatureSize: '生物大小',
    addToArchive: '加入收藏',
    dissolve: '消解',
    dissolveConfirm: '让这个生物消散吗？',
    noArchivedCreatures: '还没有收藏的生物。收藏你喜欢的生物，它们就不会消失！',
    archivedOn: '收藏于',
    willDissolveIn: '将于',
    dissolving: '消解中...',
    removeFromArchive: '取消收藏',
  }
};

const mockVisualParams1 = {
  baseRadius: 40,
  baseColor: [147, 112, 219] as [number, number, number],
  colors: [[147, 112, 219], [100, 80, 180], [70, 50, 150]] as [number, number, number][],
  points: Array(10).fill(0).map((_, i) => ({ angle: (i/10)*Math.PI*2, baseRadius: 40, originalAngle: (i/10)*Math.PI*2, weight: 0.5 })),
  features: ['spots'],
  spotParams: {
    count: 5,
    spots: [{angle: 0, dist: 10, size: 5}, {angle: 2, dist: 15, size: 4}, {angle: 4, dist: 12, size: 6}, {angle: 5, dist: 8, size: 5}, {angle: 1, dist: 20, size: 3}],
    spotColor: [255, 200, 200] as [number, number, number]
  },
  eyeOffset: { x: 0, y: -5 }
};

const mockVisualParams2 = {
  baseRadius: 35,
  baseColor: [255, 165, 0] as [number, number, number],
  colors: [[255, 165, 0], [200, 120, 0], [150, 80, 0]] as [number, number, number][],
  points: Array(9).fill(0).map((_, i) => ({ angle: (i/9)*Math.PI*2, baseRadius: 35, originalAngle: (i/9)*Math.PI*2, weight: 0.6 })),
  features: ['rainbowEdge', 'flowers'],
  flowerParams: {
    count: 3,
    flowers: [
      {idealAngle: 0, size: 5, color: [255, 255, 255] as [number, number, number]}, 
      {idealAngle: 2, size: 4, color: [255, 200, 200] as [number, number, number]}, 
      {idealAngle: 4, size: 6, color: [200, 200, 255] as [number, number, number]}
    ]
  },
  eyeOffset: { x: 2, y: 2 }
};

export const MOCK_FORUM_POSTS = [
  {
    id: '1',
    author: 'Alice',
    likes: 12,
    caption: 'Look at this happy little guy I found after studying for 2 hours! 🐱',
    reactions: { '👍': 5, '😊': 7 },
    timestamp: Date.now() - 1000000,
    creature: {
      id: 'mock1',
      type: 'dream' as const,
      emojis: ['✨', '🐱', '🌙'],
      createdAt: Date.now(),
      size: 1.2,
      color: 'bg-purple-300',
      visualParams: mockVisualParams1,
      x: 50,
      y: 50,
    },
    comments: [
      { id: 'c1', user: 'Bob', text: 'So cute! 😊' }
    ]
  },
  {
    id: '2',
    author: 'Dreamer_99',
    likes: 5,
    caption: 'To the moon! 🚀 This one feels energetic.',
    reactions: { '🚀': 2, '🔥': 3 },
    timestamp: Date.now() - 5000000,
    creature: {
      id: 'mock2',
      type: 'dream' as const,
      emojis: ['🚀', '🔥', '⭐'],
      createdAt: Date.now(),
      size: 0.9,
      color: 'bg-orange-300',
      visualParams: mockVisualParams2,
      x: 50,
      y: 50,
    },
    comments: []
  }
];