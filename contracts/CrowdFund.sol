// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrowdFund {
    event Launch(uint id, address indexed creator, uint goal, uint startAt, uint endAt);
    event Pledge(address indexed caller, uint amount);
    event Refund(address indexed caller, uint amount);

    address public manager;
    uint public goal;
    uint public deadline;
    // uint public pledgeAmount;
    IERC20 public token;
    mapping(address => uint) public pledged;

    constructor(address _manager, uint _goal, uint _duration, address _token) {
        manager = _manager;
        goal = _goal;
        deadline = block.timestamp + _duration;
        token = IERC20(_token);
        emit Launch( 1, manager, goal, block.timestamp, deadline);
    }

    modifier onlyManager (){
        require(msg.sender == manager, "Not manager");
        _;
    }

    // Phase 1: Quyên góp bằng ETH

    // Hàm rút tiền của manager
    // function withdraw() external onlyManager {
    //     require(block.timestamp >= deadline, "Not finished");
    //     require(pledgeAmount >= goal, "Goal not met");
    //     (bool success, ) = manager.call{value: address(this).balance}("");
    //     require(success, "Transfer failed");
    // }

    // Hàm quyên góp và thu hồi nếu không đạt mục tiêu
    // Người quyên góp là người trực tiếp gọi hàm -> Họ chính là msg.sender
    // function pledge(uint _amount) external {
    //     require(block.timestamp < deadline, "Deadline passed");
    //     require(msg.value > 0, "Value must be > 0");
    //     pledged[msg.sender] += msg.value;
    //     pledgeAmount += msg.value;
    //     emit Pledge(msg.sender, msg.value);
    // }

    // function refund() external payable {
    //     require(block.timestamp >= deadline, "Not finished");
    //     require(pledgeAmount < goal, "Goal met, cannot refund");
    //     require(pledged[msg.sender] > 0, "Nothing to refund");

    //     uint amountToRefund = pledged[msg.sender];
    //     pledged[msg.sender] = 0;
    //     (bool success, ) = msg.sender.call{value: amountToRefund}("");
    //     require(success, "Transfer failed");
    //     emit Refund(msg.sender, amountToRefund);
    // }



    // Phase 2: Quyên góp bằng ERC20 (Stable coin)

    function withdraw() external onlyManager {
        require(block.timestamp >= deadline, "Not finished");
        // Kiểm tra số dư thực tế của contract
        require(token.balanceOf(address(this)) >= goal, "Goal not met");
        token.transfer(manager, token.balanceOf(address(this)));
    }

    // Không nhận ETH nữa nên bỏ đi payable
    // Thêm _amount vì không có msg.value nên user phải truyền vào họ muốn đóng góp bao nhiêu
    function pledge(uint _amount) external {
        require(block.timestamp < deadline, "Deadline passed");
        require(_amount > 0, "Amount must be > 0");
        // Lấy tiền từ ví người dùng
        token.transferFrom(msg.sender, address(this), _amount);
        pledged[msg.sender] += _amount;
        emit Pledge(msg.sender, _amount);
    }

    function refund() external {
        require(block.timestamp >= deadline, "Not finished");
        require(token.balanceOf(address(this)) < goal, "Goal met, cannot refund");
        uint amountToRefund = pledged[msg.sender];
        pledged[msg.sender] = 0;
        token.transfer(msg.sender, amountToRefund);
    }

}


