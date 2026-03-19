import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
    "CELO"
  );

  const CeloRaffle = await ethers.getContractFactory("CeloRaffle");
  const raffle = await CeloRaffle.deploy();

  await raffle.waitForDeployment();
  const address = await raffle.getAddress();

  console.log("\nCeloRaffle deployed to:", address);
  console.log("\nUpdate your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);

  // Register ERC-8004 agent
  const agentId = ethers.keccak256(ethers.toUtf8Bytes("raffle-agent-v1"));
  const metadata = JSON.stringify({
    name: "CeloRaffleAgent",
    version: "1.0.0",
    capabilities: ["commentary", "draw-management", "winner-announcement"],
    model: "gemini-2.0-flash",
    erc8004: true,
  });

  console.log("\nRegistering ERC-8004 agent...");
  const tx = await raffle.registerAgent(agentId, metadata);
  await tx.wait();
  console.log("Agent registered. ID:", agentId);

  const activateTx = await raffle.activateAgent(agentId);
  await activateTx.wait();
  console.log("Agent activated.");

  console.log("\nDone!");
  console.log("Copy contract address to NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});