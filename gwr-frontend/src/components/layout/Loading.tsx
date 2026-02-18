import { Spinner } from '@chakra-ui/react';
import React from 'react';

const Loading = () => {
  return (
    <div className="loading">
      <Spinner color="gray.600" size="xl" />
    </div>
  );
};

export default Loading;
