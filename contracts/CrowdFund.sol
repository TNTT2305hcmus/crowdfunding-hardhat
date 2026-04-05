// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./RewardNFT.sol";

// Trang bị ReentrancyGuard và Pausable
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CrowdFund is ReentrancyGuard, Pausable {
    event Launch(uint id, address indexed creator, uint goal, uint startAt, uint endAt);
    event Pledge(address indexed caller, uint amount);
    event Refund(address indexed caller, uint amount);

    address public manager;
    uint public goal;
    uint public deadline;
    mapping(address => uint) public pledged;
    // uint public pledgeAmount;
    IERC20 public token;
    RewardNFT public nftReward;
    uint public constant NFT_TIER = 100 * 10**18;
    mapping(address => bool) public hasClaimedNFT;

    // Phát triển hệ thống DAO Voting
    struct Request {
        string description; // Lý do rút tiền
        uint value;         // Số tiền muốn rút
        address recipient;  // Địa chỉ người nhận 
        bool complete;      // Đã giải ngân
        uint approvalCount; // Số phiểu đồng ý hiện tại
    }

    // Danh sách yêu cầu rút tiền
    Request[] public requests;

    // Lưu trữ xem ai đã vote cho request nào
    mapping(uint => mapping(address => bool)) public approvals;

    // Tổng số người đã góp tiền
    uint public contributorsCount;

    constructor(address _manager, uint _goal, uint _duration, address _token) {
        manager = _manager;
        goal = _goal;
        deadline = block.timestamp + _duration;
        token = IERC20(_token);
        // Automatic deploy contract RewardNFT
        nftReward = new RewardNFT("Campain VIP Badge", "CBG", address(this));
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

    function withdraw() external onlyManager nonReentrant {
        require(block.timestamp >= deadline, "Not finished");
        // Kiểm tra số dư thực tế của contract
        require(token.balanceOf(address(this)) >= goal, "Goal not met");
        token.transfer(manager, token.balanceOf(address(this)));
    }

    // Không nhận ETH nữa nên bỏ đi payable
    // Thêm _amount vì không có msg.value nên user phải truyền vào họ muốn đóng góp bao nhiêu
    function pledge(uint _amount) external whenNotPaused {
        require(block.timestamp < deadline, "Deadline passed");
        require(_amount > 0, "Amount must be > 0");

        if(pledged[msg.sender] == 0){
            contributorsCount++;
        }

        // Lấy tiền từ ví người dùng
        token.transferFrom(msg.sender, address(this), _amount);
        pledged[msg.sender] += _amount;
        // Cấp NFT khi quyên góp vượt NFT_TIER
        if(pledged[msg.sender] >= NFT_TIER && !hasClaimedNFT[msg.sender]){
            nftReward.mint(msg.sender);
            hasClaimedNFT[msg.sender] = true;
        }
        emit Pledge(msg.sender, _amount);
    }

    function refund() external nonReentrant {
        require(block.timestamp >= deadline, "Not finished");
        require(token.balanceOf(address(this)) < goal, "Goal met, cannot refund");
        uint amountToRefund = pledged[msg.sender];
        pledged[msg.sender] = 0;
        token.transfer(msg.sender, amountToRefund);
    }

    function createRequest(string memory _description, uint _value, address _recipient) external onlyManager whenNotPaused {
        Request memory newRequest = Request({
            description: _description,
            value: _value,
            recipient: _recipient,
            complete: false,
            approvalCount: 0
        });
        requests.push(newRequest);
    }

    function approveRequest(uint _requestId) public {
        require(pledged[msg.sender] > 0, "Caller must be contributor");
        require(approvals[_requestId][msg.sender] == false, "Caller already voted");

        requests[_requestId].approvalCount++;
        approvals[_requestId][msg.sender] = true;
    }

    function finalizeRequest(uint _requestId) external onlyManager nonReentrant {
        Request storage request = requests[_requestId];

        require(!request.complete, "Request already completed");
        require(request.approvalCount > (contributorsCount / 2), "Not enough approvals");

        // Đánh dấu hoàn thành trước khi chuyển tiền (Chống Reentrancy)
        request.complete = true;
        token.transfer(request.recipient, request.value);
    }

    function togglePause() external onlyManager {
        if(paused()){
            _unpause();
        } else {
            _pause();
        }
    }

}


