'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

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
      name: '자료실',
      href: '/download',
      submenu: [
        { name: '다운로드', href: '/download/client' },
        { name: '멀티미디어', href: '/download/media' },
      ]
    },
    {
      name: '고객센터',
      href: '/support',
      submenu: [
        { name: 'FAQ', href: '/support/faq' },
        { name: '문의하기', href: '/support/contact' },
      ]
    }
  ];

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
            {isLoading ? (
              <div className="text-gray-400">로딩중...</div>
            ) : isAuthenticated ? (
              <>
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
      </div>
    </header>
  );
};

export default Header; 