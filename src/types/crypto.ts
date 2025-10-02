export interface Crypto {
  id: number;
  symbol: string;
  name: string;
}

export interface PriceHistory {
  id: number;
  crypto_id: number;
  price: number;
  volume: number;
  percent_change_24h: number;
  timestamp: string;
}
