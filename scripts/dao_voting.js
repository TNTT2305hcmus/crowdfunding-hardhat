const hre = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

async function main() {
    // Thêm 'agency' (Bên thứ 3) làm người nhận tiền giải ngân
    const [manager, user1, user2, agency] = await hre.ethers.getSigners();

    console.log("==================================================");
    console.log("STARTING DAO VOTING SIMULATION");
    console.log("==================================================");

    // Setup mint and create campaign
    const mockToken = await hre.ethers.deployContract("MockToken");
    await mockToken.waitForDeployment();
    const tokenAddress = await mockToken.getAddress();

    await (await mockToken.transfer(user1.address, hre.ethers.parseEther("1000"))).wait();
    await (await mockToken.transfer(user2.address, hre.ethers.parseEther("1000"))).wait();

    const factory = await hre.ethers.deployContract("CrowdFundFactory");
    await factory.waitForDeployment();
    await (await factory.createCampaign(hre.ethers.parseEther("500"), 3600, tokenAddress)).wait();
    
    const campaignAddress = (await factory.getDeployedCampaigns())[0];
    const campaign = await hre.ethers.getContractAt("CrowdFund", campaignAddress);

    // Pledge
    console.log("\n Users are pledging...");
    await (await mockToken.connect(user1).approve(campaignAddress, hre.ethers.parseEther("300"))).wait();
    await (await campaign.connect(user1).pledge(hre.ethers.parseEther("300"))).wait();

    await (await mockToken.connect(user2).approve(campaignAddress, hre.ethers.parseEther("400"))).wait();
    await (await campaign.connect(user2).pledge(hre.ethers.parseEther("400"))).wait();
    console.log("  Total pledged: 700 mUSD. Total contributors: 2");

    // Create withdraw request
    console.log("\nFast forwarding time...");
    await time.increase(4000);

    console.log("\nManager creates a withdrawal request...");
    const requestValue = hre.ethers.parseEther("500");
    // Xin 500 mUSD trả cho Agency (Xưởng may)
    await (await campaign.connect(manager).createRequest("Pay Manufacturing Agency", requestValue, agency.address)).wait();
    console.log(" Request #0 created: 'Pay Manufacturing Agency' (500 mUSD)");

    // Voting
    console.log("\nVoting starts!");
    
    console.log("  User 1 votes YES.");
    await (await campaign.connect(user1).approveRequest(0)).wait();

    console.log("\n Manager acts greedy & attempts to finalize early...");
    try {
        await campaign.connect(manager).finalizeRequest(0);
    } catch (error) {
        // Lỗi này là CỐ TÌNH bị bắn ra bởi dòng require() của bạn
        console.log("  SMART CONTRACT BLOCKED: Not enough approvals! (Current: 1/2 votes = 50%)");
    }

    console.log("\n  User 2 votes YES.");
    await (await campaign.connect(user2).approveRequest(0)).wait();

    // Giải ngân nếu đủ điều kiện
    console.log("\nManager finalizes the request again...");
    await (await campaign.connect(manager).finalizeRequest(0)).wait();
    console.log("   SUCCESS! Funds securely transferred to Agency.");

    const agencyBalance = await mockToken.balanceOf(agency.address);
    console.log(`   Agency Balance: ${hre.ethers.formatEther(agencyBalance)} mUSD`);

    console.log("==================================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});