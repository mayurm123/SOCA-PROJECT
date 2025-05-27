// src/pages/OptionChain.js
import React, { useEffect, useState } from 'react';

const OptionChain = () => {
  const [index, setIndex] = useState('NIFTY');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/options?index=${index}&latest=true`, {
          credentials: 'include'
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching live data:", err);
      }
      setLoading(false);
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 30000);
    return () => clearInterval(interval);
  }, [index]);

  const formatTime = (timestamp) => {
    const raw = timestamp?.replace('Z', '');
    const localTime = new Date(raw);
    return localTime.toLocaleString('en-IN', {
      hour12: true,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMaxSecondMax = (field, side) => {
    const values = data?.records?.map(row => row?.[side]?.[field] || 0);
    const sorted = [...new Set(values)].sort((a, b) => b - a);
    return [sorted[0] || 1, sorted[1] || 1];
  };

  const cmp = data?.records?.[0]?.CE?.underlyingValue || 25000;
  const sortedAsc = [...(data?.records || [])].sort((a, b) => a.strikePrice - b.strikePrice);

  const lowerIndex = sortedAsc.findIndex(row => row.strikePrice > cmp);
  const below = sortedAsc.slice(Math.max(0, lowerIndex - 10), lowerIndex);
  const above = sortedAsc.slice(lowerIndex, lowerIndex + 10);
  const filteredRecords = [...below, { isCMP: true }, ...above].reverse();

  const [maxCOI_CE, secCOI_CE] = getMaxSecondMax('changeinOpenInterest', 'CE');
  const [maxOI_CE, secOI_CE] = getMaxSecondMax('openInterest', 'CE');
  const [maxVOL_CE, secVOL_CE] = getMaxSecondMax('totalTradedVolume', 'CE');
  const [maxCOI_PE, secCOI_PE] = getMaxSecondMax('changeinOpenInterest', 'PE');
  const [maxOI_PE, secOI_PE] = getMaxSecondMax('openInterest', 'PE');
  const [maxVOL_PE, secVOL_PE] = getMaxSecondMax('totalTradedVolume', 'PE');

  const getClass = (val, max, second, side) => {
    if (val === max) return side === 'CE' ? 'bg-danger text-white' : 'bg-success text-white';
    if (val === second) return 'bg-warning';
    return '';
  };

  const getPercent = (val, max) => `${Math.round((val / max) * 100)}%`;

  return (
    <div className="container mt-4">
      <h3>Live Option Chain</h3>
      <div className="d-flex gap-3 align-items-center mb-3">
        <select className="form-select w-auto" value={index} onChange={(e) => setIndex(e.target.value)}>
          <option value="NIFTY">NIFTY</option>
          <option value="BANKNIFTY">BANKNIFTY</option>
          <option value="FINNIFTY">FINNIFTY</option>
        </select>
        {data?.timestamp && (
          <span className="text-muted">Last Refreshed: {formatTime(data.timestamp)}</span>
        )}
      </div>

      {loading || !data ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="table table-bordered table-sm text-center">
            <thead className="table-dark">
              <tr>
                <th>Call OI</th>
                <th>Call COI</th>
                <th>Call Vol</th>
                <th>Call LTP</th>
                <th>Strike</th>
                <th>Put LTP</th>
                <th>Put Vol</th>
                <th>Put COI</th>
                <th>Put OI</th>
              </tr>
            </thead>
          </table>
          <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
            <table className="table table-bordered table-sm text-center">
              <tbody>
                {filteredRecords.map((row, idx) =>
                  row.isCMP ? (
                    <tr key="cmp" className="table-primary fw-bold">
                      <td colSpan="9">Current Market Price: {cmp}</td>
                    </tr>
                  ) : (
                    
                    <tr key={idx}>
                      <td className={getClass(row.CE?.openInterest, maxOI_CE, secOI_CE, 'CE')}>
                        {row.CE?.openInterest ?? '-'}<br />
                        {row.CE?.openInterest ? getPercent(row.CE.openInterest, maxOI_CE) : ''}
                      </td>
                      <td className={getClass(row.CE?.changeinOpenInterest, maxCOI_CE, secCOI_CE, 'CE')}>
                        {row.CE?.changeinOpenInterest ?? '-'}<br />
                        {row.CE?.changeinOpenInterest ? getPercent(row.CE.changeinOpenInterest, maxCOI_CE) : ''}
                      </td>
                      <td className={getClass(row.CE?.totalTradedVolume, maxVOL_CE, secVOL_CE, 'CE')}>
                        {row.CE?.totalTradedVolume ?? '-'}<br />
                        {row.CE?.totalTradedVolume ? getPercent(row.CE.totalTradedVolume, maxVOL_CE) : ''}
                      </td>
                      <td>{row.CE?.lastPrice ?? '-'}</td>
                      <td className="fw-bold">{row.strikePrice}</td>
                      <td>{row.PE?.lastPrice ?? '-'}</td>
                      <td className={getClass(row.PE?.totalTradedVolume, maxVOL_PE, secVOL_PE, 'PE')}>
                        {row.PE?.totalTradedVolume ?? '-'}<br />
                        {row.PE?.totalTradedVolume ? getPercent(row.PE.totalTradedVolume, maxVOL_PE) : ''}
                      </td>
                      <td className={getClass(row.PE?.changeinOpenInterest, maxCOI_PE, secCOI_PE, 'PE')}>
                        {row.PE?.changeinOpenInterest ?? '-'}<br />
                        {row.PE?.changeinOpenInterest ? getPercent(row.PE.changeinOpenInterest, maxCOI_PE) : ''}
                      </td>
                      <td className={getClass(row.PE?.openInterest, maxOI_PE, secOI_PE, 'PE')}>
                        {row.PE?.openInterest ?? '-'}<br />
                        {row.PE?.openInterest ? getPercent(row.PE.openInterest, maxOI_PE) : ''}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default OptionChain;
