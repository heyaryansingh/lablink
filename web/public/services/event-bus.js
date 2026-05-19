// Lab Link V3 - Event Bus for Cross-Component Communication

/**
 * Global event bus for cross-component communication
 * Allows Web Components to publish/subscribe to events without tight coupling
 */
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }

  /**
   * Subscribe to event once (automatically unsubscribes after first call)
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(event, callback) {
    const wrappedCallback = (data) => {
      callback(data);
      this.off(event, wrappedCallback);
    };
    return this.on(event, wrappedCallback);
  }

  /**
   * Clear all listeners for an event, or all events if no event specified
   * @param {string} [event] - Optional event name
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get count of listeners for an event
   * @param {string} event - Event name
   * @returns {number}
   */
  listenerCount(event) {
    return this.listeners.has(event) ? this.listeners.get(event).length : 0;
  }
}

// Create singleton instance
const eventBus = new EventBus();

// Export as default
export default eventBus;

// Standard event names (for documentation/autocomplete)
export const EVENTS = {
  // State events
  STATE_UPDATED: 'state:updated',
  STATE_RESET: 'state:reset',

  // Block events
  BLOCK_MOUNTED: 'block:mounted',
  BLOCK_UNMOUNTED: 'block:unmounted',
  BLOCK_UPDATED: 'block:updated',
  BLOCK_VISIBILITY_CHANGED: 'block:visibility-changed',
  BLOCK_COLLAPSED: 'block:collapsed',
  BLOCK_EXPANDED: 'block:expanded',

  // Workspace events
  WORKSPACE_CHANGED: 'workspace:changed',
  WORKSPACE_ORGANIZED: 'workspace:organized',

  // AI events
  AI_STREAM_START: 'ai:stream-start',
  AI_STREAM_TOKEN: 'ai:stream-token',
  AI_STREAM_PROGRESS: 'ai:stream-progress',
  AI_STREAM_COMPLETE: 'ai:stream-complete',
  AI_STREAM_ERROR: 'ai:stream-error',
  AI_STREAM_CANCELLED: 'ai:stream-cancelled',

  // Data events
  DATA_LOADED: 'data:loaded',
  DATA_UPDATED: 'data:updated',
  DATA_DELETED: 'data:deleted',

  // Integration events
  INTEGRATION_CONNECTED: 'integration:connected',
  INTEGRATION_DISCONNECTED: 'integration:disconnected',
  INTEGRATION_SYNC_START: 'integration:sync-start',
  INTEGRATION_SYNC_COMPLETE: 'integration:sync-complete',
  INTEGRATION_ERROR: 'integration:error',

  // Navigation events
  ROUTE_CHANGED: 'route:changed',
  TAB_CHANGED: 'tab:changed',

  // UI events
  COMMAND_PALETTE_OPEN: 'ui:command-palette-open',
  COMMAND_PALETTE_CLOSE: 'ui:command-palette-close',
  MODAL_OPEN: 'ui:modal-open',
  MODAL_CLOSE: 'ui:modal-close',
  TOAST_SHOW: 'ui:toast-show',

  // Error events
  ERROR_OCCURRED: 'error:occurred',
  ERROR_CLEARED: 'error:cleared',
};
