// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// Ownable -> Dùng để phân quyền
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    string public constant BADGE_URI = "ipfs://bafkreift5pjw2b4nrfzovrotxe4jakiqeivjrtgi44gs522wghed6xdltq";

    // Inialize NFT
    // initialOwner ref is address of contract crowdFund
    constructor(string memory name, string memory symbol, address initialOwner) 
        ERC721(name, symbol) Ownable(initialOwner)
    {}

    // Create NFT and only Owner can call
    function mint (address to) external onlyOwner{
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, BADGE_URI);
    }
}