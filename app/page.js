"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { sendToken } from "../utils/contract";
import Image from "next/image";

export default function Home() {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } else {
      alert("MetaMask가 설치되어 있지 않습니다.");
    }
  };

  const handleSendToken = async () => {
    try {
      const tx = await sendToken();
      alert("🎉 10 JKJ 토큰 전송 완료!\n\nTX:\n" + tx);
    } catch (error) {
      alert("토큰 전송 실패: " + error.message);
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
        <div style={{ marginBottom: "24px" }}>
          {account ? (
            <p style={{ color: "green", fontWeight: "bold" }}>✅ 연결된 지갑: {account}</p>
          ) : (
            <button onClick={connectWallet} style={buttonStyle}>지갑 연결하기</button>
          )}
        </div>
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