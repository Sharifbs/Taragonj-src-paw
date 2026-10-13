import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function NoliLachiReportForm({ onSaved }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState([
    { spinner_name: '', cocoon_target: '', cocoon_prod: '', noli_prod: '', lachi_prod: '' }
  ]);
  const [saving, setSaving] = useState(false);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { spinner_name: '', cocoon_target: '', cocoon_prod: '', noli_prod: '', lachi_prod: '' }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const insertData = rows
      .filter(r => r.spinner_name.trim() !== '')
      .map(r => ({
        date,
        spinner_name: r.spinner_name,
        cocoon_target: Number(r.cocoon_target || 0),
        cocoon_prod: Number(r.cocoon_prod || 0),
        noli_prod: Number(r.noli_prod || 0),
        lachi_prod: Number(r.lachi_prod || 0),
      }));

    if (insertData.length === 0) {
      alert('Please fill in at least one Spinner Name!');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('noli_lachi_production').insert(insertData);
    setSaving(false);

    if (error) {
      alert('Error saving data: ' + error.message);
    } else {
      alert('Noli & Endi Lachi report saved successfully!');
      setRows([{ spinner_name: '', cocoon_target: '', cocoon_prod: '', noli_prod: '', lachi_prod: '' }]);
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
              <th rowSpan="2">SL</th>
              <th rowSpan="2">Spinner Name</th>
              <th colSpan="2">Cocoon Supply</th>
              <th rowSpan="2">Noli Production</th>
              <th rowSpan="2">Endi Lachi Production</th>
              <th rowSpan="2">Action</th>
            </tr>
            <tr style={{ backgroundColor: '#2F5597', color: 'white' }}>
              <th>Target</th>
              <th>Production</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td><input type="text" value={row.spinner_name} onChange={(e) => handleRowChange(index, 'spinner_name', e.target.value)} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} /></td>
                <td><input type="number" value={row.cocoon_target} onChange={(e) => handleRowChange(index, 'cocoon_target', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                <td><input type="number" value={row.cocoon_prod} onChange={(e) => handleRowChange(index, 'cocoon_prod', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                <td><input type="number" value={row.noli_prod} onChange={(e) => handleRowChange(index, 'noli_prod', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                <td><input type="number" value={row.lachi_prod} onChange={(e) => handleRowChange(index, 'lachi_prod', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
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
          {saving ? 'Saving...' : '💾 Save Data'}
        </button>
      </div>
    </div>
  );
}