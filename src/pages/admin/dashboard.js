import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import ProductionReportForm from '../../components/ProductionReportForm';
import NoliLachiReportForm from '../../components/NoliLachiReportForm';
import UserManagementForm from '../../components/UserManagementForm';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [todayStats, setTodayStats] = useState({
    sareeProd: 0, sareeNoli: 0,
    dopattaProd: 0, dopattaNoli: 0,
    tanaProd: 0, yarnUse: 0,
    spinnersActive: 0, spinnersNew: 0, spinnersInactive: 0, spinnersTotal: 0
  });
  const [activeTab, setActiveTab] = useState('saree');
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (!session) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(session));
    fetchTodaySummary();
  }, []);

  const fetchTodaySummary = async () => {
    const todayDate = new Date().toISOString().split('T')[0];

    const { data: saree } = await supabase.from('saree_production').select('production, noli_production').eq('date', todayDate);
    const sareeProd = saree?.reduce((sum, r) => sum + Number(r.production || 0), 0) || 0;
    const sareeNoli = saree?.reduce((sum, r) => sum + Number(r.noli_production || 0), 0) || 0;

    const { data: dopatta } = await supabase.from('dopatta_production').select('production, noli_production').eq('date', todayDate);
    const dopattaProd = dopatta?.reduce((sum, r) => sum + Number(r.production || 0), 0) || 0;
    const dopattaNoli = dopatta?.reduce((sum, r) => sum + Number(r.noli_production || 0), 0) || 0;

    const { data: tana } = await supabase.from('tana_production').select('production, yarn_production').eq('date', todayDate);
    const tanaProd = tana?.reduce((sum, r) => sum + Number(r.production || 0), 0) || 0;
    const yarnUse = tana?.reduce((sum, r) => sum + Number(r.yarn_production || 0), 0) || 0;

    const { data: spinners } = await supabase.from('charka_spinners').select('status').eq('date', todayDate);
    const spinnersActive = spinners?.filter(s => s.status === 'Active').length || 0;
    const spinnersNew = spinners?.filter(s => s.status === 'New').length || 0;
    const spinnersInactive = spinners?.filter(s => s.status === 'InActive').length || 0;

    setTodayStats({
      sareeProd, sareeNoli,
      dopattaProd, dopattaNoli,
      tanaProd, yarnUse,
      spinnersActive, spinnersNew, spinnersInactive,
      spinnersTotal: spinners?.length || 0
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/');
  };

  if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Dashboard...</div>;

  const isAdmin = user.role === 'admin';

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '15px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1F4E78', padding: '12px 20px', color: 'white', borderRadius: '6px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px' }}>BRAC Sericulture Admin Dashboard</h2>
          <small>User: <strong>{user.user_id}</strong> ({user.role.toUpperCase()})</small>
        </div>
        <button onClick={handleLogout} style={{ padding: '6px 12px', backgroundColor: '#D32F2F', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>

      {/* Widgets */}
      <div style={{ marginTop: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1F4E78' }}>Today's Live Production Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #2F5597', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Saree Production</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#1F4E78' }}>{todayStats.sareeProd} Pcs</h3>
            <small style={{ color: '#555' }}>Noli Use: {todayStats.sareeNoli}</small>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #2E7D32', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Dopatta Production</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#2E7D32' }}>{todayStats.dopattaProd} Pcs</h3>
            <small style={{ color: '#555' }}>Noli Use: {todayStats.dopattaNoli}</small>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #ED6C02', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Tana Production</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#ED6C02' }}>{todayStats.tanaProd}</h3>
            <small style={{ color: '#555' }}>Yarn Use: {todayStats.yarnUse}</small>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #9C27B0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Spinner Visits Today</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#9C27B0' }}>{todayStats.spinnersTotal}</h3>
            <small style={{ color: '#555' }}>Active: {todayStats.spinnersActive} | New: {todayStats.spinnersNew} | Inactive: {todayStats.spinnersInactive}</small>
          </div>
        </div>
      </div>

      {/* Module Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginTop: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('saree')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'saree' ? '#1F4E78' : '#ddd', color: activeTab === 'saree' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Saree Form</button>
        <button onClick={() => setActiveTab('dopatta')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'dopatta' ? '#1F4E78' : '#ddd', color: activeTab === 'dopatta' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Dopatta Form</button>
        <button onClick={() => setActiveTab('noli_lachi')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'noli_lachi' ? '#1F4E78' : '#ddd', color: activeTab === 'noli_lachi' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Noli & Endi Lachi Form</button>
        
        {/* User Management Tab only for Admin */}
        {isAdmin && (
          <button onClick={() => setActiveTab('user_manage')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'user_manage' ? '#2E7D32' : '#C8E6C9', color: activeTab === 'user_manage' ? 'white' : '#1B5E20', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            ⚙️ Manage Users / Create Admin
          </button>
        )}
      </div>

      {/* Tab Output */}
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', marginTop: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        {activeTab === 'saree' && <ProductionReportForm type="saree" onSaved={fetchTodaySummary} />}
        {activeTab === 'dopatta' && <ProductionReportForm type="dopatta" onSaved={fetchTodaySummary} />}
        {activeTab === 'noli_lachi' && <NoliLachiReportForm onSaved={fetchTodaySummary} />}
        {activeTab === 'user_manage' && <UserManagementForm />}
      </div>
    </div>
  );
}