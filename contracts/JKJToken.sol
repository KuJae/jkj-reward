// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract JKJToken is ERC20, Ownable, Pausable {
    // 댓글 보상 설정
    uint256 public constant COMMENT_REWARD = 10 * 10**18; // 10 토큰
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 총 발행량 100만 토큰

    // 유저별 댓글 보상 내역 기록
    mapping(address => mapping(bytes32 => bool)) public hasReceivedReward;

    // 이벤트 정의
    event CommentRewarded(address indexed user, bytes32 indexed commentId, uint256 amount);

    constructor() ERC20("JKJ Token", "JKJ") Ownable(msg.sender) {
        _mint(msg.sender, MAX_SUPPLY);
    }

    /**
     * @dev 댓글 작성자에게 토큰을 보상으로 지급합니다.
     * @param user 보상을 받을 사용자 주소
     * @param commentId 댓글의 고유 ID
     */
    function rewardForComment(address user, bytes32 commentId) external onlyOwner whenNotPaused {
        require(user != address(0), "Invalid address");
        require(!hasReceivedReward[user][commentId], "Already rewarded for this comment");
        require(balanceOf(owner()) >= COMMENT_REWARD, "Insufficient reward balance");

        hasReceivedReward[user][commentId] = true;
        _transfer(owner(), user, COMMENT_REWARD);

        emit CommentRewarded(user, commentId, COMMENT_REWARD);
    }

    /**
     * @dev 컨트랙트를 일시 중지합니다.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev 컨트랙트 일시 중지를 해제합니다.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev 토큰 전송 전에 컨트랙트가 일시 중지되었는지 확인합니다.
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
