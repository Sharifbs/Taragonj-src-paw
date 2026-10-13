import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProductionReportForm({ type = 'saree' }) {
  const isSaree = type === 'saree';
  const tableName = isSaree ? 'saree_production' : 'dopatta_production';
  const itemLabel = isSaree ? 'Saree' : 'Dopatta';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState(
    Array.from({ length: 15 }, (_, i) => ({
      sl_no: i + 1,
      weaver_name: '',
      target: '',
      production: '',
      noli_target: '',
      noli_production: ''
    }))
  );

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToInsert = rows
      .filter((r) => r.weaver_name.trim() !== '')
      .map((r) => ({
        date,
        sl_no: r.sl_no,
        weaver_name: r.weaver_name,
        target: parseFloat(r.target || 0),
        production: parseFloat(r.production || 0),
        noli_target: parseFloat(r.noli_target || 0),
        noli_production: parseFloat(r.noli_production || 0)
      }));

    if (dataToInsert.length === 0) return alert('At least 1 Weaver Name is required!');

    const { error } = await supabase.from(tableName).insert(dataToInsert);
    if (error) alert('Error: ' + error.message);
    else alert(`Daily ${itemLabel} Report Saved Successfully!`);
  };

  return (
    <div style={{ padding: '15px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h3 style={{ textAlign: 'center', color: '#1F4E78' }}>Daily Production Report ({itemLabel})</h3>
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
                <th>Target</th>
                <th>Production</th>
                <th>Target</th>
                <th>Production</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>{row.sl_no}</td>
                  <td><input type="text" value={row.weaver_name} onChange={(e) => handleInputChange(i, 'weaver_name', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={row.target} onChange={(e) => handleInputChange(i, 'target', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={row.production} onChange={(e) => handleInputChange(i, 'production', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={row.noli_target} onChange={(e) => handleInputChange(i, 'noli_target', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={row.noli_production} onChange={(e) => handleInputChange(i, 'noli_production', e.target.value)} style={{ width: '100%' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="submit" style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#2E7D32', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          Save Report
        </button>
      </form>
    </div>
  );
}