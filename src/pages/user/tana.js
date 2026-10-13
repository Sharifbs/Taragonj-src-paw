import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function TanaPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      sl_no: i + 1, dram_master_name: '', target: '', production: '', yarn_target: '', yarn_production: ''
    }))
  );

  const handleInputChange = (i, field, val) => {
    const updated = [...rows];
    updated[i][field] = val;
    setRows(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToInsert = rows.filter(r => r.dram_master_name.trim() !== '').map(r => ({
      date, sl_no: r.sl_no, dram_master_name: r.dram_master_name,
      target: parseFloat(r.target || 0), production: parseFloat(r.production || 0),
      yarn_target: parseFloat(r.yarn_target || 0), yarn_production: parseFloat(r.yarn_production || 0)
    }));
    const { error } = await supabase.from('tana_production').insert(dataToInsert);
    if (error) alert('Error: ' + error.message);
    else alert('Drum Master Tana Report Saved!');
  };

  return (
    <div style={{ padding: '15px', fontFamily: 'Arial' }}>
      <h3 style={{ textAlign: 'center', color: '#1F4E78' }}>Daily Production Report (Tana & Yarn Use)</h3>
      <div style={{ marginBottom: '10px' }}>
        <label><strong>Date: </strong></label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '5px' }} />
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
                <th rowSpan="2">SL</th><th rowSpan="2">Dram Master Name</th><th colSpan="2">Tana</th><th colSpan="2">Yarn Use</th>
              </tr>
              <tr style={{ backgroundColor: '#2F5597', color: 'white' }}>
                <th>Target</th><th>Production</th><th>Target</th><th>Production</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>{r.sl_no}</td>
                  <td><input type="text" value={r.dram_master_name} onChange={(e) => handleInputChange(i, 'dram_master_name', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={r.target} onChange={(e) => handleInputChange(i, 'target', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={r.production} onChange={(e) => handleInputChange(i, 'production', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={r.yarn_target} onChange={(e) => handleInputChange(i, 'yarn_target', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={r.yarn_production} onChange={(e) => handleInputChange(i, 'yarn_production', e.target.value)} style={{ width: '100%' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="submit" style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#2E7D32', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Save Report</button>
      </form>
    </div>
  );
}