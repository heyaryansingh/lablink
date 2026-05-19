// Lab Link V3 - Streaming AI Service using Server-Sent Events

import eventBus, { EVENTS } from './event-bus.js';

/**
 * Streaming AI Service
 * Handles AI requests with Server-Sent Events for real-time token streaming
 */
class StreamingAIService {
  constructor() {
    this.activeStreams = new Map();
    this.requestId = 0;
  }

  /**
   * Stream AI organize workspace
   * @param {string} intent - User intent for organization
   * @param {Object} callbacks - Callback functions
   * @returns {Function} Cancel function
   */
  async streamOrganize(intent, { onToken, onProgress, onComplete, onError }) {
    const requestId = `org-${++this.requestId}`;

    try {
      // Emit stream start event
      eventBus.emit(EVENTS.AI_STREAM_START, { requestId, type: 'organize' });

      // Create EventSource for SSE
      const url = new URL('/api/ai/organize/stream', window.location.origin);
      url.searchParams.set('intent', intent);

      const eventSource = new EventSource(url);
      this.activeStreams.set(requestId, eventSource);

      // Handle token events
      eventSource.addEventListener('token', (e) => {
        const data = JSON.parse(e.data);
        if (onToken) onToken(data.token);
        eventBus.emit(EVENTS.AI_STREAM_TOKEN, { requestId, token: data.token });
      });

      // Handle progress events
      eventSource.addEventListener('progress', (e) => {
        const data = JSON.parse(e.data);
        if (onProgress) onProgress(data.progress, data.message);
        eventBus.emit(EVENTS.AI_STREAM_PROGRESS, { requestId, ...data });
      });

      // Handle result events
      eventSource.addEventListener('result', (e) => {
        const data = JSON.parse(e.data);
        if (onComplete) onComplete(data);
        eventBus.emit(EVENTS.AI_STREAM_COMPLETE, { requestId, result: data });
        this.closeStream(requestId);
      });

      // Handle errors
      eventSource.addEventListener('error', (e) => {
        const errorMessage = e.data ? JSON.parse(e.data).error : 'Stream connection error';
        const error = new Error(errorMessage);
        if (onError) onError(error);
        eventBus.emit(EVENTS.AI_STREAM_ERROR, { requestId, error });
        this.closeStream(requestId);
      });

      // Return cancel function
      return () => this.cancelStream(requestId);

    } catch (error) {
      if (onError) onError(error);
      eventBus.emit(EVENTS.AI_STREAM_ERROR, { requestId, error });
      throw error;
    }
  }

  /**
   * Stream AI meeting analysis
   * @param {string} transcript - Meeting transcript
   * @param {Object} callbacks - Callback functions
   * @returns {Function} Cancel function
   */
  async streamMeetingAnalysis(transcript, { onToken, onProgress, onComplete, onError }) {
    const requestId = `meeting-${++this.requestId}`;

    try {
      eventBus.emit(EVENTS.AI_STREAM_START, { requestId, type: 'meeting-analysis' });

      // For POST requests with EventSource, we need to use fetch + ReadableStream
      // or a server-side endpoint that accepts query params
      const url = new URL('/api/ai/meeting/analyze/stream', window.location.origin);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      this.activeStreams.set(requestId, { reader, cancel: () => reader.cancel() });

      // Process stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse SSE format: "event: type\ndata: {...}"
          const eventMatch = line.match(/event: (\w+)\ndata: (.+)/);
          if (!eventMatch) continue;

          const [, eventType, dataStr] = eventMatch;
          const data = JSON.parse(dataStr);

          switch (eventType) {
            case 'token':
              if (onToken) onToken(data.token);
              eventBus.emit(EVENTS.AI_STREAM_TOKEN, { requestId, token: data.token });
              break;

            case 'progress':
              if (onProgress) onProgress(data.progress, data.message);
              eventBus.emit(EVENTS.AI_STREAM_PROGRESS, { requestId, ...data });
              break;

            case 'result':
              if (onComplete) onComplete(data);
              eventBus.emit(EVENTS.AI_STREAM_COMPLETE, { requestId, result: data });
              this.closeStream(requestId);
              return;

            case 'error':
              throw new Error(data.error);
          }
        }
      }

      // Return cancel function
      return () => this.cancelStream(requestId);

    } catch (error) {
      if (onError) onError(error);
      eventBus.emit(EVENTS.AI_STREAM_ERROR, { requestId, error });
      throw error;
    }
  }

  /**
   * Stream AI section proposal
   * @param {string} goal - Section goal
   * @param {string} labProfile - Lab profile description
   * @param {Object} callbacks - Callback functions
   * @returns {Function} Cancel function
   */
  async streamSectionProposal(goal, labProfile, { onToken, onProgress, onComplete, onError }) {
    const requestId = `section-${++this.requestId}`;

    try {
      eventBus.emit(EVENTS.AI_STREAM_START, { requestId, type: 'section-proposal' });

      const url = new URL('/api/ai/builder/propose/stream', window.location.origin);
      url.searchParams.set('goal', goal);
      url.searchParams.set('labProfile', labProfile);

      const eventSource = new EventSource(url);
      this.activeStreams.set(requestId, eventSource);

      eventSource.addEventListener('token', (e) => {
        const data = JSON.parse(e.data);
        if (onToken) onToken(data.token);
        eventBus.emit(EVENTS.AI_STREAM_TOKEN, { requestId, token: data.token });
      });

      eventSource.addEventListener('progress', (e) => {
        const data = JSON.parse(e.data);
        if (onProgress) onProgress(data.progress, data.message);
        eventBus.emit(EVENTS.AI_STREAM_PROGRESS, { requestId, ...data });
      });

      eventSource.addEventListener('result', (e) => {
        const data = JSON.parse(e.data);
        if (onComplete) onComplete(data);
        eventBus.emit(EVENTS.AI_STREAM_COMPLETE, { requestId, result: data });
        this.closeStream(requestId);
      });

      eventSource.addEventListener('error', (e) => {
        const errorMessage = e.data ? JSON.parse(e.data).error : 'Stream connection error';
        const error = new Error(errorMessage);
        if (onError) onError(error);
        eventBus.emit(EVENTS.AI_STREAM_ERROR, { requestId, error });
        this.closeStream(requestId);
      });

      return () => this.cancelStream(requestId);

    } catch (error) {
      if (onError) onError(error);
      eventBus.emit(EVENTS.AI_STREAM_ERROR, { requestId, error });
      throw error;
    }
  }

  /**
   * Stream generic AI insight
   * @param {string} prompt - AI prompt
   * @param {Object} context - Additional context
   * @param {Object} callbacks - Callback functions
   * @returns {Function} Cancel function
   */
  async streamInsight(prompt, context, { onToken, onProgress, onComplete, onError }) {
    const requestId = `insight-${++this.requestId}`;

    try {
      eventBus.emit(EVENTS.AI_STREAM_START, { requestId, type: 'insight' });

      const url = new URL('/api/ai/insight/generate/stream', window.location.origin);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      this.activeStreams.set(requestId, { reader, cancel: () => reader.cancel() });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/event: (\w+)\ndata: (.+)/);
          if (!eventMatch) continue;

          const [, eventType, dataStr] = eventMatch;
          const data = JSON.parse(dataStr);

          switch (eventType) {
            case 'token':
              if (onToken) onToken(data.token);
              eventBus.emit(EVENTS.AI_STREAM_TOKEN, { requestId, token: data.token });
              break;

            case 'progress':
              if (onProgress) onProgress(data.progress, data.message);
              eventBus.emit(EVENTS.AI_STREAM_PROGRESS, { requestId, ...data });
              break;

            case 'result':
              if (onComplete) onComplete(data);
              eventBus.emit(EVENTS.AI_STREAM_COMPLETE, { requestId, result: data });
              this.closeStream(requestId);
              return;

            case 'error':
              throw new Error(data.error);
          }
        }
      }

      return () => this.cancelStream(requestId);

    } catch (error) {
      if (onError) onError(error);
      eventBus.emit(EVENTS.AI_STREAM_ERROR, { requestId, error });
      throw error;
    }
  }

  /**
   * Cancel active stream
   * @param {string} requestId - Request ID
   */
  cancelStream(requestId) {
    const stream = this.activeStreams.get(requestId);
    if (!stream) return;

    if (stream instanceof EventSource) {
      stream.close();
    } else if (stream.reader) {
      stream.cancel();
    }

    this.activeStreams.delete(requestId);
    eventBus.emit(EVENTS.AI_STREAM_CANCELLED, { requestId });
  }

  /**
   * Close stream normally
   * @param {string} requestId - Request ID
   */
  closeStream(requestId) {
    const stream = this.activeStreams.get(requestId);
    if (!stream) return;

    if (stream instanceof EventSource) {
      stream.close();
    }

    this.activeStreams.delete(requestId);
  }

  /**
   * Cancel all active streams
   */
  cancelAll() {
    for (const requestId of this.activeStreams.keys()) {
      this.cancelStream(requestId);
    }
  }

  /**
   * Get active stream count
   * @returns {number}
   */
  getActiveStreamCount() {
    return this.activeStreams.size;
  }

  /**
   * Check if stream is active
   * @param {string} requestId - Request ID
   * @returns {boolean}
   */
  isStreamActive(requestId) {
    return this.activeStreams.has(requestId);
  }
}

// Create singleton instance
const streamingAI = new StreamingAIService();

// Export
export default streamingAI;
export { StreamingAIService };
