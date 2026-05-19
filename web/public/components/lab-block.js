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
    this.applySharedStyles();

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
      this.applySharedStyles();
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
      this.applySharedStyles();

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
    this.applySharedStyles();
  }

  /**
   * Set error state
   * @param {Error|string|null} error
   */
  setError(error) {
    this._error = error;
    this.render();
    this.applySharedStyles();

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
    const cssText = `
      :host { display:block; min-height:100%; font-family: var(--font-sans); color: var(--text-primary); }
      *, *::before, *::after { box-sizing:border-box; }
      .btn { display:inline-flex; align-items:center; justify-content:center; gap:var(--space-2); min-height:34px; padding:0 var(--space-3); border:1px solid transparent; border-radius:var(--radius-md); font:inherit; font-size:var(--text-sm); font-weight:var(--font-weight-medium); cursor:pointer; transition:background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
      .btn:hover:not(:disabled) { transform:translateY(-1px); }
      .btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
      .btn-primary { background:hsl(218, 32%, 14%); border-color:hsl(218, 32%, 14%); color:white; }
      .btn-secondary { background:white; border-color:var(--border-default); color:var(--text-primary); }
      .btn-sm { min-height:30px; padding:0 var(--space-3); font-size:var(--text-xs); }
      .input { width:100%; padding:var(--space-3); border:1px solid var(--border-default); border-radius:var(--radius-md); background:white; color:var(--text-primary); font:inherit; font-size:var(--text-sm); line-height:var(--line-height-normal); }
      .input:focus, .btn:focus { outline:none; border-color:var(--border-focus); box-shadow:0 0 0 3px hsla(210, 95%, 50%, .15); }
      .badge { display:inline-flex; align-items:center; min-height:24px; padding:0 var(--space-2); border-radius:var(--radius-full); background:var(--color-neutral-100); color:var(--text-secondary); font-size:var(--text-xs); font-weight:var(--font-weight-semibold); text-transform:capitalize; }
      .badge-primary { background:var(--color-primary-100); color:var(--color-primary-700); }
      .badge-success { background:hsl(145, 60%, 90%); color:var(--color-success-600); }
      .badge-warning { background:hsl(35, 90%, 90%); color:var(--color-warning-600); }
      .badge-error { background:hsl(0, 70%, 92%); color:var(--color-error-600); }
      .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .line-clamp-3 { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
      .skeleton { background:linear-gradient(90deg, var(--color-neutral-200), var(--color-neutral-100), var(--color-neutral-200)); background-size:200% 100%; animation:skeleton-loading 1.5s ease-in-out infinite; border-radius:var(--radius-md); }
      @keyframes skeleton-loading { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
    `;

    if ('adoptedStyleSheets' in Document.prototype && 'replaceSync' in CSSStyleSheet.prototype) {
      if (!LabBlock.sharedSheet) {
        LabBlock.sharedSheet = new CSSStyleSheet();
        LabBlock.sharedSheet.replaceSync(cssText);
      }
      if (!this.shadowRoot.adoptedStyleSheets.includes(LabBlock.sharedSheet)) {
        this.shadowRoot.adoptedStyleSheets = [LabBlock.sharedSheet, ...this.shadowRoot.adoptedStyleSheets];
      }
      return;
    }

    if (!this.shadowRoot.querySelector('style[data-lablink-shared]')) {
      const style = document.createElement('style');
      style.dataset.lablinkShared = 'true';
      style.textContent = cssText;
      this.shadowRoot.prepend(style);
    }
  }
}

// Export for use in block components
export default LabBlock;
