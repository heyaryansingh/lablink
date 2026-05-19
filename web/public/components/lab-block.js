// Lab Link V3 - Base Web Component for Lab Blocks

import eventBus, { EVENTS } from '../services/event-bus.js';

/**
 * Base class for all Lab Block components
 * Provides common lifecycle hooks, state management, and utilities
 */
export class LabBlock extends HTMLElement {
  constructor() {
    super();

    // Attach shadow DOM for encapsulation
    this.attachShadow({ mode: 'open' });

    // Component state
    this.state = {};
    this.props = {};
    this.subscriptions = [];

    // Loading and error states
    this._isLoading = false;
    this._error = null;
    this._isMounted = false;

    // Block manifest (to be overridden by subclasses)
    this.manifest = {
      id: 'base-block',
      title: 'Base Block',
      domain: 'Base',
      size: 'medium',
      subtabs: [],
      actions: [],
    };
  }

  /**
   * Lifecycle: Component connected to DOM
   */
  connectedCallback() {
    if (this._isMounted) return;
    this._isMounted = true;

    // Parse attributes to props
    this._parseAttributes();

    // Initialize component
    this.init();

    // Render initial state
    this.render();

    // Emit mounted event
    eventBus.emit(EVENTS.BLOCK_MOUNTED, {
      blockId: this.manifest.id,
      instance: this,
    });

    // Setup resize observer
    this._setupResizeObserver();
  }

  /**
   * Lifecycle: Component disconnected from DOM
   */
  disconnectedCallback() {
    this._isMounted = false;

    // Cleanup subscriptions
    this.cleanup();

    // Clear event subscriptions
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];

    // Cleanup resize observer
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    // Emit unmounted event
    eventBus.emit(EVENTS.BLOCK_UNMOUNTED, {
      blockId: this.manifest.id,
    });
  }

  /**
   * Lifecycle: Attribute changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    this.props[name] = newValue;

    if (this._isMounted) {
      this.onPropsChanged(name, oldValue, newValue);
      this.render();
    }
  }

  /**
   * Initialize component (override in subclasses)
   */
  init() {
    // Override in subclasses
  }

  /**
   * Cleanup component (override in subclasses)
   */
  cleanup() {
    // Override in subclasses
  }

  /**
   * Called when props change (override in subclasses)
   */
  onPropsChanged(name, oldValue, newValue) {
    // Override in subclasses
  }

  /**
   * Parse attributes to props
   */
  _parseAttributes() {
    for (const attr of this.attributes) {
      this.props[attr.name] = attr.value;
    }
  }

  /**
   * Setup resize observer
   */
  _setupResizeObserver() {
    if (!('ResizeObserver' in window)) return;

    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.onResize(entry.contentRect);
      }
    });

    this._resizeObserver.observe(this);
  }

  /**
   * Called when component is resized (override in subclasses)
   */
  onResize(rect) {
    // Override in subclasses
  }

  /**
   * Update component state
   * @param {Object} updates - State updates
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };

    if (this._isMounted) {
      this.render();

      eventBus.emit(EVENTS.BLOCK_UPDATED, {
        blockId: this.manifest.id,
        state: this.state,
      });
    }
  }

  /**
   * Get component state
   * @returns {Object}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Set loading state
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    this._isLoading = isLoading;
    this.render();
  }

  /**
   * Set error state
   * @param {Error|string|null} error
   */
  setError(error) {
    this._error = error;
    this.render();

    if (error) {
      eventBus.emit(EVENTS.ERROR_OCCURRED, {
        blockId: this.manifest.id,
        error,
      });
    }
  }

  /**
   * Subscribe to event bus events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  subscribe(event, callback) {
    const unsub = eventBus.on(event, callback);
    this.subscriptions.push(unsub);
    return unsub;
  }

  /**
   * Emit event on event bus
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    eventBus.emit(event, data);
  }

  /**
   * Render component (must be overridden by subclasses)
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Create element helper
   * @param {string} tag - HTML tag name
   * @param {Object} props - Element properties
   * @param {Array|string} children - Child elements or text
   * @returns {HTMLElement}
   */
  createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);

    // Set properties
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    // Append children
    const childArray = Array.isArray(children) ? children : [children];
    childArray.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });

    return element;
  }

  /**
   * Render loading state
   * @returns {HTMLElement}
   */
  renderLoading() {
    const loading = this.createElement('div', {
      className: 'block-loading',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        minHeight: '200px',
      }
    });

    const spinner = this.createElement('div', {
      className: 'animate-pulse',
      style: {
        color: 'var(--text-secondary)',
        fontSize: 'var(--text-sm)',
      }
    }, 'Loading...');

    loading.appendChild(spinner);
    return loading;
  }

  /**
   * Render error state
   * @param {Error|string} error
   * @returns {HTMLElement}
   */
  renderError(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    const container = this.createElement('div', {
      className: 'block-error',
      style: {
        padding: 'var(--space-6)',
        backgroundColor: 'hsl(0, 70%, 95%)',
        border: '1px solid var(--color-error-500)',
        borderRadius: 'var(--radius-md)',
        margin: 'var(--space-4)',
      }
    });

    const title = this.createElement('div', {
      style: {
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-error-600)',
        marginBottom: 'var(--space-2)',
      }
    }, 'Error');

    const message = this.createElement('div', {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
      }
    }, errorMessage);

    container.appendChild(title);
    container.appendChild(message);

    return container;
  }

  /**
   * Render skeleton loading state
   * @returns {HTMLElement}
   */
  renderSkeleton() {
    const container = this.createElement('div', {
      className: 'block-skeleton',
      style: {
        padding: 'var(--space-6)',
      }
    });

    // Title skeleton
    const title = this.createElement('div', {
      className: 'skeleton skeleton-title',
    });

    // Content skeletons
    const content = this.createElement('div', {
      style: { marginTop: 'var(--space-4)' }
    });

    for (let i = 0; i < 3; i++) {
      const line = this.createElement('div', {
        className: 'skeleton skeleton-text',
      });
      content.appendChild(line);
    }

    container.appendChild(title);
    container.appendChild(content);

    return container;
  }

  /**
   * Apply shared styles to shadow DOM
   */
  applySharedStyles() {
    const linkDesignSystem = document.createElement('link');
    linkDesignSystem.rel = 'stylesheet';
    linkDesignSystem.href = '/design-system.css';

    const linkAnimations = document.createElement('link');
    linkAnimations.rel = 'stylesheet';
    linkAnimations.href = '/animations.css';

    this.shadowRoot.appendChild(linkDesignSystem);
    this.shadowRoot.appendChild(linkAnimations);
  }
}

// Export for use in block components
export default LabBlock;
