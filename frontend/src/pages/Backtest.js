// src/pages/Backtest.js
import React, { useState, useEffect } from 'react';

const Backtest = () => {
  const [index, setIndex] = useState('NIFTY');
  const [expiry, setExpiry] = useState('');
  const [expiryList, setExpiryList] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:30');
  const [interval, setInterval] = useState('1');
  const [fetchedData, setFetchedData] = useState([]);

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

  const handleFetch = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/backtest?index=${index}&expiry=${expiry}&date=${date}&time=${time}&interval=${interval}`
      );
      const result = await res.json();
      setFetchedData(result);
    } catch (err) {
      console.error('Backtest fetch failed:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h4>Backtest Options</h4>
      <div className="row mb-3">
        <div className="col">
          <label>Index</label>
          <select className="form-select" value={index} onChange={(e) => setIndex(e.target.value)}>
            <option value="NIFTY">NIFTY</option>
            <option value="BANKNIFTY">BANKNIFTY</option>
            <option value="FINNIFTY">FINNIFTY</option>
          </select>
        </div>
        <div className="col">
          <label>Expiry Date</label>
           {expiryList.length > 0 ? (
          <select className="form-select" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                  {expiryList.map((exp, i) => <option key={i} value={exp}>{exp}</option>)}
          </select>
           ) : (
           <p className="text-muted">No expiry dates available</p>
           )}
        </div>
        <div className="col">
          <label>Date</label>
          <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="col">
          <label>Time</label>
          <input type="time" className="form-control" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div className="mb-3">
        <label className="me-3">Interval:</label>
        {['1', '3', '5'].map((val) => (
          <label className="me-3" key={val}>
            <input
              type="radio"
              name="interval"
              value={val}
              checked={interval === val}
              onChange={(e) => setInterval(e.target.value)}
              className="me-1"
            />
            {val} min
          </label>
        ))}
      </div>

      <button className="btn btn-primary mb-3" onClick={handleFetch}>
        Fetch Backtest Data
      </button>

      {fetchedData.length > 0 && (
        <table className="table table-bordered table-sm text-center">
          <thead className="table-dark">
            <tr>
              <th>Timestamp</th>
              <th>Strike</th>
              <th>CE OI</th>
              <th>PE OI</th>
              <th>CE VOL</th>
              <th>PE VOL</th>
            </tr>
          </thead>
          <tbody>
            {fetchedData.map((row, idx) => (
              <tr key={idx}>
                <td>{new Date(row.timestamp).toLocaleString()}</td>
                <td>{row.strikePrice}</td>
                <td>{row.CE?.openInterest ?? '-'}</td>
                <td>{row.PE?.openInterest ?? '-'}</td>
                <td>{row.CE?.totalTradedVolume ?? '-'}</td>
                <td>{row.PE?.totalTradedVolume ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Backtest;
