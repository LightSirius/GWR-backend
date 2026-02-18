'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<boolean>(false); // 메뉴 활성화 상태
  const menuRefs = useRef<(HTMLUListElement | null)[]>([]); // 각 2depth li ul ref 저장
  const [bgHeight, setBgHeight] = useState<number>(0);
  const [hoverMenuIndex, setHoverMenuIndex] = useState<number | null>(null); // 메뉴 인덱스
  const pathname = usePathname(); // 현재 URL
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [headerState, setHeaderState] = useState<
    'mainScrolled' | 'subActive' | ''
  >('');

  const menuItems = [
    {
      name: '새소식',
      href: '/news',
      submenu: [
        { name: '공지사항', href: '/news/notice' },
        { name: '업데이트', href: '/news/update' },
        { name: '이벤트', href: '/news/event' },
      ],
    },
    {
      name: '커뮤니티',
      href: '/community',
      submenu: [
        { name: '자유 게시판', href: '/community/free' },
        { name: '유저 갤러리', href: '/community/gallery' },
        { name: '공략 게시판', href: '/community/guide' },
      ],
    },
    {
      name: '다운로드',
      href: '/download',
      submenu: [
        { name: '다운로드', href: '/download/client' },
        { name: '멀티미디어', href: '/download/media' },
      ],
    },
    {
      name: '고객지원',
      href: '/support',
      submenu: [
        { name: 'FAQ', href: '/support/faq' },
        { name: '문의하기', href: '/support/contact' },
      ],
    },
  ];

  // 경로 및 스크롤 상태 관리
  useEffect(() => {
    if (pathname === '/') {
      const handleScroll = () => {
        if (window.scrollY >= 10) {
          setHeaderState('mainScrolled');
        } else {
          setHeaderState('');
        }
      };
      window.addEventListener('scroll', handleScroll);
      // 초기 체크
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setHeaderState('subActive');
    }
  }, [pathname]);

  // 현재 경로에 따른 활성 메뉴 인덱스 설정
  useEffect(() => {
    const index = menuItems.findIndex((item) =>
      item.submenu?.some((sub) => sub.href === pathname),
    );
    setActiveMenuIndex(index >= 0 ? index : null);
  }, [pathname]);

  // 메뉴 호버 이벤트
  const handleMouseEnterMenu = () => {
    setActiveMenu(true);
  };

  // 메뉴 영역을 벗어났을 때
  const handleMouseLeaveMenu = () => {
    setActiveMenu(false);
  };

  // 모든 2depth ul 중 가장 큰 height 찾기
  useEffect(() => {
    let maxHeight = 0;
    menuRefs.current.forEach((ul) => {
      if (ul) {
        maxHeight = Math.max(maxHeight, ul.scrollHeight);
      }
    });
    setBgHeight(activeMenu ? maxHeight : 0);
  }, [activeMenu]);

  // 현재 보여지는 메뉴 인덱스 (호버 중이면 호버 인덱스, 아니면 활성 인덱스)
  const currentIndex = hoverMenuIndex ?? activeMenuIndex;

  return (
    <header className={`${activeMenu ? 'active' : ''} ${headerState}`}>
      {/*  */}
      <div className={`headerWrap`}>
        <div className="gnb">
          <h1 onMouseLeave={handleMouseLeaveMenu}>
            <Link href="/">GWR</Link>
          </h1>
          {/* 메뉴 */}
          <nav onMouseEnter={handleMouseEnterMenu}>
            <ul>
              {/* 1depth */}
              {menuItems.map((item, index) => (
                <li
                  key={item.name}
                  onMouseEnter={() => setHoverMenuIndex(index)}
                >
                  <Link href={item.href}>{item.name}</Link>
                  {/* 2depth */}
                  <ul
                    ref={(el) => {
                      menuRefs.current[index] = el;
                    }}
                  >
                    {item.submenu.map((sub) => (
                      <li key={sub.name}>
                        <Link href={sub.href}>{sub.name}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* utils */}
        <ul className="utils" onMouseLeave={handleMouseLeaveMenu}>
          {isLoading ? (
            <div className="text-gray-400">로딩중...</div>
          ) : isAuthenticated ? (
            <>
              <li className="profile">
                <Link href="/profile">프로필</Link>
                <span>님 환영합니다!</span>
              </li>
              <li className="logout">
                <button onClick={logout}>로그아웃</button>
              </li>
            </>
          ) : (
            <>
              <li className="login">
                <Link href="/login">로그인</Link>
              </li>
              <li className="register">
                <Link href="/register">회원가입</Link>
              </li>
            </>
          )}
          <li className="gameStartBtn">
            <button>게임스타트</button>
          </li>
        </ul>
        <div
          className={`headerBg`}
          style={{ height: activeMenu ? `${bgHeight + 20}px` : '0px' }}
          onMouseLeave={handleMouseLeaveMenu}
        ></div>
        <div
          className="hoverBg"
          style={{
            left:
              currentIndex !== null && menuRefs.current[currentIndex]
                ? `${menuRefs.current[currentIndex]!.parentElement!.offsetLeft + 60}px`
                : '0px',
            width:
              currentIndex !== null && menuRefs.current[currentIndex]
                ? `${menuRefs.current[currentIndex]!.parentElement!.offsetWidth}px`
                : '0px',
            height: bgHeight + 90 + 20, // 20은 padding
            opacity: currentIndex !== null ? 1 : 0,
          }}
          onMouseLeave={handleMouseLeaveMenu}
        />
      </div>
    </header>
  );
};

export default Header;
