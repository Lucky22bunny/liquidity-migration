import { task } from "hardhat/config";
import { ADD_ADAPTER } from "./task-names";
export const owner = "0x0c58B57E2e0675eDcb2c7c0f713320763Fc9A77b";
export const MIGRATION_ABI_FRAGMENT = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_adapter",
        type: "address",
      },
    ],
    name: "addAdapter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "adapters",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

task(ADD_ADAPTER, "Add Adapters")
  .addParam("adapterAddress", "Add adapter address")
  .addParam("migrationAddress", "Liquidity migration address")
  .setAction(async ({ adapterAddress, migrationAddress }, hre) => {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [owner],
    });
    const signer = await hre.ethers.getSigner(owner);
    const { addAdapter, adapters } = await new hre.ethers.Contract(migrationAddress, MIGRATION_ABI_FRAGMENT, signer);
    const isAlreadyAdapter = await adapters(adapterAddress);
    console.log(`is ${!isAlreadyAdapter && "not "} already an adapter`);
    if (!isAlreadyAdapter) {
      await addAdapter(adapterAddress);
    }
  });
