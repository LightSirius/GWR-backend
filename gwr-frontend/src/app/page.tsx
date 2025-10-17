'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Link from 'next/link';
import { useMainNoticeStore } from './store/useMainNoticeStore';
import { useEffect } from 'react';
import { Skeleton } from '@chakra-ui/react';
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

  const { setNoticeData, noticeMainList, eventList, isLoading, setIsLoading } =
    useMainNoticeStore();

  // 메인 노티스
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/notice/main`,
        );
        const data = await res.json();
        setNoticeData(data);
        setIsLoading(false);
      } catch (e) {
        console.error(e);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setIsLoading, setNoticeData]);

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
              {isLoading ? (
                // 로딩 중
                Array.from({ length: 5 }).map((_, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Skeleton height="20px" width="50px" borderRadius="6px" />
                    {/* badge 자리 */}
                    <Skeleton height="18px" flex="1" /> {/* 제목 자리 */}
                    <Skeleton height="16px" width="80px" /> {/* 날짜 자리 */}
                  </li>
                ))
              ) : noticeMainList && noticeMainList.length > 0 ? (
                noticeMainList.map((notice) => {
                  const formattedDate = new Date(notice.create_date)
                    .toISOString()
                    .split('T')[0];

                  return (
                    <li key={notice.notice_id}>
                      <span className="badge">
                        {notice.notice_type === 0
                          ? '공지'
                          : notice.notice_type === 1
                            ? '점검'
                            : '이벤트'}
                      </span>
                      <Link href={`/notice/detail/${notice.notice_id}`}>
                        {notice.notice_title}
                      </Link>
                      <span className="date">{formattedDate}</span>
                    </li>
                  );
                })
              ) : (
                <>
                  <li className="noData notice">등록된 공지가 없습니다.</li>
                </>
              )}
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
              </div>
            </div>
          </div>
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
  );
};

export default HomePage;
