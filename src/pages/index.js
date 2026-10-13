import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [role, setRole] = useState('admin');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'admin') router.push('/admin/dashboard');
    else if (role === 'charka') router.push('/user/charka');
    else if (role === 'saree') router.push('/user/saree');
    else if (role === 'dopatta') router.push('/user/dopatta');
    else if (role === 'tana') router.push('/user/tana');
    else if (role === 'noli-lachi') router.push('/user/noli-lachi');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1F4E78', fontFamily: 'Arial' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '320px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1F4E78', marginBottom: '5px' }}>BRAC Sericulture</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Select Module to Continue</p>
        
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="admin">Admin Dashboard</option>
          <option value="charka">User 1: Charka Spinners Statement</option>
          <option value="saree">User 2: Saree Production Report</option>
          <option value="dopatta">User 3: Dopatta Production Report</option>
          <option value="tana">User 4: Drum Master Tana Report</option>
          <option value="noli-lachi">User 5: Noli / Endi Lachi Report</option>
        </select>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Open App Module
        </button>
      </form>
    </div>
  );
}