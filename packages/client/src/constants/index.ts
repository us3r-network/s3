export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const USER_API_BASE_URL = process.env.REACT_APP_USER_API_BASE_URL;
export const MEDIA_BREAK_POINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1024,
  xxl: 1280,
  xxxl: 1440,
};
export const MOBILE_BREAK_POINT = 768;

export const FamilyOrAppMap = {
  'Gitcoin Passport':
    'kjzl6cwe1jw148h1e14jb5fkf55xmqhmyorp29r9cq356c7ou74ulowf8czjlzs',
};

export const FamilyOrAppMapReverse = Object.fromEntries(
  Object.entries(FamilyOrAppMap).map(([key, value]) => [value, key])
);
