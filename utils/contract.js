import { ethers } from "ethers";

// ✅ Remix에서 배포한 컨트랙트 주소
const CONTRACT_ADDRESS = "0xf6b91D98bDd24561155bDafd823Df5DAf9644B08";

// ✅ ERC20 최소 ABI: transfer 함수와 토큰 정보 함수들 포함
const ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)"
];

// ✅ 토큰 전송 함수
export async function sendToken(signer, toAddress) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const decimals = await contract.decimals(); // 기본적으로 18
  const amount = ethers.parseUnits("10", decimals); // 10개 전송

  const tx = await contract.transfer(toAddress, amount);
  await tx.wait(); // 전송 완료까지 대기

  return tx.hash; // 전송된 트랜잭션 해시 반환
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
