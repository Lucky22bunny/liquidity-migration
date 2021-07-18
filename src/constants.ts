import { BigNumber } from "ethers"
import { StrategyState } from "@enso/contracts"

interface Holders {
  [key: string]: string[] | undefined;
}

export const FACTORY_REGISTRIES = {
  UNISWAP: "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95",
  PIE_DAO_SMART_POOLS: "0xE0CBd9db30E15B9ad885D39AecaE138616807753", // pieDao registry
  DPI: "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b",
  ETH_2X_FLEXIBLE_LEVERAGE_INDEX: "0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD",
  ETH_USD_YIELD: "0x23687D9d40F9Ecc86E7666DDdB820e700F954526",
  DEGEN_INDEX: "0x126c121f99e1E211dF2e5f8De2d96Fa36647c855",
};

export const PIE_DAO_HOLDERS: Holders = {
  "0x0327112423F3A68efdF1fcF402F6c5CB9f7C33fd": ["0xD68A5ccDe1e5273c79Cd40711fE4750122cdD865"], // BTC++
  "0xaD6A626aE2B43DCb1B39430Ce496d2FA0365BA9C": ["0xc1f0A5c6CFA9eDDa352336e9E8202BC097E72C68"], // DEFI+S
  "0x8D1ce361eb68e9E05573443C407D4A3Bed23B033": ["0xF78d4b28C975353aA6aE45c31471e8Ca8da0BA35"], // DEFI++
  "0xE4f726Adc8e89C6a6017F01eadA77865dB22dA14": ["0xA38dA4974B594204b73581ac5FBc1eBEE54CA4E0"], // BCP (balance crypto pie)
};

export const TOKENSET_ISSUANCE_MODULES: { [key: string]: string } = {
  "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b": "0xd8EF3cACe8b4907117a45B0b125c68560532F94D", // DPI_SET_BASIC_ISSUANCE_MODULE
  "0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD": "0x39f024d621367c044bace2bf0fb15fb3612ecb92", // ETH_2X_FLEXIBLE_LEVERAGE_INDEX
  "0x23687D9d40F9Ecc86E7666DDdB820e700F954526": "0xd8EF3cACe8b4907117a45B0b125c68560532F94D",
};

export const TOKENSET_HOLDERS: Holders = {
  "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b": [
    "0xa9e1499b4883f4c59a06557a6d25bad4802fce1a",
    "0xfc624f8f58db41bdb95aedee1de3c1cf047105f1",
    "0x9c03c806a2f917e4fbb70d8064efea5917ff2ce3",
  ], // DPI
  "0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD": [
    "0x22Acb809d08aE7c79F0b84513EfCE0577acFE514",
    "0x690f1de22ee6c7c6c2433c8174cd74e82ee8563a",
    "0x65bdef0e45b652e86973c3408c7cd24dda9d844d",
  ], // ETH_2X_FLEXIBLE_LEVERAGE_INDEX
  "0x23687D9d40F9Ecc86E7666DDdB820e700F954526": [
    "0x4a8B9E2C2940fdd39aceb384654dc59aCB58C337",
    "0xEf1863a13b8Dfa1Bd542f1aF79A38C18b9169E30",
    "0x6b9568Ef82Ad3Ea56EdB3aAA805541A1748EFCD0",
  ], // ETH_2X_FLEXIBLE_LEVERAGE_INDEX
};

export const INDEXED_HOLDERS: Holders = {
  "0x126c121f99e1E211dF2e5f8De2d96Fa36647c855": [
    "0x48f49f4892f603a4a2fd99abe734cd4da5eaafff",
    "0x82df46c9047f3218b4df0589e44f71e21f7800cb",
    "0xE75021660E00A7FA0DF1B97da13eBAbe6D82e7ea",
    "0x168fa4917e7cD18f4eD3dc313c4975851cA9E5E7",
  ], // DEGEN
};

export const WETH: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export const DIVISOR = 1000;

export const STRATEGY_STATE: StrategyState = {
	timelock: BigNumber.from(60),
	rebalanceThreshold: BigNumber.from(10),
	slippage: BigNumber.from(995),
	performanceFee: BigNumber.from(50),
	social: true
}
