// Lab Link V3 - Block Registry System

import eventBus, { EVENTS } from '../services/event-bus.js';

/**
 * Block Registry manages block discovery, registration, and lifecycle
 * Provides context-aware block visibility and lazy loading
 */
class BlockRegistry {
  constructor() {
    this.blocks = new Map();
    this.instances = new Map();
    this.contextEvaluators = new Map();
  }

  /**
   * Register a block with its manifest
   * @param {Object} manifest - Block manifest
   * @param {Function} componentClass - Web Component class
   * @param {Function} contextEvaluator - Function to determine if block should be visible
   */
  register(manifest, componentClass, contextEvaluator = null) {
    if (!manifest.id) {
      throw new Error('Block manifest must have an id');
    }

    if (this.blocks.has(manifest.id)) {
      console.warn(`Block "${manifest.id}" is already registered. Skipping.`);
      return;
    }

    // Store block definition
    this.blocks.set(manifest.id, {
      manifest,
      componentClass,
      registered: Date.now(),
    });

    // Store context evaluator if provided
    if (contextEvaluator) {
      this.contextEvaluators.set(manifest.id, contextEvaluator);
    }

    // Define custom element if not already defined
    const tagName = manifest.component || `lab-${manifest.id}`;
    if (!customElements.get(tagName)) {
      customElements.define(tagName, componentClass);
    }

    console.log(`Block registered: ${manifest.id} (${tagName})`);
  }

  /**
   * Get block definition
   * @param {string} blockId - Block ID
   * @returns {Object|null}
   */
  getBlock(blockId) {
    return this.blocks.get(blockId) || null;
  }

  /**
   * Get all registered blocks
   * @returns {Array}
   */
  getAllBlocks() {
    return Array.from(this.blocks.values()).map(block => ({
      ...block.manifest,
      componentClass: block.componentClass,
    }));
  }

  /**
   * Get blocks by domain
   * @param {string} domain - Domain name
   * @returns {Array}
   */
  getBlocksByDomain(domain) {
    return this.getAllBlocks().filter(block => block.domain === domain);
  }

  /**
   * Get blocks by category
   * @param {string} category - Category name
   * @returns {Array}
   */
  getBlocksByCategory(category) {
    return this.getAllBlocks().filter(block => block.category === category);
  }

  /**
   * Evaluate if a block should be visible based on context
   * @param {string} blockId - Block ID
   * @param {Object} context - Current application context
   * @returns {boolean}
   */
  evaluateContext(blockId, context) {
    // Always visible blocks
    const block = this.getBlock(blockId);
    if (!block) return false;

    if (block.manifest.alwaysVisible) {
      return true;
    }

    // Check context evaluator
    const evaluator = this.contextEvaluators.get(blockId);
    if (!evaluator) {
      return true; // Default to visible if no evaluator
    }

    try {
      return evaluator(context);
    } catch (error) {
      console.error(`Error evaluating context for block "${blockId}":`, error);
      return false;
    }
  }

  /**
   * Get visible blocks based on current context
   * @param {Object} context - Current application context
   * @returns {Array}
   */
  getVisibleBlocks(context) {
    return this.getAllBlocks().filter(block =>
      this.evaluateContext(block.id, context)
    );
  }

  /**
   * Get hidden blocks (available but not visible)
   * @param {Object} context - Current application context
   * @returns {Array}
   */
  getHiddenBlocks(context) {
    return this.getAllBlocks().filter(block =>
      !this.evaluateContext(block.id, context)
    );
  }

  /**
   * Create block instance
   * @param {string} blockId - Block ID
   * @param {Object} props - Block properties
   * @returns {HTMLElement|null}
   */
  createInstance(blockId, props = {}) {
    const block = this.getBlock(blockId);
    if (!block) {
      console.error(`Block "${blockId}" not found in registry`);
      return null;
    }

    const tagName = block.manifest.component || `lab-${blockId}`;
    const instance = document.createElement(tagName);

    // Set properties as attributes
    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        instance.setAttribute(key, value);
      } else {
        instance[key] = value;
      }
    });

    // Track instance
    if (!this.instances.has(blockId)) {
      this.instances.set(blockId, []);
    }
    this.instances.get(blockId).push(instance);

    return instance;
  }

  /**
   * Get all instances of a block
   * @param {string} blockId - Block ID
   * @returns {Array}
   */
  getInstances(blockId) {
    return this.instances.get(blockId) || [];
  }

  /**
   * Destroy block instance
   * @param {string} blockId - Block ID
   * @param {HTMLElement} instance - Block instance
   */
  destroyInstance(blockId, instance) {
    const instances = this.instances.get(blockId);
    if (!instances) return;

    const index = instances.indexOf(instance);
    if (index > -1) {
      instances.splice(index, 1);
      instance.remove();
    }
  }

  /**
   * Get block setup guidance
   * @param {string} blockId - Block ID
   * @returns {Object|null}
   */
  getSetupGuidance(blockId) {
    const block = this.getBlock(blockId);
    if (!block) return null;

    return block.manifest.setup || null;
  }

  /**
   * Check if block has required dependencies
   * @param {string} blockId - Block ID
   * @param {Object} context - Current application context
   * @returns {Object} { satisfied: boolean, missing: Array }
   */
  checkDependencies(blockId, context) {
    const block = this.getBlock(blockId);
    if (!block || !block.manifest.dataDependencies) {
      return { satisfied: true, missing: [] };
    }

    const missing = [];
    const dependencies = block.manifest.dataDependencies;

    dependencies.forEach(dep => {
      if (!context.data || !context.data[dep] || context.data[dep].length === 0) {
        missing.push(dep);
      }
    });

    return {
      satisfied: missing.length === 0,
      missing,
    };
  }

  /**
   * Get blocks for a specific workspace
   * @param {string} workspaceId - Workspace ID
   * @param {Object} context - Current application context
   * @returns {Array}
   */
  getBlocksForWorkspace(workspaceId, context) {
    // Default workspace block sets (from PRD)
    const workspaceBlocks = {
      command: ['priority-queue', 'experiment-readiness', 'meeting-studio', 'reagent-watch', 'project-health', 'calendar-pressure'],
      experiments: ['experiment-readiness', 'reagent-watch', 'risk-radar', 'priority-queue', 'calendar-pressure', 'custom-sections'],
      meetings: ['meeting-studio', 'priority-queue', 'ai-review', 'calendar-pressure', 'inbox-signals', 'integration-routes'],
      projects: ['project-health', 'priority-queue', 'risk-radar', 'calendar-pressure', 'inbox-signals', 'ai-review'],
      integrations: ['integration-routes', 'meeting-studio', 'inbox-signals', 'ai-review', 'custom-sections'],
      builder: ['custom-sections', 'experiment-readiness', 'reagent-watch', 'integration-routes'],
      ai: ['ai-review', 'priority-queue', 'meeting-studio', 'inbox-signals', 'project-health'],
    };

    const blockIds = workspaceBlocks[workspaceId] || [];

    // Filter by context visibility
    return blockIds
      .map(id => this.getBlock(id))
      .filter(block => block && this.evaluateContext(block.manifest.id, context))
      .map(block => block.manifest);
  }

  /**
   * Clear all registrations (for testing)
   */
  clear() {
    this.blocks.clear();
    this.instances.clear();
    this.contextEvaluators.clear();
  }
}

// Create singleton instance
const blockRegistry = new BlockRegistry();

// Export
export default blockRegistry;
export { BlockRegistry };
