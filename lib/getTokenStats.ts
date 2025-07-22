import { ethers } from 'ethers';
import factoryAbi from '../data/factoryAbi.json';
import pairAbi from '../data/pairAbi.json';
import coinIndex from '../data/coinIndex.json';  // Die JSON-Datei für die Token-Adressen

const RPC_URL = 'https://rpc-pepu-v2-mainnet-0.t.conduit.xyz';
const FACTORY_ADDRESS = '0xB8B15A4d5A37D6B7A4A2A3656Ee81ED06F49D8Db'; // Adresse der Factory
const provider = new ethers.JsonRpcProvider(RPC_URL);

export async function getTokenStats(symbol: string): Promise<null | {
  priceInPEPU: number;
  tokenAddress: string;
  poolAddress: string;
}> {
  const tokenAddress = coinIndex[symbol.toLowerCase()];
  if (!tokenAddress) return null;

  try {
    const factory = new ethers.Contract(FACTORY_ADDRESS, factoryAbi, provider);
    const pairAddress = await factory.getPair(tokenAddress, ethers.ZeroAddress);
    if (pairAddress === ethers.ZeroAddress) return null;

    const pair = new ethers.Contract(pairAddress, pairAbi, provider);
    const [reserve0, reserve1] = await pair.getReserves();
    const token0 = await pair.token0();

    const priceInPEPU = token0.toLowerCase() === tokenAddress.toLowerCase()
      ? Number(reserve1) / Number(reserve0)
      : Number(reserve0) / Number(reserve1);

    return {
      priceInPEPU,
      tokenAddress,
      poolAddress: pairAddress,
    };
  } catch (err) {
    console.error('❌ Fehler bei Onchain-Preisermittlung:', err);
    return null;
  }
}
