const hre = require("hardhat");

async function main(){
    // Get information of deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with the account: ", deployer.address);

    // Define initial arguments
    const GOAL = hre.ethers.parseEther("10");
    const DURATION = 3600;

    // Deploy contract
    const crowdFund = await hre.ethers.deployContract("CrowdFund", [GOAL, DURATION]);
    await crowdFund.waitForDeployment();

    console.log("CrowdFund deployed to:", await crowdFund.getAddress());
    console.log("Goal:", GOAL.toString());
    console.log("Duration:", DURATION);
}

// Tackle error
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})