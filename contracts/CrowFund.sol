// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract CrowdFund {
    event Launch(uint id, address indexed creator, uint goal, uint startAt, uint endAt);
    event Pledge(address indexed caller, uint amount);
    event Refund(address indexed caller, uint amount);

    address public manager;
    uint public goal;
    uint public deadline;
    uint public pledgeAmount;
    mapping(address => uint) public pledged;

    constructor(uint _goal, uint _duration) {
        manager = msg.sender;
        goal = _goal;
        deadline = block.timestamp + _duration;
        emit Launch( 1, manager, goal, block.timestamp, deadline);
    }

    modifier onlyManager (){
        require(msg.sender == manager, "Not manager");
        _;
    }

    // Hàm rút tiền của manager
    function withdraw() external onlyManager {
        require(block.timestamp >= deadline, "Not finished");
        require(pledgeAmount >= goal, "Goal not met");
        (bool success, ) = manager.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    // Hàm quyên góp và thu hồi nếu không đạt mục tiêu
    // Người quyên góp là người trực tiếp gọi hàm -> Họ chính là msg.sender
    function pledge() external payable {
        require(block.timestamp < deadline, "Deadline passed");
        require(msg.value > 0, "Value must be > 0");
        
        pledged[msg.sender] += msg.value;
        pledgeAmount += msg.value;
        emit Pledge(msg.sender, msg.value);
    }

    function refund() external payable {
        require(block.timestamp >= deadline, "Not finished");
        require(pledgeAmount < goal, "Goal met, cannot refund");
        require(pledged[msg.sender] > 0, "Nothing to refund");

        uint amountToRefund = pledged[msg.sender];
        pledged[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amountToRefund}("");
        require(success, "Transfer failed");
        emit Refund(msg.sender, amountToRefund);
    }

}


