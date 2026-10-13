import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function CharkaPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      sl_no: i + 1, spinner_name: '', husband_father: '', cell_number: '', village: '', status: 'Active', remarks: ''
    }))
  );

  const handleInputChange = (i, field, val) => {
    const updated = [...rows];
    updated[i][field] = val;
    setRows(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToInsert = rows.filter(r => r.spinner_name.trim() !== '').map(r => ({ ...r, date }));
    const { error } = await supabase.from('charka_spinners').insert(dataToInsert);
    if (error) alert('Error: ' + error.message);
    else alert('Charka Spinners Statement Saved!');
  };

  return (
    <div style={{ padding: '15px', fontFamily: 'Arial' }}>
      <h3 style={{ textAlign: 'center', color: '#1F4E78' }}>Detail Statement Charka Spinners</h3>
      <div style={{ marginBottom: '10px' }}>
        <label><strong>Date: </strong></label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '5px' }} />
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
                <th>SL</th><th>Spinner Name</th><th>Husband/Father</th><th>Cell Number</th><th>Village</th><th>Status</th><th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>{r.sl_no}</td>
                  <td><input type="text" value={r.spinner_name} onChange={(e) => handleInputChange(i, 'spinner_name', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="text" value={r.husband_father} onChange={(e) => handleInputChange(i, 'husband_father', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="text" value={r.cell_number} onChange={(e) => handleInputChange(i, 'cell_number', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="text" value={r.village} onChange={(e) => handleInputChange(i, 'village', e.target.value)} style={{ width: '100%' }} /></td>
                  <td>
                    <select value={r.status} onChange={(e) => handleInputChange(i, 'status', e.target.value)}>
                      <option value="Active">Active</option>
                      <option value="InActive">InActive</option>
                      <option value="New">New</option>
                    </select>
                  </td>
                  <td><input type="text" value={r.remarks} onChange={(e) => handleInputChange(i, 'remarks', e.target.value)} style={{ width: '100%' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="submit" style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#2E7D32', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Save Statement</button>
      </form>
    </div>
  );
}