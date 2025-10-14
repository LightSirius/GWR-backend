'use client';

<<<<<<< Updated upstream
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
=======
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
  const [headerState, setHeaderState] = useState<'mainScrolled' | 'subActive' | ''>('');
  
>>>>>>> Stashed changes

  const menuItems = [
    {
      name: '새소식',
      href: '/news',
      submenu: [
        { name: '공지사항', href: '/news/notice' },
        { name: '업데이트', href: '/news/update' },
        { name: '이벤트', href: '/news/event' },
      ]
    },
    {
      name: '커뮤니티',
      href: '/community',
      submenu: [
        { name: '자유 게시판', href: '/community/free' },
        { name: '유저 갤러리', href: '/community/gallery' },
        { name: '공략 게시판', href: '/community/guide' },
      ]
    },
    {
<<<<<<< Updated upstream
      name: '자료실',
=======
      name: '다운로드',
>>>>>>> Stashed changes
      href: '/download',
      submenu: [
        { name: '다운로드', href: '/download/client' },
        { name: '멀티미디어', href: '/download/media' },
      ]
    },
    {
<<<<<<< Updated upstream
      name: '고객센터',
=======
      name: '고객지원',
>>>>>>> Stashed changes
      href: '/support',
      submenu: [
        { name: 'FAQ', href: '/support/faq' },
        { name: '문의하기', href: '/support/contact' },
      ]
    }
  ];

<<<<<<< Updated upstream
  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); // 50px 이상 스크롤되면 반투명 효과 적용
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (menuName: string) => {
    setActiveDropdown(menuName);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50 shadow-lg' 
        : 'bg-gray-900 border-b border-gray-700'
    }`}>
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-2xl font-bold text-green-500 hover:text-green-400 transition-colors">
              GWR
            </Link>
            <div className="text-sm text-gray-400">
              게임 웹 페이지 리뉴얼 프로젝트
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
=======
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
      item.submenu?.some((sub) => sub.href === pathname)
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
            <Link href="/">
              GWR
            </Link>
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
                  <Link
                    href={item.href}
                  >
                    {item.name}
                  </Link>
                  {/* 2depth */}
                  <ul ref={(el) => { menuRefs.current[index] = el }}>
                    {item.submenu.map((sub) => (
                      <li 
                        key={sub.name}
                      >
                        <Link
                          href={sub.href}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* utils */}
        <ul className='utils' onMouseLeave={handleMouseLeaveMenu}>
>>>>>>> Stashed changes
            {isLoading ? (
              <div className="text-gray-400">로딩중...</div>
            ) : isAuthenticated ? (
              <>
<<<<<<< Updated upstream
                <Link href="/profile" className="text-sm text-gray-300 hover:text-white transition-colors">
                  프로필
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                  로그인
                </Link>
                <Link href="/register" className="text-sm text-gray-300 hover:text-white transition-colors">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="py-4">
          <ul className="flex items-center space-x-8">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className="text-gray-300 hover:text-white font-medium py-2 px-3 rounded transition-colors relative"
                >
                  {item.name}
                  {/* Hover underline effect */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>

                {/* Dropdown Menu */}
                {activeDropdown === item.name && item.submenu && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/80 transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
=======
                <li className='profile'>
                  <Link href="/profile">
                    프로필
                  </Link>
                  <span>님 환영합니다!</span>
                </li>
                <li className='logout'>
                  <button
                    onClick={logout}
                  >
                    로그아웃
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className='login'>
                  <Link href="/login">
                    로그인
                  </Link>
                </li>
                <li className='register'>
                  <Link href="/register">
                    회원가입
                  </Link>
                </li>
              </>
            )}
            <li className='gameStartBtn'>
              <button>게임스타트</button>
            </li>
        </ul>
        <div className={`headerBg`} style={{height: activeMenu ? `${bgHeight + 20}px` : "0px",}} onMouseLeave={handleMouseLeaveMenu}></div>
        <div
          className="hoverBg"
          style={{
            left: currentIndex !== null && menuRefs.current[currentIndex]
                ? `${menuRefs.current[currentIndex]!.parentElement!.offsetLeft + 60}px`
                : '0px',
            width: currentIndex !== null && menuRefs.current[currentIndex]
                ? `${menuRefs.current[currentIndex]!.parentElement!.offsetWidth}px`
                : '0px',
            height: bgHeight + 90 + 20, // 20은 padding
            opacity: currentIndex !== null ? 1 : 0,
          }}
          onMouseLeave={handleMouseLeaveMenu}
        />
>>>>>>> Stashed changes
      </div>
    </header>
  );
};

export default Header; 