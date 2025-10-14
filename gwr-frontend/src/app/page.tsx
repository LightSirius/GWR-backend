'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
<<<<<<< Updated upstream

const HomePage = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDaytime, setIsDaytime] = useState<boolean | null>(null);

  // 시간에 따른 배경 이미지 결정
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const isDay = hour >= 8 && hour < 20; // 8시부터 20시(저녁 8시)까지는 낮
      
      setCurrentTime(now);
      setIsDaytime(isDay);
    };

    // 초기 실행
    updateTime();

    // 1분마다 시간 업데이트 (배경 변경을 위해)
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // body에 배경 클래스 적용
  useEffect(() => {
    const body = document.body;
    
    // 기존 클래스 제거
    body.classList.remove('daytime', 'nighttime');
    
    // 새로운 클래스 추가
    if (isDaytime !== null) {
      body.classList.add(isDaytime ? 'daytime' : 'nighttime');
    }
  }, [isDaytime]);

  // 임시 데이터 (나중에 백엔드 API로 교체)
  const notices = [
    { id: 1, type: '공지', title: 'GWR Game Portal 오픈 베타 서비스 안내', date: '2025-01-27' },
    { id: 2, type: '점검', title: '정기 점검 안내 (1월 28일 02:00~06:00)', date: '2025-01-26' },
    { id: 3, type: '이벤트', title: '신규 가입자 환영 이벤트 진행 중!', date: '2025-01-25' },
    { id: 4, type: '패치', title: 'v1.2.0 업데이트 내용 안내', date: '2025-01-24' },
  ];

  const events = [
    { id: 1, title: '신규 가입자 환영 이벤트', period: '2025.01.20 ~ 2025.02.20' },
    { id: 2, title: '겨울 특별 판매', period: '2025.01.15 ~ 2025.01.31' },
    { id: 3, title: '신년 맞이 특별 이벤트', period: '2025.01.01 ~ 2025.01.31' },
  ];

  const communityPosts = [
    { id: 1, category: '자유', title: '오늘 게임하면서 느낀 점', author: '게이머1', views: 156 },
    { id: 2, category: '공략', title: '초보자를 위한 게임 가이드', author: '고수님', views: 234 },
    { id: 3, category: '질문', title: '이 게임 어떻게 시작하나요?', author: '뉴비', views: 89 },
  ];

  return (
    <div className="min-h-screen text-white pt-32">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden">
        {/* Fallback gradient background */}
        {/* <div className={`absolute inset-0 z-0 ${
          isDaytime === null
            ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 bg-opacity-80' // 기본값
            : isDaytime 
              ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 bg-opacity-70'
              : 'bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 bg-opacity-80'
        }`}></div> */}
        
        {/* Overlay for better text readability */}
        {/* <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div> */}
        
        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
            GWR Game Portal
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            게임 웹 페이지 리뉴얼 프로젝트 프론트
            {currentTime && (
              <span className="block text-sm text-gray-400 mt-2">
                {isDaytime ? '☀️ 낮 모드' : '🌙 밤 모드'} - {currentTime.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </span>
            )}
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              게임 시작
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              게임 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Notice Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-400">공지사항</h2>
                <Link href="/news/notice" className="text-sm text-gray-400 hover:text-white">
                  더보기
                </Link>
              </div>
              <div className="space-y-3">
                {notices.slice(0, 5).map((notice) => (
                  <div key={notice.id} className="border-b border-gray-700 pb-2 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        notice.type === '공지' ? 'bg-red-600' :
                        notice.type === '점검' ? 'bg-yellow-600' :
                        notice.type === '이벤트' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {notice.type}
                      </span>
                      <span className="text-xs text-gray-400">{notice.date}</span>
                    </div>
                    <p className="text-sm mt-1 hover:text-green-400 cursor-pointer">
                      {notice.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-green-400 mb-4">이벤트 목록</h2>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="border-b border-gray-700 pb-2 last:border-b-0">
                    <p className="text-sm font-semibold hover:text-green-400 cursor-pointer">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-400">{event.period}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Videos */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-purple-400 mb-4">추천 영상</h2>
              <div className="space-y-3">
                <div className="bg-gray-700 rounded p-3">
                  <div className="w-full h-24 bg-gray-600 rounded mb-2"></div>
                  <p className="text-sm">게임 신규 업데이트 소개</p>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <div className="w-full h-24 bg-gray-600 rounded mb-2"></div>
                  <p className="text-sm">초보자 가이드 영상</p>
                </div>
=======
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

const HomePage = () => {
  // 임시 데이터 (나중에 백엔드 API로 교체)
  const notices = [
    {
      id: 1,
      type: '공지',
      title: 'GWR Game Portal 오픈 베타 서비스 안내',
      date: '2025-01-27',
    },
    {
      id: 2,
      type: '점검',
      title: '정기 점검 안내 (1월 28일 02:00~06:00)',
      date: '2025-01-26',
    },
    {
      id: 3,
      type: '이벤트',
      title: '신규 가입자 환영 이벤트 진행 중!',
      date: '2025-01-25',
    },
    {
      id: 4,
      type: '패치',
      title: 'v1.2.0 업데이트 내용 안내',
      date: '2025-01-24',
    },
    {
      id: 5,
      type: '공지',
      title: 'v1.2.0 업데이트 내용 안내',
      date: '2025-01-24',
    },
  ];

  const communityPosts = [
    {
      id: 1,
      category: '자유',
      title: '오늘 게임하면서 느낀 점',
      date: '2025-01-24',
    },
    {
      id: 2,
      category: '공략',
      title: '초보자를 위한 게임 가이드',
      date: '2025-01-24',
    },
    {
      id: 3,
      category: '질문',
      title: '이 게임 어떻게 시작하나요?',
      date: '2025-01-24',
    },
  ];

  const guideData = [
    {
      id: 1,
      title: '#1 직업 가이드',
      desc: '노아의 직업 가이드 입니다.',
      img: '/images/imgs/img_guide_01.png',
    },
    {
      id: 2,
      title: '#2 조작법 가이드',
      desc: '노아의 조작법 가이드 입니다.',
      img: '/images/imgs/img_guide_02.png',
    },
    {
      id: 3,
      title: '#3 캐릭터 강화 가이드',
      desc: '노아의 캐릭터 강화 가이드 입니다.',
      img: '/images/imgs/img_guide_03.png',
    },
    {
      id: 4,
      title: '#4 공략 가이드',
      desc: '노아의 공략 가이드 입니다.',
      img: '/images/imgs/img_guide_04.png',
    },
    {
      id: 5,
      title: '#5 에피소드 가이드',
      desc: '노아의 에피소드 가이드 입니다.',
      img: '/images/imgs/img_guide_05.png',
    },
  ];

  const rankData = [
    {
      id: 1,
      title: '도란',
      job: '성기사',
      type: '방어형',
      guild: '빛의 수호자',
      level: 99,
    },
    {
      id: 2,
      title: '카르엔',
      job: '암살자',
      type: '공격형',
      guild: '그림자단',
      level: 97,
    },
    {
      id: 3,
      title: '레오닉',
      job: '궁수',
      type: '공격형',
      guild: '자연의 분노',
      level: 96,
    },
    {
      id: 4,
      title: '엘린',
      job: '마도사',
      type: '공격형',
      guild: '하즈빈길드',
      level: 94,
    },
    {
      id: 5,
      title: '루미엘',
      job: '정령사',
      type: '지원형',
      guild: '하늘빛 연맹',
      level: 92,
    },
  ];

  return (
    <>
      <div className="mainWrap">
        <section className="mainBannerArea">
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              type: 'fraction',
              clickable: true,
            }}
            navigation={true}
            loop={true}
            modules={[Pagination, Navigation, Autoplay]}
            className="swiper"
          >
            <SwiperSlide>
              <Link href={'/'}>
                <img src="/images/imgs/img_mainLbanner.png" alt="" />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link href={'/'}>
                <img src="/images/imgs/img_mainLbanner.png" alt="" />
              </Link>
            </SwiperSlide>
            <SwiperSlide>
              <Link href={'/'}>
                <img src="/images/imgs/img_mainLbanner.png" alt="" />
              </Link>
            </SwiperSlide>
          </Swiper>
        </section>

        <section className="boardArea">
          <div className="noticeArea">
            <div className="mainTitle">
              <h3>공지사항</h3>
              <Link href={'/notices'} className="moreBtn">
                더보기
              </Link>
            </div>
            <ul className="mainTable">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <span className="badge">{notice.type}</span>
                  <Link href="/">{notice.title}</Link>
                  <span className="date">{notice.date}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="userArea">
            <div className="startBtnDiv">
              <Link href="" className="startBtn">
                <span className="bg">
                  <span className="ico_playBtn"></span>
                  <span className="txt">게임 스타트</span>
                </span>
              </Link>
              <Link href="" className="download">
                다운로드<span className="ico_download"></span>
              </Link>
            </div>
            <div className="loginArea">
              <div className="userInfo">
                <span className="img">
                  <img src="/images/imgs/img_userCharacter.png" alt="" />
                </span>
                <ul className="info">
                  <li className="name">복스내남편</li>
                  <li className="lv">Lv 90</li>
                  <li className="job">마도사</li>
                </ul>
              </div>
              <button>로그아웃</button>
            </div>
            <div className="notLoginArea">
              <span>로그인이 필요합니다.</span>
              <button>로그인</button>
              <div className="etc">
                <ul>
                  <li>
                    <Link href="">아이디 찾기</Link>
                  </li>
                  <li>
                    <Link href="">비밀번호 찾기</Link>
                  </li>
                  <li>
                    <Link href="">회원가입</Link>
                  </li>
                </ul>
>>>>>>> Stashed changes
              </div>
            </div>
          </div>

<<<<<<< Updated upstream
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guide Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-green-400 mb-6">GWR의 모든 것. 가이드</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['직업', '조작법', '캐릭터 강화', '공략', '에피소드'].map((guide) => (
                  <div key={guide} className="bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-600 cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-2"></div>
                    <p className="text-sm font-semibold">{guide}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ranking Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">랭킹</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">서버A 랭킹</h3>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <div key={rank} className="flex items-center justify-between bg-gray-700 rounded p-2">
                        <span className="text-sm">#{rank}</span>
                        <span className="text-sm">플레이어{rank}</span>
                        <span className="text-xs text-gray-400">레벨 {100 - rank * 5}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">서버B 랭킹</h3>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <div key={rank} className="flex items-center justify-between bg-gray-700 rounded p-2">
                        <span className="text-sm">#{rank}</span>
                        <span className="text-sm">플레이어{rank + 5}</span>
                        <span className="text-xs text-gray-400">레벨 {95 - rank * 5}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Community Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-400">커뮤니티</h2>
                <Link href="/community" className="text-sm text-gray-400 hover:text-white">
                  더보기
                </Link>
              </div>
              <div className="space-y-3">
                {communityPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between border-b border-gray-700 pb-2 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        post.category === '자유' ? 'bg-blue-600' :
                        post.category === '공략' ? 'bg-green-600' : 'bg-yellow-600'
                      }`}>
                        {post.category}
                      </span>
                      <span className="text-sm hover:text-green-400 cursor-pointer">
                        {post.title}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      <span>{post.author}</span>
                      <span className="ml-2">조회 {post.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Special Sale */}
            <div className="bg-gradient-to-br from-red-900 to-red-700 rounded-lg p-6 border border-red-600">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">HOT! 특별 판매!</h2>
              <div className="space-y-3">
                {['NPC의 선물', '여름 특별판매', '8월 한정판매', '펫 특별판매'].map((sale, index) => (
                  <div key={index} className="bg-red-800 rounded p-3 hover:bg-red-700 cursor-pointer transition-colors">
                    <p className="text-sm font-semibold">{sale}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* News Style */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-purple-400 mb-4">뉴스타일</h2>
              <div className="space-y-3">
                {['NEW STYLE&HAIR&FACE [2025.07]', 'NEW STYLE[2025.05]', 'NEW STYLE&HAIR [2025.04]'].map((style, index) => (
                  <div key={index} className="bg-gray-700 rounded p-3 hover:bg-gray-600 cursor-pointer transition-colors">
                    <div className="w-full h-20 bg-gray-600 rounded mb-2"></div>
                    <p className="text-sm">{style}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-green-400 mb-4">빠른 링크</h2>
              <div className="space-y-2">
                {['게임 다운로드', '공식 카페', '고객센터', '이벤트 페이지'].map((link, index) => (
                  <Link key={index} href="#" className="block text-sm hover:text-green-400 transition-colors">
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
=======
          <div className="communityArea">
            <div className="communityBoardArea">
              <div className="mainTitle">
                <h3>커뮤니티</h3>
                <Link href={'/notices'} className="moreBtn">
                  더보기
                </Link>
              </div>
              <ul className="mainTable">
                {communityPosts.map((post) => (
                  <li key={post.id}>
                    <span className="badge">{post.category}</span>
                    <Link href="/">{post.title}</Link>
                    <span className="date">{post.date}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="subBannerArea">
              <Swiper
                slidesPerView={1}
                spaceBetween={30}
                autoplay={{
                  delay: 3000, // 3초마다 슬라이드 변경
                  disableOnInteraction: false, // 사용자가 스와이프해도 계속 자동재생 유지
                }}
                loop={true}
                modules={[Autoplay]}
                className="swiper"
              >
                <SwiperSlide>
                  <Link href={'/'}>
                    <img src="/images/imgs/img_mainSbanner.png" alt="" />
                  </Link>
                </SwiperSlide>
                <SwiperSlide>
                  <Link href={'/'}>
                    <img src="/images/imgs/img_mainSbanner.png" alt="" />
                  </Link>
                </SwiperSlide>
                <SwiperSlide>
                  <Link href={'/'}>
                    <img src="/images/imgs/img_mainSbanner.png" alt="" />
                  </Link>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </section>

        <section className="guideArea">
          <div className="mainTitle">
            <h3>가이드</h3>
          </div>
          <ul>
            {guideData.map((guide) => (
              <li key={guide.id}>
                <Link href="/">
                  <span className="img">
                    <img src={guide.img} alt={guide.title} />
                  </span>
                  <span className="title">
                    <strong>{guide.title}</strong>
                    <em>{guide.desc}</em>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="communityArea">
          <div className="rankingArea">
            <div className="mainTitle">
              <h3>랭킹</h3>
              <div className="searchArea">
                <input type="text" placeholder="캐릭터명 검색" />
                <span>검색아이콘</span>
              </div>
            </div>
            <div className="rankingTable">
              <table>
                <colgroup>
                  <col width="60px" />
                  <col width="25%" />
                  <col width="15%" />
                  <col width="15%" />
                  <col width="15%" />
                  <col width="15%" />
                </colgroup>
                <tbody>
                  {rankData.map((player, index) => {
                    let rankClass = '';
                    if (index === 0) rankClass = 'gold';
                    else if (index === 1) rankClass = 'silver';
                    else if (index === 2) rankClass = 'bronze';

                    return (
                      <tr key={player.id}>
                        <td>
                          <span className={`rankNum ${rankClass}`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="agnL">{player.title}</td>
                        <td>{player.job}</td>
                        <td>{player.type}</td>
                        <td>{player.guild}</td>
                        <td>레벨 {player.level}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="youtubeArea">
            <div className="mainTitle">
              <h3>유튜브</h3>
            </div>
            <div className="video">
              <iframe
                src="https://www.youtube.com/embed/8PK45_wynKQ"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      </div>
    </>
>>>>>>> Stashed changes
  );
};

export default HomePage;
