import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CharkaSpinnersForm({ onSaved }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState([
    { spinner_name: '', husband_father: '', cell_number: '', village: '', status: 'Active', remarks: '' }
  ]);
  const [saving, setSaving] = useState(false);

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

  return (
    <div style={{ fontFamily: 'Arial' }}>
      <div style={{ marginBottom: '15px' }}>
        <label><strong>Date: </strong></label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '6px' }} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
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
                <td><input type="text" value={row.spinner_name} onChange={(e) => handleRowChange(index, 'spinner_name', e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></td>
                <td><input type="text" value={row.husband_father} onChange={(e) => handleRowChange(index, 'husband_father', e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></td>
                <td><input type="text" value={row.cell_number} onChange={(e) => handleRowChange(index, 'cell_number', e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></td>
                <td><input type="text" value={row.village} onChange={(e) => handleRowChange(index, 'village', e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></td>
                <td>
                  <select value={row.status} onChange={(e) => handleRowChange(index, 'status', e.target.value)} style={{ padding: '4px' }}>
                    <option value="Active">Active</option>
                    <option value="New">New</option>
                    <option value="InActive">InActive</option>
                  </select>
                </td>
                <td><input type="text" value={row.remarks} onChange={(e) => handleRowChange(index, 'remarks', e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></td>
                <td>
                  {rows.length > 1 && (
                    <button onClick={() => removeRow(index)} style={{ backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>❌</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button onClick={addRow} style={{ padding: '8px 16px', backgroundColor: '#0288D1', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          ➕ Add Row
        </button>
        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          {saving ? 'Saving...' : '💾 Save Statement'}
        </button>
      </div>
    </div>
  );
}