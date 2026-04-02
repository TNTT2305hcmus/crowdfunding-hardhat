const hre = require("hardhat");

async function main(){
    const [deployer, user1, user2] = await hre.ethers.getSigners();

    console.log("================================================");

    // Deploy Factory
    console.log("Deploying factory ...");
    const factory = await hre.ethers.deployContract("CrowdFundFactory");
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();

    console.log("-------------------------------------------------");

    // User 1 create campaign
    console.log("User 1 is creating a campaign (Goal: 10 ETH)");
    const tx1 = await factory.connect(user1).createCampaign(hre.ethers.parseEther('10'), 3600);
    await tx1.wait();

    // User 2 create campaign
    console.log("User 2 is creating a campaign (Goal: 20 ETH)");
    const tx2 = await factory.connect(user2).createCampaign(hre.ethers.parseEther('10'), 3600);
    await tx2.wait();

    console.log("-------------------------------------------------");

    // Lấy danh sách Campaign để hiển thị lên UI
    const campaigns = await factory.getDeployedCampaigns();
    console.log("List of Deployed Campaigns:");
    console.log(campaigns);

    console.log("------------------------------------");
    
    // Cross-check
    // Kết nối trực tiếp vào Campaign đầu tiên trong mảng để xem ai là quản lý

    const firstCampaignAddress = campaigns[0];
    const firstCampaign = await hre.ethers.getContractAt("CrowdFund", firstCampaignAddress);
    
    const managerOfFirst = await firstCampaign.manager();
    console.log(`Manager of Campaign 1 is: ${managerOfFirst}`);
    console.log(`Is User 1 the manager? ${managerOfFirst === user1.address}`);
    console.log("====================================");

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});