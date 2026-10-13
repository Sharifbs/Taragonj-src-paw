import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function UserManagementForm() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('saree');
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('app_users').select('*').order('id', { ascending: true });
    if (data) setUsersList(data);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) return alert('User ID and Password are required!');

    setLoading(true);
    const { error } = await supabase.from('app_users').insert([
      { user_id: userId.trim(), password: password.trim(), role }
    ]);
    setLoading(false);

    if (error) {
      alert('Error creating user: ' + error.message);
    } else {
      alert(`User "${userId}" created successfully!`);
      setUserId('');
      setPassword('');
      fetchUsers();
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (confirm(`Are you sure you want to delete user: ${name}?`)) {
      await supabase.from('app_users').delete().eq('id', id);
      fetchUsers();
    }
  };

  return (
    <div style={{ fontFamily: 'Arial' }}>
      <h3 style={{ color: '#1F4E78', marginTop: 0 }}>Create New System User / Admin</h3>
      
      {/* User Create Form */}
      <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>User ID:</label>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required placeholder="e.g. saree_admin" style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Password:</label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Access Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '6px' }}>
            <option value="admin">Full Admin (All Access)</option>
            <option value="saree">Saree Module</option>
            <option value="dopatta">Dopatta Module</option>
            <option value="tana">Tana Module</option>
            <option value="noli_lachi">Noli & Endi Lachi Module</option>
            <option value="charka">Charka Spinners Module</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '8px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Creating...' : '➕ Create User'}
          </button>
        </div>
      </form>

      {/* Existing Users List */}
      <h4 style={{ color: '#1F4E78', marginBottom: '10px' }}>Existing System Users</h4>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
            <th>SL</th>
            <th>User ID</th>
            <th>Password</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {usersList.map((u, i) => (
            <tr key={u.id}>
              <td>{i + 1}</td>
              <td><strong>{u.user_id}</strong></td>
              <td>{u.password}</td>
              <td><span style={{ backgroundColor: u.role === 'admin' ? '#D32F2F' : '#0288D1', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{u.role.toUpperCase()}</span></td>
              <td>
                {u.user_id !== 'admin' && (
                  <button onClick={() => handleDeleteUser(u.id, u.user_id)} style={{ backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}