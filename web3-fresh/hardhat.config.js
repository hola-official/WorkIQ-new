require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    crossfi: {
      url: "https://rpc.testnet.ms",
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      // chainId: 44787
    },
  },
};

