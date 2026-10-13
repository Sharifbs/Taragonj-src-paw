import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CharkaSpinnersForm({ onSaved }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [viewMode, setViewMode] = useState('entry');
  const [rows, setRows] = useState([
    { spinner_name: '', husband_father: '', cell_number: '', village: '', status: 'Active', remarks: '' }
  ]);
  const [historyData, setHistoryData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { spinner_name: '', husband_father: '', cell_number: '', village: '', status: 'Active', remarks: '' }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const insertData = rows
      .filter(r => r.spinner_name.trim() !== '')
      .map(r => ({ date, ...r }));

    if (insertData.length === 0) {
      alert('Please fill in at least one Spinner Name!');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('charka_spinners').insert(insertData);
    setSaving(false);

    if (error) {
      alert('Error saving statement: ' + error.message);
    } else {
      alert('Charka Spinners Statement Saved!');
      setRows([{ spinner_name: '', husband_father: '', cell_number: '', village: '', status: 'Active', remarks: '' }]);
      if (onSaved) onSaved();
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('charka_spinners')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    setLoadingHistory(false);
    if (!error && data) setHistoryData(data);
  };

  const exportExcelCSV = () => {
    if (historyData.length === 0) return alert('No data available to export!');
    let csvContent = 'data:text/csv;charset=utf-8,Date,Spinner Name,Husband/Father,Cell Number,Village,Status,Remarks\n';
    historyData.forEach(r => {
      csvContent += `${r.date},"${r.spinner_name}","${r.husband_father}","${r.cell_number}","${r.village}",${r.status},"${r.remarks}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `charka_spinners_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button onClick={() => setViewMode('entry')} style={{ padding: '8px 16px', backgroundColor: viewMode === 'entry' ? '#1F4E78' : '#e0e0e0', color: viewMode === 'entry' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          ➕ Daily Data Entry
        </button>
        <button onClick={() => { setViewMode('history'); fetchHistory(); }} style={{ padding: '8px 16px', backgroundColor: viewMode === 'history' ? '#1F4E78' : '#e0e0e0', color: viewMode === 'history' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          📊 View History & Export
        </button>
      </div>

      {viewMode === 'entry' ? (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <label><strong>Date: </strong></label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1F4E78', color: 'white', fontSize: '14px' }}>
                  <th>SL</th>
                  <th>Spinner Name</th>
                  <th>Husband/Father</th>
                  <th>Cell Number</th>
                  <th>Village</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td><input type="text" placeholder="Name" value={row.spinner_name} onChange={(e) => handleRowChange(index, 'spinner_name', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontSize: '14px' }} /></td>
                    <td><input type="text" placeholder="Husband/Father" value={row.husband_father} onChange={(e) => handleRowChange(index, 'husband_father', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontSize: '14px' }} /></td>
                    <td><input type="tel" placeholder="Mobile" value={row.cell_number} onChange={(e) => handleRowChange(index, 'cell_number', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontSize: '14px' }} /></td>
                    <td><input type="text" placeholder="Village" value={row.village} onChange={(e) => handleRowChange(index, 'village', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontSize: '14px' }} /></td>
                    <td>
                      <select value={row.status} onChange={(e) => handleRowChange(index, 'status', e.target.value)} style={{ padding: '8px', fontSize: '14px' }}>
                        <option value="Active">Active</option>
                        <option value="New">New</option>
                        <option value="InActive">InActive</option>
                      </select>
                    </td>
                    <td><input type="text" placeholder="Remarks" value={row.remarks} onChange={(e) => handleRowChange(index, 'remarks', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontSize: '14px' }} /></td>
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

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button onClick={addRow} style={{ padding: '10px 18px', backgroundColor: '#0288D1', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              ➕ Add Row
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 18px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {saving ? 'Saving...' : '💾 Save Statement'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
            <label><strong>From:</strong></label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px' }} />
            <label><strong>To:</strong></label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px' }} />
            <button onClick={fetchHistory} style={{ padding: '6px 14px', backgroundColor: '#1F4E78', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              🔍 Search
            </button>
          </div>

          {historyData.length > 0 && (
            <button onClick={exportExcelCSV} style={{ padding: '6px 12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>
              📥 Export Excel (.csv)
            </button>
          )}

          {loadingHistory ? (
            <div>Loading statement history...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
                    <th>Date</th>
                    <th>Spinner Name</th>
                    <th>Husband/Father</th>
                    <th>Cell</th>
                    <th>Village</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((r) => (
                    <tr key={r.id}>
                      <td>{r.date}</td>
                      <td>{r.spinner_name}</td>
                      <td>{r.husband_father}</td>
                      <td>{r.cell_number}</td>
                      <td>{r.village}</td>
                      <td>{r.status}</td>
                      <td>{r.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}