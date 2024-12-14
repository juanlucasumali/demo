import { ProjectItem } from "../types";

export const dummyProjectItems: ProjectItem[] = [
  {
    id: '1',
    name: 'Trap Beats 2024',
    type: 'folder',
    starred: true,
    description: 'Collection of trap beats for collaboration',
    fileFormat: null,
    size: null,
    duration: null,
    dateModified: new Date('2024-01-15'),
    dateCreated: new Date('2024-01-10'),
    createdBy: 'Producer_X',
    tags: ['trap', 'beats', '2024']
  },
  {
    id: '2',
    name: 'dark_melody_140bpm.wav',
    type: 'file',
    starred: false,
    description: 'Dark melodic loop for trap beat',
    fileFormat: 'wav',
    size: 1024 * 1024 * 15, // 15MB
    duration: 180, // 3 minutes in seconds
    dateModified: new Date('2024-01-16'),
    dateCreated: new Date('2024-01-16'),
    createdBy: 'MelodyMaker',
    tags: ['melody', 'dark', '140bpm']
  },
  {
    id: '3',
    name: 'drill_drums_stem.mp3',
    type: 'file',
    starred: true,
    description: 'Drum pattern for UK drill collaboration',
    fileFormat: 'mp3',
    size: 1024 * 1024 * 8, // 8MB
    duration: 240, // 4 minutes in seconds
    dateModified: new Date('2024-01-14'),
    dateCreated: new Date('2024-01-12'),
    createdBy: 'DrumMaster',
    tags: ['drums', 'drill', 'stem']
  },
  {
    id: '4',
    name: 'R&B Projects',
    type: 'folder',
    starred: false,
    description: 'R&B collaborations folder',
    fileFormat: null,
    size: null,
    duration: null,
    dateModified: new Date('2024-01-13'),
    dateCreated: new Date('2024-01-01'),
    createdBy: 'SoulProducer',
    tags: ['rnb', 'soul']
  },
  {
    id: '5',
    name: 'bass_808_Fmin.wav',
    type: 'file',
    starred: false,
    description: '808 bass pattern in F minor',
    fileFormat: 'wav',
    size: 1024 * 1024 * 5, // 5MB
    duration: 120, // 2 minutes in seconds
    dateModified: new Date('2024-01-17'),
    dateCreated: new Date('2024-01-17'),
    createdBy: 'BassKing',
    tags: ['808', 'bass', 'Fmin']
  },
  {
    id: '6',
    name: 'guitar_loop_clean.flac',
    type: 'file',
    starred: true,
    description: 'Clean guitar melody for hip-hop beat',
    fileFormat: 'flac',
    size: 1024 * 1024 * 20, // 20MB
    duration: 145, // 2:25 minutes in seconds
    dateModified: new Date('2024-01-15'),
    dateCreated: new Date('2024-01-15'),
    createdBy: 'GuitarHero',
    tags: ['guitar', 'melody', 'clean']
  },
  {
    id: '7',
    name: 'Samples Library',
    type: 'folder',
    starred: true,
    description: 'Shared sample library for collaboration',
    fileFormat: null,
    size: null,
    duration: null,
    dateModified: new Date('2024-01-16'),
    dateCreated: new Date('2024-01-01'),
    createdBy: 'SampleMaster',
    tags: ['samples', 'library']
  },
  {
    id: '8',
    name: 'vocals_processed_stem.wav',
    type: 'file',
    starred: false,
    description: 'Processed vocal stem for remix',
    fileFormat: 'wav',
    size: 1024 * 1024 * 25, // 25MB
    duration: 200, // 3:20 minutes in seconds
    dateModified: new Date('2024-01-18'),
    dateCreated: new Date('2024-01-18'),
    createdBy: 'VocalProcessor',
    tags: ['vocals', 'processed', 'stem']
  },
  // ... (previous items remain the same, adding these new ones)
  {
    id: '9',
    name: 'kazoo_trap_solo_FINAL_FINAL_FR.wav',
    type: 'file',
    starred: true,
    description: 'You won\'t believe this kazoo trap solo actually slaps',
    fileFormat: 'wav',
    size: 1024 * 1024 * 12, // 12MB
    duration: 165, // 2:45 minutes in seconds
    dateModified: new Date('2024-01-19'),
    dateCreated: new Date('2024-01-15'),
    createdBy: 'KazooKid2004',
    tags: ['kazoo', 'trap', 'why-does-this-work', 'fire']
  },
  {
    id: '10',
    name: 'my_cat_walked_on_piano.midi',
    type: 'file',
    starred: true,
    description: 'My cat literally created this heat at 3AM',
    fileFormat: 'midi',
    size: 1024 * 24, // 24KB
    duration: 90, // 1:30 minutes in seconds
    dateModified: new Date('2024-01-20'),
    dateCreated: new Date('2024-01-20'),
    createdBy: 'MeowMixer',
    tags: ['cat', 'piano', 'accidental-fire', 'midi']
  },
  {
    id: '11',
    name: 'grandmas_cookies_type_beat.mp3',
    type: 'file',
    starred: false,
    description: 'Cozy beat inspired by grandma\'s chocolate chip cookies',
    fileFormat: 'mp3',
    size: 1024 * 1024 * 10, // 10MB
    duration: 185, // 3:05 minutes in seconds
    dateModified: new Date('2024-01-21'),
    dateCreated: new Date('2024-01-21'),
    createdBy: 'CookieCrunkBeats',
    tags: ['cozy', 'wholesome', 'grandma-core']
  },
  {
    id: '12',
    name: 'Sounds I Recorded At Walmart',
    type: 'folder',
    starred: true,
    description: 'Field recordings from Walmart at 2AM. Pure gold.',
    fileFormat: null,
    size: null,
    duration: null,
    dateModified: new Date('2024-01-22'),
    dateCreated: new Date('2024-01-20'),
    createdBy: 'RetailRhythms',
    tags: ['field-recording', 'walmart-core', 'experimental']
  },
  {
    id: '13',
    name: 'minecraft_villager_remix_v69.flac',
    type: 'file',
    starred: true,
    description: 'Turned Minecraft villager sounds into a club banger',
    fileFormat: 'flac',
    size: 1024 * 1024 * 30, // 30MB
    duration: 240, // 4:00 minutes in seconds
    dateModified: new Date('2024-01-23'),
    dateCreated: new Date('2024-01-20'),
    createdBy: 'BlockBuster',
    tags: ['minecraft', 'meme', 'actually-fire', 'gaming']
  },
  {
    id: '14',
    name: 'toast_popping_808.wav',
    type: 'file',
    starred: false,
    description: 'Sampled my toaster and turned it into an 808',
    fileFormat: 'wav',
    size: 1024 * 1024 * 2, // 2MB
    duration: 30, // 30 seconds
    dateModified: new Date('2024-01-24'),
    dateCreated: new Date('2024-01-24'),
    createdBy: 'ToasterTunes',
    tags: ['breakfast-beats', '808', 'kitchen-samples']
  },
  {
    id: '15',
    name: 'Sounds That Shouldn\'t Work But Do',
    type: 'folder',
    starred: true,
    description: 'Collection of weird samples that somehow make fire beats',
    fileFormat: null,
    size: null,
    duration: null,
    dateModified: new Date('2024-01-25'),
    dateCreated: new Date('2024-01-01'),
    createdBy: 'WeirdFlexButOK',
    tags: ['experimental', 'weird', 'successful-fails']
  },
  {
    id: '16',
    name: 'rubber_chicken_drill_HARD.wav',
    type: 'file',
    starred: true,
    description: 'UK drill beat using only rubber chicken samples',
    fileFormat: 'wav',
    size: 1024 * 1024 * 18, // 18MB
    duration: 210, // 3:30 minutes in seconds
    dateModified: new Date('2024-01-26'),
    dateCreated: new Date('2024-01-25'),
    createdBy: 'ChickenChef',
    tags: ['drill', 'rubber-chicken', 'why-did-i-make-this']
  },
  {
    id: '17',
    name: 'discord_notification_type_beat.mp3',
    type: 'file',
    starred: false,
    description: 'Made a beat from Discord notification sounds. Touch grass.',
    fileFormat: 'mp3',
    size: 1024 * 1024 * 8, // 8MB
    duration: 150, // 2:30 minutes in seconds
    dateModified: new Date('2024-01-27'),
    dateCreated: new Date('2024-01-27'),
    createdBy: 'DiscordianBeats',
    tags: ['discord', 'notification', 'touch-grass']
  },
  {
    id: '18',
    name: 'ASMR_but_make_it_trap.wav',
    type: 'file',
    starred: true,
    description: 'Whispered ad-libs and keyboard typing trap beat',
    fileFormat: 'wav',
    size: 1024 * 1024 * 22, // 22MB
    duration: 195, // 3:15 minutes in seconds
    dateModified: new Date('2024-01-28'),
    dateCreated: new Date('2024-01-28'),
    createdBy: 'WhisperTrap',
    tags: ['asmr', 'trap', 'weird-flex']
  }
]
