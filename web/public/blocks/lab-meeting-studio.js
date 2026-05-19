// Lab Link V3 - Meeting Studio Block

import LabBlock from '../components/lab-block.js';
import { MEETING_STUDIO_MANIFEST } from '../registry/block-manifests.js';
import streamingAI from '../services/streaming-ai.js';

/**
 * Meeting Studio Block
 * Prepare agendas, capture transcripts, and track actions
 */
class LabMeetingStudio extends LabBlock {
  constructor() {
    super();

    this.manifest = MEETING_STUDIO_MANIFEST;

    this.state = {
      activeSubtab: 'agenda',
      currentMeeting: null,
      meetings: [],
      agenda: '',
      transcript: '',
      actions: [],
      isAnalyzing: false,
      analysisProgress: 0,
      analysisMessage: '',
      isRecording: false,
      recognition: null,
    };
  }

  static get observedAttributes() {
    return ['data-meeting-id', 'data-initial-subtab'];
  }

  init() {
    this.subscribe('data:updated', (data) => {
      if (data.type === 'meetings') {
        this.loadMeetings();
      }
    });

    this.loadMeetings();
  }

  cleanup() {
    if (this.state.recognition) {
      this.state.recognition.stop();
    }
  }

  async loadMeetings() {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();
      this.setState({
        meetings: data.meetings || [],
        currentMeeting: data.meetings?.[0] || null,
      });
    } catch (error) {
      this.setError(error);
    }
  }

  handleSubtabClick(subtabId) {
    this.setState({ activeSubtab: subtabId });
  }

  handleStartMeeting() {
    this.emit('meeting:start', {});
  }

  handleImportTranscript() {
    this.emit('meeting:import', {});
  }

  async handleAnalyzeAI() {
    const { transcript } = this.state;
    if (!transcript || !transcript.trim()) {
      this.setError('No transcript to analyze');
      return;
    }

    this.setState({ isAnalyzing: true, analysisProgress: 0, analysisMessage: 'Starting analysis...' });

    try {
      await streamingAI.streamMeetingAnalysis(transcript, {
        onToken: (token) => {
          // Could display streaming tokens in UI
        },
        onProgress: (progress, message) => {
          this.setState({ analysisProgress: progress, analysisMessage: message });
        },
        onComplete: (result) => {
          this.setState({
            actions: result.actionItems || [],
            isAnalyzing: false,
            analysisProgress: 1,
            analysisMessage: 'Analysis complete',
          });
          this.emit('meeting:analyzed', result);
        },
        onError: (error) => {
          this.setError(error);
          this.setState({ isAnalyzing: false });
        },
      });
    } catch (error) {
      this.setError(error);
      this.setState({ isAnalyzing: false });
    }
  }

  handleStartRecording() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = this.state.transcript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      this.setState({ transcript: finalTranscript + interimTranscript });
    };

    recognition.onerror = (event) => {
      this.setError(`Speech recognition error: ${event.error}`);
      this.setState({ isRecording: false, recognition: null });
    };

    recognition.onend = () => {
      if (this.state.isRecording) {
        recognition.start(); // Restart if still recording
      }
    };

    recognition.start();
    this.setState({ isRecording: true, recognition });
  }

  handleStopRecording() {
    if (this.state.recognition) {
      this.state.recognition.stop();
      this.setState({ isRecording: false, recognition: null });
    }
  }

  handleAgendaChange(value) {
    this.setState({ agenda: value });
  }

  handleTranscriptChange(value) {
    this.setState({ transcript: value });
  }

  render() {
    this.applySharedStyles();

    if (this._error) {
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(this.renderError(this._error));
      return;
    }

    if (this._isLoading) {
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(this.renderLoading());
      return;
    }

    this.shadowRoot.innerHTML = '';

    const container = this.createElement('div', {
      className: 'block-container',
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--surface-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
      }
    });

    const header = this.createHeader();
    container.appendChild(header);

    const subtabs = this.createSubtabs();
    container.appendChild(subtabs);

    const content = this.createContent();
    container.appendChild(content);

    this.shadowRoot.appendChild(container);
  }

  createHeader() {
    const header = this.createElement('div', {
      className: 'block-header',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--border-default)',
      }
    });

    const title = this.createElement('h2', {
      style: {
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)',
      }
    }, this.manifest.title);

    const actions = this.createElement('div', {
      className: 'block-actions',
      style: {
        display: 'flex',
        gap: 'var(--space-2)',
      }
    });

    const startButton = this.createElement('button', {
      className: 'btn btn-primary btn-sm',
      onClick: () => this.handleStartMeeting(),
    }, 'Start Meeting');

    const importButton = this.createElement('button', {
      className: 'btn btn-secondary btn-sm',
      onClick: () => this.handleImportTranscript(),
    }, 'Import');

    actions.appendChild(startButton);
    actions.appendChild(importButton);

    header.appendChild(title);
    header.appendChild(actions);

    return header;
  }

  createSubtabs() {
    const subtabsContainer = this.createElement('div', {
      className: 'block-subtabs',
      style: {
        display: 'flex',
        gap: 'var(--space-1)',
        padding: 'var(--space-2) var(--space-6)',
        borderBottom: '1px solid var(--border-default)',
        backgroundColor: 'var(--surface-bg)',
      }
    });

    this.manifest.subtabs.forEach(subtab => {
      const isActive = this.state.activeSubtab === subtab.id;

      const button = this.createElement('button', {
        className: isActive ? 'subtab-active' : 'subtab',
        onClick: () => this.handleSubtabClick(subtab.id),
        style: {
          padding: 'var(--space-2) var(--space-4)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: isActive ? 'var(--color-primary-600)' : 'var(--text-secondary)',
          backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'all var(--duration-fast) var(--ease-out)',
        }
      }, subtab.label);

      subtabsContainer.appendChild(button);
    });

    return subtabsContainer;
  }

  createContent() {
    const content = this.createElement('div', {
      className: 'block-content',
      style: {
        flex: 1,
        overflow: 'auto',
        padding: 'var(--space-6)',
      }
    });

    switch (this.state.activeSubtab) {
      case 'agenda':
        content.appendChild(this.createAgendaView());
        break;
      case 'transcript':
        content.appendChild(this.createTranscriptView());
        break;
      case 'actions':
        content.appendChild(this.createActionsView());
        break;
    }

    return content;
  }

  createAgendaView() {
    const view = this.createElement('div', {
      className: 'agenda-view',
    });

    const label = this.createElement('label', {
      style: {
        display: 'block',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-2)',
      }
    }, 'Meeting Agenda');

    const textarea = this.createElement('textarea', {
      className: 'input',
      rows: 10,
      placeholder: 'Enter meeting agenda...',
      value: this.state.agenda,
      style: {
        width: '100%',
        minHeight: '200px',
        resize: 'vertical',
      }
    });

    textarea.addEventListener('input', (e) => {
      this.handleAgendaChange(e.target.value);
    });

    view.appendChild(label);
    view.appendChild(textarea);

    return view;
  }

  createTranscriptView() {
    const view = this.createElement('div', {
      className: 'transcript-view',
    });

    const toolbar = this.createElement('div', {
      style: {
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
      }
    });

    const recordButton = this.createElement('button', {
      className: this.state.isRecording ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm',
      onClick: () => this.state.isRecording ? this.handleStopRecording() : this.handleStartRecording(),
    }, this.state.isRecording ? '⏹ Stop Recording' : '🎤 Start Recording');

    const analyzeButton = this.createElement('button', {
      className: 'btn btn-primary btn-sm',
      onClick: () => this.handleAnalyzeAI(),
      disabled: this.state.isAnalyzing || !this.state.transcript,
    }, this.state.isAnalyzing ? 'Analyzing...' : '✨ Analyze with AI');

    toolbar.appendChild(recordButton);
    toolbar.appendChild(analyzeButton);

    if (this.state.isAnalyzing) {
      const progress = this.createElement('div', {
        style: {
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }
      });

      const progressBar = this.createElement('div', {
        style: {
          flex: 1,
          height: '4px',
          backgroundColor: 'var(--color-neutral-200)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }
      });

      const progressFill = this.createElement('div', {
        style: {
          width: `${this.state.analysisProgress * 100}%`,
          height: '100%',
          backgroundColor: 'var(--color-primary-500)',
          transition: 'width var(--duration-base) var(--ease-out)',
        }
      });

      progressBar.appendChild(progressFill);

      const progressText = this.createElement('span', {
        style: {
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
        }
      }, this.state.analysisMessage);

      progress.appendChild(progressBar);
      progress.appendChild(progressText);
      toolbar.appendChild(progress);
    }

    const label = this.createElement('label', {
      style: {
        display: 'block',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-2)',
      }
    }, 'Meeting Transcript');

    const textarea = this.createElement('textarea', {
      className: 'input',
      rows: 15,
      placeholder: 'Transcript will appear here...',
      value: this.state.transcript,
      style: {
        width: '100%',
        minHeight: '300px',
        resize: 'vertical',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
      }
    });

    textarea.addEventListener('input', (e) => {
      this.handleTranscriptChange(e.target.value);
    });

    view.appendChild(toolbar);
    view.appendChild(label);
    view.appendChild(textarea);

    return view;
  }

  createActionsView() {
    const view = this.createElement('div', {
      className: 'actions-view',
    });

    if (this.state.actions.length === 0) {
      const empty = this.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: 'var(--text-tertiary)',
          fontSize: 'var(--text-sm)',
        }
      }, 'No action items yet. Analyze a transcript to extract actions.');
      view.appendChild(empty);
      return view;
    }

    const title = this.createElement('h3', {
      style: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-4)',
      }
    }, 'Action Items');

    view.appendChild(title);

    this.state.actions.forEach((action, index) => {
      const actionItem = this.createActionItem(action, index);
      view.appendChild(actionItem);
    });

    return view;
  }

  createActionItem(action, index) {
    const item = this.createElement('div', {
      className: 'action-item',
      style: {
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-3)',
        backgroundColor: 'var(--surface-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
      }
    });

    const header = this.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'start',
        gap: 'var(--space-3)',
      }
    });

    const checkbox = this.createElement('input', {
      type: 'checkbox',
      checked: action.completed || false,
      style: {
        marginTop: 'var(--space-1)',
      }
    });

    const content = this.createElement('div', {
      style: {
        flex: 1,
      }
    });

    const text = this.createElement('div', {
      style: {
        fontSize: 'var(--text-base)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-2)',
      }
    }, action.text || action.title || `Action ${index + 1}`);

    content.appendChild(text);

    if (action.owner) {
      const owner = this.createElement('div', {
        style: {
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
        }
      }, `Owner: ${action.owner}`);
      content.appendChild(owner);
    }

    header.appendChild(checkbox);
    header.appendChild(content);

    item.appendChild(header);

    return item;
  }
}

customElements.define('lab-meeting-studio', LabMeetingStudio);

export default LabMeetingStudio;
