export const tagBgClasses = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
    } as const

    

/* FILE TAGS */
export type FileTagType = 'Stems' | 'Mix' | 'Master' | 'Reference' | 'Project File' | 'Sample Pack' | 'Recording' | 'Bounce';
export type StatusType = 'Draft' | 'Final' | 'Approved' | 'Needs Revision' | 'Reference Only' | 'Archive';
export type InstrumentType = 'Vocals' | 'Drums' | 'Bass' | 'Keys' | 'Synth' | 'Guitar' | 'Strings' | 'Brass' | 'FX' | 'Percussion';
export type VersionType = 'Dry' | 'Wet' | 'Edited' | 'Tuned' | 'Compressed' | 'Clean';

export interface FileTags {
fileType: FileTagType;
status: StatusType;
instruments: InstrumentType[];
version: VersionType[];
}

export const fileTagColors = {
fileType: tagBgClasses.green,
status: tagBgClasses.purple,
instruments: tagBgClasses.blue,
version: tagBgClasses.red
} as const;



/* PROJECT TAGS */
export type ProjectTagType = 'Stage' | 'Genre' | 'Needs';

export type StageType = 
  | 'Concept'
  | 'Demo'
  | 'In-Progress'
  | 'Arrangement'
  | 'Mixing'
  | 'Mastering'
  | 'Final';

export type GenreType = 
  | 'Hip-Hop'
  | 'Lo-Fi'
  | 'Soundtrack'
  | 'Experimental'
  | 'R&B'
  | 'Pop'
  | 'Electronic'
  | 'Trap'
  | 'Drill'
  | 'Afrobeats'
  | 'House'
  | 'Rock'
  | 'Alternative'
  | 'Indie'
  | 'Ambient';

export type NeedsType = 
  | 'Vocals'
  | 'Melody'
  | 'Drums'
  | 'Bass'
  | 'Mixing'
  | 'Mastering'
  | 'Producer'
  | 'Feedback'
  | 'Instruments'
  | 'Writing';

export interface ProjectTags {
  stage: StageType;
  genre: GenreType[];
  needs: NeedsType[];
}

export const projectTagColors = {
  stage: tagBgClasses.green,
  genre: tagBgClasses.blue,
  needs: tagBgClasses.blue,
} as const;