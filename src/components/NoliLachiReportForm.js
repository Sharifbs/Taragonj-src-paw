import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function NoliLachiReportForm({ onSaved }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState([
    { sl_no: 1, spinner_name: '', village: '', supply_cocoon: '', lachi_received: '', noli_received: '' }
  ]);

  const addRow = () => {
    setRows([...rows, { sl_no: rows.length + 1, spinner_name: '', village: '', supply_cocoon: '', lachi_received: '', noli_received: '' }]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validRows = rows.filter((r) => r.spinner_name.trim() !== '');

    if (validRows.length === 0) return alert('Spinner Name Required!');

    const dataToInsert = validRows.map((r) => ({
      date,
      sl_no: r.sl_no,
      spinner_name: r.spinner_name,
      village: r.village,
      supply_cocoon: parseFloat(r.supply_cocoon || 0),
      lachi_received: parseFloat(r.lachi_received || 0),
      noli_received: parseFloat(r.noli_received || 0)
    }));

    const { error } = await supabase.from('noli_lachi_production').insert(dataToInsert);
    if (error) alert('Error: ' + error.message);
    else {
      alert('Daily Noli/Endi Lachi Report Saved Successfully!');
      if (onSaved) onSaved();
    }
  };

  return (
    <div style={{ fontFamily: 'Arial' }}>
      <h3 style={{ color: '#1F4E78', marginTop: 0 }}>Daily Noli / Endi Lachi Entry</h3>
      <div style={{ marginBottom: '10px' }}>
        <label><strong>Date: </strong></label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '5px' }} />
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
                <th>SL</th>
                <th>Spinner Name</th>
                <th>Village</th>
                <th>Supply Cocoon</th>
                <th>Lachi Received</th>
                <th>Noli Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>{row.sl_no}</td>
                  <td><input type="text" value={row.spinner_name} onChange={(e) => handleInputChange(i, 'spinner_name', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="text" value={row.village} onChange={(e) => handleInputChange(i, 'village', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={row.supply_cocoon} onChange={(e) => handleInputChange(i, 'supply_cocoon', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={row.lachi_received} onChange={(e) => handleInputChange(i, 'lachi_received', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={row.noli_received} onChange={(e) => handleInputChange(i, 'noli_received', e.target.value)} style={{ width: '100%' }} /></td>
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