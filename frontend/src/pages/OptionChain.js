// src/pages/OptionChain.js
import React, { useEffect, useState } from 'react';
import '../OptionChain.css';
import Header from '../components/Header';

const OptionRow = React.memo(({ row, cmp, highlight, getClass, getPercent }) => {
  if (row.isCMP) {
    return (
      <tr className="table-primary fw-bold">
        <td colSpan="9">Current Market Price: {cmp}</td>
      </tr>
    );
  }

  return (
    <tr>
      <td className={getClass(row.CE?.openInterest, highlight.maxOI_CE, highlight.secOI_CE, 'CE')}>
        {row.CE?.openInterest ?? '-'}<br />
        {row.CE?.openInterest && <span className="percent-pill">{getPercent(row.CE.openInterest, highlight.maxOI_CE)}</span>}
      </td>
      <td className={getClass(row.CE?.changeinOpenInterest, highlight.maxCOI_CE, highlight.secCOI_CE, 'CE')}>
        {row.CE?.changeinOpenInterest ?? '-'}<br />
        {row.CE?.changeinOpenInterest && <span className="percent-pill">{getPercent(row.CE.changeinOpenInterest, highlight.maxCOI_CE)}</span>}
      </td>
      <td className={getClass(row.CE?.totalTradedVolume, highlight.maxVOL_CE, highlight.secVOL_CE, 'CE')}>
        {row.CE?.totalTradedVolume ?? '-'}<br />
        {row.CE?.totalTradedVolume && <span className="percent-pill">{getPercent(row.CE.totalTradedVolume, highlight.maxVOL_CE)}</span>}
      </td>
      <td>{row.CE?.lastPrice ?? '-'}</td>
      <td className="fw-bold text-center bg-light text-dark">{row.strikePrice}</td>
      <td>{row.PE?.lastPrice ?? '-'}</td>
      <td className={getClass(row.PE?.totalTradedVolume, highlight.maxVOL_PE, highlight.secVOL_PE, 'PE')}>
        {row.PE?.totalTradedVolume ?? '-'}<br />
        {row.PE?.totalTradedVolume && <span className="percent-pill">{getPercent(row.PE.totalTradedVolume, highlight.maxVOL_PE)}</span>}
      </td>
      <td className={getClass(row.PE?.changeinOpenInterest, highlight.maxCOI_PE, highlight.secCOI_PE, 'PE')}>
        {row.PE?.changeinOpenInterest ?? '-'}<br />
        {row.PE?.changeinOpenInterest && <span className="percent-pill">{getPercent(row.PE.changeinOpenInterest, highlight.maxCOI_PE)}</span>}
      </td>
      <td className={getClass(row.PE?.openInterest, highlight.maxOI_PE, highlight.secOI_PE, 'PE')}>
        {row.PE?.openInterest ?? '-'}<br />
        {row.PE?.openInterest && <span className="percent-pill">{getPercent(row.PE.openInterest, highlight.maxOI_PE)}</span>}
      </td>
    </tr>
  );
}, (prev, next) => {
  const p = prev.row;
  const n = next.row;
  return (
    p.strikePrice === n.strikePrice &&
    JSON.stringify(p.CE) === JSON.stringify(n.CE) &&
    JSON.stringify(p.PE) === JSON.stringify(n.PE) &&
    p.isCMP === n.isCMP
  );
});

const OptionChain = () => {
  const [index, setIndex] = useState('NIFTY');
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ cmp: 0, timestamp: '' });
  const [loading, setLoading] = useState(false);

  const getMaxSecondMax = (field, side, data) => {
    const values = data.map(row => row?.[side]?.[field] || 0);
    const sorted = [...new Set(values)].sort((a, b) => b - a);
    return [sorted[0] || 1, sorted[1] || 1];
  };

  const getClass = (val, max, second, side) => {
    if (val === max) return side === 'CE' ? 'bg-danger text-white' : 'bg-success text-white';
    if (val === second) return 'bg-warning';
    return '';
  };

  const getPercent = (val, max) => `${Math.round((val / max) * 100)}%`;

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/options?index=${index}&latest=true`, {
          credentials: 'include'
        });
        const result = await res.json();
        const cmp = result?.records?.[0]?.CE?.underlyingValue || 25000;
        const sortedAsc = [...(result.records || [])].sort((a, b) => a.strikePrice - b.strikePrice);
        const lowerIndex = sortedAsc.findIndex(row => row.strikePrice > cmp);
        const below = sortedAsc.slice(Math.max(0, lowerIndex - 10), lowerIndex);
        const above = sortedAsc.slice(lowerIndex, lowerIndex + 10);
        const filtered = [...below, { isCMP: true }, ...above].reverse();
        setMeta({ cmp, timestamp: result.timestamp });
        setRecords(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(filtered)) {
            return filtered;
          }
          return prev;
        });
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

  const highlight = {
    maxCOI_CE: getMaxSecondMax('changeinOpenInterest', 'CE', records)[0],
    secCOI_CE: getMaxSecondMax('changeinOpenInterest', 'CE', records)[1],
    maxOI_CE: getMaxSecondMax('openInterest', 'CE', records)[0],
    secOI_CE: getMaxSecondMax('openInterest', 'CE', records)[1],
    maxVOL_CE: getMaxSecondMax('totalTradedVolume', 'CE', records)[0],
    secVOL_CE: getMaxSecondMax('totalTradedVolume', 'CE', records)[1],
    maxCOI_PE: getMaxSecondMax('changeinOpenInterest', 'PE', records)[0],
    secCOI_PE: getMaxSecondMax('changeinOpenInterest', 'PE', records)[1],
    maxOI_PE: getMaxSecondMax('openInterest', 'PE', records)[0],
    secOI_PE: getMaxSecondMax('openInterest', 'PE', records)[1],
    maxVOL_PE: getMaxSecondMax('totalTradedVolume', 'PE', records)[0],
    secVOL_PE: getMaxSecondMax('totalTradedVolume', 'PE', records)[1]
  };

  return (
    <>
    <Header />
    <div className="container mt-4 optionchain-container">
      <h2 className="text-gradient mb-4">Live Option Chain</h2>
      <div className="d-flex gap-3 align-items-center mb-3">
        <select className="form-select w-auto" value={index} onChange={(e) => setIndex(e.target.value)}>
          <option value="NIFTY">NIFTY</option>
          <option value="BANKNIFTY">BANKNIFTY</option>
          <option value="FINNIFTY">FINNIFTY</option>
        </select>
        {meta?.timestamp && (
          <span className="text-muted">Last Refreshed: {formatTime(meta.timestamp)}</span>
        )}
      </div>

      {loading || !records.length ? (
        <p>Loading...</p>
      ) : (
        <>

          <div className="table-wrapper">
            <table className="table table-bordered table-sm text-center optionchain-table">
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
              <tbody>
                {records.map((row) => (
                  <OptionRow
                    key={row.strikePrice || (row.isCMP ? 'cmp' : Math.random())}
                    row={row}
                    cmp={meta.cmp}
                    highlight={highlight}
                    getClass={getClass}
                    getPercent={getPercent}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default OptionChain;
