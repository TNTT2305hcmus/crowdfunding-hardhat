// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26; 

import "./CrowdFund.sol";

contract CrowdFundFactory{
    event CampaignCreated(address indexed campaignAddress, address indexed creator, uint goal);

    address[] public deployCampaigns;

    function createCampaign(uint _goal, uint _duration, address _token) public {
        CrowdFund newCampaign = new CrowdFund(msg.sender, _goal, _duration, _token);
        deployCampaigns.push(address(newCampaign));
        emit CampaignCreated(address(newCampaign), msg.sender, _goal);
    }

    function getDeployedCampaigns() external view returns (address[] memory){
        return deployCampaigns;
    }


}