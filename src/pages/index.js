import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoded Master Admin Fallback
    if (userId.trim() === 'admin' && password.trim() === 'admin123') {
      const adminSession = { user_id: 'admin', role: 'admin' };
      localStorage.setItem('user_session', JSON.stringify(adminSession));
      setLoading(false);
      router.push('/admin/dashboard');
      return;
    }

    // Supabase DB Authentication for other users
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('user_id', userId.trim())
      .eq('password', password.trim())
      .single();

    setLoading(false);

    if (error || !data) {
      alert('Invalid User ID or Password!');
      return;
    }

    localStorage.setItem('user_session', JSON.stringify(data));

    if (data.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push(`/user/${data.role}`);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1F4E78', fontFamily: 'Arial' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '320px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
        <h2 style={{ color: '#1F4E78', marginBottom: '5px' }}>BRAC Sericulture</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Production Reporting Login</p>
        
        <input 
          type="text" 
          placeholder="User ID" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)} 
          required 
          style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
        />

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Authenticating...' : 'Login to Dashboard'}
        </button>
      </form>
    </div>
  );
}