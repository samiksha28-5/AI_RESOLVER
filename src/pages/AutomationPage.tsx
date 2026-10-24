import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Plus,
  ArrowRight,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  AutomationRule,
  AutomationTrigger,
  AutomationConditionField,
  AutomationActionType,
} from '../types';

export const AutomationPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { currentUser, canManageRules } = useAuth();
  const { showToast } = useNotifications();

  const [rules, setRules] = useState<AutomationRule[]>(() => storageService.getAutomationRules());
  const users = storageService.getUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<AutomationTrigger>('ticket_created');
  const [conditionField, setConditionField] = useState<AutomationConditionField>('category');
  const [conditionValue, setConditionValue] = useState('Billing');
  const [actionType, setActionType] = useState<AutomationActionType>('set_priority');
  const [actionValue, setActionValue] = useState('High');

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setRules(storageService.getAutomationRules());
    });
    return unsub;
  }, []);

  const handleOpenCreate = () => {
    setEditingRule(null);
    setName('');
    setDescription('');
    setTrigger('ticket_created');
    setConditionField('category');
    setConditionValue('Billing');
    setActionType('set_priority');
    setActionValue('High');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setDescription(rule.description);
    setTrigger(rule.trigger);
    setConditionField(rule.conditionField);
    setConditionValue(rule.conditionValue);
    setActionType(rule.actionType);
    setActionValue(rule.actionValue);
    setIsModalOpen(true);
  };

  const handleToggleRule = (rule: AutomationRule) => {
    if (!canManageRules) {
      showToast('Managing automation rules requires Administrator permissions.', 'error');
      return;
    }
    storageService.updateRule(rule.id, { enabled: !rule.enabled }, currentUser || undefined);
    showToast(`Rule "${rule.name}" ${!rule.enabled ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleDelete = (id: string) => {
    if (!canManageRules) {
      showToast('Only administrators can remove automation rules.', 'error');
      return;
    }
    if (confirm('Delete this automation rule?')) {
      storageService.deleteRule(id, currentUser || undefined);
      showToast('Rule deleted', 'info');
    }
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Rule name is required', 'error');
      return;
    }

    if (editingRule) {
      storageService.updateRule(
        editingRule.id,
        {
          name,
          description,
          trigger,
          conditionField,
          conditionOperator: 'equals',
          conditionValue,
          actionType,
          actionValue,
        },
        currentUser || undefined
      );
      showToast('Rule updated successfully', 'success');
    } else {
      storageService.createRule(
        {
          name,
          description: description || `Automated routing rule triggered on ${trigger}`,
          trigger,
          conditionField,
          conditionOperator: 'equals',
          conditionValue,
          actionType,
          actionValue,
          enabled: true,
        },
        currentUser || undefined
      );
      showToast('Automation rule deployed', 'success');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Automation Rules Engine</h2>
          <p className="text-xs text-slate-500 mt-1">
            Event-driven triggers, triage routing, automatic escalations, and SLA tag assignments.
          </p>
        </div>

        {canManageRules && (
          <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={handleOpenCreate}>
            New Rule
          </Button>
        )}
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="w-6 h-6" />}
          title="No Automation Rules Configured"
          description="Create event-driven rules to automate triage, set SLA priorities, or assign operators."
          actionText={canManageRules ? 'Create First Rule' : undefined}
          onAction={canManageRules ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  />
                  <h3 className="font-bold text-sm text-slate-900">{rule.name}</h3>
                  <span className="text-[10px] font-mono text-slate-500">
                    · on {rule.trigger.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>

                {/* Developer-style clean condition block (Anti-Slop Zero-Pill) */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-700 flex flex-wrap items-center gap-2">
                  <span className="text-indigo-700 font-medium">IF</span>
                  <span className="text-slate-900">{rule.conditionField} == "{rule.conditionValue}"</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-700 font-medium">THEN</span>
                  <span className="text-slate-900">{rule.actionType}("{rule.actionValue}")</span>
                </div>
              </div>

              {/* Right Meta & Actions */}
              <div className="flex items-center space-x-4 self-end sm:self-center shrink-0">
                <div className="text-right text-xs text-slate-400">
                  <div className="font-semibold text-slate-800 font-mono tabular-nums">{rule.executionCount} executions</div>
                  <div className="text-[10px] font-mono tabular-nums">
                    {rule.lastExecutedAt ? `Last: ${new Date(rule.lastExecutedAt).toLocaleTimeString()}` : 'Never executed'}
                  </div>
                </div>

                {canManageRules && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleRule(rule)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        rule.enabled
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(rule)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Rule"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
        description="Event-driven rules evaluate immediately on state mutations and prevent infinite cascading loops."
      >
        <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Auto-Escalate Enterprise Incidents"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the operational rationale for this rule..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trigger Event</label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as AutomationTrigger)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ticket_created">Ticket Created</option>
              <option value="priority_changed">Priority Changed</option>
              <option value="status_changed">Status Changed</option>
              <option value="ticket_assigned">Ticket Assigned</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Condition Field</label>
              <select
                value={conditionField}
                onChange={(e) => setConditionField(e.target.value as AutomationConditionField)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="category">Category</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="is_unassigned">Is Unassigned</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Value</label>
              <input
                type="text"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                placeholder="Billing, Urgent, etc."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Action Type</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as AutomationActionType)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="set_priority">Set Priority</option>
                <option value="assign_agent">Assign Agent</option>
                <option value="add_tag">Add Internal Tag</option>
                <option value="set_status">Set Status</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Action Target Value</label>
              {actionType === 'assign_agent' ? (
                <select
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  placeholder="High, critical-sla, etc."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
