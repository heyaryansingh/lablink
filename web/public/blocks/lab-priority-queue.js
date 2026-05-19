// Lab Link V3 - Priority Queue Block

import LabBlock from '../components/lab-block.js';
import { PRIORITY_QUEUE_MANIFEST } from '../registry/block-manifests.js';

/**
 * Priority Queue Block
 * Manages today's priorities, blocked tasks, and waiting items
 */
class LabPriorityQueue extends LabBlock {
  constructor() {
    super();

    this.manifest = PRIORITY_QUEUE_MANIFEST;

    this.state = {
      activeSubtab: 'today',
      tasks: [],
      filter: 'all',
      sortBy: 'priority',
    };
  }

  static get observedAttributes() {
    return ['data-tasks', 'data-initial-subtab'];
  }

  init() {
    // Subscribe to task updates
    this.subscribe('data:updated', (data) => {
      if (data.type === 'tasks') {
        this.loadTasks();
      }
    });

    // Load initial tasks
    this.loadTasks();
  }

  async loadTasks() {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();
      this.setState({ tasks: data.tasks || [] });
    } catch (error) {
      this.setError(error);
    }
  }

  onPropsChanged(name, oldValue, newValue) {
    if (name === 'data-initial-subtab' && newValue) {
      this.setState({ activeSubtab: newValue });
    }
  }

  handleSubtabClick(subtabId) {
    this.setState({ activeSubtab: subtabId });
  }

  handleTaskClick(taskId) {
    this.emit('task:selected', { taskId });
  }

  handleAddTask() {
    this.emit('task:add', { context: this.state.activeSubtab });
  }

  getFilteredTasks() {
    const { tasks, activeSubtab } = this.state;

    switch (activeSubtab) {
      case 'today':
        return tasks.filter(t => t.priority === 'high' || t.dueDate === 'today');
      case 'blocked':
        return tasks.filter(t => t.status === 'blocked');
      case 'waiting':
        return tasks.filter(t => t.status === 'waiting');
      default:
        return tasks;
    }
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

    const filteredTasks = this.getFilteredTasks();

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

    // Header
    const header = this.createHeader();
    container.appendChild(header);

    // Subtabs
    const subtabs = this.createSubtabs();
    container.appendChild(subtabs);

    // Content
    const content = this.createContent(filteredTasks);
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

    const addButton = this.createElement('button', {
      className: 'btn btn-primary btn-sm',
      onClick: () => this.handleAddTask(),
    }, '+ Add Task');

    actions.appendChild(addButton);

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

  createContent(tasks) {
    const content = this.createElement('div', {
      className: 'block-content',
      style: {
        flex: 1,
        overflow: 'auto',
        padding: 'var(--space-4) var(--space-6)',
      }
    });

    if (tasks.length === 0) {
      const empty = this.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: 'var(--text-tertiary)',
          fontSize: 'var(--text-sm)',
        }
      }, `No ${this.state.activeSubtab} tasks`);
      content.appendChild(empty);
      return content;
    }

    tasks.forEach(task => {
      const taskItem = this.createTaskItem(task);
      content.appendChild(taskItem);
    });

    return content;
  }

  createTaskItem(task) {
    const item = this.createElement('div', {
      className: 'task-item',
      onClick: () => this.handleTaskClick(task.id),
      style: {
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-3)',
        backgroundColor: 'var(--surface-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all var(--duration-fast) var(--ease-out)',
      }
    });

    // Add hover effect
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
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-2)',
      }
    });

    const title = this.createElement('div', {
      style: {
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--text-primary)',
      }
    }, task.title || 'Untitled task');

    const badge = this.createElement('span', {
      className: `badge badge-${this.getPriorityBadgeClass(task.priority)}`,
    }, task.priority || 'medium');

    header.appendChild(title);
    header.appendChild(badge);

    item.appendChild(header);

    if (task.description) {
      const description = this.createElement('div', {
        className: 'line-clamp-2',
        style: {
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
        }
      }, task.description);
      item.appendChild(description);
    }

    return item;
  }

  getPriorityBadgeClass(priority) {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'primary';
    }
  }
}

// Register custom element
customElements.define('lab-priority-queue', LabPriorityQueue);

export default LabPriorityQueue;
