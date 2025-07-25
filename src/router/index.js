// router/index.js 또는 router.js
import { createRouter, createWebHistory } from 'vue-router';

/* ── 페이지 컴포넌트 ─────────────────────── */
import HomePage from '@/pages/HomePage.vue';
import MyPage from '@/pages/user/MyPage.vue';
import RecommendDeposit from '@/pages/deposit/RecommendDeposit.vue';
import SignupPage from '@/pages/auth/SignupPage.vue';
import LoginPage from '@/pages/auth/LoginPage.vue';
import UpdateUserInfoPage from '@/pages/user/UpdateUserInfoPage.vue';
import UpdatePasswordPage from '@/pages/user/UpdatePasswordPage.vue';

import PersonaSurveyPage from '@/pages/persona/PersonaSurveyPage.vue';
import PersonaSurveyStart from '@/pages/persona/PersonaSurveyStartPage.vue';
import PersonaCardAllList from '@/pages/persona/PersonaCardAllList.vue';
import PersonaDepositAllList from '@/pages/persona/PersonaDepositAllListPage.vue';
import PersonaSavingAllList from '@/pages/persona/PersonaSavingAllListPage.vue';

import RecommendSavings from '@/pages/savings/recommendations/RecommendSavings.vue';

/* 결과 페이지 (동적 import) */
const ResultPage = () => import('@/pages/persona/PersonaResultPage.vue');

/* 8종 페르소나 코드 */
const personaCodes = [
  'turtle',
  'squirrel',
  'ant',
  'owl',
  'rabbit',
  'cat',
  'tiger',
  'penguin',
];

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/signup', name: 'signup', component: SignupPage },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/mypage', name: 'mypage', component: MyPage },
  {
    path: '/mypage/update',
    name: 'updateUserInfo',
    component: UpdateUserInfoPage,
  },
  {
    path: '/mypage/update/password',
    name: 'updatePassword',
    component: UpdatePasswordPage,
  },
  {
    path: '/savings/recommendations/history',
    name: 'RecommendSavingst',
    component: RecommendSavings,
  },
  {
    path: '/api/deposits/recommendations/history',
    name: 'RecommendDeposit',
    component: RecommendDeposit,
  },
  {
    path: '/persona',
    children: [
      { path: 'start', name: 'PersonaTest', component: PersonaSurveyStart },
      { path: 'survey', name: 'PersonaSurvey', component: PersonaSurveyPage },
      { path: 'cards', name: 'PersonaCards', component: PersonaCardAllList },
      {
        path: 'savings',
        name: 'PersonaSavings',
        component: PersonaSavingAllList,
      },
      {
        path: 'deposits',
        name: 'PersonaDeposits',
        component: PersonaDepositAllList,
      },
      {
        path: 'result/:code',
        name: 'PersonaResult',
        component: ResultPage,
        props: true,
        beforeEnter: (to, _, next) => {
          if (personaCodes.includes(to.params.code)) next();
          else next('/');
        },
      },
    ],
  },
  { path: '/survey', redirect: '/persona/survey' },
  { path: '/personatest', redirect: '/persona/test' },
  { path: '/personaCardList', redirect: '/persona/cards' },
  ...personaCodes.map((c) => ({
    path: `/${c}`,
    redirect: `/persona/result/${c}`,
  })),
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});
