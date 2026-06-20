import { decoyObjects, relicMemories, roomSlots, type DecoyObject, type RelicMemory } from './data/relics';
import { stamps, type StampMemory } from './data/stamps';
import './styles.css';

interface CollectorSlot {
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutMetadata {
  project: string;
  subtitle: string;
  collector_sheet_size_px: {
    width: number;
    height: number;
  };
  stamp_titles: string[];
  collector_slots_px: CollectorSlot[];
}

type RouteName = 'hub' | 'postmark' | 'republic';

interface RoomObject {
  id: string;
  kind: 'relic' | 'decoy';
  objectName: string;
  clue: string;
  iconLabel: string;
  slotId: string;
  stampId?: string;
  relicName?: string;
}

interface RepublicRun {
  selectedStampIds: string[];
  matchedStampIds: string[];
  objects: RoomObject[];
  feedback: string;
  hintIndex: number;
  inspectObjectId?: string;
  inspectFeedback?: string;
  reveal: boolean;
}

const paths = {
  collectorSheet: './assets/postmark_250_full_collector_sheet.png',
  highRes: './assets/stamps/high_res/',
  collectorCrops: './assets/stamps/collector_crops/',
  metadata: './assets/metadata/layout_metadata.json'
};

const routeLinks = {
  hub: '#/',
  postmark: '#/postmark-250/',
  republic: '#/republic-room/'
};

let activeIndex = 0;
let metadata: LayoutMetadata | undefined;
let republicRun: RepublicRun | undefined;
let republicHowToOpen = false;

const stampByTitle = new Map(stamps.map((stamp) => [stamp.title, stamp]));
const stampById = new Map(stamps.map((stamp) => [stamp.id, stamp]));
const relicByStampId = new Map(relicMemories.map((relic) => [relic.stampId, relic]));
const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

const loadMetadata = async (): Promise<LayoutMetadata> => {
  const response = await fetch(paths.metadata);

  if (!response.ok) {
    throw new Error(`Failed to load layout metadata: ${response.status}`);
  }

  return response.json() as Promise<LayoutMetadata>;
};

const stampImagePath = (stamp: StampMemory) => `${paths.highRes}${stamp.highResFile}`;
const cropImagePath = (stamp: StampMemory) => `${paths.collectorCrops}${stamp.collectorCropFile}`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttribute = escapeHtml;

const objectVisualClass = (iconLabel: string) => `visual-${iconLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const shuffle = <T>(items: T[]) => {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
};

const resolveRoute = (): RouteName => {
  const hash = window.location.hash.toLowerCase();

  if (hash.startsWith('#/republic-room')) {
    return 'republic';
  }

  if (hash.startsWith('#/postmark-250')) {
    return 'postmark';
  }

  return 'hub';
};

const renderArchiveNav = (active: RouteName) => `
  <nav class="archive-nav" aria-label="Postmark archive navigation">
    <a href="${routeLinks.hub}" ${active === 'hub' ? 'aria-current="page"' : ''}>Archive Hub</a>
    <a href="${routeLinks.postmark}" ${active === 'postmark' ? 'aria-current="page"' : ''}>Postmark 250</a>
    <a href="${routeLinks.republic}" ${active === 'republic' ? 'aria-current="page"' : ''}>The Republic Room</a>
  </nav>
`;

const slotStyle = (slot: CollectorSlot, layout: LayoutMetadata) => {
  const sheet = layout.collector_sheet_size_px;

  return [
    `left: ${(slot.x / sheet.width) * 100}%`,
    `top: ${(slot.y / sheet.height) * 100}%`,
    `width: ${(slot.width / sheet.width) * 100}%`,
    `height: ${(slot.height / sheet.height) * 100}%`
  ].join(';');
};

const renderHotspots = (layout: LayoutMetadata) =>
  layout.collector_slots_px
    .map((slot, index) => {
      const stamp = stampByTitle.get(slot.title);
      const label = stamp ? `${index + 1}. ${stamp.title}` : slot.title;

      return `
        <button
          class="collector-hotspot"
          data-stamp-index="${index}"
          style="${slotStyle(slot, layout)}"
          aria-label="Open memory card for ${escapeAttribute(label)}"
          title="${escapeAttribute(label)}"
        >
          <span>${String(index + 1).padStart(2, '0')}</span>
        </button>
      `;
    })
    .join('');

const renderFallbackButtons = () =>
  stamps
    .map(
      (stamp, index) => `
        <button class="archive-button" data-stamp-index="${index}">
          <span>${String(index + 1).padStart(2, '0')}</span>
          ${escapeHtml(stamp.title)}
        </button>
      `
    )
    .join('');

const renderStampGrid = () =>
  stamps
    .map(
      (stamp, index) => `
        <article class="stamp-card">
          <button class="stamp-card-button" data-stamp-index="${index}">
            <img src="${stampImagePath(stamp)}" alt="${escapeAttribute(stamp.title)} stamp" loading="lazy" />
            <span class="stamp-card-meta">${String(index + 1).padStart(2, '0')} / ${escapeHtml(stamp.category)}</span>
            <strong>${escapeHtml(stamp.title)}</strong>
          </button>
        </article>
      `
    )
    .join('');

const renderHub = () => {
  app.innerHTML = `
    ${renderArchiveNav('hub')}
    <main class="hub-shell">
      <section class="hub-hero" aria-labelledby="hub-title">
        <p class="kicker">Summer into AI Theme 1 / 8-Bit America</p>
        <h1 id="hub-title">Postmark 250 Archive</h1>
        <p class="subtitle">Two distinct public artifacts from one vintage postal kiosk.</p>
        <p class="hub-intro">The collector sheet is the memory artifact. The Republic Room is the puzzle artifact. Shared universe, separate submissions.</p>
      </section>

      <section class="artifact-grid" aria-label="Archive artifacts">
        <article class="artifact-card artifact-card-postmark">
          <div>
            <p class="eyebrow">Submission 2</p>
            <h2>Postmark 250</h2>
            <p>A clickable commemorative stamp sheet of American memory.</p>
          </div>
          <img src="${paths.collectorSheet}" alt="Preview of the Postmark 250 collector sheet" />
          <a class="artifact-button" href="${routeLinks.postmark}">Open Collector Sheet</a>
        </article>

        <article class="artifact-card artifact-card-room">
          <div>
            <p class="eyebrow">Submission 3</p>
            <h2>The Republic Room</h2>
            <p>A tiny retro archive puzzle where players match relics to Postmark 250 stamps and unlock the memory cabinet.</p>
          </div>
          <div class="artifact-room-preview" aria-hidden="true">
            <span class="preview-shelf"></span>
            <span class="preview-desk"></span>
            <span class="preview-cabinet"></span>
            <span class="preview-object one">COIL</span>
            <span class="preview-object two">RADIO</span>
            <span class="preview-object three">STONE</span>
          </div>
          <a class="artifact-button" href="${routeLinks.republic}">Enter the Republic Room</a>
        </article>
      </section>
    </main>
  `;
};

const renderPostmarkShell = (layout: LayoutMetadata) => {
  app.innerHTML = `
    ${renderArchiveNav('postmark')}
    <header class="site-header">
      <div class="hero-copy">
        <div class="kicker">Summer into AI Theme 1 / 8-Bit America</div>
        <h1>Postmark 250</h1>
        <p class="subtitle">A Declaration of American Memory</p>
        <div class="intro-copy">
          <p>America at 250 is not one marble monument. It is a sheet of postmarks: places, rituals, ruptures, inventions, screens, ballparks, lakes, migrations, homes, and unfinished arguments.</p>
          <p>Postmark 250 is not a ranked list of the most important American events. It is a collector sheet of memory fragments: the kind of things that get stamped into people, families, regions, and screens.</p>
        </div>
      </div>

      <button class="hero-preview" type="button" data-scroll-collector aria-label="Jump to the interactive collector sheet">
        <span>Collector sheet preview</span>
        <img
          src="${paths.collectorSheet}"
          alt="Preview crop of the Postmark 250 collector sheet"
        />
        <strong>Click any stamp.</strong>
      </button>
    </header>

    <main>
      <section class="collector-section" aria-labelledby="collector-title">
        <div class="section-heading">
          <p class="eyebrow">Interactive Collector Sheet</p>
          <h2 id="collector-title">Click a stamp to open its memory card.</h2>
        </div>
        <p class="sheet-instruction">Click any stamp on the sheet, or use the archive buttons below.</p>

        <div class="collector-frame">
          <div class="collector-stage">
            <img
              class="collector-sheet"
              src="${paths.collectorSheet}"
              alt="Postmark 250 full collector sheet with twelve commemorative memory stamps"
            />
            <div class="hotspot-layer" aria-label="Stamp hotspots">
              ${renderHotspots(layout)}
            </div>
          </div>
        </div>

        <div class="archive-buttons" aria-label="Keyboard-accessible stamp list">
          ${renderFallbackButtons()}
        </div>
      </section>

      <section class="stamp-grid-section" aria-labelledby="grid-title">
        <div class="section-heading">
          <p class="eyebrow">Archive Drawer</p>
          <h2 id="grid-title">Twelve memory fragments.</h2>
        </div>
        <div class="stamp-grid">
          ${renderStampGrid()}
        </div>
      </section>

      <section class="about-section" id="about" aria-labelledby="about-title">
        <div>
          <p class="eyebrow">Process Note</p>
          <h2 id="about-title">A proof wrapper for the artifact.</h2>
        </div>
        <div class="about-copy">
          <p>Built for Summer into AI Theme 1: 8-Bit America.</p>
          <p>Postmark 250 is a static public browser artifact: no backend, login, database, analytics, or user submissions.</p>
          <p>The full collector sheet is the hero artifact. The clickable stamp cards add context and proof that the sheet works as a tiny retro postal archive.</p>
          <p>Visual design is AI-assisted; the curation, editing, implementation, and final assembly are human-directed. The provided collector sheet remains the source artifact.</p>
        </div>
      </section>
    </main>

    <div class="modal-backdrop" hidden>
      <section class="memory-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal-close" type="button" data-modal-close aria-label="Close memory card">Close</button>
        <div class="modal-content"></div>
      </section>
    </div>
  `;
};

const openModal = (index: number) => {
  activeIndex = (index + stamps.length) % stamps.length;
  const stamp = stamps[activeIndex];
  const backdrop = document.querySelector<HTMLDivElement>('.modal-backdrop');
  const content = document.querySelector<HTMLDivElement>('.modal-content');

  if (!backdrop || !content) {
    return;
  }

  content.innerHTML = `
    <div class="modal-image-wrap">
      <div class="stamp-mat">
        <img src="${stampImagePath(stamp)}" alt="${escapeAttribute(stamp.title)} stamp detail" />
      </div>
    </div>
    <div class="modal-text">
      <p class="modal-number">POSTMARK MEMORY CARD / ${String(activeIndex + 1).padStart(2, '0')} OF 12</p>
      <h2 id="modal-title">${escapeHtml(stamp.title)}</h2>
      <div class="archive-field">
        <span>CATEGORY</span>
        <p class="modal-category">${escapeHtml(stamp.category)}</p>
      </div>
      <p class="modal-hook">${escapeHtml(stamp.hook)}</p>
      <p>${escapeHtml(stamp.description)}</p>
      <h3>WHY IT BELONGS</h3>
      <p>${escapeHtml(stamp.why)}</p>
      <div class="final-postmark">
        <span>FINAL POSTMARK</span>
        <strong>${escapeHtml(stamp.postmark)}</strong>
      </div>
      <div class="modal-actions">
        <button type="button" class="modal-prev" data-modal-prev>Previous</button>
        <button type="button" class="modal-next" data-modal-next>Next</button>
      </div>
    </div>
  `;

  backdrop.hidden = false;
  document.body.classList.add('modal-open');
  document.querySelector<HTMLButtonElement>('.modal-close')?.focus();
};

const closeModal = () => {
  const backdrop = document.querySelector<HTMLDivElement>('.modal-backdrop');

  if (!backdrop) {
    return;
  }

  backdrop.hidden = true;
  document.body.classList.remove('modal-open');
};

const relicToRoomObject = (relic: RelicMemory, slotId: string): RoomObject => ({
  id: `relic-${relic.stampId}`,
  kind: 'relic',
  stampId: relic.stampId,
  relicName: relic.relicName,
  objectName: relic.objectName,
  clue: relic.clue,
  iconLabel: relic.iconLabel,
  slotId
});

const decoyToRoomObject = (decoy: DecoyObject, slotId: string): RoomObject => ({
  id: `decoy-${decoy.id}`,
  kind: 'decoy',
  objectName: decoy.objectName,
  clue: decoy.clue,
  iconLabel: decoy.iconLabel,
  slotId
});

const createRepublicRun = (): RepublicRun => {
  const selectedRelics = shuffle(relicMemories).slice(0, 3);
  const objectTargetCount = 10;
  const selectedDecoys = shuffle(decoyObjects).slice(0, objectTargetCount - selectedRelics.length);
  const selectedSlots = roomSlots.slice(0, objectTargetCount);
  const shuffledSlots = shuffle(selectedSlots);
  const objects = shuffle([
    ...selectedRelics.map((relic, index) => relicToRoomObject(relic, shuffledSlots[index].id)),
    ...selectedDecoys.map((decoy, index) => decoyToRoomObject(decoy, shuffledSlots[index + selectedRelics.length].id))
  ]);

  return {
    selectedStampIds: selectedRelics.map((relic) => relic.stampId),
    matchedStampIds: [],
    objects,
    feedback: '',
    hintIndex: 0,
    reveal: false
  };
};

const getActiveStamps = (run: RepublicRun) =>
  run.selectedStampIds
    .map((stampId) => stampById.get(stampId))
    .filter((stamp): stamp is StampMemory => Boolean(stamp));

const renderRepublicTitle = () => `
  ${renderArchiveNav('republic')}
  <main class="republic-shell republic-title-screen">
    <section class="kiosk-title-panel" aria-labelledby="republic-title">
      <p class="kicker">Submission 3 / Retro Archive Puzzle</p>
      <h1 id="republic-title">The Republic Room</h1>
      <p class="subtitle">A Postmark 250 Puzzle Kiosk</p>
      <p class="hub-intro">Search a room of relics and decoys. Match three artifacts to their active Postmark stamps and unlock the memory cabinet.</p>
      <div class="title-actions">
        <button class="artifact-button" type="button" data-republic-start>Start</button>
        <button class="artifact-button secondary" type="button" data-republic-howto>How to Play</button>
      </div>
      <div class="howto-panel" ${republicHowToOpen ? '' : 'hidden'}>
        <h2>How to Play</h2>
        <ul>
          <li>Each run selects three Postmark 250 stamps.</li>
          <li>Click visible relics in the archive room to inspect them.</li>
          <li>Choose which active stamp the relic belongs to.</li>
          <li>Correct matches light cabinet seals. Wrong guesses have no penalty.</li>
          <li>Three matches open the memory cabinet.</li>
        </ul>
      </div>
    </section>
  </main>
`;

const renderActiveStampCards = (run: RepublicRun) =>
  getActiveStamps(run)
    .map((stamp) => {
      const matched = run.matchedStampIds.includes(stamp.id);

      return `
        <article class="active-stamp-card ${matched ? 'matched' : ''}">
          <img src="${cropImagePath(stamp)}" alt="${escapeAttribute(stamp.title)} crop" />
          <div>
            <span class="stamp-status">${matched ? 'STAMPED' : 'UNMATCHED'}</span>
            <strong>${escapeHtml(stamp.title)}</strong>
          </div>
        </article>
      `;
    })
    .join('');

const renderRoomObjects = (run: RepublicRun) =>
  run.objects
    .map((object) => {
      const slot = roomSlots.find((roomSlot) => roomSlot.id === object.slotId);
      const matched = object.stampId ? run.matchedStampIds.includes(object.stampId) : false;
      const style = slot
        ? `left:${slot.x}%;top:${slot.y}%;width:${slot.width}%;height:${slot.height}%`
        : '';

      return `
        <button
          class="room-object ${object.kind} ${objectVisualClass(object.iconLabel)} ${matched ? 'matched' : ''}"
          type="button"
          data-room-object-id="${escapeAttribute(object.id)}"
          style="${style}"
          aria-label="Inspect ${escapeAttribute(object.objectName)}"
        >
          <span class="object-art" aria-hidden="true"></span>
          <span class="object-room-label">${escapeHtml(object.iconLabel)}</span>
          <span class="sr-only">${escapeHtml(object.objectName)}</span>
        </button>
      `;
    })
    .join('');

const renderCabinet = (run: RepublicRun) => {
  const progress = run.matchedStampIds.length;
  const sealNames = ['SEAL I', 'SEAL II', 'SEAL III'];
  const seals = sealNames
    .map(
      (sealName, index) => `
        <span class="cabinet-seal ${index < progress ? 'lit' : ''}">
          <strong>${sealName}</strong>
          <em>${index < progress ? 'OPEN' : 'LOCKED'}</em>
        </span>
      `
    )
    .join('');

  return `
    <aside class="memory-cabinet ${progress >= 3 ? 'unlocked' : ''}" aria-label="Memory cabinet progress">
      <p class="eyebrow">Memory Cabinet</p>
      <h2>${progress}/3</h2>
      <div class="cabinet-object" aria-hidden="true">
        <span></span>
        <span></span>
      </div>
      <div class="cabinet-seals">${seals}</div>
      <p>Match all three relics to unlock the collector sheet.</p>
    </aside>
  `;
};

const renderInspectModal = (run: RepublicRun) => {
  if (!run.inspectObjectId) {
    return '';
  }

  const object = run.objects.find((roomObject) => roomObject.id === run.inspectObjectId);

  if (!object) {
    return '';
  }

  const matched = object.stampId ? run.matchedStampIds.includes(object.stampId) : false;
  const stampButtons = getActiveStamps(run)
    .map((stamp) => {
      const alreadyMatched = run.matchedStampIds.includes(stamp.id);

      return `
        <button
          type="button"
          data-assign-stamp-id="${escapeAttribute(stamp.id)}"
          ${alreadyMatched ? 'disabled' : ''}
        >
          ${alreadyMatched ? 'Matched: ' : ''}${escapeHtml(stamp.title)}
        </button>
      `;
    })
    .join('');

  return `
    <div class="relic-modal-backdrop">
      <section class="relic-modal" role="dialog" aria-modal="true" aria-labelledby="inspect-title">
        <button class="modal-close" type="button" data-republic-close aria-label="Close relic inspection">Close</button>
        <div class="relic-inspect-grid">
          <div class="relic-object-preview ${object.kind} ${objectVisualClass(object.iconLabel)}">
            <span class="object-art large" aria-hidden="true"></span>
            <strong>${escapeHtml(object.iconLabel)}</strong>
          </div>
          <div class="relic-inspect-copy">
            <p class="modal-number">${object.kind === 'relic' ? 'CATALOGED RELIC' : 'ARCHIVE DECOY'}</p>
            <h2 id="inspect-title">${escapeHtml(object.relicName ?? object.objectName)}</h2>
            <div class="archive-field">
              <span>ROOM OBJECT</span>
              <p class="modal-category">${escapeHtml(object.objectName)}</p>
            </div>
            <p class="modal-hook">${escapeHtml(object.clue)}</p>
            ${matched ? '<p class="inspect-feedback correct">POSTMARK MATCHED.</p>' : ''}
            ${run.inspectFeedback ? `<p class="inspect-feedback">${escapeHtml(run.inspectFeedback)}</p>` : ''}
            <div class="match-buttons" aria-label="Choose matching stamp">
              ${stampButtons}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
};

const renderRepublicRoom = (run: RepublicRun) => `
  ${renderArchiveNav('republic')}
  <main class="republic-shell">
    <section class="republic-room-heading">
      <div>
        <p class="kicker">The Republic Room</p>
        <h1>A Postmark 250 Puzzle Kiosk</h1>
      </div>
      <button class="archive-button" type="button" data-republic-reset>New Run</button>
    </section>

    ${run.feedback ? `<p class="room-feedback">${escapeHtml(run.feedback)}</p>` : ''}

    <section class="room-layout" aria-label="Republic Room puzzle">
      <aside class="relic-panel">
        <p class="eyebrow">Archive Request</p>
        <h2>Locate these 3 memory relics</h2>
        <div class="active-stamps">
          ${renderActiveStampCards(run)}
        </div>
        <button class="archive-button hint-button" type="button" data-republic-hint>Ask the Kiosk</button>
      </aside>

      <section class="room-center" aria-label="Clickable archive room">
        <div class="room-stage">
          <div class="room-wall-trim"></div>
          <div class="room-label">REPUBLIC ROOM / RELIC BAY</div>
          <div class="room-window"></div>
          <div class="room-shelf shelf-left"><span></span></div>
          <div class="room-shelf shelf-right"><span></span></div>
          <div class="room-desk"></div>
          <div class="room-floor"></div>
          ${renderRoomObjects(run)}
        </div>
      </section>

      ${renderCabinet(run)}
    </section>
    ${renderInspectModal(run)}
  </main>
`;

const renderRepublicFinalReveal = (run: RepublicRun) => `
  ${renderArchiveNav('republic')}
  <main class="republic-shell">
    <section class="final-reveal" aria-labelledby="final-reveal-title">
      <div>
        <p class="kicker">Memory Cabinet Unlocked</p>
        <h1 id="final-reveal-title">The sheet is revealed.</h1>
        <p class="subtitle">America at 250 is not one marble monument. It is a sheet of postmarks.</p>
      </div>
      <img src="${paths.collectorSheet}" alt="Postmark 250 collector sheet revealed inside the cabinet" />
      <div class="final-actions">
        <a class="artifact-button" href="${routeLinks.postmark}">View Collector Sheet</a>
        <button class="artifact-button secondary" type="button" data-republic-start>Play Again</button>
      </div>
      <p class="room-feedback">Solved relics: ${run.matchedStampIds
        .map((stampId) => stampById.get(stampId)?.title)
        .filter(Boolean)
        .map((title) => escapeHtml(String(title)))
        .join(' / ')}</p>
    </section>
  </main>
`;

const renderRepublic = () => {
  if (republicRun?.reveal) {
    app.innerHTML = renderRepublicFinalReveal(republicRun);
    return;
  }

  if (republicRun) {
    app.innerHTML = renderRepublicRoom(republicRun);
    return;
  }

  app.innerHTML = renderRepublicTitle();
};

const renderCurrentRoute = () => {
  if (!metadata) {
    return;
  }

  document.body.classList.remove('modal-open');
  const route = resolveRoute();

  if (route === 'postmark') {
    renderPostmarkShell(metadata);
    window.scrollTo({ top: 0 });
    return;
  }

  if (route === 'republic') {
    renderRepublic();
    window.scrollTo({ top: 0 });
    return;
  }

  renderHub();
  window.scrollTo({ top: 0 });
};

const startRepublicRun = () => {
  republicHowToOpen = false;
  republicRun = createRepublicRun();
  renderRepublic();
};

const openRepublicObject = (objectId: string) => {
  if (!republicRun) {
    return;
  }

  republicRun.inspectObjectId = objectId;
  republicRun.inspectFeedback = undefined;
  renderRepublic();
};

const closeRepublicInspection = () => {
  if (!republicRun) {
    return;
  }

  republicRun.inspectObjectId = undefined;
  republicRun.inspectFeedback = undefined;
  renderRepublic();
};

const assignRepublicStamp = (stampId: string) => {
  if (!republicRun?.inspectObjectId) {
    return;
  }

  const object = republicRun.objects.find((roomObject) => roomObject.id === republicRun?.inspectObjectId);

  if (!object) {
    return;
  }

  if (object.stampId === stampId && !republicRun.matchedStampIds.includes(stampId)) {
    republicRun.matchedStampIds = [...republicRun.matchedStampIds, stampId];
    republicRun.feedback = republicRun.matchedStampIds.length >= 3 ? 'MEMORY CABINET UNLOCKED.' : 'POSTMARK MATCHED.';
    republicRun.inspectObjectId = undefined;
    republicRun.inspectFeedback = undefined;

    if (republicRun.matchedStampIds.length >= 3) {
      republicRun.reveal = true;
    }

    renderRepublic();
    return;
  }

  republicRun.inspectFeedback = 'Not quite. That relic belongs to a different shelf in American memory.';
  renderRepublic();
};

const showRepublicHint = () => {
  if (!republicRun) {
    return;
  }

  const unmatched = republicRun.selectedStampIds.filter((stampId) => !republicRun?.matchedStampIds.includes(stampId));

  if (unmatched.length === 0) {
    republicRun.feedback = 'The cabinet is ready. One more look should open it.';
    renderRepublic();
    return;
  }

  const stampId = unmatched[republicRun.hintIndex % unmatched.length];
  const relic = relicByStampId.get(stampId);
  const stamp = stampById.get(stampId);

  republicRun.hintIndex += 1;
  republicRun.feedback = relic && stamp ? `${stamp.title}: ${relic.hint}` : 'Look for a relic whose clue echoes an active stamp.';
  renderRepublic();
};

app.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const stampTrigger = target.closest<HTMLElement>('[data-stamp-index]');
  const roomObjectTrigger = target.closest<HTMLElement>('[data-room-object-id]');
  const assignTrigger = target.closest<HTMLElement>('[data-assign-stamp-id]');

  if (target.closest('[data-scroll-collector]')) {
    document.querySelector('#collector-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (target.closest('[data-modal-close]')) {
    closeModal();
    return;
  }

  if (target.closest('[data-modal-prev]')) {
    openModal(activeIndex - 1);
    return;
  }

  if (target.closest('[data-modal-next]')) {
    openModal(activeIndex + 1);
    return;
  }

  if (target.closest('[data-republic-start]')) {
    event.preventDefault();
    startRepublicRun();
    return;
  }

  if (target.closest('[data-republic-howto]')) {
    republicHowToOpen = !republicHowToOpen;
    renderRepublic();
    return;
  }

  if (target.closest('[data-republic-reset]')) {
    startRepublicRun();
    return;
  }

  if (target.closest('[data-republic-hint]')) {
    showRepublicHint();
    return;
  }

  if (target.closest('[data-republic-close]')) {
    closeRepublicInspection();
    return;
  }

  if (assignTrigger?.dataset.assignStampId) {
    assignRepublicStamp(assignTrigger.dataset.assignStampId);
    return;
  }

  if (roomObjectTrigger?.dataset.roomObjectId) {
    openRepublicObject(roomObjectTrigger.dataset.roomObjectId);
    return;
  }

  if (stampTrigger?.dataset.stampIndex) {
    const index = Number(stampTrigger.dataset.stampIndex);

    if (Number.isInteger(index)) {
      openModal(index);
    }
  }
});

document.addEventListener('keydown', (event) => {
  const postmarkBackdrop = document.querySelector<HTMLDivElement>('.modal-backdrop');
  const postmarkModalOpen = Boolean(postmarkBackdrop && !postmarkBackdrop.hidden);
  const republicModalOpen = Boolean(republicRun?.inspectObjectId);

  if (event.key === 'Escape' && republicModalOpen) {
    closeRepublicInspection();
    return;
  }

  if (!postmarkModalOpen) {
    return;
  }

  if (event.key === 'Escape') {
    closeModal();
  }

  if (event.key === 'ArrowLeft') {
    openModal(activeIndex - 1);
  }

  if (event.key === 'ArrowRight') {
    openModal(activeIndex + 1);
  }
});

window.addEventListener('hashchange', renderCurrentRoute);

loadMetadata()
  .then((layout) => {
    metadata = layout;
    renderCurrentRoute();
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown asset loading error';

    app.innerHTML = `
      <main class="error-state">
        <h1>Postmark 250 Archive</h1>
        <p>${escapeHtml(message)}</p>
      </main>
    `;
  });

export const getLoadedMetadata = () => metadata;
