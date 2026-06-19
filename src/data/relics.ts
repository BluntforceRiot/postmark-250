export interface RelicMemory {
  stampId: string;
  relicName: string;
  objectName: string;
  clue: string;
  hint: string;
  iconLabel: string;
}

export interface DecoyObject {
  id: string;
  objectName: string;
  clue: string;
  iconLabel: string;
}

export interface RoomSlot {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const relicMemories: RelicMemory[] = [
  {
    stampId: 'gichi-gami',
    relicName: 'Superior Shore Fragment',
    objectName: 'shoreline stone in a small display case',
    clue: 'Cold water, old name, older than the birthday.',
    hint: 'Look for the relic that feels like water and place.',
    iconLabel: 'STONE'
  },
  {
    stampId: 'wardenclyffe',
    relicName: 'Tower Coil Fragment',
    objectName: 'brass coil and blueprint scrap',
    clue: 'A piece of a future that failed loudly enough to keep glowing.',
    hint: 'The future relic has coils and bad decisions.',
    iconLabel: 'COIL'
  },
  {
    stampId: 'around-the-radio',
    relicName: 'Vacuum Tube Radio',
    objectName: 'tabletop radio',
    clue: 'One box. Many rooms. A country leaning toward the same sound.',
    hint: 'The listening relic sits like a small wooden broadcast box.',
    iconLabel: 'RADIO'
  },
  {
    stampId: 'tgif',
    relicName: 'Friday Night Remote',
    objectName: 'remote, pizza box, and VHS tape',
    clue: 'Couch occupied. Pizza cooling. Theme song incoming.',
    hint: 'Look for the living-room relic with Friday-night energy.',
    iconLabel: 'REMOTE'
  },
  {
    stampId: 'first-connection',
    relicName: 'Dial-Up Modem',
    objectName: 'beige modem and floppy disk',
    clue: 'The scream before the network opened.',
    hint: 'The internet relic probably made terrible noises.',
    iconLabel: 'MODEM'
  },
  {
    stampId: 'fourth-inning-fireworks',
    relicName: 'Ballpark Firework Shell',
    objectName: 'baseball and fireworks shell',
    clue: 'Summer ritual, cheap seats, and the sky interrupting the inning.',
    hint: 'The summer relic belongs somewhere between the scoreboard and the sky.',
    iconLabel: 'BALL'
  },
  {
    stampId: 'copper-country-finns',
    relicName: 'Copper Core Sample',
    objectName: 'copper rock and miner lamp',
    clue: 'Work in the rock. Winter in the bones. Sisu in the walls.',
    hint: 'The mining relic carries copper, lamp-light, and winter grit.',
    iconLabel: 'COPPER'
  },
  {
    stampId: 'the-speakeasy',
    relicName: 'Password Card',
    objectName: 'hidden bottle and jazz flyer',
    clue: 'The law said dry. The city found a door.',
    hint: 'The rebellion relic has a password and a reason to whisper.',
    iconLabel: 'PASS'
  }
];

export const decoyObjects: DecoyObject[] = [
  {
    id: 'generic-lantern',
    objectName: 'generic lantern',
    clue: 'Useful light, wrong memory.',
    iconLabel: 'LAMP'
  },
  {
    id: 'old-key',
    objectName: 'old key',
    clue: 'It opens something, just not this cabinet.',
    iconLabel: 'KEY'
  },
  {
    id: 'blank-postcard',
    objectName: 'blank postcard',
    clue: 'No postmark, no memory assigned.',
    iconLabel: 'CARD'
  },
  {
    id: 'eagle-figurine',
    objectName: 'eagle figurine',
    clue: 'Symbolic, but too general for the active stamps.',
    iconLabel: 'EAGLE'
  },
  {
    id: 'tea-cup',
    objectName: 'tea cup',
    clue: 'A little ceremony, a little misdirection.',
    iconLabel: 'TEA'
  },
  {
    id: 'county-fair-ribbon',
    objectName: 'county fair ribbon',
    clue: 'Blue ribbon, wrong shelf.',
    iconLabel: 'RIBBON'
  },
  {
    id: 'snow-globe',
    objectName: 'snow globe',
    clue: 'Shakeable nostalgia with no active match.',
    iconLabel: 'SNOW'
  },
  {
    id: 'telegraph-key',
    objectName: 'telegraph key',
    clue: 'A signal machine from a neighboring archive.',
    iconLabel: 'WIRE'
  },
  {
    id: 'empty-frame',
    objectName: 'empty frame',
    clue: 'Waiting for a picture that is not in this round.',
    iconLabel: 'FRAME'
  },
  {
    id: 'cracked-bell',
    objectName: 'cracked bell',
    clue: 'A loud symbol, but not one of today\'s relics.',
    iconLabel: 'BELL'
  },
  {
    id: 'generic-parchment',
    objectName: 'generic parchment',
    clue: 'A document without a useful postmark.',
    iconLabel: 'DOC'
  },
  {
    id: 'compass',
    objectName: 'compass',
    clue: 'It points, but not to an active stamp.',
    iconLabel: 'NORTH'
  }
];

export const roomSlots: RoomSlot[] = [
  { id: 'wall-shelf-left', label: 'wall shelf left', x: 8, y: 16, width: 16, height: 13 },
  { id: 'wall-shelf-right', label: 'wall shelf right', x: 74, y: 16, width: 16, height: 13 },
  { id: 'desk-left', label: 'desk left', x: 18, y: 54, width: 15, height: 14 },
  { id: 'desk-center', label: 'desk center', x: 42, y: 52, width: 16, height: 14 },
  { id: 'desk-right', label: 'desk right', x: 66, y: 54, width: 15, height: 14 },
  { id: 'display-case', label: 'display case', x: 37, y: 30, width: 20, height: 13 },
  { id: 'floor-crate', label: 'floor crate', x: 7, y: 74, width: 17, height: 14 },
  { id: 'cabinet-top', label: 'cabinet top', x: 75, y: 40, width: 17, height: 14 },
  { id: 'side-table', label: 'side table', x: 58, y: 72, width: 16, height: 14 },
  { id: 'wall-hook', label: 'wall hook', x: 30, y: 13, width: 15, height: 12 },
  { id: 'window-ledge', label: 'window ledge', x: 51, y: 16, width: 17, height: 12 },
  { id: 'radio-stand', label: 'radio stand', x: 26, y: 70, width: 15, height: 14 }
];
