import Link from 'next/link';
import React from 'react';

interface SubPageTitleProps {
  title: string; // 서브페이지별 제목
  children?: React.ReactNode;
  firstDepth: string;
  titleUri: string;
}

const SubPageTitle: React.FC<SubPageTitleProps> = ({
  title,
  firstDepth,
  children,
  titleUri,
}) => {
  return (
    <div className="subTitle">
      <h2>{title}</h2>
      <ul className="location">
        <li className="home"></li>
        <li>{firstDepth}</li>
        <li>
          <Link href={titleUri}>{title}</Link>
        </li>
      </ul>
      {children}
    </div>
  );
};

export default SubPageTitle;
