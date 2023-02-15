import React from 'react';
import { useLocation } from 'react-router-dom';

import { sendPageView } from '../utils/analytics';

export const useGAPageView = () => {
  const location = useLocation();

  React.useEffect(() => {
    const currentPath = location.pathname + location.search;
    sendPageView(currentPath);
  }, [location]);
};
