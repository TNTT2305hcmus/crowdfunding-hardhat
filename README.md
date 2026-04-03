# 🚀 Decentralized Kickstarter (Web3 Crowdfunding)

A decentralized crowdfunding platform built with Solidity and Hardhat, applying DeFi concepts and Design Patterns.

## 🌟 Key Features (Level 3 Completed)

- **Factory Pattern:** Automatically deploy isolated crowdfunding campaigns via `CrowdFundFactory.sol`, allowing multiple projects to run simultaneously.
- **DeFi Flow (ERC20):** Accept funding in Stablecoins (Mock USD) to prevent extreme price volatility, utilizing standard `approve` and `transferFrom` mechanics.
- **Gamification & NFT Rewards (ERC721):** - Exclusive VIP system for top contributors.
  - Automatically mints and sends a "Campaign VIP Badge" (NFT) directly to the wallets of users who pledge 100 mUSD or more.
  - Fully on-chain automated distribution.
- **Security:** Built-in safeguards against reentrancy, timeline manipulation, and unauthorized minting (Ownable standard).

## 🛠 Tech Stack
- **Smart Contracts:** Solidity ^0.8.26
- **Development Environment:** Hardhat
- **Libraries:** OpenZeppelin (ERC20, ERC721, Ownable)
- **Testing & Interaction:** Ethers.js v6, Chai, Hardhat Network Helpers (Time Travel)

## 📁 Project Structure
- `contracts/`: Core logic (`CrowdFund.sol`, `CrowdFundFactory.sol`, `RewardNFT.sol`, `MockToken.sol`).
- `scripts/`: Deployment and full DeFi cycle simulation (`defi_flow.js`).

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

