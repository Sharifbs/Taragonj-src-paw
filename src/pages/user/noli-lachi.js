import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NoliLachiReportForm from '../../components/NoliLachiReportForm';

export default function NoliLachiPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (!session) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(session);
    if (parsedUser.role !== 'noli_lachi' && parsedUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(parsedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/');
  };

  if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '15px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1F4E78', padding: '12px 20px', color: 'white', borderRadius: '6px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px' }}>BRAC Sericulture (Taragonj SRC)</h2>
          <small>Logged in as: <strong>{user.user_id}</strong> (Noli & Endi Lachi Module)</small>
        </div>
        <button onClick={handleLogout} style={{ padding: '6px 14px', backgroundColor: '#D32F2F', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h3 className="no-print" style={{ color: '#1F4E78', marginTop: 0, marginBottom: '15px', borderBottom: '2px solid #1F4E78', paddingBottom: '8px' }}>
          Noli & Endi Lachi Daily Production Entry
        </h3>
        <NoliLachiReportForm />
      </div>
    </div>
  );
}