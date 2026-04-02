// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    // Khi deploy, in 1 triệu token
    // (Nhân 10^18 - Chuẩn ERC20)
    // Chuyển vào ví msg.sender (người tạo)
    constructor() ERC20("Mock USD", "mUSD") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}