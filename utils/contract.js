import { ethers } from "ethers";

// ✅ 새로 배포한 JKJToken 컨트랙트 주소
const CONTRACT_ADDRESS = "0xf6b91D98bDd24561155bDafd823Df5DAf9644B08"; // TODO: 새로 배포한 주소로 업데이트 필요

// ✅ JKJToken ABI
const ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function rewardForComment(address user, bytes32 commentId) external",
  "function hasReceivedReward(address user, bytes32 commentId) view returns (bool)"
];

// ✅ 댓글 작성 보상 함수
export async function sendToken(signer, toAddress, commentId) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  
  // commentId를 bytes32로 변환
  const commentHash = ethers.keccak256(ethers.toUtf8Bytes(commentId));
  
  // 이미 보상을 받았는지 확인
  const alreadyRewarded = await contract.hasReceivedReward(toAddress, commentHash);
  if (alreadyRewarded) {
    throw new Error("이미 이 댓글에 대한 리워드를 받으셨습니다!");
  }

  // 보상 지급
  const tx = await contract.rewardForComment(toAddress, commentHash);
  await tx.wait(); // 트랜잭션 완료 대기

  return tx.hash; // 트랜잭션 해시 반환
}

// ✅ 토큰 정보 조회 함수
export async function getTokenInfo(provider) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  
  const decimals = await contract.decimals();
  const total = ethers.formatUnits(await contract.totalSupply(), decimals);
  const name = await contract.name();
  const symbol = await contract.symbol();

  return {
    name,
    symbol,
    decimals,
    total
  };
}
