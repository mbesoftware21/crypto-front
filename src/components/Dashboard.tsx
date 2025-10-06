import ChartPanel from "./ChartPanel";
import CryptoTable from "./CryptoTable";
import TradePanel from "./TradePanel";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <header className="header">
        <h1>Crypto Exchange Pro</h1>
        <div className="balance-card">
          <span>Total Balance</span>
          <h2>$25,380.44</h2>
        </div>
      </header>

      <section className="main-grid">
        <div className="left-panel">
          <CryptoTable />
          <ChartPanel />
        </div>

        <div className="right-panel">
          <TradePanel />
        </div>
      </section>
    </div>
  );
}
