// Lab Link V3 - AI Review Block

import LabBlock from '../components/lab-block.js';
import { AI_REVIEW_MANIFEST } from '../registry/block-manifests.js';
import streamingAI from '../services/streaming-ai.js';

/**
 * AI Review Block
 * Review AI suggestions, configure providers, and view AI run history
 */
class LabAIReview extends LabBlock {
  constructor() {
    super();

    this.manifest = AI_REVIEW_MANIFEST;

    this.state = {
      activeSubtab: 'suggestions',
      suggestions: [],
      providers: [],
      runs: [],
      selectedSuggestion: null,
      isProcessing: false,
    };
  }

  static get observedAttributes() {
    return ['data-initial-subtab'];
  }

  init() {
    this.subscribe('data:updated', (data) => {
      if (data.type === 'ai-suggestions' || data.type === 'ai-runs') {
        this.loadAIData();
      }
    });

    this.loadAIData();
  }

  async loadAIData() {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();
      this.setState({
        suggestions: data.aiSuggestions || [],
        providers: data.aiProviders || this.getDefaultProviders(),
        runs: data.aiRuns || [],
      });
    } catch (error) {
      this.setError(error);
    }
  }

  getDefaultProviders() {
    return [
      {
        id: 'openai',
        name: 'OpenAI',
        status: 'configured',
        models: ['gpt-4', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-4',
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        status: 'not-configured',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        defaultModel: 'claude-3-sonnet',
      },
      {
        id: 'local',
        name: 'Local Model',
        status: 'not-configured',
        models: ['llama-2', 'mistral'],
        defaultModel: 'llama-2',
      },
    ];
  }

  handleSubtabClick(subtabId) {
    this.setState({ activeSubtab: subtabId });
  }

  async handleApproveSuggestion(suggestionId) {
    const suggestion = this.state.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    this.setState({ isProcessing: true });

    try {
      await fetch('/api/ai/suggestion/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId }),
      });

      this.emit('ai:suggestion-approved', { suggestionId });
      this.loadAIData();
    } catch (error) {
      this.setError(error);
    } finally {
      this.setState({ isProcessing: false });
    }
  }

  async handleRejectSuggestion(suggestionId) {
    this.setState({ isProcessing: true });

    try {
      await fetch('/api/ai/suggestion/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId }),
      });

      this.emit('ai:suggestion-rejected', { suggestionId });
      this.loadAIData();
    } catch (error) {
      this.setError(error);
    } finally {
      this.setState({ isProcessing: false });
    }
  }

  handleConfigureProvider(providerId) {
    this.emit('ai:configure-provider', { providerId });
  }

  handleRunClick(runId) {
    this.emit('ai:run-selected', { runId });
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

    header.appendChild(title);

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
      case 'suggestions':
        content.appendChild(this.createSuggestionsView());
        break;
      case 'providers':
        content.appendChild(this.createProvidersView());
        break;
      case 'runs':
        content.appendChild(this.createRunsView());
        break;
    }

    return content;
  }

  createSuggestionsView() {
    const view = this.createElement('div', {
      className: 'suggestions-view',
    });

    if (this.state.suggestions.length === 0) {
      const empty = this.createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: 'var(--text-tertiary)',
          fontSize: 'var(--text-sm)',
          gap: 'var(--space-2)',
        }
      });

      const icon = this.createElement('div', {
        style: {
          fontSize: 'var(--text-2xl)',
        }
      }, '✨');

      const text = this.createElement('div', {}, 'No AI suggestions yet');

      empty.appendChild(icon);
      empty.appendChild(text);
      view.appendChild(empty);
      return view;
    }

    const list = this.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }
    });

    this.state.suggestions.forEach(suggestion => {
      const item = this.createSuggestionItem(suggestion);
      list.appendChild(item);
    });

    view.appendChild(list);
    return view;
  }

  createSuggestionItem(suggestion) {
    const item = this.createElement('div', {
      style: {
        padding: 'var(--space-4)',
        backgroundColor: 'var(--surface-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
      }
    });

    const header = this.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-3)',
      }
    });

    const titleSection = this.createElement('div', {
      style: { flex: 1 }
    });

    const title = this.createElement('div', {
      style: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-1)',
      }
    }, suggestion.title || 'AI Suggestion');

    const meta = this.createElement('div', {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
      }
    }, `${suggestion.category || 'General'} • ${suggestion.confidence ? `${suggestion.confidence}% confidence` : ''}`);

    titleSection.appendChild(title);
    titleSection.appendChild(meta);

    const badge = this.createElement('span', {
      className: `badge badge-${this.getSuggestionTypeBadge(suggestion.type)}`,
    }, suggestion.type || 'insight');

    header.appendChild(titleSection);
    header.appendChild(badge);

    const description = this.createElement('div', {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-4)',
        lineHeight: '1.6',
      }
    }, suggestion.description || suggestion.content || 'No description provided');

    const actions = this.createElement('div', {
      style: {
        display: 'flex',
        gap: 'var(--space-2)',
      }
    });

    const approveButton = this.createElement('button', {
      className: 'btn btn-primary btn-sm',
      onClick: () => this.handleApproveSuggestion(suggestion.id),
      disabled: this.state.isProcessing,
    }, '✓ Approve');

    const rejectButton = this.createElement('button', {
      className: 'btn btn-secondary btn-sm',
      onClick: () => this.handleRejectSuggestion(suggestion.id),
      disabled: this.state.isProcessing,
    }, '✗ Reject');

    actions.appendChild(approveButton);
    actions.appendChild(rejectButton);

    item.appendChild(header);
    item.appendChild(description);
    item.appendChild(actions);

    return item;
  }

  createProvidersView() {
    const view = this.createElement('div', {
      className: 'providers-view',
    });

    const grid = this.createElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--space-4)',
      }
    });

    this.state.providers.forEach(provider => {
      const card = this.createProviderCard(provider);
      grid.appendChild(card);
    });

    view.appendChild(grid);
    return view;
  }

  createProviderCard(provider) {
    const card = this.createElement('div', {
      style: {
        padding: 'var(--space-5)',
        backgroundColor: 'var(--surface-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
      }
    });

    const header = this.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-3)',
      }
    });

    const name = this.createElement('h3', {
      style: {
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)',
      }
    }, provider.name);

    const statusBadge = this.createElement('span', {
      className: `badge badge-${this.getProviderStatusBadge(provider.status)}`,
    }, provider.status === 'configured' ? 'Configured' : 'Not Configured');

    header.appendChild(name);
    header.appendChild(statusBadge);

    const models = this.createElement('div', {
      style: {
        marginBottom: 'var(--space-4)',
      }
    });

    const modelsLabel = this.createElement('div', {
      style: {
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-2)',
      }
    }, 'Available Models:');

    const modelsList = this.createElement('div', {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }
    });

    provider.models?.forEach(model => {
      const modelBadge = this.createElement('span', {
        className: 'badge badge-primary',
        style: {
          fontSize: 'var(--text-xs)',
        }
      }, model);
      modelsList.appendChild(modelBadge);
    });

    models.appendChild(modelsLabel);
    models.appendChild(modelsList);

    if (provider.defaultModel) {
      const defaultModel = this.createElement('div', {
        style: {
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-4)',
        }
      }, `Default: ${provider.defaultModel}`);
      models.appendChild(defaultModel);
    }

    const configButton = this.createElement('button', {
      className: provider.status === 'configured' ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm',
      onClick: () => this.handleConfigureProvider(provider.id),
      style: {
        width: '100%',
      }
    }, provider.status === 'configured' ? 'Reconfigure' : 'Configure');

    card.appendChild(header);
    card.appendChild(models);
    card.appendChild(configButton);

    return card;
  }

  createRunsView() {
    const view = this.createElement('div', {
      className: 'runs-view',
    });

    if (this.state.runs.length === 0) {
      const empty = this.createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: 'var(--text-tertiary)',
          fontSize: 'var(--text-sm)',
          gap: 'var(--space-2)',
        }
      });

      const icon = this.createElement('div', {
        style: {
          fontSize: 'var(--text-2xl)',
        }
      }, '📊');

      const text = this.createElement('div', {}, 'No AI runs yet');

      empty.appendChild(icon);
      empty.appendChild(text);
      view.appendChild(empty);
      return view;
    }

    const list = this.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }
    });

    this.state.runs.forEach(run => {
      const item = this.createRunItem(run);
      list.appendChild(item);
    });

    view.appendChild(list);
    return view;
  }

  createRunItem(run) {
    const item = this.createElement('div', {
      onClick: () => this.handleRunClick(run.id),
      style: {
        padding: 'var(--space-4)',
        backgroundColor: 'var(--surface-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all var(--duration-fast) var(--ease-out)',
      }
    });

    item.addEventListener('mouseenter', () => {
      item.style.borderColor = 'var(--border-interactive)';
      item.style.boxShadow = 'var(--shadow-sm)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.borderColor = 'var(--border-default)';
      item.style.boxShadow = 'none';
    });

    const header = this.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-2)',
      }
    });

    const titleSection = this.createElement('div', {
      style: { flex: 1 }
    });

    const title = this.createElement('div', {
      style: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-1)',
      }
    }, run.operation || run.type || 'AI Operation');

    const meta = this.createElement('div', {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
      }
    }, `${run.provider || 'Unknown'} • ${run.timestamp || run.date || 'Unknown time'}`);

    titleSection.appendChild(title);
    titleSection.appendChild(meta);

    const badge = this.createElement('span', {
      className: `badge badge-${this.getRunStatusBadge(run.status)}`,
    }, run.status || 'completed');

    header.appendChild(titleSection);
    header.appendChild(badge);

    const stats = this.createElement('div', {
      style: {
        display: 'flex',
        gap: 'var(--space-4)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
      }
    });

    if (run.duration) {
      const duration = this.createElement('div', {}, `Duration: ${run.duration}`);
      stats.appendChild(duration);
    }

    if (run.tokensUsed) {
      const tokens = this.createElement('div', {}, `Tokens: ${run.tokensUsed}`);
      stats.appendChild(tokens);
    }

    if (run.cost) {
      const cost = this.createElement('div', {}, `Cost: $${run.cost}`);
      stats.appendChild(cost);
    }

    item.appendChild(header);
    if (stats.children.length > 0) {
      item.appendChild(stats);
    }

    return item;
  }

  getSuggestionTypeBadge(type) {
    switch (type?.toLowerCase()) {
      case 'insight':
        return 'primary';
      case 'action':
      case 'recommendation':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
      case 'critical':
        return 'error';
      default:
        return 'primary';
    }
  }

  getProviderStatusBadge(status) {
    return status === 'configured' ? 'success' : 'warning';
  }

  getRunStatusBadge(status) {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'success';
      case 'running':
      case 'in-progress':
        return 'primary';
      case 'failed':
      case 'error':
        return 'error';
      default:
        return 'primary';
    }
  }
}

customElements.define('lab-ai-review', LabAIReview);

export default LabAIReview;
