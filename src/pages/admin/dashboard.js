import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminDashboard() {
  const [reportType, setReportType] = useState('saree_production');
  const [dateFilter, setDateFilter] = useState('');
  const [data, setData] = useState([]);

  const fetchReport = async () => {
    let query = supabase.from(reportType).select('*');
    if (dateFilter) query = query.eq('date', dateFilter);
    const { data: result, error } = await query;
    if (!error) setData(result || []);
  };

  useEffect(() => { fetchReport(); }, [reportType, dateFilter]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `BRAC_Report_${reportType}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`BRAC Sericulture Report: ${reportType.toUpperCase()}`, 14, 15);
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(obj => Object.values(obj));
      doc.autoTable({ head: [headers], body: rows, startY: 20 });
    }
    doc.save(`BRAC_Report_${reportType}.pdf`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#1F4E78' }}>BRAC Sericulture — Central Admin Dashboard</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ padding: '8px' }}>
          <option value="charka_spinners">1. Charka Spinners Statement</option>
          <option value="saree_production">2. Saree Daily Production</option>
          <option value="dopatta_production">3. Dopatta Daily Production</option>
          <option value="tana_production">4. Drum Master Tana Report</option>
          <option value="noli_lachi_production">5. Noli / Endi Lachi Report</option>
        </select>

        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ padding: '8px' }} />

        <button onClick={exportExcel} style={{ backgroundColor: '#1D6F42', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
          📥 Export Excel
        </button>
        <button onClick={exportPDF} style={{ backgroundColor: '#A61C1C', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
          📄 Export PDF
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#1F4E78', color: 'white' }}>
              {data.length > 0 && Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => <td key={i}>{val}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}