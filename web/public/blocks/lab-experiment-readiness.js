// Lab Link V3 - Experiment Readiness Block

import LabBlock from '../components/lab-block.js';
import { EXPERIMENT_READINESS_MANIFEST } from '../registry/block-manifests.js';

/**
 * Experiment Readiness Block
 * Track protocols, samples, and approval status
 */
class LabExperimentReadiness extends LabBlock {
  constructor() {
    super();

    this.manifest = EXPERIMENT_READINESS_MANIFEST;

    this.state = {
      activeSubtab: 'protocols',
      protocols: [],
      samples: [],
      approvals: [],
      selectedProtocol: null,
      selectedSample: null,
      selectedApproval: null,
    };
  }

  static get observedAttributes() {
    return ['data-experiment-id', 'data-initial-subtab'];
  }

  init() {
    this.subscribe('data:updated', (data) => {
      if (data.type === 'experiments') {
        this.loadExperiments();
      }
    });

    this.loadExperiments();
  }

  async loadExperiments() {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();
      this.setState({
        protocols: data.protocols || [],
        samples: data.samples || [],
        approvals: data.approvals || [],
      });
    } catch (error) {
      this.setError(error);
    }
  }

  handleSubtabClick(subtabId) {
    this.setState({ activeSubtab: subtabId });
  }

  handleAddProtocol() {
    this.emit('protocol:add', {});
  }

  handleProtocolClick(protocolId) {
    const protocol = this.state.protocols.find(p => p.id === protocolId);
    this.setState({ selectedProtocol: protocol });
    this.emit('protocol:selected', { protocolId });
  }

  handleAddSample() {
    this.emit('sample:add', {});
  }

  handleSampleClick(sampleId) {
    const sample = this.state.samples.find(s => s.id === sampleId);
    this.setState({ selectedSample: sample });
    this.emit('sample:selected', { sampleId });
  }

  handleRequestApproval() {
    this.emit('approval:request', {});
  }

  handleApprovalClick(approvalId) {
    const approval = this.state.approvals.find(a => a.id === approvalId);
    this.setState({ selectedApproval: approval });
    this.emit('approval:selected', { approvalId });
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

    let addButton;
    switch (this.state.activeSubtab) {
      case 'protocols':
        addButton = this.createElement('button', {
          className: 'btn btn-primary btn-sm',
          onClick: () => this.handleAddProtocol(),
        }, '+ Protocol');
        break;
      case 'samples':
        addButton = this.createElement('button', {
          className: 'btn btn-primary btn-sm',
          onClick: () => this.handleAddSample(),
        }, '+ Sample');
        break;
      case 'approvals':
        addButton = this.createElement('button', {
          className: 'btn btn-primary btn-sm',
          onClick: () => this.handleRequestApproval(),
        }, 'Request Approval');
        break;
    }

    if (addButton) {
      actions.appendChild(addButton);
    }

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
      case 'protocols':
        content.appendChild(this.createProtocolsView());
        break;
      case 'samples':
        content.appendChild(this.createSamplesView());
        break;
      case 'approvals':
        content.appendChild(this.createApprovalsView());
        break;
    }

    return content;
  }

  createProtocolsView() {
    const view = this.createElement('div', {
      className: 'protocols-view',
    });

    if (this.state.protocols.length === 0) {
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
      }, '📋');

      const text = this.createElement('div', {}, 'No protocols yet');

      empty.appendChild(icon);
      empty.appendChild(text);
      view.appendChild(empty);
      return view;
    }

    const grid = this.createElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-4)',
      }
    });

    this.state.protocols.forEach(protocol => {
      const card = this.createProtocolCard(protocol);
      grid.appendChild(card);
    });

    view.appendChild(grid);
    return view;
  }

  createProtocolCard(protocol) {
    const card = this.createElement('div', {
      className: 'protocol-card',
      onClick: () => this.handleProtocolClick(protocol.id),
      style: {
        padding: 'var(--space-4)',
        backgroundColor: 'var(--surface-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all var(--duration-fast) var(--ease-out)',
      }
    });

    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'var(--border-interactive)';
      card.style.boxShadow = 'var(--shadow-sm)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = 'var(--border-default)';
      card.style.boxShadow = 'none';
    });

    const header = this.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-3)',
      }
    });

    const title = this.createElement('div', {
      style: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)',
      }
    }, protocol.title || protocol.name || 'Untitled Protocol');

    const badge = this.createElement('span', {
      className: `badge badge-${this.getStatusBadgeClass(protocol.status)}`,
    }, protocol.status || 'draft');

    header.appendChild(title);
    header.appendChild(badge);

    const meta = this.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
      }
    });

    if (protocol.version) {
      const version = this.createElement('div', {}, `Version ${protocol.version}`);
      meta.appendChild(version);
    }

    if (protocol.lastModified) {
      const modified = this.createElement('div', {}, `Modified ${protocol.lastModified}`);
      meta.appendChild(modified);
    }

    card.appendChild(header);
    card.appendChild(meta);

    return card;
  }

  createSamplesView() {
    const view = this.createElement('div', {
      className: 'samples-view',
    });

    if (this.state.samples.length === 0) {
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
      }, '🧪');

      const text = this.createElement('div', {}, 'No samples tracked');

      empty.appendChild(icon);
      empty.appendChild(text);
      view.appendChild(empty);
      return view;
    }

    const table = this.createElement('div', {
      style: {
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }
    });

    const tableHeader = this.createElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
        padding: 'var(--space-3) var(--space-4)',
        backgroundColor: 'var(--surface-bg)',
        borderBottom: '1px solid var(--border-default)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-secondary)',
      }
    });

    ['Sample ID', 'Type', 'Location', 'Date', 'Status'].forEach(label => {
      const cell = this.createElement('div', {}, label);
      tableHeader.appendChild(cell);
    });

    table.appendChild(tableHeader);

    this.state.samples.forEach(sample => {
      const row = this.createSampleRow(sample);
      table.appendChild(row);
    });

    view.appendChild(table);
    return view;
  }

  createSampleRow(sample) {
    const row = this.createElement('div', {
      onClick: () => this.handleSampleClick(sample.id),
      style: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border-default)',
        fontSize: 'var(--text-sm)',
        cursor: 'pointer',
        transition: 'background-color var(--duration-fast) var(--ease-out)',
      }
    });

    row.addEventListener('mouseenter', () => {
      row.style.backgroundColor = 'var(--surface-bg)';
    });
    row.addEventListener('mouseleave', () => {
      row.style.backgroundColor = 'transparent';
    });

    const id = this.createElement('div', {
      style: {
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--text-primary)',
      }
    }, sample.id || sample.name || 'Unknown');

    const type = this.createElement('div', {
      style: { color: 'var(--text-secondary)' }
    }, sample.type || '-');

    const location = this.createElement('div', {
      style: { color: 'var(--text-secondary)' }
    }, sample.location || '-');

    const date = this.createElement('div', {
      style: { color: 'var(--text-secondary)' }
    }, sample.collectionDate || sample.date || '-');

    const badgeContainer = this.createElement('div', {});
    const badge = this.createElement('span', {
      className: `badge badge-${this.getStatusBadgeClass(sample.status)}`,
    }, sample.status || 'stored');

    badgeContainer.appendChild(badge);

    row.appendChild(id);
    row.appendChild(type);
    row.appendChild(location);
    row.appendChild(date);
    row.appendChild(badgeContainer);

    return row;
  }

  createApprovalsView() {
    const view = this.createElement('div', {
      className: 'approvals-view',
    });

    if (this.state.approvals.length === 0) {
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
      }, '✓');

      const text = this.createElement('div', {}, 'No approvals pending');

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

    this.state.approvals.forEach(approval => {
      const item = this.createApprovalItem(approval);
      list.appendChild(item);
    });

    view.appendChild(list);
    return view;
  }

  createApprovalItem(approval) {
    const item = this.createElement('div', {
      onClick: () => this.handleApprovalClick(approval.id),
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

    const title = this.createElement('div', {
      style: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--text-primary)',
      }
    }, approval.title || approval.type || 'Approval Request');

    const badge = this.createElement('span', {
      className: `badge badge-${this.getApprovalBadgeClass(approval.status)}`,
    }, approval.status || 'pending');

    header.appendChild(title);
    header.appendChild(badge);

    const meta = this.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
      }
    });

    if (approval.requester) {
      const requester = this.createElement('div', {}, `Requested by ${approval.requester}`);
      meta.appendChild(requester);
    }

    if (approval.requestDate) {
      const date = this.createElement('div', {}, `Submitted ${approval.requestDate}`);
      meta.appendChild(date);
    }

    if (approval.reviewer && approval.status !== 'pending') {
      const reviewer = this.createElement('div', {}, `Reviewed by ${approval.reviewer}`);
      meta.appendChild(reviewer);
    }

    item.appendChild(header);
    item.appendChild(meta);

    return item;
  }

  getStatusBadgeClass(status) {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
      case 'ready':
        return 'success';
      case 'draft':
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'expired':
        return 'error';
      default:
        return 'primary';
    }
  }

  getApprovalBadgeClass(status) {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'primary';
    }
  }
}

customElements.define('lab-experiment-readiness', LabExperimentReadiness);

export default LabExperimentReadiness;
