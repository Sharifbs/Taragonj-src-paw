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

    const cleanUserId = userId.trim();
    const cleanPassword = password.trim();

    // Admin Fallback
    if (cleanUserId === 'admin' && cleanPassword === 'admin123') {
      const adminSession = { user_id: 'admin', role: 'admin' };
      localStorage.setItem('user_session', JSON.stringify(adminSession));
      setLoading(false);
      router.push('/admin/dashboard');
      return;
    }

    // Supabase User Auth
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('user_id', cleanUserId)
      .eq('password', cleanPassword)
      .single();

    setLoading(false);

    if (error || !data) {
      alert('Invalid User ID or Password!');
      return;
    }

    localStorage.setItem('user_session', JSON.stringify(data));

    switch (data.role) {
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'saree':
        router.push('/user/saree');
        break;
      case 'dopatta':
        router.push('/user/dopatta');
        break;
      case 'tana':
        router.push('/user/tana');
        break;
      case 'noli_lachi':
        router.push('/user/noli-lachi');
        break;
      case 'charka':
        router.push('/user/charka');
        break;
      default:
        alert('No page assigned for this role!');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), url('/Mulberry.JPG')`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: 'Arial, sans-serif' 
    }}>
      <form onSubmit={handleLogin} style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.92)', 
        padding: '35px 30px', 
        borderRadius: '12px', 
        width: '320px', 
        textAlign: 'center', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}>
        <h2 style={{ color: '#1F4E78', marginBottom: '5px', fontSize: '24px' }}>BRAC Sericulture</h2>
        <p style={{ fontSize: '13px', color: '#444', marginBottom: '25px', fontWeight: 'bold' }}>Production Reporting Login</p>
        
        <input 
          type="text" 
          placeholder="User ID" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)} 
          required 
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px', backgroundColor: '#fff' }} 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ width: '100%', padding: '12px', marginBottom: '22px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px', backgroundColor: '#fff' }} 
        />

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: '0.3s' }}>
          {loading ? 'Authenticating...' : 'Login to Dashboard'}
        </button>
      </form>
    </div>
  );
}