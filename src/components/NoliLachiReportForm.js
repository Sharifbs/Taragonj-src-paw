import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function NoliLachiReportForm({ onSaved }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [viewMode, setViewMode] = useState('entry');
  const [rows, setRows] = useState([
    { spinner_name: '', cocoon_target: '', cocoon_prod: '', noli_prod: '', lachi_prod: '' }
  ]);
  const [savedSpinners, setSavedSpinners] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchSpinners();
  }, []);

  const fetchSpinners = async () => {
    const { data, error } = await supabase
      .from('noli_lachi_production')
      .select('spinner_name, cocoon_target')
      .order('id', { ascending: false });

    if (!error && data) {
      const uniqueMap = new Map();
      data.forEach(item => {
        if (item.spinner_name && !uniqueMap.has(item.spinner_name.trim())) {
          uniqueMap.set(item.spinner_name.trim(), {
            name: item.spinner_name.trim(),
            target: item.cocoon_target || ''
          });
        }
      });
      setSavedSpinners(Array.from(uniqueMap.values()));
    }
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleSelectSpinner = (index, spinnerName) => {
    const selected = savedSpinners.find(s => s.name === spinnerName);
    const updated = [...rows];
    if (selected) {
      updated[index].spinner_name = selected.name;
      updated[index].cocoon_target = selected.target;
    } else {
      updated[index].spinner_name = spinnerName;
    }
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
        spinner_name: r.spinner_name.trim(),
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
      fetchSpinners();
      if (onSaved) onSaved();
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('noli_lachi_production')
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
    let csvContent = 'data:text/csv;charset=utf-8,Date,Spinner Name,Cocoon Target,Cocoon Prod,Noli Prod,Endi Lachi Prod\n';
    historyData.forEach(r => {
      csvContent += `${r.date},"${r.spinner_name}",${r.cocoon_target},${r.cocoon_prod},${r.noli_prod},${r.lachi_prod}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `noli_lachi_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDFPrint = () => {
    window.print();
  };

  const shareWhatsApp = () => {
    let msg = `*BRAC Sericulture (NOLI & LACHI) Report*\nDate Range: ${startDate} to ${endDate}\n\n`;
    historyData.forEach((d, i) => {
      msg += `${i + 1}. ${d.spinner_name} (${d.date}): Cocoon ${d.cocoon_prod}, Noli ${d.noli_prod}, Lachi ${d.lachi_prod}\n`;
    });
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalCocoonTarget = historyData.reduce((acc, curr) => acc + Number(curr.cocoon_target || 0), 0);
  const totalCocoonProd = historyData.reduce((acc, curr) => acc + Number(curr.cocoon_prod || 0), 0);
  const totalNoliProd = historyData.reduce((acc, curr) => acc + Number(curr.noli_prod || 0), 0);
  const totalLachiProd = historyData.reduce((acc, curr) => acc + Number(curr.lachi_prod || 0), 0);

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
                  <th rowSpan="2">Spinner Name</th>
                  <th colSpan="2">Cocoon Supply</th>
                  <th rowSpan="2">Noli Production</th>
                  <th rowSpan="2">Endi Lachi Production</th>
                  <th rowSpan="2" className="no-print">Action</th>
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
                    <td>
                      <input 
                        type="text" 
                        list={`spinner-list-${index}`}
                        placeholder="Type or select name" 
                        value={row.spinner_name} 
                        onChange={(e) => handleSelectSpinner(index, e.target.value)} 
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                      <datalist id={`spinner-list-${index}`}>
                        {savedSpinners.map((s, i) => (
                          <option key={i} value={s.name}>{s.name}</option>
                        ))}
                      </datalist>
                    </td>
                    <td><input type="number" value={row.cocoon_target} onChange={(e) => handleRowChange(index, 'cocoon_target', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                    <td><input type="number" value={row.cocoon_prod} onChange={(e) => handleRowChange(index, 'cocoon_prod', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                    <td><input type="number" value={row.noli_prod} onChange={(e) => handleRowChange(index, 'noli_prod', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
                    <td><input type="number" value={row.lachi_prod} onChange={(e) => handleRowChange(index, 'lachi_prod', e.target.value)} style={{ width: '80px', padding: '4px' }} /></td>
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
            <h4 style={{ margin: '5px 0', fontSize: '15px' }}><strong>Noli & Endi Lachi Production Statement Report</strong></h4>
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
                    <th rowSpan="2">Spinner Name</th>
                    <th colSpan="2">Cocoon Supply</th>
                    <th rowSpan="2">Noli Production</th>
                    <th rowSpan="2">Endi Lachi Production</th>
                  </tr>
                  <tr style={{ backgroundColor: '#2F5597', color: 'white' }}>
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
                          <td style={{ textAlign: 'left' }}><strong>{r.spinner_name}</strong></td>
                          <td>{r.cocoon_target}</td>
                          <td>{r.cocoon_prod}</td>
                          <td>{r.noli_prod}</td>
                          <td>{r.lachi_prod}</td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#f0f4f8', fontWeight: 'bold' }}>
                        <td colSpan="3" style={{ textAlign: 'right' }}>Total Summary:</td>
                        <td>{totalCocoonTarget}</td>
                        <td>{totalCocoonProd}</td>
                        <td>{totalNoliProd}</td>
                        <td>{totalLachiProd}</td>
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