// Lab Link V3 - Safety Checklist Block

import LabBlock from '../components/lab-block.js';
import { SAFETY_CHECKLIST_MANIFEST } from '../registry/block-manifests.js';

class LabSafetyChecklist extends LabBlock {
  constructor() {
    super();
    this.manifest = SAFETY_CHECKLIST_MANIFEST;
    this.state = { activeSubtab: 'daily', dailyChecks: [], weeklyChecks: [], incidents: [] };
  }

  init() {
    this.subscribe('data:updated', (data) => {
      if (data.type === 'safety') this.loadSafety();
    });
    this.loadSafety();
  }

  async loadSafety() {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();
      this.setState({
        dailyChecks: data.dailySafetyChecks || [],
        weeklyChecks: data.weeklySafetyChecks || [],
        incidents: data.safetyIncidents || [],
      });
    } catch (error) {
      this.setError(error);
    }
  }

  handleSubtabClick(subtabId) {
    this.setState({ activeSubtab: subtabId });
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
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: 'var(--surface-elevated)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)', overflow: 'hidden',
      }
    });

    const header = this.createElement('div', {
      style: {
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--border-default)',
      }
    });
    const title = this.createElement('h2', {
      style: {
        fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)',
      }
    }, this.manifest.title);
    header.appendChild(title);

    const subtabs = this.createElement('div', {
      style: {
        display: 'flex', gap: 'var(--space-1)',
        padding: 'var(--space-2) var(--space-6)',
        borderBottom: '1px solid var(--border-default)',
        backgroundColor: 'var(--surface-bg)',
      }
    });

    this.manifest.subtabs.forEach(subtab => {
      const isActive = this.state.activeSubtab === subtab.id;
      const button = this.createElement('button', {
        onClick: () => this.handleSubtabClick(subtab.id),
        style: {
          padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)',
          color: isActive ? 'var(--color-primary-600)' : 'var(--text-secondary)',
          backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
          border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
        }
      }, subtab.label);
      subtabs.appendChild(button);
    });

    const content = this.createElement('div', {
      style: {
        flex: 1, overflow: 'auto', padding: 'var(--space-6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)',
      }
    }, 'Safety checklist coming soon');

    container.appendChild(header);
    container.appendChild(subtabs);
    container.appendChild(content);
    this.shadowRoot.appendChild(container);
  }
}

customElements.define('lab-safety-checklist', LabSafetyChecklist);
export default LabSafetyChecklist;
