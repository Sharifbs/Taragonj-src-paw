import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AttendanceReportForm from '../../components/AttendanceReportForm';

export default function UserAttendancePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (!session) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(session));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/');
  };

  if (!user) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '15px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#1F4E78', 
        color: 'white', 
        padding: '12px 20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>BRAC Sericulture - Attendance Module</h3>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>Logged in as: <strong>{user.user_id}</strong></span>
        </div>
        <button onClick={handleLogout} style={{ backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <AttendanceReportForm />
      </div>
    </div>
  );
}