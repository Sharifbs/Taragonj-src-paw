import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProductionReportForm({ type = 'saree', onSaved }) {
  const isSaree = type === 'saree';
  const tableName = isSaree ? 'saree_production' : 'dopatta_production';
  const itemLabel = isSaree ? 'Saree' : 'Dopatta';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [savedWeavers, setSavedWeavers] = useState([]);
  const [rows, setRows] = useState([
    { sl_no: 1, weaver_name: '', target: '', production: '', noli_target: '', noli_production: '' }
  ]);

  useEffect(() => {
    fetchSavedWeavers();
  }, []);

  const fetchSavedWeavers = async () => {
    const { data } = await supabase.from('master_workers').select('worker_name').eq('role_type', 'weaver');
    if (data) setSavedWeavers(data.map(d => d.worker_name));
  };

  const addRow = () => {
    setRows([...rows, { sl_no: rows.length + 1, weaver_name: '', target: '', production: '', noli_target: '', noli_production: '' }]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validRows = rows.filter((r) => r.weaver_name.trim() !== '');

    if (validRows.length === 0) return alert('At least 1 Weaver Name is required!');

    // Save auto-suggestion master names
    const newNames = validRows.map(r => ({ worker_name: r.weaver_name.trim(), role_type: 'weaver' }));
    await supabase.from('master_workers').upsert(newNames, { onConflict: 'worker_name' });

    // Save Data
    const dataToInsert = validRows.map((r) => ({
      date,
      sl_no: r.sl_no,
      weaver_name: r.weaver_name,
      target: parseFloat(r.target || 0),
      production: parseFloat(r.production || 0),
      noli_target: parseFloat(r.noli_target || 0),
      noli_production: parseFloat(r.noli_production || 0)
    }));

    const { error } = await supabase.from(tableName).insert(dataToInsert);
    if (error) alert('Error: ' + error.message);
    else {
      alert(`Daily ${itemLabel} Report Saved Successfully!`);
      fetchSavedWeavers();
      if (onSaved) onSaved();
    }
  };

  return (
    <div style={{ fontFamily: 'Arial' }}>
      <datalist id="weaver-suggestions">
        {savedWeavers.map((name, i) => <option key={i} value={name} />)}
      </datalist>

      <h3 style={{ color: '#1F4E78', marginTop: 0 }}>{itemLabel} Daily Production Entry</h3>
      <div style={{ marginBottom: '10px' }}>
        <label><strong>Date: </strong></label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '5px' }} />
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
                <th rowSpan="2">SL</th>
                <th rowSpan="2">Weaver Name</th>
                <th colSpan="2">{itemLabel}</th>
                <th colSpan="2">Noli Use</th>
              </tr>
              <tr style={{ backgroundColor: '#2F5597', color: 'white' }}>
                <th>Target</th><th>Production</th><th>Target</th><th>Production</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>{row.sl_no}</td>
                  <td>
                    <input 
                      type="text" 
                      list="weaver-suggestions" 
                      value={row.weaver_name} 
                      onChange={(e) => handleInputChange(i, 'weaver_name', e.target.value)} 
                      placeholder="Type or select name"
                      style={{ width: '100%', boxSizing: 'border-box' }} 
                    />
                  </td>
                  <td><input type="number" value={row.target} onChange={(e) => handleInputChange(i, 'target', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={row.production} onChange={(e) => handleInputChange(i, 'production', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={row.noli_target} onChange={(e) => handleInputChange(i, 'noli_target', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={row.noli_production} onChange={(e) => handleInputChange(i, 'noli_production', e.target.value)} style={{ width: '100%' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="button" onClick={addRow} style={{ padding: '8px 15px', backgroundColor: '#0288D1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            ➕ Add Row
          </button>
          <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            💾 Save Data
          </button>
        </div>
      </form>
    </div>
  );
}