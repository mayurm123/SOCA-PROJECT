// src/pages/Backtest.js
import React, { useState, useEffect } from 'react';
import '../OptionChain.css';

const Backtest = () => {
  const [index, setIndex] = useState('NIFTY');
  const [expiry, setExpiry] = useState('');
  const [expiryList, setExpiryList] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:30');
  const [interval, setInterval] = useState('1');
  const [records, setRecords] = useState([]);
  const [timestamp, setTimestamp] = useState(null);
  const [cmp, setCmp] = useState(0);
   
  const [availableDates, setAvailableDates] = useState([]);

      useEffect(() => {
        const fetchDates = async () => {
          if (!index || !expiry) return;
          try {
            const res = await fetch(`http://localhost:5000/api/backtest/dates?index=${index}&expiry=${expiry}`);
            const result = await res.json();
            setAvailableDates(result);
            setDate(result[0]); // set default selected date
          } catch (err) {
            console.error("Failed to fetch available dates:", err);
          }
        };
        fetchDates();
      }, [index, expiry]);



  useEffect(() => {
    const fetchExpiries = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/options/expiries?index=${index}`);
        const result = await res.json();
        setExpiryList(result);
        setExpiry(result[0]);
      } catch (err) {
        console.error('Failed to fetch expiries:', err);
      }
    };
    fetchExpiries();
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

  const fetchBacktest = async (customTime) => {
    const res = await fetch(
      `http://localhost:5000/api/backtest?index=${index}&expiry=${expiry}&date=${date}&time=${customTime || time}&interval=${interval}`
    );
    const result = await res.json();
    if (Array.isArray(result)) {
      const cmpValue = result.find(r => r?.CE?.underlyingValue)?.CE?.underlyingValue || 25000;
      const uniqueMap = new Map();
      result.forEach(row => {
         if (row && row.strikePrice != null) {
          uniqueMap.set(row.strikePrice, row); // replaces old with latest
         }
       });
       const uniqueResult = Array.from(uniqueMap.values());
       const sorted = [...uniqueResult].sort((a, b) => a.strikePrice - b.strikePrice);
      const mid = sorted.findIndex(r => r.strikePrice > cmpValue);
      const data = [
        ...sorted.slice(Math.max(0, mid - 10), mid),
        { isCMP: true },
        ...sorted.slice(mid, mid + 10)
      ].reverse();
      setCmp(cmpValue);
      setTimestamp(result[0]?.timestamp);
      setRecords(data);
    }
  };

  const getMax = (field, side) => {
    const vals = records.map(row => row?.[side]?.[field] || 0);
    const sorted = [...new Set(vals)].sort((a, b) => b - a);
    return [sorted[0] || 1, sorted[1] || 1];
  };

  const getClass = (val, max, second, side) => {
    if (val === max) return side === 'CE' ? 'bg-danger text-white' : 'bg-success text-white';
    if (val === second) return 'bg-warning';
    return '';
  };

  const getPercent = (val, max) => `${Math.round((val / max) * 100)}%`;

  const updateTime = (dir) => {
    const [h, m] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h);
    d.setMinutes(m + (dir === 'forward' ? 1 : -1) * parseInt(interval));
    const newTime = d.toTimeString().split(':').slice(0, 2).join(':');
    setTime(newTime);
    fetchBacktest(newTime);
  };

  const [maxOI_CE, secOI_CE] = getMax('openInterest', 'CE');
  const [maxCOI_CE, secCOI_CE] = getMax('changeinOpenInterest', 'CE');
  const [maxVOL_CE, secVOL_CE] = getMax('totalTradedVolume', 'CE');
  const [maxOI_PE, secOI_PE] = getMax('openInterest', 'PE');
  const [maxCOI_PE, secCOI_PE] = getMax('changeinOpenInterest', 'PE');
  const [maxVOL_PE, secVOL_PE] = getMax('totalTradedVolume', 'PE');

  return (
    <div className="container mt-4 optionchain-container">
      <h2 className="text-gradient mb-4">Backtest Option Chain</h2>

      <div className="row mb-3">
        <div className="col">
          <label>Index</label>
          <select className="form-select" value={index} onChange={e => setIndex(e.target.value)}>
            <option value="NIFTY">NIFTY</option>
            <option value="BANKNIFTY">BANKNIFTY</option>
            <option value="FINNIFTY">FINNIFTY</option>
          </select>
        </div>
        <div className="col">
          <label>Expiry</label>
          <select className="form-select" value={expiry} onChange={e => setExpiry(e.target.value)}>
            {expiryList.map((exp, i) => <option key={i} value={exp}>{exp}</option>)}
          </select>
        </div>
        {/* <div className="col">
          <label>Date</label>
          <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
        </div> */}
        <div className="col">
            <label>Date</label>
            <select className="form-select" value={date} onChange={(e) => setDate(e.target.value)}>
              {availableDates.length === 0 ? (
                <option disabled>No dates available</option>
              ) : (
                availableDates.map((d, i) => <option key={i} value={d}>{d}</option>)
              )}
            </select>
         </div> 
        <div className="col">
          <label>Time</label>
          <input type="time" className="form-control" value={time} onChange={e => setTime(e.target.value)} />
        </div>
      </div>

      <div className="mb-3">
        <label className="me-3">Interval:</label>
        {['1', '3', '5'].map((val) => (
          <label key={val} className="me-3">
            <input
              type="radio"
              value={val}
              checked={interval === val}
              onChange={e => setInterval(e.target.value)}
              className="me-1"
              name="interval"
            />
            {val} min
          </label>
        ))}
      </div>

      <div className="d-flex align-items-center mb-3 gap-3">
        <div>
          <button className="btn btn-primary" onClick={() => fetchBacktest()}>Fetch</button>
          <button className="btn btn-secondary ms-2" onClick={() => updateTime('backward')}>
            -{interval} min
          </button>          
          <button className="btn btn-secondary ms-2" onClick={() => updateTime('forward')}>
            +{interval} min
          </button>
        </div>
        {timestamp && (
          <div className="text-muted">
           <h3> ⏱ <strong>Timestamp: {formatTime(timestamp)}</strong></h3>
          </div>
        )}
      </div>

      {records.length > 0 && (
        <>
          <table className="table table-bordered table-sm text-center optionchain-header">
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
          <div className="table-wrapper">
            <table className="table table-bordered table-sm text-center">
              <tbody>
                {records.map((row, idx) =>
                  row.isCMP ? (
                    <tr key={'cmp'} className="table-primary fw-bold">
                      <td colSpan="9">Current Market Price: {cmp}</td>
                    </tr>
                  ) : (
                    <tr key={idx}>
                      <td className={getClass(row.CE?.openInterest, maxOI_CE, secOI_CE, 'CE')}>
                        {row.CE?.openInterest ?? '-'}<br />
                        {row.CE?.openInterest && <span className="percent-pill">{getPercent(row.CE.openInterest, maxOI_CE)}</span>}
                      </td>
                      <td className={getClass(row.CE?.changeinOpenInterest, maxCOI_CE, secCOI_CE, 'CE')}>
                        {row.CE?.changeinOpenInterest ?? '-'}<br />
                        {row.CE?.changeinOpenInterest && <span className="percent-pill">{getPercent(row.CE.changeinOpenInterest, maxCOI_CE)}</span>}
                      </td>
                      <td className={getClass(row.CE?.totalTradedVolume, maxVOL_CE, secVOL_CE, 'CE')}>
                        {row.CE?.totalTradedVolume ?? '-'}<br />
                        {row.CE?.totalTradedVolume && <span className="percent-pill">{getPercent(row.CE.totalTradedVolume, maxVOL_CE)}</span>}
                      </td>
                      <td>{row.CE?.lastPrice ?? '-'}</td>
                      <td className="fw-bold text-center bg-light text-dark">{row.strikePrice}</td>
                      <td>{row.PE?.lastPrice ?? '-'}</td>
                      <td className={getClass(row.PE?.totalTradedVolume, maxVOL_PE, secVOL_PE, 'PE')}>
                        {row.PE?.totalTradedVolume ?? '-'}<br />
                        {row.PE?.totalTradedVolume && <span className="percent-pill">{getPercent(row.PE.totalTradedVolume, maxVOL_PE)}</span>}
                      </td>
                      <td className={getClass(row.PE?.changeinOpenInterest, maxCOI_PE, secCOI_PE, 'PE')}>
                        {row.PE?.changeinOpenInterest ?? '-'}<br />
                        {row.PE?.changeinOpenInterest && <span className="percent-pill">{getPercent(row.PE.changeinOpenInterest, maxCOI_PE)}</span>}
                      </td>
                      <td className={getClass(row.PE?.openInterest, maxOI_PE, secOI_PE, 'PE')}>
                        {row.PE?.openInterest ?? '-'}<br />
                        {row.PE?.openInterest && <span className="percent-pill">{getPercent(row.PE.openInterest, maxOI_PE)}</span>}
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

export default Backtest;
