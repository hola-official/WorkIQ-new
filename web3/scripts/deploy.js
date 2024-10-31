const { ethers } = require("hardhat");

async function main() {
  const taskManagement = await ethers.deployContract("TaskManagement", [
    "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
  ]);

  await taskManagement.waitForDeployment();

  // console.log(taskManagement);

  console.log("Contract Deployed at " + taskManagement.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// TaskManagement new contract address: 0x737d968E3c861b19DE231EE700C2cB473abb0c25
// TaskManagement contract address: 0x863a65fC1A6FBf95b90ac9e32E851fD9977AC589
// CA: 0x430c0C180d1E5b8D8E91A605Bd5D7846FB0f1e22
