import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, UserCog, ShieldCheck } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';

export default function ManageUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(user?.role === 'super_admin');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'super_admin') {
      fetchUsers();
    }
  }, [user?.role]);

  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Failed to update role', error);
      alert('Gagal mengubah role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if(window.confirm('Yakin ingin menghapus user ini?')) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Failed to delete user', error);
        alert('Gagal menghapus user');
      }
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Memuat data...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Manajemen User</h1>
          <p className="text-muted">Kelola peran dan akses pengguna (Khusus Super Admin)</p>
        </div>
        <Link to="/dashboard" className="btn btn-secondary">Kembali ke Dashboard</Link>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '1.25rem 1.5rem' }}>Nama Pengguna</th>
                <th style={{ padding: '1.25rem 1.5rem' }}>Email</th>
                <th style={{ padding: '1.25rem 1.5rem' }}>Role Saat Ini</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge ${u.role === 'super_admin' ? 'badge-rejected' : u.role === 'admin' ? 'badge-pending' : 'badge-approved'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {u.role !== 'super_admin' && (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {u.role === 'user' ? (
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleRoleChange(u.id, 'admin')}>
                            <ShieldCheck size={14} /> Jadikan Admin
                          </button>
                        ) : (
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleRoleChange(u.id, 'user')}>
                            <UserCog size={14} /> Cabut Admin
                          </button>
                        )}
                        <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }} onClick={() => handleDeleteUser(u.id)} title="Hapus User">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
