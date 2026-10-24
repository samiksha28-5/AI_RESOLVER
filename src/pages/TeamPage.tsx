import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Avatar } from '../components/common/Avatar';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { User, UserRole } from '../types';

export const TeamPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { currentUser, canManageSettings } = useAuth();
  const { showToast } = useNotifications();

  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [tickets, setTickets] = useState(() => storageService.getTickets());
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('agent');
  const [inviteDepartment, setInviteDepartment] = useState('Technical Support');

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setUsers(storageService.getUsers());
      setTickets(storageService.getTickets());
    });
    return unsub;
  }, []);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    storageService.inviteUser(
      {
        name: inviteName,
        email: inviteEmail,
        avatar: '',
        role: inviteRole,
        department: inviteDepartment,
        status: 'active',
      },
      currentUser || undefined
    );

    showToast(`Invitation sent to ${inviteEmail}`, 'success');
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (!canManageSettings) {
      showToast('Only administrators can modify team roles', 'error');
      return;
    }
    storageService.updateUserRole(userId, newRole, currentUser || undefined);
    showToast('Role updated successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Team Roster & Workload</h2>
          <p className="text-xs text-slate-500 mt-1">
            Support operators, queue assignments, SLA responsibilities, and role-based access permissions.
          </p>
        </div>

        {canManageSettings && (
          <Button size="sm" icon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setIsInviteModalOpen(true)}>
            Invite Team Member
          </Button>
        )}
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((member) => {
          const memberTickets = tickets.filter((t) => t.assignedAgentId === member.id);
          const openCount = memberTickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length;
          const urgentCount = memberTickets.filter((t) => t.priority === 'Urgent' && t.status !== 'Resolved').length;
          const capacityMax = 8;
          const capacityPercent = Math.min(Math.round((openCount / capacityMax) * 100), 100);

          return (
            <div
              key={member.id}
              className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar src={member.avatar} name={member.name} size="lg" />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{member.name}</h3>
                      <p className="text-[11px] text-slate-500 font-mono">{member.email}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{member.department || 'General Support'}</p>
                    </div>
                  </div>
                </div>

                {/* Role & Access */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Role:</span>
                  {canManageSettings ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                      className="text-xs font-semibold px-2 py-1 rounded-md border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="admin">Administrator</option>
                      <option value="manager">Support Manager</option>
                      <option value="agent">Support Agent</option>
                      <option value="customer">Customer Portal</option>
                    </select>
                  ) : (
                    <span className="font-semibold text-slate-700 capitalize text-xs">
                      {member.role}
                    </span>
                  )}
                </div>

                {/* Workload Capacity Bar */}
                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Active Queue:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {openCount} / {capacityMax} tickets
                    </span>
                  </div>
                  {/* Capacity progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capacityPercent > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                  {urgentCount > 0 && (
                    <div className="flex items-center justify-between text-red-600 font-medium text-[11px] pt-0.5">
                      <span>Urgent SLA Priority:</span>
                      <span className="font-mono tabular-nums font-bold">{urgentCount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="capitalize text-slate-600 font-medium">{member.status}</span>
                </span>
                <button
                  onClick={() => navigate(`/tickets?assignee=${member.id}`)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer inline-flex items-center space-x-1"
                >
                  <span>View Queue</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        description="Add a new support operator, manager, or administrator to your organization."
      >
        <form onSubmit={handleInvite} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="e.g. maya@resolveai.io"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role Permission</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="agent">Support Agent</option>
                <option value="manager">Support Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={inviteDepartment}
                onChange={(e) => setInviteDepartment(e.target.value)}
                placeholder="Technical Support"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
