import { Breadcrumb } from '@chakra-ui/react';
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
      <div className="location">
        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#">HOME</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#">{firstDepth}</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href={titleUri}>{title}</Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
      {children}
    </div>
  );
};

export default SubPageTitle;
