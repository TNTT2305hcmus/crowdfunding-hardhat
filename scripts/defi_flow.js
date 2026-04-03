const hre = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

async function main() {
    const [deployer, user1, user2] = await hre.ethers.getSigners();
    console.log("==================================================");
    console.log("STARTING DEFI CROWDFUNDING SIMULATION");
    console.log("==================================================");

    // Mint token and distribute
    console.log("\n1️⃣ DEPLOYING MOCK TOKEN...");
    const mockToken = await hre.ethers.deployContract("MockToken");
    await mockToken.waitForDeployment();
    const tokenAddress = await mockToken.getAddress();
    console.log("   MockToken (mUSD) deployed at:", tokenAddress);

    // Deployer đang cầm 1 triệu mUSD, phát cho user1 và user2 mỗi người 1,000
    const fundAmount = hre.ethers.parseEther("1000"); 
    await (await mockToken.transfer(user1.address, fundAmount)).wait();
    await (await mockToken.transfer(user2.address, fundAmount)).wait();
    console.log("   Distributed 1,000 mUSD to User 1 and User 2");

    // Use factory to create campaign
    console.log("\nDEPLOYING FACTORY & CREATING CAMPAIGN...");
    const factory = await hre.ethers.deployContract("CrowdFundFactory");
    await factory.waitForDeployment();
    
    const goal = hre.ethers.parseEther("500"); // Mục tiêu 500 mUSD
    const duration = 3600; // 1 tiếng

    // Tạo chiến dịch
    await (await factory.createCampaign(goal, duration, tokenAddress)).wait();
    
    // Lấy địa chỉ chiến dịch vừa tạo
    const campaigns = await factory.getDeployedCampaigns();
    const campaignAddress = campaigns[0];
    console.log("   Campaign created at:", campaignAddress);

    // Kết nối vào Contract Campaign
    const campaign = await hre.ethers.getContractAt("CrowdFund", campaignAddress);

    // User 1 pledge
    console.log("\nUSER 1 IS PLEDGING 300 mUSD...");
    const pledgeAmount1 = hre.ethers.parseEther("300");

    // User 1 ủy quyền cho Campaign được phép rút tiền
    console.log("   User 1 Approving campaign to spend tokens...");
    await (await mockToken.connect(user1).approve(campaignAddress, pledgeAmount1)).wait();
    
    // Sau khi ủy quyền xong mới được gọi hàm pledge
    console.log("   User 1 Calling pledge()...");
    await (await campaign.connect(user1).pledge(pledgeAmount1)).wait();
    console.log("   User 1 pledged successfully!");

    // User 2 pledge
    console.log("\nUSER 2 IS PLEDGING 400 mUSD...");
    const pledgeAmount2 = hre.ethers.parseEther("400");

    console.log("   User 2 Approving campaign to spend tokens...");
    await (await mockToken.connect(user2).approve(campaignAddress, pledgeAmount2)).wait();
    
    console.log("   User 2 Calling pledge()...");
    await (await campaign.connect(user2).pledge(pledgeAmount2)).wait();
    console.log("   User 2 pledged successfully!");

    // Kiểm tra két sắt (Đã thu được 700 mUSD, vượt mục tiêu 500)
    const vaultBalance = await mockToken.balanceOf(campaignAddress);
    console.log(`\nVault Balance: ${hre.ethers.formatEther(vaultBalance)} mUSD`);

    // Manager withdraws
    console.log("\nFAST FORWARDING TIME & WITHDRAWING...");
    await time.increase(4000); // Hack thời gian
    
    console.log("   Manager withdrawing funds...");
    await (await campaign.connect(deployer).withdraw()).wait();

    // Kiểm tra ví manager
    const managerBalance = await mockToken.balanceOf(deployer.address);
    console.log(`   Manager's Token Balance: ${hre.ethers.formatEther(managerBalance)} mUSD`);
    
    // --- KIỂM TRA NFT ---
    console.log("\n CHECKING NFT REWARDS...");
    const nftAddress = await campaign.nftReward();
    const nftContract = await hre.ethers.getContractAt("RewardNFT", nftAddress);
    
    const user1NFTs = await nftContract.balanceOf(user1.address);
    const user2NFTs = await nftContract.balanceOf(user2.address);
    
    console.log(`   User 1 NFT Balance: ${user1NFTs} Badge(s)`); // User 1 góp 300 -> 1 NFT
    console.log(`   User 2 NFT Balance: ${user2NFTs} Badge(s)`); // User 2 góp 400 -> 1 NFT



    console.log("==================================================");
    console.log("SIMULATION COMPLETED SUCCESSFULLY!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});