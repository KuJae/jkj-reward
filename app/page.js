'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { sendToken, getTokenInfo } from '../utils/contract';
import { Wallet, Coins, Users, Info, Gift, Zap, Shield, Sparkles } from 'lucide-react';

// 보상용 지갑 주소 (토큰이 보관된 배포자 주소)
const DISTRIBUTOR_ADDRESS = '0xDaF319F9B32538bAAA8D141D122494c8631b0e37';

export default function Home() {
  const [account, setAccount] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [supply, setSupply] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rewardedComments, setRewardedComments] = useState(new Set());

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
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (err) {
      console.error('지갑 연결 오류:', err);
      alert('⚠️ 지갑 연결에 실패했습니다.');
    }
    setLoading(false);
  };

  // 토큰 전송
  const handleSendToken = async (commentId) => {
    if (rewardedComments.has(commentId)) {
      alert('이미 이 댓글에 대한 리워드를 받으셨습니다!');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const txHash = await sendToken(signer, account);
      setRewardedComments(prev => new Set([...prev, commentId]));
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
    setLoading(false);
  };

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 px-7 py-4 rounded-2xl font-medium transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg scale-105 border border-white/30'
          : 'bg-white/10 backdrop-blur-xl text-white/80 hover:bg-white/20 hover:text-white border border-white/20'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, color = 'purple' }) => (
    <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl hover:bg-white/20 transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${color}-400/90 to-${color}-600/90 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-white/70 text-sm font-medium mb-2">{label}</p>
      <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );

  const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
    <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 border border-white/30 hover:bg-white/20 transition-all duration-300 group shadow-xl">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative`}>
        <Icon className="w-8 h-8 text-white" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400/80 rounded-full animate-pulse"></div>
      </div>
      <h3 className="text-white text-xl font-semibold mb-3">{title}</h3>
      <p className="text-white/70 text-base leading-relaxed">{description}</p>
    </div>
  );

  const HomeTab = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        {/* 귀여운 아바타 섹션 */}
        <div className="relative w-40 h-40 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <span className="text-6xl transform -translate-y-1">🐰</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-bounce delay-300 flex items-center justify-center">
            <span className="text-sm">💫</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            재구의 리워드 허브 🎁
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            안녕하세요! <span className="font-bold text-pink-400">재구</span>가 만든 특별한 리워드 시스템입니다.<br/>
            제가 준비한 특별한 토큰으로 여러분을 응원할게요! 💝
          </p>
        </div>
        
        {/* Cute Friends Image */}
        <div className="relative w-full max-w-2xl mx-auto mt-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-yellow-400/20 rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-500"></div>
          <div className="relative overflow-hidden rounded-3xl border-2 border-white/20 shadow-xl">
            <img 
              src="/cute-friends.png" 
              alt="재구의 귀여운 친구들" 
              className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Coins} 
          label="총 발행량" 
          value={supply ? `${supply} JKJ` : '로딩 중...'} 
          color="yellow" 
        />
        <StatCard 
          icon={Gift} 
          label="남은 리워드" 
          value={remaining ? `${remaining} JKJ` : '로딩 중...'} 
          color="green" 
        />
        <StatCard icon={Users} label="참여자 수" value="1,247명" color="blue" />
      </div>

      {/* Wallet Connection */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="text-center space-y-6">
          {!account ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                  재구의 토큰 친구들
                </span>이 되어주세요! 🌟
              </h2>
              <button
                onClick={connectWallet}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-semibold text-lg hover:opacity-90 transform hover:scale-102 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto border border-white/30 backdrop-blur-xl relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative flex items-center gap-3">
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Wallet className="w-6 h-6" />
                  )}
                  {loading ? '연결하는 중...' : '🦊 지갑 연결하기'}
                </div>
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-2xl p-4 backdrop-blur-xl border border-white/20">
                <p className="text-pink-300 font-mono text-sm break-all">
                  {account}
                </p>
              </div>
              {!claimed ? (
                <div className="space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                      <span className="text-4xl">🎁</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSendToken}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-semibold text-lg hover:opacity-90 transform hover:scale-102 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto border border-white/30 backdrop-blur-xl relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
                    <div className="relative flex items-center gap-3">
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Gift className="w-6 h-6" />
                      )}
                      {loading ? '선물 포장 중...' : '✨ 재구의 선물 받기'}
                    </div>
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                      <span className="text-5xl">🎉</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center">
                      <span className="text-lg">✨</span>
                    </div>
                  </div>
                  <p className="text-pink-300 text-xl font-semibold">와아! 선물을 받았어요! �</p>
                  <p className="text-white/70">재구의 특별한 토큰과 함께 행복한 하루 보내세요 💝</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CommentsTab = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8">댓글 남기고 토큰 받기 ✨</h2>
      
      {/* 댓글 입력 섹션 */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="재구에게 응원의 한마디를 남겨주세요! 💝"
            className="w-full h-32 bg-white/5 backdrop-blur-sm rounded-xl p-4 text-white placeholder-white/50 border border-white/10 focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 resize-none"
          />
          <div className="flex justify-between items-center">
            <p className="text-white/60 text-sm">
              {!account ? '댓글을 작성하려면 지갑을 연결해주세요!' : '댓글을 작성하면 10 JKJ 토큰을 받을 수 있어요!'}
            </p>
            <button
              onClick={handleSubmitComment}
              disabled={!account || loading}
              className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : '댓글 작성하기'}
            </button>
          </div>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-lg">🦊</span>
                </div>
                <div>
                  <p className="text-white/90 font-medium">{`${comment.author.slice(0, 6)}...${comment.author.slice(-4)}`}</p>
                  <p className="text-white/50 text-sm">{comment.timestamp}</p>
                </div>
              </div>
              {rewardedComments.has(comment.id) && (
                <div className="bg-green-400/10 px-3 py-1 rounded-full">
                  <span className="text-green-400 text-sm">리워드 지급완료 ✓</span>
                </div>
              )}
            </div>
            <p className="text-white/80 leading-relaxed">{comment.text}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50">아직 댓글이 없어요! 첫 번째 댓글을 작성해보세요 ✨</p>
          </div>
        )}
      </div>
    </div>
  );

  const AboutTab = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8">JKJ 토큰에 대해</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          icon={Shield}
          title="안전한 블록체인"
          description="이더리움 네트워크 기반으로 투명하고 안전한 거래를 보장합니다"
          gradient="from-blue-500 to-cyan-500"
        />
        <FeatureCard
          icon={Zap}
          title="빠른 전송"
          description="스마트 컨트랙트를 통해 즉시 토큰 전송이 가능합니다"
          gradient="from-yellow-500 to-orange-500"
        />
        <FeatureCard
          icon={Coins}
          title="제한된 공급량"
          description="총 1,000,000개의 JKJ 토큰만 발행되어 희소성을 보장합니다"
          gradient="from-purple-500 to-pink-500"
        />
        <FeatureCard
          icon={Users}
          title="커뮤니티 중심"
          description="재구 친구들을 위한 특별한 리워드 시스템입니다"
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">토큰 정보</h3>
        <div className="space-y-3 text-white/80">
          <p><span className="font-semibold">토큰 이름:</span> JKJ Token</p>
          <p><span className="font-semibold">심볼:</span> JKJ</p>
          <p><span className="font-semibold">네트워크:</span> Ethereum</p>
          <p><span className="font-semibold">계약 주소:</span> 
            <code className="bg-black/20 px-2 py-1 rounded ml-2 font-mono text-sm break-all">
              0xf6b91D98bDd24561155bDafd823Df5DAf9644B08
            </code>
          </p>
          <p><span className="font-semibold">소수점:</span> 18</p>
        </div>
      </div>
    </div>
  );

  const GuideTab = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          재구와 함께하는 가이드 ✨
        </h2>
        <p className="text-white/70">차근차근 따라오시면 쉽게 토큰을 받을 수 있어요!</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/30 transform hover:scale-102 transition-all duration-300 shadow-xl">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                1
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-3">MetaMask 설치하기 🦊</h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                우리의 귀여운 친구 MetaMask를 설치해주세요! 브라우저 확장 프로그램이나 모바일 앱으로 만나볼 수 있어요.
              </p>
              <a 
                href="https://metamask.io/" 
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl transition-all duration-300 hover:opacity-90 shadow-lg group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative">🦊 MetaMask 다운로드</div>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/30 transform hover:scale-102 transition-all duration-300 shadow-xl">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                2
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-100"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-3">지갑 만들기 💫</h3>
              <p className="text-white/70 leading-relaxed">
                여러분만의 특별한 지갑을 만들어보세요! 시드 문구는 소중히 보관해주시는 거 잊지 마세요 🔐
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/30 transform hover:scale-102 transition-all duration-300 shadow-xl">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                3
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-pulse delay-200"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-3">지갑 연결하기 🤝</h3>
              <p className="text-white/70 leading-relaxed">
                이제 '지갑 연결하기' 버튼을 눌러서 재구의 토큰 친구가 되어주세요!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/30 transform hover:scale-102 transition-all duration-300 shadow-xl">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                4
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse delay-300"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-3">토큰 확인하기 ✨</h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                MetaMask에서 재구의 특별한 토큰을 확인해보세요! 아래 주소로 토큰을 등록할 수 있어요.
              </p>
              <div className="bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-xl p-4 backdrop-blur-xl border border-white/20">
                <p className="text-white/80 text-sm mb-2">✉️ 토큰 주소:</p>
                <code className="text-pink-300 font-mono text-sm break-all">
                  0xf6b91D98bDd24561155bDafd823Df5DAf9644B08
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-150"></div>
        <div className="absolute -bottom-20 left-1/2 w-[500px] h-[500px] bg-blue-500/25 rounded-full blur-[100px] animate-pulse delay-300"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <nav className="flex justify-center mb-8">
            <div className="flex gap-2 bg-black/20 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
              <TabButton
                id="home"
                icon={Gift}
                label="홈"
                isActive={activeTab === 'home'}
                onClick={setActiveTab}
              />
              <TabButton
                id="about"
                icon={Info}
                label="토큰 정보"
                isActive={activeTab === 'about'}
                onClick={setActiveTab}
              />
              <TabButton
                id="guide"
                icon={Wallet}
                label="가이드"
                isActive={activeTab === 'guide'}
                onClick={setActiveTab}
              />
            </div>
          </nav>

          {/* Tab Content */}
          <div className="fadeIn">
            {activeTab === 'home' && <HomeTab />}
            {activeTab === 'comments' && <CommentsTab />}
            {activeTab === 'about' && <AboutTab />}
            {activeTab === 'guide' && <GuideTab />}
          </div>

          {/* Footer */}
          <footer className="mt-16 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🐰</span>
              <span className="text-pink-400">•</span>
              <span className="text-2xl">✨</span>
              <span className="text-purple-400">•</span>
              <span className="text-2xl">💝</span>
            </div>
            <p className="text-white/70">
              Made with 💖 by <span className="font-bold text-pink-400">재구</span>
            </p>
            <p className="text-white/50 text-sm">© 2025 JKJ Reward Hub</p>
          </footer>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}