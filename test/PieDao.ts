import { ethers } from "hardhat";
import { BigNumber, Contract, Event } from "ethers";
import { Signers, MainnetSigner } from "../types";
import { IStrategy__factory } from "../typechain";
import { shouldStakeLPToken, shouldMigrateToStrategy } from "./PieDao.behavior";
import { AcceptedProtocols, LiquidityMigrationBuilder } from "../src/liquiditymigration"
import { PieDaoEnvironmentBuilder } from "../src/piedao";
import { StrategyBuilder, Position } from "@enso/contracts"
import { DIVISOR, THRESHOLD, TIMELOCK, SLIPPAGE } from "../src/constants"

describe("PieDao: Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    const signers = await ethers.getSigners();
    this.signers.default = signers[0];
    this.signers.admin = signers[10];

    this.pieDaoEnv = await new PieDaoEnvironmentBuilder(this.signers.default).connect()

    const liquidityMigrationBuilder = await new LiquidityMigrationBuilder(this.signers.admin)
    liquidityMigrationBuilder.addAdapter(AcceptedProtocols.PieDao, this.pieDaoEnv.adapter)
    await liquidityMigrationBuilder.deploy()

    this.ensoEnv = liquidityMigrationBuilder.enso
    this.liquidityMigration = liquidityMigrationBuilder.liquidityMigration

    // Create strategy
    const pool = this.pieDaoEnv.pools[0];

    const positions = [] as Position[]
    for (let i = 0; i < pool.tokens.length; i++) {
      positions.push({
        token: pool.tokens[i],
        percentage: BigNumber.from(DIVISOR).div(pool.tokens.length)
      })
    }
    const s = new StrategyBuilder(positions, this.ensoEnv.adapters.uniswap.contract.address)

    const data = ethers.utils.defaultAbiCoder.encode(['address[]', 'address[]'], [s.tokens, s.adapters])
    const tx = await this.ensoEnv.enso.strategyFactory.createStrategy(
      this.liquidityMigration.address, //Because strategies can't be social without initial deposit, must make LiquidityMigration contract manager
      'PieDao',
      'PIE',
      s.tokens,
      s.percentages,
      false, //Cannot open strategy without first depositing
      0,
      THRESHOLD,
      SLIPPAGE,
      TIMELOCK,
      this.ensoEnv.routers[1].contract.address,
      data
    )
    const receipt = await tx.wait()
    const strategyAddress = receipt.events.find((ev: Event) => ev.event === 'NewStrategy').args.strategy
    console.log('Strategy address: ', strategyAddress)
		this.strategy = IStrategy__factory.connect(strategyAddress, this.signers.default);
  });

  /*
  describe("PoolRegistry", function () {
    shouldMigrateFromSmartPool();
  });
  */

  describe("Stake", function () {
    shouldStakeLPToken()
  })

  describe("Migrate", function () {
    shouldMigrateToStrategy()
  })
});
