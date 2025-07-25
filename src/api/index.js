import axios from 'axios';

const instance = axios.create({
  timeout: 300000, //30초
  //  codef 적금 불러오기 시간초과 발생 방지를 위해 길게 설정
});

instance.interceptors.request.use(
  (config) => {
    // const { getToken } = useAuthStore();
    // const token = getToken();
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW1waW5rNDMyMkBuYXZlci5jb20iLCJpYXQiOjE3NTM0NDE3MDAsImV4cCI6MTc1MzQ0MjAwMH0.C0rTbtyGBPwovGljNjVxXkia3dbnoHHUWzcQYZxHPf8';
    //실제 로그인 토큰 값으로 변경
    //현재 프론트 로그인 미구현으로 임시 이용

    //토큰 값 있으면 헤더에 자동 추가
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
