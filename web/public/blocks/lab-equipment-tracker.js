// Lab Link V3 - Equipment Tracker Block

import LabBlock from '../components/lab-block.js';
import { EQUIPMENT_TRACKER_MANIFEST } from '../registry/block-manifests.js';

/**
 * Equipment Tracker Block
 * Track equipment status, maintenance schedules, and usage logs
 */
class LabEquipmentTracker extends LabBlock {
  constructor() {
    super();

    this.manifest = EQUIPMENT_TRACKER_MANIFEST;

    this.state = {
      activeSubtab: 'inventory',
      equipment: [],
      maintenanceSchedule: [],
      usageLogs: [],
      selectedEquipment: null,
      filterStatus: 'all',
    };
  }

  static get observedAttributes() {
    return ['data-equipment-id', 'data-initial-subtab'];
  }

  init() {
    this.subscribe('data:updated', (data) => {
      if (data.type === 'equipment') {
        this.loadEquipment();
      }
    });

    this.loadEquipment();
  }

  async loadEquipment() {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();
      this.setState({
        equipment: data.equipment || this.getMockEquipment(),
        maintenanceSchedule: data.maintenanceSchedule || [],
        usageLogs: data.usageLogs || [],
      });
    } catch (error) {
      this.setError(error);
    }
  }

  getMockEquipment() {
    return [
      {
        id: 'eq-001',
        name: 'Centrifuge R-7000',
        category: 'Centrifuge',
        status: 'operational',
        location: 'Lab A, Bench 3',
        lastMaintenance: '2026-04-15',
        nextMaintenance: '2026-07-15',
      },
      {
        id: 'eq-002',
        name: 'PCR Thermal Cycler',
        category: 'Thermal Cycler',
        status: 'maintenance',
        location: 'Lab B, Station 2',
        lastMaintenance: '2026-05-01',
        nextMaintenance: '2026-05-20',
      },
      {
        id: 'eq-003',
        name: 'Microscope Zeiss Z1',
        category: 'Microscope',
        status: 'operational',
        location: 'Imaging Suite',
        lastMaintenance: '2026-03-10',
        nextMaintenance: '2026-09-10',
      },
    ];
  }

  handleSubtabClick(subtabId) {
    this.setState({ activeSubtab: subtabId });
  }

  handleAddEquipment() {
    this.emit('equipment:add', {});
  }

  handleEquipmentClick(equipmentId) {
    const equipment = this.state.equipment.find(e => e.id === equipmentId);
    this.setState({ selectedEquipment: equipment });
    this.emit('equipment:selected', { equipmentId });
  }

  handleStatusFilter(status) {
    this.setState({ filterStatus: status });
  }

  handleScheduleMaintenance(equipmentId) {
    this.emit('equipment:schedule-maintenance', { equipmentId });
  }

  handleLogUsage(equipmentId) {
    this.emit('equipment:log-usage', { equipmentId });
  }

  getFilteredEquipment() {
    const { equipment, filterStatus } = this.state;
    if (filterStatus === 'all') return equipment;
    return equipment.filter(e => e.status === filterStatus);
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

    if (this.state.activeSubtab === 'inventory') {
      const addButton = this.createElement('button', {
        className: 'btn btn-primary btn-sm',
        onClick: () => this.handleAddEquipment(),
      }, '+ Equipment');
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
      case 'inventory':
        content.appendChild(this.createInventoryView());
        break;
      case 'maintenance':
        content.appendChild(this.createMaintenanceView());
        break;
      case 'usage':
        content.appendChild(this.createUsageView());
        break;
    }

    return content;
  }

  createInventoryView() {
    const view = this.createElement('div', {
      className: 'inventory-view',
    });

    // Status filter
    const filterBar = this.createElement('div', {
      style: {
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
      }
    });

    ['all', 'operational', 'maintenance', 'offline'].forEach(status => {
      const isActive = this.state.filterStatus === status;
      const button = this.createElement('button', {
        className: isActive ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm',
        onClick: () => this.handleStatusFilter(status),
      }, status.charAt(0).toUpperCase() + status.slice(1));
      filterBar.appendChild(button);
    });

    view.appendChild(filterBar);

    const filteredEquipment = this.getFilteredEquipment();

    if (filteredEquipment.length === 0) {
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
        style: { fontSize: 'var(--text-2xl)' }
      }, '🔬');

      const text = this.createElement('div', {}, 'No equipment found');

      empty.appendChild(icon);
      empty.appendChild(text);
      view.appendChild(empty);
      return view;
    }

    const grid = this.createElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--space-4)',
      }
    });

    filteredEquipment.forEach(equipment => {
      const card = this.createEquipmentCard(equipment);
      grid.appendChild(card);
    });

    view.appendChild(grid);
    return view;
  }

  createEquipmentCard(equipment) {
    const card = this.createElement('div', {
      onClick: () => this.handleEquipmentClick(equipment.id),
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
    }, equipment.name);

    const badge = this.createElement('span', {
      className: `badge badge-${this.getStatusBadgeClass(equipment.status)}`,
    }, equipment.status);

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

    const category = this.createElement('div', {}, `Category: ${equipment.category}`);
    const location = this.createElement('div', {}, `Location: ${equipment.location}`);
    const nextMaint = this.createElement('div', {}, `Next Maintenance: ${equipment.nextMaintenance}`);

    meta.appendChild(category);
    meta.appendChild(location);
    meta.appendChild(nextMaint);

    card.appendChild(header);
    card.appendChild(meta);

    return card;
  }

  createMaintenanceView() {
    const view = this.createElement('div', {
      className: 'maintenance-view',
    });

    // Show equipment with upcoming maintenance
    const upcomingMaintenance = this.state.equipment
      .filter(e => e.nextMaintenance)
      .sort((a, b) => new Date(a.nextMaintenance) - new Date(b.nextMaintenance));

    if (upcomingMaintenance.length === 0) {
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
        style: { fontSize: 'var(--text-2xl)' }
      }, '🔧');

      const text = this.createElement('div', {}, 'No maintenance scheduled');

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

    upcomingMaintenance.forEach(equipment => {
      const item = this.createMaintenanceItem(equipment);
      list.appendChild(item);
    });

    view.appendChild(list);
    return view;
  }

  createMaintenanceItem(equipment) {
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
        alignItems: 'center',
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
    }, equipment.name);

    const scheduleButton = this.createElement('button', {
      className: 'btn btn-primary btn-sm',
      onClick: () => this.handleScheduleMaintenance(equipment.id),
    }, 'Schedule');

    header.appendChild(title);
    header.appendChild(scheduleButton);

    const meta = this.createElement('div', {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
      }
    }, `Due: ${equipment.nextMaintenance} • Last: ${equipment.lastMaintenance}`);

    item.appendChild(header);
    item.appendChild(meta);

    return item;
  }

  createUsageView() {
    const view = this.createElement('div', {
      className: 'usage-view',
    });

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
      style: { fontSize: 'var(--text-2xl)' }
    }, '📊');

    const text = this.createElement('div', {}, 'Usage logs coming soon');

    empty.appendChild(icon);
    empty.appendChild(text);
    view.appendChild(empty);

    return view;
  }

  getStatusBadgeClass(status) {
    switch (status?.toLowerCase()) {
      case 'operational':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'offline':
        return 'error';
      default:
        return 'primary';
    }
  }
}

customElements.define('lab-equipment-tracker', LabEquipmentTracker);

export default LabEquipmentTracker;
