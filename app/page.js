'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { sendToken, getTokenInfo } from '../utils/contract';
import Image from 'next/image';

// 보상용 지갑 주소 (토큰이 보관된 배포자 주소)
const DISTRIBUTOR_ADDRESS = '0xDaF319F9B32538bAAA8D141D122494c8631b0e37';

export default function Home() {
  const [account, setAccount] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [supply, setSupply] = useState(null);
  const [remaining, setRemaining] = useState(null);

  // 페이지 로드 시 총 발행량 & 남은 리워드 조회
  useEffect(() => {
    async function fetchTokenData() {
      try {
        const provider = new ethers.BrowserProvider(
          window.ethereum || ethers.getDefaultProvider()
        );
        const { total } = await getTokenInfo(provider);
        setSupply(total);
        // 남은 리워드 (배포자 잔액)
        const contract = new ethers.Contract(
          /* same contract address as in utils */
          '0xf6b91D98bDd24561155bDafd823Df5DAf9644B08',
          [
            'function balanceOf(address) view returns (uint256)',
            'function decimals() view returns (uint8)'
          ],
          provider
        );
        const decimals = await contract.decimals();
        const bal = await contract.balanceOf(DISTRIBUTOR_ADDRESS);
        setRemaining(ethers.formatUnits(bal, decimals));
      } catch (err) {
        console.error('토큰 데이터 조회 오류:', err);
      }
    }
    fetchTokenData();
  }, []);

  // 지갑 연결
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('🦊 MetaMask가 설치되어 있지 않습니다.');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (err) {
      console.error('지갑 연결 오류:', err);
      alert('⚠️ 지갑 연결에 실패했습니다.');
    }
  };

  // 토큰 전송
  const handleSendToken = async () => {
    if (claimed) {
      alert('이미 리워드를 받으셨습니다!');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const txHash = await sendToken(signer, account);
      setClaimed(true);
      // 리워드 전송 후 남은 잔액 갱신
      const contract = new ethers.Contract(
        '0xf6b91D98bDd24561155bDafd823Df5DAf9644B08',
        ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
        provider
      );
      const decimals = await contract.decimals();
      const bal = await contract.balanceOf(DISTRIBUTOR_ADDRESS);
      setRemaining(ethers.formatUnits(bal, decimals));
      alert(`🎉 10 JKJ 토큰 전송 완료!\nTX: ${txHash}`);
    } catch (error) {
      console.error('토큰 전송 오류:', error);
      if (error.message.includes('insufficient')) {
        alert('⚠️ 토큰 잔액이 부족합니다. 배포 지갑의 잔액을 확인해주세요.');
      } else {
        alert(`⚠️ 토큰 전송 실패: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center">
          <Image src="/cute-friends.png" width={180} height={180} alt="귀여운 친구들" />
          <h1 className="mt-4 text-3xl font-bold">JKJ 리워드 허브 🎁</h1>
          <p className="mt-2 text-gray-600">재구 친구들을 위한 리워드 페이지!</p>
          {supply && (
            <p className="mt-2 text-gray-700">
              총 발행량: <span className="font-semibold">{supply}</span> JKJ
            </p>
          )}
          {remaining && (
            <p className="mt-1 text-gray-700">
              남은 리워드: <span className="font-semibold">{remaining}</span> JKJ
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center">
          {!account ? (
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              🦊 지갑 연결하기
            </button>
          ) : !claimed ? (
            <>
              <p className="text-green-600 font-medium break-words text-center">{account}</p>
              <button
                onClick={handleSendToken}
                className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                🎈 리워드 토큰 전송
              </button>
            </>
          ) : (
            <p className="mt-4 text-gray-500 text-center">이미 리워드를 받으셨습니다! 🎉</p>
          )}
        </div>

        {/* MetaMask 사용 가이드 */}
        <div className="mt-8 bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-bold mb-2">MetaMask 사용 가이드</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-1">
            <li>
              MetaMask 설치 (<a href="https://metamask.io/" target="_blank" className="text-blue-600">다운로드</a>)
            </li>
            <li>지갑 생성 또는 기존 지갑 복구</li>
            <li>이 페이지에서 "지갑 연결하기" 클릭</li>
            <li>
              토큰 가져오기: 계약 주소 붙여넣기{' '}
              <code className="bg-gray-100 px-1 rounded">0xf6b91D98bDd24561155bDafd823Df5DAf9644B08</code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

