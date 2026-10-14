import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function UserManagementForm() {
  const [users, setUsers] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('saree');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('app_users').select('*');
    if (!error && data) {
      setUsers(data);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserId || !newPassword) return alert('User ID and Password are required!');

    setLoading(true);
    const { error } = await supabase.from('app_users').insert([
      { user_id: newUserId.trim(), password: newPassword.trim(), role: newRole }
    ]);
    setLoading(false);

    if (error) {
      alert('Error creating user: ' + error.message);
    } else {
      alert('User created successfully!');
      setNewUserId('');
      setNewPassword('');
      fetchUsers(); // Refresh list immediately
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user.user_id);
    setEditPassword(user.password);
    setEditRole(user.role);
  };

  const saveEdit = async (userId) => {
    setLoading(true);
    const { error } = await supabase
      .from('app_users')
      .update({ password: editPassword.trim(), role: editRole })
      .eq('user_id', userId);

    setLoading(false);
    if (error) {
      alert('Error updating user: ' + error.message);
    } else {
      alert('User updated successfully!');
      setEditingUserId(null);
      fetchUsers();
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm(`Are you sure you want to delete ${userId}?`)) return;
    const { error } = await supabase.from('app_users').delete().eq('user_id', userId);
    if (!error) {
      fetchUsers();
    } else {
      alert('Error deleting user: ' + error.message);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial' }}>
      <h3 style={{ color: '#1F4E78', marginTop: 0 }}>Create New System User / Admin</h3>
      <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '6px' }}>
        <input 
          type="text" 
          placeholder="User ID (e.g. saree_user)" 
          value={newUserId} 
          onChange={(e) => setNewUserId(e.target.value)} 
          style={{ padding: '8px', flex: '1', minWidth: '150px' }} 
        />
        <input 
          type="text" 
          placeholder="Password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)} 
          style={{ padding: '8px', flex: '1', minWidth: '150px' }} 
        />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ padding: '8px' }}>
          <option value="saree">Saree Module</option>
          <option value="dopatta">Dopatta Module</option>
          <option value="tana">Tana Module</option>
          <option value="noli_lachi">Noli & Lachi Module</option>
          <option value="charka">Charka Spinners Module</option>
          <option value="attendance">Attendance Module</option>
          <option value="admin">Admin Access</option>
        </select>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Creating...' : '➕ Create User'}
        </button>
      </form>

      <h4 style={{ color: '#1F4E78' }}>Existing System Users</h4>
      <div style={{ overflowX: 'auto' }}>
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
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
            {users.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No users found in database.</td></tr>
            ) : (
              users.map((u, i) => (
                <tr key={u.user_id || i}>
                  <td>{i + 1}</td>
                  <td><strong>{u.user_id}</strong></td>
                  <td>
                    {editingUserId === u.user_id ? (
                      <input 
                        type="text" 
                        value={editPassword} 
                        onChange={(e) => setEditPassword(e.target.value)} 
                        style={{ padding: '4px', width: '120px' }} 
                      />
                    ) : (
                      <span>{u.password}</span>
                    )}
                  </td>
                  <td>
                    {editingUserId === u.user_id ? (
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value)} style={{ padding: '4px' }}>
                        <option value="saree">saree</option>
                        <option value="dopatta">dopatta</option>
                        <option value="tana">tana</option>
                        <option value="noli_lachi">noli_lachi</option>
                        <option value="charka">charka</option>
                        <option value="attendance">attendance</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span style={{ 
                        backgroundColor: u.role === 'admin' ? '#D32F2F' : u.role === 'attendance' ? '#2E7D32' : '#0288D1', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {u.role ? u.role.toUpperCase() : ''}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingUserId === u.user_id ? (
                      <button onClick={() => saveEdit(u.user_id)} style={{ padding: '4px 8px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' }}>💾 Save</button>
                    ) : (
                      <button onClick={() => startEdit(u)} style={{ padding: '4px 8px', backgroundColor: '#ED6C02', color: 'white', border: 'none', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' }}>✏️ Edit</button>
                    )}
                    {u.user_id !== 'admin' && (
                      <button onClick={() => handleDelete(u.user_id)} style={{ padding: '4px 8px', backgroundColor: '#D32F2F', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❌ Delete</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}