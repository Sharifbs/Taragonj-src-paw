import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProductionReportForm({ type, onSaved }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState([
    { weaver_name: '', target_saree: '', prod_saree: '', target_noli: '', prod_noli: '' }
  ]);
  const [saving, setSaving] = useState(false);

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
    const tableName = type === 'saree' ? 'saree_production' : type === 'dopatta' ? 'dopatta_production' : 'tana_production';

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
      alert('Please fill in at least one weaver row!');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from(tableName).insert(insertData);
    setSaving(false);

    if (error) {
      alert('Error saving data: ' + error.message);
    } else {
      alert('Production data saved successfully!');
      setRows([{ weaver_name: '', target_saree: '', prod_saree: '', target_noli: '', prod_noli: '' }]);
      if (onSaved) onSaved();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '15px' }}>
        <label><strong>Date: </strong></label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '6px' }} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center' }}>
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
                    style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                  />
                </td>
                <td><input type="number" value={row.target_saree} onChange={(e) => handleRowChange(index, 'target_saree', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                <td><input type="number" value={row.prod_saree} onChange={(e) => handleRowChange(index, 'prod_saree', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                <td><input type="number" value={row.target_noli} onChange={(e) => handleRowChange(index, 'target_noli', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                <td><input type="number" value={row.prod_noli} onChange={(e) => handleRowChange(index, 'prod_noli', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
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