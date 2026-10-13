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
  const [savedWeavers, setSavedWeavers] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const tableName = type === 'saree' ? 'saree_production' : type === 'dopatta' ? 'dopatta_production' : 'tana_production';

  useEffect(() => {
    fetchWeavers();
  }, [type]);

  const fetchWeavers = async () => {
    const { data, error } = await supabase
      .from(tableName)
      .select('weaver_name, target, noli_target')
      .order('id', { ascending: false });

    if (!error && data) {
      const uniqueWeaversMap = new Map();
      data.forEach(item => {
        if (item.weaver_name && !uniqueWeaversMap.has(item.weaver_name.trim())) {
          uniqueWeaversMap.set(item.weaver_name.trim(), {
            name: item.weaver_name.trim(),
            target: item.target || '',
            noli_target: item.noli_target || ''
          });
        }
      });
      setSavedWeavers(Array.from(uniqueWeaversMap.values()));
    }
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleSelectWeaver = (index, weaverName) => {
    const selected = savedWeavers.find(w => w.name === weaverName);
    const updatedRows = [...rows];
    if (selected) {
      updatedRows[index].weaver_name = selected.name;
      updatedRows[index].target_saree = selected.target;
      updatedRows[index].target_noli = selected.noli_target;
    } else {
      updatedRows[index].weaver_name = weaverName;
    }
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
        weaver_name: r.weaver_name.trim(),
        target: Number(r.target_saree || 0),
        production: Number(r.prod_saree || 0),
        noli_target: Number(r.target_noli || 0),
        noli_production: Number(r.prod_noli || 0),
      }));

    if (insertData.length === 0) {
      alert('Please fill in at least one Weaver Name!');
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
      fetchWeavers();
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

  const exportExcelCSV = () => {
    if (historyData.length === 0) return alert('No data available to export!');
    let csvContent = 'data:text/csv;charset=utf-8,Date,Weaver Name,Target,Production,Noli Target,Noli Production\n';
    historyData.forEach(r => {
      csvContent += `${r.date},"${r.weaver_name}",${r.target},${r.production},${r.noli_target},${r.noli_production}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_production_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDFPrint = () => {
    window.print();
  };

  const shareWhatsApp = () => {
    let msg = `*BRAC Sericulture (${type.toUpperCase()}) Report*\nDate Range: ${startDate} to ${endDate}\n\n`;
    historyData.forEach((d, i) => {
      msg += `${i + 1}. ${d.weaver_name} (${d.date}): Target ${d.target}, Prod ${d.production}\n`;
    });
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalTarget = historyData.reduce((acc, curr) => acc + Number(curr.target || 0), 0);
  const totalProd = historyData.reduce((acc, curr) => acc + Number(curr.production || 0), 0);
  const totalNoliTarget = historyData.reduce((acc, curr) => acc + Number(curr.noli_target || 0), 0);
  const totalNoliProd = historyData.reduce((acc, curr) => acc + Number(curr.noli_production || 0), 0);

  return (
    <div>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 20px;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #333 !important;
            padding: 6px !important;
            font-size: 12px !important;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      {/* Navigation Buttons */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button onClick={() => setViewMode('entry')} style={{ padding: '8px 16px', backgroundColor: viewMode === 'entry' ? '#1F4E78' : '#e0e0e0', color: viewMode === 'entry' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          ➕ Daily Data Entry
        </button>
        <button onClick={() => { setViewMode('history'); fetchHistory(); }} style={{ padding: '8px 16px', backgroundColor: viewMode === 'history' ? '#1F4E78' : '#e0e0e0', color: viewMode === 'history' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          📊 View Saved History & Export
        </button>
      </div>

      {viewMode === 'entry' ? (
        <div>
          <div className="no-print" style={{ marginBottom: '15px' }}>
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
                  <th rowSpan="2" className="no-print">Action</th>
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
                        list={`weaver-list-${index}`}
                        placeholder="Type or select name" 
                        value={row.weaver_name} 
                        onChange={(e) => handleSelectWeaver(index, e.target.value)} 
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                      <datalist id={`weaver-list-${index}`}>
                        {savedWeavers.map((w, i) => (
                          <option key={i} value={w.name}>{w.name}</option>
                        ))}
                      </datalist>
                    </td>
                    <td><input type="number" value={row.target_saree} onChange={(e) => handleRowChange(index, 'target_saree', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                    <td><input type="number" value={row.prod_saree} onChange={(e) => handleRowChange(index, 'prod_saree', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                    <td><input type="number" value={row.target_noli} onChange={(e) => handleRowChange(index, 'target_noli', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                    <td><input type="number" value={row.prod_noli} onChange={(e) => handleRowChange(index, 'prod_noli', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                    <td className="no-print">
                      {rows.length > 1 && (
                        <button onClick={() => removeRow(index)} style={{ backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>❌</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="no-print" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button onClick={addRow} style={{ padding: '8px 16px', backgroundColor: '#0288D1', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              ➕ Add Row
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {saving ? 'Saving...' : '💾 Save Data'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="no-print" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
            <label><strong>From:</strong></label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px' }} />
            <label><strong>To:</strong></label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px' }} />
            <button onClick={fetchHistory} style={{ padding: '6px 14px', backgroundColor: '#1F4E78', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              🔍 Search
            </button>
          </div>

          {historyData.length > 0 && (
            <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <button onClick={exportExcelCSV} style={{ padding: '6px 12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                📥 Export Excel (.csv)
              </button>
              <button onClick={exportPDFPrint} style={{ padding: '6px 12px', backgroundColor: '#D32F2F', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                🖨️ PDF / Print
              </button>
              <button onClick={shareWhatsApp} style={{ padding: '6px 12px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                📲 Send to WhatsApp
              </button>
            </div>
          )}

          <div className="print-header">
            <h1 style={{ margin: 0, color: '#1F4E78', fontSize: '24px' }}>BRAC Sericulture Enterprise</h1>
            <h3 style={{ margin: '4px 0', color: '#555', fontSize: '16px' }}>Taragonj Silk Production Center</h3>
            <h4 style={{ margin: '5px 0', fontSize: '15px' }}><strong>{type.toUpperCase()} Production Statement Report</strong></h4>
            <p style={{ margin: '2px 0 15px 0', fontSize: '12px', color: '#666' }}>Date Range: {startDate} to {endDate}</p>
          </div>

          {loadingHistory ? (
            <div>Loading records...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
                    <th rowSpan="2">SL</th>
                    <th rowSpan="2">Date</th>
                    <th rowSpan="2">Weaver Name</th>
                    <th colSpan="2">{type.toUpperCase()}</th>
                    <th colSpan="2">{type === 'tana' ? 'Yarn Use' : 'Noli Use'}</th>
                  </tr>
                  <tr style={{ backgroundColor: '#2F5597', color: 'white' }}>
                    <th>Target</th>
                    <th>Production</th>
                    <th>Target</th>
                    <th>Production</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>No records found for selected range.</td></tr>
                  ) : (
                    <>
                      {historyData.map((r, i) => (
                        <tr key={r.id || i}>
                          <td>{i + 1}</td>
                          <td>{r.date}</td>
                          <td style={{ textAlign: 'left' }}><strong>{r.weaver_name}</strong></td>
                          <td>{r.target}</td>
                          <td>{r.production}</td>
                          <td>{r.noli_target}</td>
                          <td>{r.noli_production}</td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#f0f4f8', fontWeight: 'bold' }}>
                        <td colSpan="3" style={{ textAlign: 'right' }}>Total Summary:</td>
                        <td>{totalTarget}</td>
                        <td>{totalProd}</td>
                        <td>{totalNoliTarget}</td>
                        <td>{totalNoliProd}</td>
                      </tr>
                    </>
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