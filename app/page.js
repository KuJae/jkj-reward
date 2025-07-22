'use client';

import { useState } from "react";
import { ethers } from "ethers";
import { sendToken } from "../utils/contract";
import Image from "next/image";

export default function Home() {
  const [account, setAccount] = useState(null);
  const [claimed, setClaimed] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("🦊 MetaMask가 설치되어 있지 않습니다.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (err) {
      console.error("지갑 연결 오류:", err);
      alert("⚠️ 지갑 연결에 실패했습니다.");
    }
  };

  const handleSendToken = async () => {
    if (claimed) {
      alert("이미 리워드를 받으셨습니다!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const txHash = await sendToken(signer, account);
      setClaimed(true);
      alert(`🎉 10 JKJ 토큰 전송 완료!\nTX: ${txHash}`);
    } catch (error) {
      console.error("토큰 전송 오류:", error);
      if (error.message.includes("insufficient")) {
        alert("⚠️ 토큰 잔액이 부족합니다. 배포 지갑의 잔액을 확인해주세요.");
      } else {
        alert(`⚠️ 토큰 전송 실패: ${error.message}`);
      }
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f0f2f5",
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        maxWidth: "480px",
        width: "100%",
      }}>
        <Image src="/cute-friends.png" alt="귀여운 친구들" width={180} height={180} />
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "20px 0" }}>JKJ 리워드 사이트 🎁</h1>
        <p style={{ fontSize: "16px", marginBottom: "24px" }}>재구 친구들을 위한 귀여운 리워드 페이지예요 😊</p>

        {!account ? (
          <button onClick={connectWallet} style={buttonStyle}>
            🦊 지갑 연결하기
          </button>
        ) : !claimed ? (
          <>
            <p style={{ color: "green", fontWeight: "bold", marginBottom: "16px" }}>
              ✅ 연결된 지갑: {account}
            </p>
            <button
              onClick={handleSendToken}
              style={{
                ...buttonStyle,
                backgroundColor: "#6366f1",
                color: "white",
              }}
            >
              🎈 리워드 토큰 전송
            </button>
          </>
        ) : (
          <p style={{ marginTop: "24px", color: "#888" }}>
            이미 리워드를 받으셨습니다! 🎉
          </p>
        )}

        <div style={{ marginTop: "32px", fontSize: "0.9rem", color: "#666" }}>
          Powered by JKJ | For 재구 친구들 ❤️
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "12px 24px",
  fontSize: "16px",
  fontWeight: "bold",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: "#e0e0e0",
};
