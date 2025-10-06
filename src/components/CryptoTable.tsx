const cryptos = [
  { name: "Bitcoin", symbol: "BTC", price: 64850.22, change: 1.2 },
  { name: "Ethereum", symbol: "ETH", price: 3125.43, change: -0.8 },
  { name: "Cardano", symbol: "ADA", price: 0.45, change: 3.1 },
  { name: "Solana", symbol: "SOL", price: 175.2, change: -1.3 },
];

export default function CryptoTable() {
  return (
    <div className="card crypto-table">
      <h3>Market Overview</h3>
      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Price</th>
            <th>Change (24h)</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((c) => (
            <tr key={c.symbol}>
              <td>
                <strong>{c.symbol}</strong> <span>{c.name}</span>
              </td>
              <td>${c.price.toLocaleString()}</td>
              <td className={c.change >= 0 ? "up" : "down"}>
                {c.change > 0 ? "+" : ""}
                {c.change}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
