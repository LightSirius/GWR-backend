import Link from 'next/link';
import React from 'react';

const SubPageLogin = () => {
  return (
    <div className="subPageLogin">
      <div className="loginArea sub">
        <div className="characterWrap">
          <span className="img">
            <img src="/images/imgs/img_userCharacter.png" alt="" />
          </span>
          <ul className="info">
            <li className="name">복스내남편</li>
            <li className="lv">Lv 90</li>
            <li className="job">마도사</li>
          </ul>
        </div>
        <div className="myBtnWrap">
          <button className="myInfo">개인정보 수정</button>
          <button className="mypage">마이페이지</button>
          <button className="logout">로그아웃</button>
        </div>
        <div className="myInfoWrap">
          <dl>
            <dt>
              1:1 문의 <span>0</span>
            </dt>
            <dd>
              <Link href="">내 문의 현황</Link>
            </dd>
          </dl>
          <dl>
            <dt>이벤트 경품 당첨</dt>
            <dd>
              <Link href="">당첨자 조회</Link>
            </dd>
          </dl>
          <dl>
            <dt>
              미수령 아이템 <span>0</span>
            </dt>
            <dd>
              <Link href="">아이템 보관함</Link>
            </dd>
          </dl>
        </div>
      </div>
      {/* <div className="notLoginArea">
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
      </div> */}
    </div>
  );
};

export default SubPageLogin;
