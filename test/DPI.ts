import { ethers } from "hardhat";
import { expect } from "chai";
import bignumber from "bignumber.js"
import { BigNumber, Contract, Event } from "ethers";
import { Signers, MainnetSigner } from "../types";
import { AcceptedProtocols, LiquidityMigrationBuilder } from "../src/liquiditymigration";
import { ClashingImplementation, IERC20, IERC20__factory, IStrategy__factory } from "../typechain";


import { DPIEnvironmentBuilder } from "../src/dpi";
import { StrategyBuilder, Position } from "@enso/contracts";
import { TASK_COMPILE_SOLIDITY_LOG_NOTHING_TO_COMPILE } from "hardhat/builtin-tasks/task-names";
import { DIVISOR, THRESHOLD, TIMELOCK, SLIPPAGE } from "../src/constants";


describe("DPI: Unit tests", function () {
  // lets create a strategy and then log its address and related stuff
  before(async function () {
    this.signers = {} as Signers;
    const signers = await ethers.getSigners();
    this.signers.default = signers[0];
    this.signers.admin = signers[10];

    this.DPIEnv = await new DPIEnvironmentBuilder(this.signers.default).connect();
    
    console.log(`DPI Adapter: ${this.DPIEnv.adapter.address}`);

    const liquidityMigrationBuilder = await new LiquidityMigrationBuilder(this.signers.admin);

    liquidityMigrationBuilder.addAdapter(AcceptedProtocols.DefiPulseIndex, this.DPIEnv.adapter);
    const liquitityMigrationDeployed = await liquidityMigrationBuilder.deploy();
    if (liquitityMigrationDeployed != undefined) {
      console.log(`Liquidity Migration: ${liquitityMigrationDeployed.address}`);
    } else {
      console.log(`Liquidity Migration is undefined`);
    }

    this.ensoEnv = liquidityMigrationBuilder.enso;
    this.liquidityMigration = liquidityMigrationBuilder.liquidityMigration;

    // getting the underlying tokens from DPI
    const underlyingTokens = await this.DPIEnv.DPIToken.getComponents();

    // creating the Positions array (that is which token holds how much weigth)
    const positions = [] as Position[];
    const [total, estimates] = await this.ensoEnv.enso.oracle.estimateTotal(
      this.DPIEnv.DPIToken.address,
      underlyingTokens,
    );
    for (let i = 0; i < underlyingTokens.length; i++) {
      const percentage = (new bignumber(estimates[i].toString())).multipliedBy(DIVISOR).dividedBy(total.toString()).toFixed(0);
      positions.push({
        token: underlyingTokens[i],
        percentage: BigNumber.from(percentage),
      });
    }

    // creating a strategy

    const s = new StrategyBuilder(positions, this.ensoEnv.adapters.uniswap.contract.address);

    const data = ethers.utils.defaultAbiCoder.encode(["address[]", "address[]"], [s.tokens, s.adapters]);

    // createStrategy(address,string,string,address[],uint256[],bool,uint256,uint256,uint256,uint256,address,bytes)'

    const tx = await this.ensoEnv.enso.strategyFactory.createStrategy(
      this.liquidityMigration.address, //Because strategies can't be social without initial deposit, must make LiquidityMigration contract manager
      "DPI",
      "DPI",
      s.tokens,
      s.percentages,
      false, //Cannot open strategy without first depositing
      0,
      THRESHOLD,
      SLIPPAGE,
      TIMELOCK,
      this.ensoEnv.routers[1].contract.address,
      data,
    );
    const receipt = await tx.wait();
    const strategyAddress = receipt.events.find((ev: Event) => ev.event === 'NewStrategy').args.strategy
    console.log('Strategy address: ', strategyAddress)
    this.strategy = IStrategy__factory.connect(strategyAddress, this.signers.default);
  });

  it("Token holder should be able to withdraw from pool", async function () {
    // getting holders of DPI Tokens

    const holderBalances: any[] = [];
    for (let i = 0; i < this.DPIEnv.holders.length; i++) {
      holderBalances[i] = {
        holder: await this.DPIEnv.holders[i].getAddress(),
        balance: await this.DPIEnv.DPIToken.balanceOf((await this.DPIEnv.holders[i].getAddress())),
      }
      expect(await this.DPIEnv.DPIToken.balanceOf((await this.DPIEnv.holders[i].getAddress()))).to.gt(BigNumber.from(0));
    };

    // getting the underlying tokens
    const underlyingTokens = await this.DPIEnv.DPIToken.getComponents();
    // interface underlyingTokenBalances {
    //   [key: string]: BigNumber
    // };
    // const ub: underlyingTokenBalances = {};
    
    // for (let index = 0; index < underlyingTokens.length; index++) {
    //       const tokenContract = IERC20__factory.connect(underlyingTokens[index], this.signers.default) as IERC20;
    //       const contractAddress = tokenContract.address;
    //       holderBalances.forEach(async (e)=>
    //         {          
    //           const balance = await tokenContract.balanceOf(e.holder);
    //           // adding key value pair to the empty object created
    //           ub[contractAddress] =  balance;
    //         })   
    // }

    // console.log(ub);
    
    // redeeming the token
    const setBasicIssuanceModule = this.DPIEnv.setBasicIssuanceModule;
    const addressWhoIsRedeeming = await this.DPIEnv.holders[0].getAddress();
    const address_toWhom = addressWhoIsRedeeming;
    const tokenBalance = holderBalances[0].balance;
    const tokenContract = IERC20__factory.connect(underlyingTokens[0], this.DPIEnv.holders[0]) as IERC20;
    const previousUnderlyingTokenBalance = await tokenContract.balanceOf(addressWhoIsRedeeming);
    const tx = await setBasicIssuanceModule.connect(this.DPIEnv.holders[0]).redeem(this.DPIEnv.DPIToken.address,tokenBalance,address_toWhom);
    await tx.wait();
    const updatedDPIBalance = await this.DPIEnv.DPIToken.balanceOf(address_toWhom);
    const updatedUnderlyingTokenBalance = await tokenContract.balanceOf(addressWhoIsRedeeming);
    expect(updatedDPIBalance).to.equal(BigNumber.from(0));
    expect((updatedUnderlyingTokenBalance.gt(previousUnderlyingTokenBalance))).to.be.true;
  });
});
