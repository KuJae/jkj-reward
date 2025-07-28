const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying JKJ Token...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const JKJToken = await ethers.getContractFactory("JKJToken");
  const token = await JKJToken.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("JKJToken deployed to:", address);
  
  console.log("Token details:");
  console.log("Name:", await token.name());
  console.log("Symbol:", await token.symbol());
  console.log("Total supply:", ethers.formatEther(await token.totalSupply()), "JKJ");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
