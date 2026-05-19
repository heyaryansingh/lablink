// Lab Link V3 - Calendar Pressure Block

import LabBlock from '../components/lab-block.js';
import { CALENDAR_PRESSURE_MANIFEST } from '../registry/block-manifests.js';

class LabCalendarPressure extends LabBlock {
  constructor() {
    super();
    this.manifest = CALENDAR_PRESSURE_MANIFEST;
    this.state = { activeSubtab: 'this-week', thisWeek: [], nextWeek: [], conflicts: [] };
  }

  init() {
    this.subscribe('data:updated', (data) => {
      if (data.type === 'calendar') this.loadCalendar();
    });
    this.loadCalendar();
  }

  async loadCalendar() {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();
      this.setState({
        thisWeek: data.thisWeekEvents || [],
        nextWeek: data.nextWeekEvents || [],
        conflicts: data.calendarConflicts || [],
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

    const header = this.createElement('h2', {
      style: {
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--border-default)',
        fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)', margin: 0,
      }
    }, this.manifest.title);

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
    }, 'Calendar view coming soon');

    container.appendChild(header);
    container.appendChild(subtabs);
    container.appendChild(content);
    this.shadowRoot.appendChild(container);
  }
}

customElements.define('lab-calendar-pressure', LabCalendarPressure);
export default LabCalendarPressure;
