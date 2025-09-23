<template>
  <div class="login-container">
    <!-- 상단 로고 영역 -->
    <div class="login-logo">
      <img src="@/assets/Logo.png" alt="맞추머니 로고" />
    </div>

    <!-- BaseCardGrey 적용 -->
    <BaseCardGrey class="login-card">
      <template #content>
        <h1 class="login-title">로그인</h1>

        <!-- 이메일 -->
        <div class="login-row">
          <BaseInput v-model="email" label="이메일" id="login-email" placeholder="이메일" />
        </div>

        <!-- 비밀번호 -->
        <div class="login-row">
          <BaseInput v-model="password" label="비밀번호" id="login-password" type="password" placeholder="비밀번호" />
        </div>

        <!-- 비밀번호 찾기 -->
        <div class="login-options">
          <label class="keep-login">
            <!-- <input type="checkbox" v-model="keepLogin" />
            로그인 상태 유지 -->
          </label>
          <a class="reset-pw" href="/reset-password">비밀번호 재설정</a>
        </div>

        <!-- 일반 로그인 버튼 -->
        <button class="login-btn" @click="handleLogin">로그인</button>

        <!-- 구분선 -->
        <div class="sns-divider">
          <span>SNS 로그인</span>
        </div>

        <!-- 카카오 로그인 버튼 -->
        <button class="kakao-btn" @click="handleKakaoLogin">
          <img src="@/assets/kakao_login_medium_wide.png" alt="카카오계정으로 로그인" />
        </button>

        <!-- 회원가입 링크 -->
        <div class="signup-link">
          계정이 없으신가요?
          <a href="/signup">회원가입 하러가기</a>
        </div>
      </template>
    </BaseCardGrey>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseCardGrey from '@/components/base/BaseCardGrey.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import authApi from '@/api/auth'; // ✅ 새로 추가된 import
import { useCustomModal } from '@/composables/useCustomModal';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { showAlert, showSuccess, showError } = useCustomModal();

const handleLogin = async () => {
  // 입력값 검증
  if (!email.value || !password.value) {
    await showAlert('이메일과 비밀번호를 입력해주세요.', '입력 오류');
    return;
  }

  try {
    console.log('🔐 로그인 시도:', { email: email.value });
    const response = await authApi.login({
      email: email.value,
      password: password.value,
    });

    console.log('✅ 로그인 응답:', response);
    const tokenDto = response.result;

    if (!tokenDto || !tokenDto.accessToken) {
      throw new Error('토큰이 응답에 포함되지 않았습니다.');
    }

    authStore.setAuth(tokenDto);
    console.log('💾 토큰 저장 완료:', {
      accessToken: tokenDto.accessToken.substring(0, 20) + '...',
      userId: tokenDto.userId,
      nickname: tokenDto.nickname,
    });

    await showSuccess(`${tokenDto.nickname}님, Matchumoney에 오신 것을 진심으로 환영합니다!`, '로그인 성공');

    // 로그인 후 리다이렉트 처리
    const redirectPath = route.query.redirect || '/';

    if (tokenDto.personaId === null || tokenDto.personaId === undefined) {
      router.push('/persona/start');
    } else {
      window.dispatchEvent(new Event('app:login'));
      router.push(redirectPath);
    }
  } catch (err) {
    console.error('❌ 로그인 실패:', err);

    if (err.response?.status === 401) {
      await showError('이메일 또는 비밀번호가 올바르지 않습니다.', '로그인 실패');
    } else if (err.response?.status === 403) {
      alert('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else if (err.response?.status >= 500) {
      alert('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      await showError(`로그인에 실패했습니다: ${err.response?.data?.message || err.message}`, '로그인 실패');
    }
  }
};

const handleKakaoLogin = () => {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&through_account=true`;
  window.location.href = kakaoLoginUrl;
};
</script>

<style scoped>
/* 컨테이너 */
.login-container {
  min-height: 100vh;
  background: var(--bg-body);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

/* 로고 영역 */
.login-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}
.login-logo img {
  height: 150px;
}

/* BaseCardGrey 커스터마이징 */
.login-card {
  width: 435px;
  height: 630px;
  padding: 3rem;
}

/* 제목 */
.login-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--color-dark);
}

/* 입력 행 */
.login-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}
.login-label {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: var(--color-dark);
}
.login-input {
  height: 44px;
  padding: 0 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  color: var(--text-primary);
  background: var(--color-white);
}

/* 옵션 행 */
.login-options {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 0.85rem;
  margin-bottom: 1.8rem;
  color: var(--text-secondary);
}
.reset-pw {
  color: var(--text-link);
  text-decoration: none;
}
.reset-pw:hover {
  color: var(--text-link-hover);
}

/* 로그인 버튼 */
.login-btn {
  width: 335px;
  height: 50px;
  background: var(--color-accent);
  color: var(--color-white);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 2rem;
  cursor: pointer;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

/* SNS 로그인 구분선 */
.sns-divider {
  position: relative;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.2rem;
}
.sns-divider::before,
.sns-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: var(--border-light);
}
.sns-divider::before {
  left: 0;
}
.sns-divider::after {
  right: 0;
}

/* 카카오 로그인 버튼 */
.kakao-btn {
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 2rem;
  width: 360px; /* 원하는 고정 px 값 */
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.kakao-btn img {
  width: 100%;
  height: 50px;
  object-fit: contain;
  display: block;
}

/* 회원가입 링크 */
.signup-link {
  font-size: 0.85rem;
  text-align: center;
  color: var(--text-secondary);
}
.signup-link a {
  color: var(--text-link);
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.2rem;
}
.signup-link a:hover {
  color: var(--text-link-hover);
}

@media (max-width: 768px) {
  .login-card {
    width: 90%;
    height: auto;
    padding: 2rem;
  }
  .login-logo img {
    height: 100px;
  }
  .login-btn {
    width: 300px;
    height: 45px;
  }
  .kakao-btn {
    width: 100%;
  }
  .kakao-btn img {
    height: 45px;
  }
  .login-container {
    justify-content: center;
    padding-bottom: 100px;
  }
  .login-title {
    font-size: 2rem;
  }
  .login-label {
    font-size: 10rem;
  }
  .login-btn {
    font-size: 1.5rem;
  }
  .sns-divider {
    font-size: 1.2rem;
  }
  .signup-link {
    font-size: 1.2rem;
  }
  .login-options {
    font-size: 1.2rem;
  }

  /* Scoped deep styles for BaseInput on mobile */
  ::v-deep(.input-field) {
    font-size: 1.2rem;
    height: 48px;
    padding: 0.75rem;
  }
  ::v-deep(.input-label) {
    font-size: 1.2rem;
  }
}
</style>
