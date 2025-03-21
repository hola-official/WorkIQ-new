require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    crossfi: {
      url: `${process.env.CROSSFI_URL}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      gas: 5000000,
    },
  },
};
