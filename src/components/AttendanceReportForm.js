import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AttendanceReportForm({ onSaved }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [viewMode, setViewMode] = useState('entry'); // 'entry' or 'history'
  const [rows, setRows] = useState([
    { staff_name: '', designation: 'Weaver', status: 'Present', in_time: '08:00', remarks: '' }
  ]);
  const [savedStaffs, setSavedStaffs] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('staff_name, designation')
      .order('id', { ascending: false });

    if (!error && data) {
      const uniqueMap = new Map();
      data.forEach(item => {
        if (item.staff_name && !uniqueMap.has(item.staff_name.trim())) {
          uniqueMap.set(item.staff_name.trim(), {
            name: item.staff_name.trim(),
            designation: item.designation || 'Weaver'
          });
        }
      });
      setSavedStaffs(Array.from(uniqueMap.values()));
    }
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleSelectStaff = (index, staffName) => {
    const selected = savedStaffs.find(s => s.name === staffName);
    const updated = [...rows];
    if (selected) {
      updated[index].staff_name = selected.name;
      updated[index].designation = selected.designation;
    } else {
      updated[index].staff_name = staffName;
    }
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { staff_name: '', designation: 'Weaver', status: 'Present', in_time: '08:00', remarks: '' }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const insertData = rows
      .filter(r => r.staff_name.trim() !== '')
      .map(r => ({
        date,
        staff_name: r.staff_name.trim(),
        designation: r.designation,
        status: r.status,
        in_time: r.in_time,
        remarks: r.remarks
      }));

    if (insertData.length === 0) {
      alert('Please fill in at least one Staff/Weaver Name!');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('attendance_records').insert(insertData);
    setSaving(false);

    if (error) {
      alert('Error saving attendance: ' + error.message);
    } else {
      alert('Attendance saved successfully!');
      setRows([{ staff_name: '', designation: 'Weaver', status: 'Present', in_time: '08:00', remarks: '' }]);
      fetchStaffs();
      if (onSaved) onSaved();
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('attendance_records')
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
    let csvContent = 'data:text/csv;charset=utf-8,Date,Name,Designation,Status,In Time,Remarks\n';
    historyData.forEach(r => {
      csvContent += `${r.date},"${r.staff_name}","${r.designation}",${r.status},"${r.in_time}","${r.remarks}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDFPrint = () => {
    window.print();
  };

  const shareWhatsApp = () => {
    let msg = `*BRAC Sericulture Daily Attendance Report*\nDate Range: ${startDate} to ${endDate}\n\n`;
    historyData.forEach((d, i) => {
      msg += `${i + 1}. ${d.staff_name} (${d.designation}): ${d.status}\n`;
    });
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalPresent = historyData.filter(r => r.status === 'Present').length;
  const totalAbsent = historyData.filter(r => r.status === 'Absent').length;
  const totalLeave = historyData.filter(r => r.status === 'Leave').length;

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

      {/* Navigation Mode Buttons */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button onClick={() => setViewMode('entry')} style={{ padding: '8px 16px', backgroundColor: viewMode === 'entry' ? '#1F4E78' : '#e0e0e0', color: viewMode === 'entry' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          ➕ Daily Attendance Entry
        </button>
        <button onClick={() => { setViewMode('history'); fetchHistory(); }} style={{ padding: '8px 16px', backgroundColor: viewMode === 'history' ? '#1F4E78' : '#e0e0e0', color: viewMode === 'history' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          📊 View Saved Attendance & Export
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
                  <th>SL</th>
                  <th>Name</th>
                  <th>Designation / Role</th>
                  <th>Status</th>
                  <th>In Time</th>
                  <th>Remarks</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <input 
                        type="text" 
                        list={`staff-list-${index}`}
                        placeholder="Type or select name" 
                        value={row.staff_name} 
                        onChange={(e) => handleSelectStaff(index, e.target.value)} 
                        style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                      />
                      <datalist id={`staff-list-${index}`}>
                        {savedStaffs.map((s, i) => (
                          <option key={i} value={s.name}>{s.name}</option>
                        ))}
                      </datalist>
                    </td>
                    <td>
                      <select value={row.designation} onChange={(e) => handleRowChange(index, 'designation', e.target.value)} style={{ padding: '6px', width: '100%' }}>
                        <option value="Weaver">Weaver</option>
                        <option value="Spinner">Spinner</option>
                        <option value="Reeler">Reeler</option>
                        <option value="Staff">Staff</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </td>
                    <td>
                      <select value={row.status} onChange={(e) => handleRowChange(index, 'status', e.target.value)} style={{ padding: '6px', width: '100%', fontWeight: 'bold' }}>
                        <option value="Present" style={{ color: 'green' }}>Present</option>
                        <option value="Absent" style={{ color: 'red' }}>Absent</option>
                        <option value="Leave" style={{ color: 'orange' }}>Leave</option>
                        <option value="Late" style={{ color: 'purple' }}>Late</option>
                      </select>
                    </td>
                    <td><input type="time" value={row.in_time} onChange={(e) => handleRowChange(index, 'in_time', e.target.value)} style={{ padding: '6px' }} /></td>
                    <td><input type="text" placeholder="Remarks" value={row.remarks} onChange={(e) => handleRowChange(index, 'remarks', e.target.value)} style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} /></td>
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
              {saving ? 'Saving...' : '💾 Save Attendance'}
            </button>
          </div>
        </div>
      ) : (
        /* Printable Report View */
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
            <h4 style={{ margin: '5px 0', fontSize: '15px' }}><strong>Daily Attendance Register Report</strong></h4>
            <p style={{ margin: '2px 0 15px 0', fontSize: '12px', color: '#666' }}>Date Range: {startDate} to {endDate}</p>
          </div>

          {loadingHistory ? (
            <div>Loading records...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
                    <th>SL</th>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>In Time</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>No attendance records found.</td></tr>
                  ) : (
                    <>
                      {historyData.map((r, i) => (
                        <tr key={r.id || i}>
                          <td>{i + 1}</td>
                          <td>{r.date}</td>
                          <td style={{ textAlign: 'left' }}><strong>{r.staff_name}</strong></td>
                          <td>{r.designation}</td>
                          <td style={{ fontWeight: 'bold', color: r.status === 'Present' ? 'green' : r.status === 'Absent' ? 'red' : 'orange' }}>{r.status}</td>
                          <td>{r.in_time}</td>
                          <td>{r.remarks}</td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#f0f4f8', fontWeight: 'bold' }}>
                        <td colSpan="4" style={{ textAlign: 'right' }}>Total Attendance Summary:</td>
                        <td colSpan="3" style={{ textAlign: 'left' }}>
                          Present: {totalPresent} | Absent: {totalAbsent} | Leave: {totalLeave}
                        </td>
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