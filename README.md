# 🚀 Decentralized Kickstarter (Web3 Crowdfunding)

A decentralized crowdfunding platform built with Solidity and Hardhat, applying DeFi concepts and Design Patterns.

## 🌟 Key Features (Level 2 Completed)
- **Factory Pattern:** Automatically deploy new crowdfunding campaigns (`CrowdFundFactory.sol`).
- **ERC20 Integration:** Accept funding in Stablecoins/Tokens (Mock USD) instead of volatile native ETH.
- **DeFi Flow:** Implemented standard ERC20 `approve` and `transferFrom` mechanics for secure pledges.
- **Security:** Built-in safeguards against reentrancy and deadline manipulation.
- **Unit Testing:** Comprehensive test coverage using Hardhat, Chai, and Ethers.js (Time manipulation included).

## 🛠 Tech Stack
- Solidity ^0.8.26
- Hardhat (Development Environment)
- Ethers.js v6
- OpenZeppelin Contracts (ERC20 standard)

## 🏃‍♂️ How to Run Locally

1. Install dependencies:
   ```bash
   npm install
2. Start local blockchain node:
    ```bash
   npx hardhat node
4. Run the full DeFi simulation flow:
   ```bash
   npx hardhat run scripts/defi_flow.js --network localhost

