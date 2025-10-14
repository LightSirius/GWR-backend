import Link from 'next/link';
import React from 'react';

const SubPageLogin = () => {
  return (
    <div className="subPageLogin">
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
  );
};

export default SubPageLogin;
