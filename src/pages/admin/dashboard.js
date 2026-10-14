import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import ProductionReportForm from '../../components/ProductionReportForm';
import NoliLachiReportForm from '../../components/NoliLachiReportForm';
import CharkaSpinnersForm from '../../components/CharkaSpinnersForm';
import UserManagementForm from '../../components/UserManagementForm';
import AttendanceReportForm from '../../components/AttendanceReportForm';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('saree');
  
  // Date range filter for Admin Reports
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [todayStats, setTodayStats] = useState({
    sareeProd: 0, sareeNoli: 0,
    dopattaProd: 0, dopattaNoli: 0,
    tanaProd: 0, yarnUse: 0,
    spinnersActive: 0, spinnersNew: 0, spinnersInactive: 0, spinnersTotal: 0,
    attPresent: 0, attAbsent: 0, attTotal: 0
  });

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

    // Saree Summary
    const { data: saree } = await supabase.from('saree_production').select('production, noli_production').eq('date', todayDate);
    const sareeProd = saree?.reduce((sum, r) => sum + Number(r.production || 0), 0) || 0;
    const sareeNoli = saree?.reduce((sum, r) => sum + Number(r.noli_production || 0), 0) || 0;

    // Dopatta Summary
    const { data: dopatta } = await supabase.from('dopatta_production').select('production, noli_production').eq('date', todayDate);
    const dopattaProd = dopatta?.reduce((sum, r) => sum + Number(r.production || 0), 0) || 0;
    const dopattaNoli = dopatta?.reduce((sum, r) => sum + Number(r.noli_production || 0), 0) || 0;

    // Tana Summary
    const { data: tana } = await supabase.from('tana_production').select('production, noli_production').eq('date', todayDate);
    const tanaProd = tana?.reduce((sum, r) => sum + Number(r.production || 0), 0) || 0;
    const yarnUse = tana?.reduce((sum, r) => sum + Number(r.noli_production || 0), 0) || 0;

    // Charka Summary
    const { data: spinners } = await supabase.from('charka_spinners').select('status').eq('date', todayDate);
    const spinnersActive = spinners?.filter(s => s.status === 'Active').length || 0;
    const spinnersNew = spinners?.filter(s => s.status === 'New').length || 0;
    const spinnersInactive = spinners?.filter(s => s.status === 'InActive').length || 0;

    // Attendance Summary
    const { data: attendance } = await supabase.from('attendance_records').select('status').eq('date', todayDate);
    const attPresent = attendance?.filter(a => a.status === 'Present').length || 0;
    const attAbsent = attendance?.filter(a => a.status === 'Absent').length || 0;

    setTodayStats({
      sareeProd, sareeNoli,
      dopattaProd, dopattaNoli,
      tanaProd, yarnUse,
      spinnersActive, spinnersNew, spinnersInactive,
      spinnersTotal: spinners?.length || 0,
      attPresent, attAbsent,
      attTotal: attendance?.length || 0
    });
  };

  // Admin Multi-Sheet Master Excel Export (using 'xlsx')
  const exportMasterExcel = async () => {
    const { data: saree } = await supabase.from('saree_production').select('*').gte('date', startDate).lte('date', endDate);
    const { data: dopatta } = await supabase.from('dopatta_production').select('*').gte('date', startDate).lte('date', endDate);
    const { data: tana } = await supabase.from('tana_production').select('*').gte('date', startDate).lte('date', endDate);
    const { data: noliLachi } = await supabase.from('noli_lachi_production').select('*').gte('date', startDate).lte('date', endDate);
    const { data: charka } = await supabase.from('charka_spinners').select('*').gte('date', startDate).lte('date', endDate);
    const { data: attendance } = await supabase.from('attendance_records').select('*').gte('date', startDate).lte('date', endDate);

    const wb = XLSX.utils.book_new();

    if (saree && saree.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(saree), 'Saree Report');
    if (dopatta && dopatta.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dopatta), 'Dopatta Report');
    if (tana && tana.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tana), 'Tana Report');
    if (noliLachi && noliLachi.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(noliLachi), 'Noli & Lachi');
    if (charka && charka.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(charka), 'Charka Report');
    if (attendance && attendance.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendance), 'Attendance Log');

    XLSX.writeFile(wb, `BRAC_Master_Production_Report_${startDate}_to_${endDate}.xlsx`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/');
  };

  if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Dashboard...</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '12px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1F4E78', padding: '12px 15px', color: 'white', borderRadius: '6px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px' }}>BRAC Sericulture Dashboard</h2>
          <small>User: <strong>{user.user_id}</strong> ({user.role ? user.role.toUpperCase() : 'ADMIN'})</small>
        </div>
        <button onClick={handleLogout} style={{ padding: '6px 14px', backgroundColor: '#D32F2F', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      {/* Live Summary Widgets */}
      <div style={{ marginTop: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1F4E78' }}>Today's Live Production & Attendance Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #2F5597', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Saree Prod</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#1F4E78' }}>{todayStats.sareeProd} Pcs</h3>
            <small style={{ color: '#555', fontSize: '10px' }}>Noli: {todayStats.sareeNoli}</small>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #2E7D32', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Dopatta Prod</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#2E7D32' }}>{todayStats.dopattaProd} Pcs</h3>
            <small style={{ color: '#555', fontSize: '10px' }}>Noli: {todayStats.dopattaNoli}</small>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #ED6C02', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Tana Prod</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#ED6C02' }}>{todayStats.tanaProd}</h3>
            <small style={{ color: '#555', fontSize: '10px' }}>Yarn: {todayStats.yarnUse}</small>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #9C27B0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Spinner Visits</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#9C27B0' }}>{todayStats.spinnersTotal}</h3>
            <small style={{ color: '#555', fontSize: '10px' }}>Act: {todayStats.spinnersActive} | New: {todayStats.spinnersNew}</small>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #009688', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Today Attendance</span>
            <h3 style={{ margin: '5px 0 0 0', color: '#009688' }}>{todayStats.attPresent} Present</h3>
            <small style={{ color: '#555', fontSize: '10px' }}>Absent: {todayStats.attAbsent} | Total: {todayStats.attTotal}</small>
          </div>
        </div>
      </div>

      {/* Admin Central Date Range Export Panel */}
      <div style={{ backgroundColor: '#E1F5FE', padding: '12px', borderRadius: '6px', marginTop: '15px', border: '1px solid #81D4FA' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#0277BD' }}>📊 Admin Master Report Export (Date Range)</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px' }} />
          <span>to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px' }} />
          <button onClick={exportMasterExcel} style={{ padding: '8px 16px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            📥 Download Multi-Sheet Master Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Tab Controls */}
      <div style={{ display: 'flex', gap: '5px', marginTop: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
        <button onClick={() => setActiveTab('saree')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'saree' ? '#1F4E78' : '#ddd', color: activeTab === 'saree' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Saree Form</button>
        <button onClick={() => setActiveTab('dopatta')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'dopatta' ? '#1F4E78' : '#ddd', color: activeTab === 'dopatta' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Dopatta Form</button>
        <button onClick={() => setActiveTab('tana')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'tana' ? '#1F4E78' : '#ddd', color: activeTab === 'tana' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Tana Form</button>
        <button onClick={() => setActiveTab('charka')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'charka' ? '#1F4E78' : '#ddd', color: activeTab === 'charka' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Charka Form</button>
        <button onClick={() => setActiveTab('noli_lachi')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'noli_lachi' ? '#1F4E78' : '#ddd', color: activeTab === 'noli_lachi' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Noli & Lachi Form</button>
        <button onClick={() => setActiveTab('attendance')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'attendance' ? '#1F4E78' : '#ddd', color: activeTab === 'attendance' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>📋 Attendance</button>
        <button onClick={() => setActiveTab('user_manage')} style={{ padding: '8px 12px', backgroundColor: activeTab === 'user_manage' ? '#2E7D32' : '#C8E6C9', color: activeTab === 'user_manage' ? 'white' : '#1B5E20', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>⚙️ Manage Users</button>
      </div>

      {/* Dynamic Tab Body */}
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', marginTop: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        {activeTab === 'saree' && <ProductionReportForm type="saree" onSaved={fetchTodaySummary} />}
        {activeTab === 'dopatta' && <ProductionReportForm type="dopatta" onSaved={fetchTodaySummary} />}
        {activeTab === 'tana' && <ProductionReportForm type="tana" onSaved={fetchTodaySummary} />}
        {activeTab === 'charka' && <CharkaSpinnersForm onSaved={fetchTodaySummary} />}
        {activeTab === 'noli_lachi' && <NoliLachiReportForm onSaved={fetchTodaySummary} />}
        {activeTab === 'attendance' && <AttendanceReportForm onSaved={fetchTodaySummary} />}
        {activeTab === 'user_manage' && <UserManagementForm />}
      </div>
    </div>
  );
}