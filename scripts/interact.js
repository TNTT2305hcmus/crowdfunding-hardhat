const hre = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

async function main(){
    // Set up: Get list of wallets
    const [manager, user1, user2] = await hre.ethers.getSigners();

    // Manager address
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    console.log("-----------------------------------------");
    console.log("📡 Connecting to contract at:", CONTRACT_ADDRESS);

    // Connect to available contract - Not deploy new contract
    const crowdFund = await hre.ethers.getContractAt("CrowdFund", CONTRACT_ADDRESS);

    // Check initial information
    const goal = await crowdFund.goal();
    console.log(`🎯 Goal: ${hre.ethers.formatEther(goal)} ETH`);

    console.log("-----------------------------------------");

    // User1 pledge
    console.log("User 1 is pledging 7 ETH...");
    // .connect(user1) for determining who will sign this transaction
    const tx1 = await crowdFund.connect(user1).pledge({value: hre.ethers.parseEther("7")});
    // Waiting for transaction is writen to block
    await tx1.wait(); 
    console.log("✅ User 1 pledged successfully!");

    // User2 pledge
    console.log("User 2 is pledging 5 ETH...");
    // .connect(user1) for determining who will sign this transaction
    const tx2 = await crowdFund.connect(user2).pledge({value: hre.ethers.parseEther("5")});
    // Waiting for transaction is writen to block
    await tx2.wait(); 
    console.log("✅ User 2 pledged successfully!");

    // Check total pledgeAmount
    const totalPledged = await crowdFund.pledgeAmount();
    console.log(`💰 Total Pledged: ${hre.ethers.formatEther(totalPledged)} ETH`);

    // Withdraw
    // Only can withdraw after meeting deadline
    try{
        console.log("⏳ Attempting to withdraw...");
        const tx3 = await crowdFund.connect(manager).withdraw();
        await tx3.wait();
        console.log("🎉 Withdraw success! Money sent to manager.");
    } catch(error){
        console.log("❌ Withdraw failed (Expected if deadline not passed):", error.message);
    }

    console.log("-----------------------------------------");
    console.log("⏳ Time Travel: Fast forward 4000 seconds...");
    // We increase time to pass deadline
    await time.increase(4000);
    console.log("💸 Manager is withdrawing...");
    const txWithdraw = await crowdFund.connect(manager).withdraw();
    await txWithdraw.wait();
    console.log("🎉 Withdraw success!");
    const managerBalance = await hre.ethers.provider.getBalance(manager.address);
    console.log(`💰 Manager balance: ${hre.ethers.formatEther(managerBalance)} ETH`);
    const contractBalance = await hre.ethers.provider.getBalance(CONTRACT_ADDRESS);
    console.log(`🏦 Contract balance: ${hre.ethers.formatEther(contractBalance)} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});