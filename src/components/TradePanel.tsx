export default function TradePanel() {
  return (
    <div className="card trade-panel">
      <h3>Trade BTC/USDT</h3>
      <div className="trade-actions">
        <button className="btn buy">Buy</button>
        <button className="btn sell">Sell</button>
      </div>

      <div className="trade-form">
        <label>Amount (BTC)</label>
        <input type="number" placeholder="0.000" />
        <label>Price (USDT)</label>
        <input type="number" placeholder="64000" />
        <button className="btn confirm">Confirm Trade</button>
      </div>
    </div>
  );
}
