import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProductionReportForm({ type, onSaved }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [viewMode, setViewMode] = useState('entry'); // 'entry' or 'history'
  const [rows, setRows] = useState([
    { weaver_name: '', target_saree: '', prod_saree: '', target_noli: '', prod_noli: '' }
  ]);
  const [historyData, setHistoryData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const tableName = type === 'saree' ? 'saree_production' : type === 'dopatta' ? 'dopatta_production' : 'tana_production';

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { weaver_name: '', target_saree: '', prod_saree: '', target_noli: '', prod_noli: '' }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const insertData = rows
      .filter(r => r.weaver_name.trim() !== '')
      .map(r => ({
        date,
        weaver_name: r.weaver_name,
        target: Number(r.target_saree || 0),
        production: Number(r.prod_saree || 0),
        noli_target: Number(r.target_noli || 0),
        noli_production: Number(r.prod_noli || 0),
      }));

    if (insertData.length === 0) {
      alert('At least 1 row fill up korun!');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from(tableName).insert(insertData);
    setSaving(false);

    if (error) {
      alert('Error saving data: ' + error.message);
    } else {
      alert('Data successfully save hoyeche!');
      setRows([{ weaver_name: '', target_saree: '', prod_saree: '', target_noli: '', prod_noli: '' }]);
      if (onSaved) onSaved();
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    setLoadingHistory(false);
    if (!error && data) {
      setHistoryData(data);
    }
  };

  // Built-in CSV Excel Export
  const exportExcelCSV = () => {
    if (historyData.length === 0) return alert('No data to export!');
    let csvContent = 'data:text/csv;charset=utf-8,Date,Weaver Name,Target,Production,Noli Target,Noli Production\n';
    historyData.forEach(r => {
      csvContent += `${r.date},"${r.weaver_name}",${r.target},${r.production},${r.noli_target},${r.noli_production}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser Native Print / PDF Download
  const exportPDFPrint = () => {
    window.print();
  };

  const shareWhatsApp = () => {
    let msg = `*BRAC Sericulture ${type.toUpperCase()} Report*\nDate: ${startDate} to ${endDate}\n\n`;
    historyData.forEach((d, i) => {
      msg += `${i + 1}. ${d.weaver_name} (${d.date}): Target ${d.target}, Prod ${d.production}\n`;
    });
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Dynamic Action Mode Selection */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button onClick={() => setViewMode('entry')} style={{ flex: 1, padding: '10px', backgroundColor: viewMode === 'entry' ? '#1F4E78' : '#E0E0E0', color: viewMode === 'entry' ? 'white' : 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          📝 Data Entry Mode
        </button>
        <button onClick={() => { setViewMode('history'); fetchHistory(); }} style={{ flex: 1, padding: '10px', backgroundColor: viewMode === 'history' ? '#1F4E78' : '#E0E0E0', color: viewMode === 'history' ? 'white' : 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          📊 View Previous Records
        </button>
      </div>

      {viewMode === 'entry' ? (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <label><strong>Entry Date: </strong></label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
                  <th rowSpan="2">SL</th>
                  <th rowSpan="2">Weaver Name</th>
                  <th colSpan="2">{type.toUpperCase()}</th>
                  <th colSpan="2">{type === 'tana' ? 'Yarn Use' : 'Noli Use'}</th>
                  <th rowSpan="2">Action</th>
                </tr>
                <tr style={{ backgroundColor: '#2F5597', color: 'white' }}>
                  <th>Target</th>
                  <th>Production</th>
                  <th>Target</th>
                  <th>Production</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <input 
                        type="text" 
                        placeholder="Type or select name" 
                        value={row.weaver_name} 
                        onChange={(e) => handleRowChange(index, 'weaver_name', e.target.value)} 
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                    </td>
                    <td><input type="number" value={row.target_saree} onChange={(e) => handleRowChange(index, 'target_saree', e.target.value)} style={{ width: '70px', padding: '6px' }} /></td>
                    <td><input type="number" value={row.prod_saree} onChange={(e) => handleRowChange(index, 'prod_saree', e.target.value)} style={{ width: '70px', padding: '6px' }} /></td>
                    <td><input type="number" value={row.target_noli} onChange={(e) => handleRowChange(index, 'target_noli', e.target.value)} style={{ width: '70px', padding: '6px' }} /></td>
                    <td><input type="number" value={row.prod_noli} onChange={(e) => handleRowChange(index, 'prod_noli', e.target.value)} style={{ width: '70px', padding: '6px' }} /></td>
                    <td>
                      {rows.length > 1 && (
                        <button onClick={() => removeRow(index)} style={{ backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>❌</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={addRow} style={{ padding: '10px 18px', backgroundColor: '#0288D1', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              ➕ Add Row
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 18px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {saving ? 'Saving...' : '💾 Save Data'}
            </button>
          </div>
        </div>
      ) : (
        /* History & Date Filtering Mode */
        <div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#F0F4F8', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>From Date:</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ display: 'block', padding: '6px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>To Date:</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ display: 'block', padding: '6px' }} />
            </div>
            <button onClick={fetchHistory} style={{ marginTop: '15px', padding: '8px 16px', backgroundColor: '#1F4E78', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              🔍 Search Records
            </button>
          </div>

          {/* Export Action Controls */}
          {historyData.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <button onClick={exportExcelCSV} style={{ padding: '8px 14px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                📥 Download Excel (.csv)
              </button>
              <button onClick={exportPDFPrint} style={{ padding: '8px 14px', backgroundColor: '#D32F2F', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                🖨️ Save as PDF / Print
              </button>
              <button onClick={shareWhatsApp} style={{ padding: '8px 14px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                📲 Share via WhatsApp
              </button>
            </div>
          )}

          {loadingHistory ? (
            <div>Loading records...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
                    <th>Date</th>
                    <th>Weaver Name</th>
                    <th>Target</th>
                    <th>Prod</th>
                    <th>Noli Target</th>
                    <th>Noli Prod</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No record found for selected date range.</td></tr>
                  ) : (
                    historyData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td><strong>{row.weaver_name}</strong></td>
                        <td>{row.target}</td>
                        <td>{row.production}</td>
                        <td>{row.noli_target}</td>
                        <td>{row.noli_production}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}