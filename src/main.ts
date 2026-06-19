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

const paths = {
  collectorSheet: './assets/postmark_250_full_collector_sheet.png',
  highRes: './assets/stamps/high_res/',
  collectorCrops: './assets/stamps/collector_crops/',
  metadata: './assets/metadata/layout_metadata.json'
};

let activeIndex = 0;
let metadata: LayoutMetadata | undefined;

const stampByTitle = new Map(stamps.map((stamp) => [stamp.title, stamp]));

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

const escapeAttribute = (value: string) => value.replace(/"/g, '&quot;');

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
          ${stamp.title}
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
            <span class="stamp-card-meta">${String(index + 1).padStart(2, '0')} / ${stamp.category}</span>
            <strong>${stamp.title}</strong>
          </button>
        </article>
      `
    )
    .join('');

const renderShell = (layout: LayoutMetadata) => {
  app.innerHTML = `
    <header class="site-header">
      <div class="kicker">Summer into AI Theme 1 / 8-Bit America</div>
      <h1>Postmark 250</h1>
      <p class="subtitle">A Declaration of American Memory</p>
      <p class="tagline">"America at 250 is not one marble monument. It is a sheet of postmarks."</p>
    </header>

    <main>
      <section class="collector-section" aria-labelledby="collector-title">
        <div class="section-heading">
          <p class="eyebrow">Interactive Collector Sheet</p>
          <h2 id="collector-title">Click a stamp to open its memory card.</h2>
        </div>

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
          <p>This is not a ranked list of America's most important events. It is a curated sheet of American memory fragments.</p>
          <p>The artifact interprets America at 250 through places, rituals, ruptures, inventions, screens, ballparks, lakes, migrations, homes, and unfinished arguments.</p>
          <p>Visual design is AI-assisted and human-curated. The provided collector sheet is the source artifact; this webpage is the small interactive museum kiosk around it.</p>
        </div>
      </section>
    </main>

    <div class="modal-backdrop" hidden>
      <section class="memory-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal-close" type="button" aria-label="Close memory card">Close</button>
        <div class="modal-content"></div>
      </section>
    </div>
  `;

  bindInteractions();
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
      <img src="${stampImagePath(stamp)}" alt="${escapeAttribute(stamp.title)} stamp detail" />
    </div>
    <div class="modal-text">
      <p class="modal-number">Postmark ${String(activeIndex + 1).padStart(2, '0')} of 12</p>
      <h2 id="modal-title">${stamp.title}</h2>
      <p class="modal-category">${stamp.category}</p>
      <p>${stamp.description}</p>
      <h3>Why it belongs</h3>
      <p>${stamp.why}</p>
      <div class="modal-actions">
        <button type="button" class="modal-prev">Previous</button>
        <button type="button" class="modal-next">Next</button>
      </div>
    </div>
  `;

  backdrop.hidden = false;
  document.body.classList.add('modal-open');
  document.querySelector<HTMLButtonElement>('.modal-close')?.focus();
  document.querySelector<HTMLButtonElement>('.modal-prev')?.addEventListener('click', () => openModal(activeIndex - 1));
  document.querySelector<HTMLButtonElement>('.modal-next')?.addEventListener('click', () => openModal(activeIndex + 1));
};

const closeModal = () => {
  const backdrop = document.querySelector<HTMLDivElement>('.modal-backdrop');

  if (!backdrop) {
    return;
  }

  backdrop.hidden = true;
  document.body.classList.remove('modal-open');
};

const bindInteractions = () => {
  document.querySelectorAll<HTMLElement>('[data-stamp-index]').forEach((element) => {
    element.addEventListener('click', () => {
      const index = Number(element.dataset.stampIndex);

      if (Number.isInteger(index)) {
        openModal(index);
      }
    });
  });

  document.querySelector<HTMLButtonElement>('.modal-close')?.addEventListener('click', closeModal);
  document.querySelector<HTMLDivElement>('.modal-backdrop')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  });
};

document.addEventListener('keydown', (event) => {
  const backdrop = document.querySelector<HTMLDivElement>('.modal-backdrop');
  const modalOpen = Boolean(backdrop && !backdrop.hidden);

  if (!modalOpen) {
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

loadMetadata()
  .then((layout) => {
    metadata = layout;
    renderShell(layout);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown asset loading error';

    app.innerHTML = `
      <main class="error-state">
        <h1>Postmark 250</h1>
        <p>${message}</p>
      </main>
    `;
  });

export const getLoadedMetadata = () => metadata;
