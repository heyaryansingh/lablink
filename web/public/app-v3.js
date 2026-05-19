// Lab Link V3 - Main Application
// Zero-dependency modular lab management platform

import eventBus, { EVENTS } from './services/event-bus.js';
import blockRegistry from './registry/block-registry.js';
import streamingAI from './services/streaming-ai.js';

// Import all block components
import './blocks/lab-priority-queue.js';
import './blocks/lab-meeting-studio.js';
import './blocks/lab-experiment-readiness.js';
import './blocks/lab-ai-review.js';

/**
 * Lab Link V3 Application
 * Manages workspace, block lifecycle, and global state
 */
class LabLinkApp {
  constructor() {
    this.state = {
      currentWorkspace: 'default',
      visibleBlocks: [],
      blockPositions: {},
      isOrganizing: false,
      organizeProgress: 0,
      organizeMessage: '',
    };

    this.init();
  }

  async init() {
    // Load application state
    await this.loadState();

    // Set up event listeners
    this.setupEventListeners();

    // Render workspace
    this.renderWorkspace();

    // Initialize visible blocks
    this.initializeBlocks();

    console.log('Lab Link V3 initialized', {
      workspace: this.state.currentWorkspace,
      visibleBlocks: this.state.visibleBlocks.length,
    });
  }

  async loadState() {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();

      this.state = {
        ...this.state,
        visibleBlocks: data.visibleBlocks || this.getDefaultBlocks(),
        blockPositions: data.blockPositions || {},
        currentWorkspace: data.workspace || 'default',
      };
    } catch (error) {
      console.error('Failed to load state:', error);
      this.state.visibleBlocks = this.getDefaultBlocks();
    }
  }

  getDefaultBlocks() {
    // Default blocks always visible
    return [
      { id: 'priority-queue', size: 'large' },
      { id: 'meeting-studio', size: 'medium' },
      { id: 'experiment-readiness', size: 'medium' },
      { id: 'ai-review', size: 'large' },
    ];
  }

  setupEventListeners() {
    // Global AI Organize
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="ai-organize"]')) {
        this.handleAIOrganize();
      }
    });

    // Block visibility toggle
    eventBus.on(EVENTS.BLOCK_VISIBILITY_CHANGED, (data) => {
      this.handleBlockVisibilityChange(data);
    });

    // Task events from Priority Queue
    eventBus.on('task:add', () => {
      console.log('Task add requested');
    });

    eventBus.on('task:selected', (data) => {
      console.log('Task selected:', data.taskId);
    });

    // Meeting events from Meeting Studio
    eventBus.on('meeting:start', () => {
      console.log('Meeting start requested');
    });

    eventBus.on('meeting:analyzed', (data) => {
      console.log('Meeting analyzed:', data);
    });

    // Protocol events from Experiment Readiness
    eventBus.on('protocol:add', () => {
      console.log('Protocol add requested');
    });

    eventBus.on('sample:add', () => {
      console.log('Sample add requested');
    });

    // AI Review events
    eventBus.on('ai:suggestion-approved', (data) => {
      console.log('AI suggestion approved:', data.suggestionId);
    });

    eventBus.on('ai:configure-provider', (data) => {
      console.log('Configure AI provider:', data.providerId);
    });
  }

  renderWorkspace() {
    const app = document.getElementById('app');
    if (!app) {
      console.error('App container not found');
      return;
    }

    app.innerHTML = '';
    app.className = 'app-v3';

    // Create workspace container
    const workspace = document.createElement('div');
    workspace.className = 'workspace';
    workspace.style.cssText = `
      min-height: 100vh;
      background-color: var(--surface-bg);
      padding: var(--space-6);
    `;

    // Create header
    const header = this.createHeader();
    workspace.appendChild(header);

    // Create blocks grid
    const blocksGrid = document.createElement('div');
    blocksGrid.id = 'blocks-grid';
    blocksGrid.className = 'blocks-grid';
    blocksGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--space-6);
      margin-top: var(--space-6);
    `;

    workspace.appendChild(blocksGrid);

    app.appendChild(workspace);
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'workspace-header';
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-6);
      background-color: var(--surface-elevated);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-default);
    `;

    // Title
    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
    `;
    title.textContent = 'Lab Link V3';

    // Actions
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: var(--space-2);
    `;

    // AI Organize button
    const organizeButton = document.createElement('button');
    organizeButton.className = 'btn btn-primary';
    organizeButton.dataset.action = 'ai-organize';
    organizeButton.textContent = this.state.isOrganizing ? 'Organizing...' : '✨ AI Organize';
    organizeButton.disabled = this.state.isOrganizing;

    actions.appendChild(organizeButton);

    header.appendChild(title);
    header.appendChild(actions);

    // Progress bar (if organizing)
    if (this.state.isOrganizing) {
      const progressContainer = document.createElement('div');
      progressContainer.style.cssText = `
        margin-top: var(--space-4);
      `;

      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        height: 4px;
        background-color: var(--color-neutral-200);
        border-radius: var(--radius-full);
        overflow: hidden;
      `;

      const progressFill = document.createElement('div');
      progressFill.style.cssText = `
        width: ${this.state.organizeProgress * 100}%;
        height: 100%;
        background-color: var(--color-primary-500);
        transition: width var(--duration-base) var(--ease-out);
      `;

      progressBar.appendChild(progressFill);

      const progressText = document.createElement('div');
      progressText.style.cssText = `
        margin-top: var(--space-2);
        font-size: var(--text-sm);
        color: var(--text-secondary);
      `;
      progressText.textContent = this.state.organizeMessage;

      progressContainer.appendChild(progressBar);
      progressContainer.appendChild(progressText);

      header.appendChild(progressContainer);
    }

    return header;
  }

  initializeBlocks() {
    const blocksGrid = document.getElementById('blocks-grid');
    if (!blocksGrid) return;

    blocksGrid.innerHTML = '';

    this.state.visibleBlocks.forEach((blockConfig, index) => {
      const manifest = blockRegistry.getBlockManifest(blockConfig.id);
      if (!manifest) {
        console.warn(`Block manifest not found: ${blockConfig.id}`);
        return;
      }

      // Create block container
      const blockContainer = document.createElement('div');
      blockContainer.className = `block-wrapper animate-blockEntrance`;
      blockContainer.dataset.blockId = blockConfig.id;
      blockContainer.style.cssText = `
        animation-delay: ${index * 50}ms;
        grid-column: ${this.getGridColumn(blockConfig.size)};
      `;

      // Create and append the Web Component
      const blockElement = document.createElement(manifest.component);
      blockElement.dataset.blockId = blockConfig.id;

      if (blockConfig.initialSubtab) {
        blockElement.setAttribute('data-initial-subtab', blockConfig.initialSubtab);
      }

      blockContainer.appendChild(blockElement);
      blocksGrid.appendChild(blockContainer);
    });

    console.log(`Initialized ${this.state.visibleBlocks.length} blocks`);
  }

  getGridColumn(size) {
    switch (size) {
      case 'small':
        return 'span 1';
      case 'medium':
        return 'span 1';
      case 'large':
        return 'span 2';
      default:
        return 'span 1';
    }
  }

  async handleAIOrganize() {
    console.log('AI Organize requested');

    this.state.isOrganizing = true;
    this.state.organizeProgress = 0;
    this.state.organizeMessage = 'Starting analysis...';

    // Re-render header to show progress
    const header = this.createHeader();
    const existingHeader = document.querySelector('.workspace-header');
    if (existingHeader) {
      existingHeader.replaceWith(header);
    }

    try {
      const cancelStream = await streamingAI.streamOrganize('optimize my workspace', {
        onToken: (token) => {
          console.log('Organize token:', token);
        },
        onProgress: (progress, message) => {
          this.state.organizeProgress = progress;
          this.state.organizeMessage = message;

          // Update progress bar
          const progressFill = document.querySelector('.workspace-header progress div');
          if (progressFill) {
            progressFill.style.width = `${progress * 100}%`;
          }

          const progressText = document.querySelector('.workspace-header progress + div');
          if (progressText) {
            progressText.textContent = message;
          }
        },
        onComplete: (result) => {
          console.log('Organize complete:', result);

          this.state.isOrganizing = false;
          this.state.organizeProgress = 1;
          this.state.organizeMessage = 'Complete!';

          // Update visible blocks if result provides them
          if (result.visibleBlocks) {
            this.state.visibleBlocks = result.visibleBlocks;
            this.initializeBlocks();
          }

          // Save state
          this.saveState();

          // Re-render header to remove progress
          setTimeout(() => {
            const header = this.createHeader();
            const existingHeader = document.querySelector('.workspace-header');
            if (existingHeader) {
              existingHeader.replaceWith(header);
            }
          }, 2000);
        },
        onError: (error) => {
          console.error('Organize error:', error);
          this.state.isOrganizing = false;
          this.state.organizeMessage = `Error: ${error.message}`;

          // Re-render header
          const header = this.createHeader();
          const existingHeader = document.querySelector('.workspace-header');
          if (existingHeader) {
            existingHeader.replaceWith(header);
          }
        },
      });

      // Store cancel function in case we need it
      this.cancelOrganize = cancelStream;
    } catch (error) {
      console.error('Failed to start organize:', error);
      this.state.isOrganizing = false;

      const header = this.createHeader();
      const existingHeader = document.querySelector('.workspace-header');
      if (existingHeader) {
        existingHeader.replaceWith(header);
      }
    }
  }

  handleBlockVisibilityChange(data) {
    const { blockId, visible } = data;

    if (visible) {
      // Add block if not already visible
      const exists = this.state.visibleBlocks.some(b => b.id === blockId);
      if (!exists) {
        this.state.visibleBlocks.push({ id: blockId, size: 'medium' });
        this.initializeBlocks();
        this.saveState();
      }
    } else {
      // Remove block
      this.state.visibleBlocks = this.state.visibleBlocks.filter(b => b.id !== blockId);

      const blockWrapper = document.querySelector(`[data-block-id="${blockId}"]`);
      if (blockWrapper) {
        blockWrapper.remove();
      }

      this.saveState();
    }
  }

  async saveState() {
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace: this.state.currentWorkspace,
          visibleBlocks: this.state.visibleBlocks,
          blockPositions: this.state.blockPositions,
        }),
      });
      console.log('State saved');
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.labLinkApp = new LabLinkApp();
  });
} else {
  window.labLinkApp = new LabLinkApp();
}

export default LabLinkApp;
