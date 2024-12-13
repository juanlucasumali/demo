export const PROJECT_TAGS = {
  stage: {
    color: 'blue',
    allowMultiple: false,
    options: [
      'Concept',
      'Demo',
      'In-Progress',
      'Arrangement',
      'Mixing',
      'Mastering',
      'Final',
    ]
  },
  genre: {
    color: 'purple',
    allowMultiple: true,
    options: [
      'Hip-Hop',
      'R&B',
      'Pop',
      'Electronic',
      'Trap',
      'Drill',
      'Afrobeats',
      'House',
      'Rock',
      'Alternative',
      'Indie',
      'Ambient',
    ]
  },
  needs: {
    color: 'green',
    allowMultiple: true,
    options: [
      'Vocals',
      'Melody',
      'Drums',
      'Bass',
      'Mixing',
      'Mastering',
      'Producer',
      'Feedback',
      'Instruments',
      'Writing',
    ]
  }
} as const

export type TagCategory = keyof typeof PROJECT_TAGS