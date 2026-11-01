import React, { useState, useEffect } from 'react';
import { Search, Users, Shield, UserCheck, UserX } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers({ search, role, limit: 30 });
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role]);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole.toUpperCase()}?`)) return;
    try {
      await adminService.updateUserRole(user._id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>User Access & Role Administration</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Registered accounts, contact information, and role privileges</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', borderRadius: '10px' }}
          />
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-field"
          style={{ width: 'auto', background: '#1a202c' }}
        >
          <option value="All">All Roles</option>
          <option value="user">Standard User</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      {loading ? (
        <Loader message="Loading registered users..." />
      ) : (
        <div style={{ background: '#121620', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '14px 16px' }}>User</th>
                <th style={{ padding: '14px 16px' }}>Contact Phone</th>
                <th style={{ padding: '14px 16px' }}>Assigned Role</th>
                <th style={{ padding: '14px 16px' }}>Member Since</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Role Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={u.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={u.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <p style={{ fontWeight: 700, color: '#fff' }}>{u.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.email}</p>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{u.phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {u.role === 'admin' ? (
                      <span className="badge badge-primary">Admin</span>
                    ) : (
                      <span className="badge badge-blue">Customer</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.82rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleRoleToggle(u)}
                      style={{
                        background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: u.role === 'admin' ? '#f87171' : '#60a5fa',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

