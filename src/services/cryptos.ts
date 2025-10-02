import { api } from "./api";
import type { Crypto, PriceHistory } from "../types/crypto";

export const getCryptos = async (): Promise<Crypto[]> => {
  const { data } = await api.get("/cryptos");
  return data;
};

export const createCrypto = async (crypto: { symbol: string; name: string }) => {
  const { data } = await api.post("/cryptos", crypto);
  return data;
};

export const updateCrypto = async (id: number, crypto: { symbol: string; name: string }) => {
  const { data } = await api.put(`/cryptos/${id}`, crypto);
  return data;
};

export const deleteCrypto = async (id: number) => {
  await api.delete(`/cryptos/${id}`);
};

export const syncCrypto = async (symbol: string) => {
  const { data } = await api.post(`/cryptos/${symbol}/sync`);
  return data;
};

export const getHistory = async (cryptoId: number): Promise<PriceHistory[]> => {
  const { data } = await api.get(`/price-history/${cryptoId}`);
  return data;
};
// import { api } from "./api";
// import type { Crypto, PriceHistory } from "../types/crypto";

// export const getCryptos = async (): Promise<Crypto[]> => {
//   const { data } = await api.get("/cryptos");
//   return data;
// };

// export const createCrypto = async (crypto: { symbol: string; name: string }) => {
//   const { data } = await api.post("/cryptos", crypto);
//   return data;
// };

// export const syncCrypto = async (symbol: string) => {
//   const { data } = await api.post(`/cryptos/${symbol}/sync`);
//   return data;
// };

// export const getHistory = async (cryptoId: number): Promise<PriceHistory[]> => {
//   const { data } = await api.get(`/price-history/${cryptoId}`);
//   return data;
// };
