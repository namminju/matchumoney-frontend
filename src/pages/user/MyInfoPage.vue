<template>
  <div class="myInfoPage container fade-in">
    <!-- 헤더는 App.vue에서 공통으로 렌더링된다고 가정 -->

    <main class="content flex flex-column align-center mt-5">
      <h2 class="profile-title">내 프로필 변경하기</h2>
      <!-- 프로필 이미지 (클릭 시 파일 선택) -->
      <div class="profile-img clickable" @click="triggerFilePicker" title="프로필 사진 변경" role="button" tabindex="0">
        <template v-if="previewUrl || user?.profileImageUrl">
          <img :src="previewUrl || user.profileImageUrl" alt="프로필 이미지" class="profile-picture" />
        </template>
        <template v-else>
          <img src="@/assets/user.png" alt="기본 프로필 이미지" class="profile-picture" />
        </template>
        <!-- 숨김 파일 입력 -->
        <input ref="fileInput" type="file" accept="image/*" class="hidden-file" @change="onFileChange" />
        <div class="profile-img__hint" v-if="!uploading"></div>
        <div class="profile-img__hint" v-else></div>
      </div>

      <!-- 비밀번호 확인 카드: 성공하면 사라짐 -->
      <!-- 비밀번호 확인 카드: 성공하면 사라짐 -->
      <form
        v-if="!isChecking && !isVerified && !isSocialLogin"
        class="verify-card"
        @submit.prevent="handleVerifyPassword">
        <div class="verify-title">비밀번호 확인</div>
        <div class="verify-row">
          <label class="verify-label" for="verifyPw">현재 비밀번호</label>
          <input
            id="verifyPw"
            v-model="verifyPw"
            type="password"
            class="verify-input"
            placeholder="현재 비밀번호를 입력하세요"
            autocomplete="current-password"
            required />
        </div>
        <p class="verify-error" v-if="verifyErr">{{ verifyErr }}</p>
        <div class="verify-actions">
          <!-- type=submit이면 엔터도 자동으로 동작 -->
          <button type="submit" class="btn primary">확인</button>
        </div>
      </form>

      <!-- 로딩 중 힌트 -->
      <div v-if="isChecking" class="verify-card" style="text-align: center">로딩 중...</div>

      <!-- 프로필 카드 (비밀번호 확인 전에는 잠금 상태) -->
      <div class="profile-card" :class="{ 'is-locked': !isChecking && !isVerified }">
        <div class="profile-card__head">
          <h2 class="profile-title inner">내 정보 수정</h2>
          <router-link v-if="!isSocialLogin" to="/myinfo/update/password" class="pw-link">비밀번호 변경</router-link>
          <span v-else class="pw-link" style="opacity: 0.7; cursor: default">소셜 로그인 계정입니다</span>
        </div>

        <!-- 폼 그리드 (가로 2열, 각 행당 입력 1개) -->
        <div class="form-grid">
          <!-- 이메일 (읽기 전용) -->
          <div class="form-row">
            <label class="form-label">이메일</label>
            <input class="form-input" type="email" :value="user?.email || ''" readonly />
          </div>

          <!-- 비밀번호 (변경 진입용) -->
          <div class="form-row">
            <label class="form-label">비밀번호</label>
            <div class="pw-inline">
              <input class="form-input" type="password" value="********" readonly />
              <router-link
                v-if="!isSocialLogin"
                :to="isVerified ? '/myinfo/update/password' : ''"
                class="btn secondary tiny pw-change-btn"
                :aria-disabled="!isVerified"
                :tabindex="isVerified ? 0 : -1"
                @click.prevent="handleGoChangePassword">
                변경하러 가기
              </router-link>
              <span v-else class="pw-hint">소셜 로그인 계정입니다</span>
            </div>
          </div>

          <!-- 닉네임 -->
          <div class="form-row">
            <label class="form-label" for="nick">닉네임</label>
            <input id="nick" class="form-input" type="text" v-model.trim="form.nickname" :disabled="!isVerified" />
          </div>

          <!-- 성별 -->
          <div class="form-row">
            <label class="form-label" for="gender">성별</label>
            <select id="gender" class="form-input" v-model="form.gender" :disabled="!isVerified">
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
              <option value="OTHER">기타</option>
            </select>
          </div>

          <!-- 생년월일 -->
          <div class="form-row">
            <label class="form-label" for="birth">생년월일</label>
            <input id="birth" class="form-input" type="date" v-model="form.birthDate" :disabled="!isVerified" />
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="form-actions">
          <button type="button" class="btn ghost" @click="handleLogout">로그아웃</button>
          <div class="spacer"></div>
          <button type="button" class="btn danger" @click="handleDeleteAccount">회원 탈퇴</button>
          <button type="button" class="btn primary" @click="handleSaveProfile" :disabled="!isVerified">저장</button>
        </div>
      </div>
      <!-- ===== 회원 탈퇴 확인 다이얼로그 ===== -->
      <div v-if="showDeleteDialog" class="delete-overlay" role="dialog" aria-modal="true">
        <div class="delete-modal">
          <div class="delete-modal__head">
            <h3 class="delete-title">정말로 회원 탈퇴하시나요?</h3>
            <button class="delete-close" @click="closeDeleteDialog" aria-label="닫기">✕</button>
          </div>

          <p class="delete-desc">
            탈퇴하시려면 아래 입력란에
            <strong>회원 탈퇴</strong>
            를 정확히 입력하고, 탈퇴 사유를 선택해 주세요. 데이터는 복구되지 않습니다.
          </p>

          <label class="delete-label" for="deleteConfirmInput">확인 문구 입력</label>
          <input
            id="deleteConfirmInput"
            v-model.trim="confirmDeleteText"
            type="text"
            class="delete-input"
            placeholder="회원 탈퇴" />

          <label class="delete-label" for="deleteReason">탈퇴 사유</label>
          <select id="deleteReason" v-model="deleteReason" class="delete-input">
            <option value="" disabled>사유를 선택하세요</option>
            <option v-for="r in DELETE_REASONS" :key="r" :value="r">
              {{ r }}
            </option>
          </select>

          <div v-if="deleteReason === '기타(직접 입력)'" class="delete-detail-wrap">
            <label class="delete-label" for="deleteDetail">상세 사유</label>
            <textarea
              id="deleteDetail"
              v-model.trim="deleteDetail"
              class="delete-textarea"
              rows="3"
              placeholder="사유를 구체적으로 작성해 주세요"></textarea>
          </div>

          <p v-if="deleteError" class="delete-error">{{ deleteError }}</p>

          <div class="delete-actions">
            <button class="btn ghost" type="button" @click="closeDeleteDialog">취소</button>
            <button
              class="btn danger"
              type="button"
              :disabled="
                isDeleting ||
                confirmDeleteText.trim() !== '회원 탈퇴' ||
                !deleteReason ||
                (deleteReason === '기타(직접 입력)' && !deleteDetail.trim())
              "
              @click="submitDeleteAccount">
              {{ isDeleting ? '처리 중...' : '탈퇴하기' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import userApi from '@/api/user';
import api from '@/api';
import authApi from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import { useCustomModal } from '@/composables/useCustomModal';
// ===== 회원 탈퇴 다이얼로그 상태 =====
const showDeleteDialog = ref(false);
const deleteReason = ref('');
const deleteDetail = ref('');
const confirmDeleteText = ref('');
const isDeleting = ref(false);
const deleteError = ref('');

const DELETE_REASONS = [
  '서비스가 마음에 들지 않음',
  '원하는 기능이 없음',
  '이용 빈도가 낮음',
  '개인정보/보안 우려',
  '비용/혜택이 불만족',
  '기타(직접 입력)',
];

const user = ref(null);
const form = reactive({ nickname: '', gender: 'OTHER', birthDate: '' });

const isVerified = ref(false);
const verifyPw = ref('');
const verifyErr = ref('');
const isSocialLogin = ref(false);
const isChecking = ref(true);

const isDev = (import.meta.env?.MODE || 'development') !== 'production';

const authStore = useAuthStore();
const { showAlert, showSuccess, showError, showDangerConfirm } = useCustomModal();

const fileInput = ref(null);
const uploading = ref(false);
const previewUrl = ref('');

function triggerFilePicker() {
  // 소셜이든 비번검증 완료든, 편집 가능할 때만 허용
  if (!isVerified.value && !isSocialLogin.value) {
    showAlert('비밀번호 확인 후 변경할 수 있어요.', '알림');
    return;
  }
  fileInput.value && fileInput.value.click();
}

async function onFileChange(e) {
  const file = e?.target?.files?.[0];
  if (!file) return;

  // 미리보기
  if (previewUrl.value) {
    try {
      URL.revokeObjectURL(previewUrl.value);
    } catch (_) {}
  }
  previewUrl.value = URL.createObjectURL(file);

  // 파일명/컨텐트타입 보정
  const origName = (file.name || '').trim();
  const hasExt = /\.[a-zA-Z0-9]+$/.test(origName);
  const extFromName = hasExt ? origName.split('.').pop().toLowerCase() : '';

  // 확장자 기반 contentType 추정
  const extToMime = (ext) => {
    switch ((ext || '').toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      case 'heic':
        return 'image/heic';
      case 'bmp':
        return 'image/bmp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return '';
    }
  };

  const inferredByExt = extToMime(extFromName);
  const rawType = (file.type || '').trim();
  // 최종 Content-Type: 파일이 제공하면 우선, 아니면 확장자, 그래도 없으면 png
  const contentType = rawType && rawType.startsWith('image/') ? rawType : inferredByExt || 'image/png';

  const safeName = hasExt ? origName : `profile_${Date.now()}.png`;

  uploading.value = true;
  try {
    // 1) presign 요청 (백엔드 규약: filename, contentType 필요)
    const presignRes = await api.post('/files/profile/presign', {
      filename: safeName, // 🔁 서버 DTO가 요구하는 이름
      contentType,
    });
    console.log('[presign] response', presignRes?.data || presignRes);

    const data = presignRes?.data || presignRes;
    const uploadUrl = data?.uploadUrl || data?.result?.uploadUrl;
    const publicUrl = data?.publicUrl || data?.result?.publicUrl;
    const headers = data?.headers || {}; // S3가 요구하는 추가 헤더가 있으면 사용

    if (!uploadUrl) throw new Error('사전서명 URL을 받지 못했습니다.');

    // 2) S3로 PUT 업로드
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType, ...headers },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error(`S3 업로드 실패 (${putRes.status})`);
    }

    // 3) 프로필 URL을 서버 DB에 반영 (publicUrl을 사용하는 계약이라 가정)
    if (publicUrl) {
      await userApi.updateUserInfo({
        nickname: form.nickname,
        gender: form.gender,
        birthDate: form.birthDate,
        profileImageUrl: publicUrl,
      });
      user.value = { ...(user.value || {}), profileImageUrl: publicUrl };
      try {
        URL.revokeObjectURL(previewUrl.value);
      } catch (_) {}
      previewUrl.value = '';
    }
  } catch (err) {
    console.error('[profile presign/upload] error', err);
    showError('이미지 업로드에 실패했습니다. 다른 이미지를 시도해 주세요.', '업로드 실패');
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
}

onUnmounted(() => {
  if (previewUrl.value) {
    try {
      URL.revokeObjectURL(previewUrl.value);
    } catch (_) {}
  }
});

function toYmd(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

async function handleSaveProfile() {
  try {
    await userApi.updateUserInfo({
      nickname: form.nickname,
      gender: form.gender,
      birthDate: form.birthDate,
    });
    await showSuccess('변경 사항이 저장되었습니다.', '저장 완료');
    // 저장 알림 후 새로고침으로 전체 상태 동기화
    setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch (e) {
    console.error('회원 정보 수정 실패', e);
    showError('수정에 실패했습니다. 다시 시도해 주세요.', '저장 실패');
  }
}

function handleLogout() {
  // Assuming logout logic is handled elsewhere or needs to be added
  window.location.href = '/login';
}

function handleDeleteAccount() {
  showDeleteDialog.value = true;
  deleteError.value = '';
}
function closeDeleteDialog() {
  showDeleteDialog.value = false;
  confirmDeleteText.value = '';
  deleteReason.value = '';
  deleteDetail.value = '';
  isDeleting.value = false;
  deleteError.value = '';
}
async function submitDeleteAccount() {
  deleteError.value = '';
  const typedOk = confirmDeleteText.value.trim() === '회원 탈퇴';
  const reasonOk = !!deleteReason.value;
  const needDetail = deleteReason.value === '기타(직접 입력)';
  const detailOk = !needDetail || (needDetail && deleteDetail.value.trim().length > 0);

  if (!typedOk || !reasonOk || !detailOk) {
    deleteError.value = '상단 안내 문구와 사유 선택/입력을 완료해 주세요.';
    return;
  }

  const confirmed = await showDangerConfirm(
    '정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    '회원 탈퇴 확인',
    '탈퇴'
  );
  if (!confirmed) return;

  isDeleting.value = true;
  try {
    // 백엔드 규격에 맞춰 경로/메서드만 바꾸세요.

    await api.post('/auth/withdraw', {
      reason: deleteReason.value,
      detail: deleteDetail.value.trim(),
    });

    await showSuccess('회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.', '탈퇴 완료');
    window.location.href = '/';
  } catch (err) {
    console.error('[delete account] error', err);
    deleteError.value = err?.response?.data?.message || '탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  } finally {
    isDeleting.value = false;
  }
}

async function handleVerifyPassword() {
  console.log('[verify] submit called');
  verifyErr.value = '';

  if (!verifyPw.value) {
    verifyErr.value = '비밀번호를 입력해 주세요.';
    return;
  }

  isChecking.value = true; // 로딩 on
  try {
    console.log('[verify] request start');
    const res = await authApi.verifyPassword(verifyPw.value); // { ok: true } 예상
    console.log('[verify] response', res);

    const ok = !!(res?.ok ?? res?.result ?? res === true);

    if (ok) {
      isVerified.value = true; // 폼 잠금 해제
      verifyPw.value = '';
      verifyErr.value = ''; // 에러 문구 클리어
      console.log('[verify] success');
    } else {
      verifyErr.value = '비밀번호가 올바르지 않습니다.';
      console.log('[verify] mismatch');
    }
  } catch (err) {
    console.error('[verify] error', err?.response?.status, err?.response?.data);
    verifyErr.value = err?.response?.data?.message || '비밀번호 검증 중 오류가 발생했습니다.';
  } finally {
    isChecking.value = false; // 로딩 off
  }
}

import { useRouter } from 'vue-router';
const router = useRouter();

function handleGoChangePassword() {
  // 소셜 계정은 이 버튼이 노출되지 않지만, 방어적으로 체크
  if (isSocialLogin.value) return;
  if (!isVerified.value) {
    showAlert('비밀번호 확인 후 이동할 수 있어요.', '알림');
    return;
  }
  router.push('/myinfo/update/password');
}
onMounted(async () => {
  console.log('[MyInfoPage] onMounted fired');
  try {
    console.log('[MyInfoPage] calling getMyInfo');
    const res = await userApi.getMyInfo();
    window.__myInfoResponse = res; // 🔎 inspectable from devtools
    console.log('[MyInfoPage] getMyInfo response:', res);
    console.log('[MyInfoPage] result:', res?.result);
    user.value = res.result;

    form.nickname = res.result?.nickname || '';
    form.gender = res.result?.gender || 'OTHER';
    form.birthDate = toYmd(res.result?.birthDate);

    // 소셜 로그인 여부 판단 (여러 백엔드 필드 대응)
    const r = res.result || {};
    const provider = (r.provider || r.authProvider || r.loginType || r.socialProvider || '').toString().toUpperCase();
    const isProviderSocial = ['KAKAO', 'NAVER', 'GOOGLE', 'APPLE', 'FACEBOOK', 'GITHUB', 'SOCIAL', 'OAUTH'].includes(
      provider
    );
    const hasPassword = r.hasPassword !== undefined ? !!r.hasPassword : undefined;

    // 1차: 백엔드 응답 기반 판단
    let socialByResponse =
      r.is_social_login === 1 ||
      r.isSocialLogin === true ||
      r.socialLogin === true ||
      isProviderSocial ||
      hasPassword === false;

    // 2차: 로그인 스토어 기반 보조 판단 (로그인 시 저장해둔 값 활용)
    const storeProvider = (authStore?.provider || authStore?.loginType || '').toString().toUpperCase();
    const storeIsSocial =
      authStore?.isSocialLogin === true ||
      ['KAKAO', 'NAVER', 'GOOGLE', 'APPLE', 'FACEBOOK', 'GITHUB', 'SOCIAL', 'OAUTH'].includes(storeProvider);

    isSocialLogin.value = socialByResponse || storeIsSocial;

    if (isDev) {
      console.log('[MyInfoPage] store snapshot', {
        provider: authStore?.provider,
        loginType: authStore?.loginType,
        isSocialLogin: authStore?.isSocialLogin,
      });
      console.log('[MyInfoPage] isSocialLogin (final):', isSocialLogin.value);
    }

    // 소셜이면 비번 검증 없이 바로 수정 가능
    isVerified.value = isSocialLogin.value ? true : false;
  } catch (err) {
    console.error('[MyInfoPage] getMyInfo error', err);
  } finally {
    isChecking.value = false;
  }
});
</script>

<style>
/* 기본 링크 스타일 */
a.info-item {
  text-decoration: none;
  color: inherit;
}

/* 페이지 배경/텍스트 기본색 */
.myInfoPage {
  background-color: var(--bg-body);
  color: var(--text-primary);
}

/* 상단 프로필 이미지 */
.profile-img {
  width: 120px;
  height: 120px;
  border: 2px solid var(--color-secondary-50);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 64px;
  background-color: var(--color-primary-10);
}

.profile-picture {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.hidden-file {
  display: none;
}
.profile-img.clickable {
  cursor: pointer;
  position: relative;
}
.profile-img.clickable:hover {
  box-shadow: 0 0 0 3px rgba(91, 140, 255, 0.2) inset;
}
.profile-img__hint {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: var(--text-secondary);
}

/* 상단 타이틀 */
.profile-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}
.profile-title.inner {
  font-size: 18px;
  margin: 0;
  text-align: left;
}

/* ===== 비밀번호 확인 카드 ===== */
.verify-card {
  width: 100%;
  max-width: 880px;
  background: #fff;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.06);
  padding: 20px 24px;
  margin: 18px 0;
}
.verify-title {
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--text-primary);
}
.verify-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 12px;
  align-items: center;
}
.verify-label {
  font-size: 14px;
  color: var(--text-secondary);
}
.verify-input {
  height: 44px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
}
.verify-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(91, 140, 255, 0.15);
}
.verify-error {
  margin-top: 8px;
  color: #ef4444;
  font-size: 13px;
}
.verify-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* ===== 프로필 카드 레이아웃 (2열) ===== */
.profile-card {
  width: 100%;
  max-width: 880px;
  margin-top: 12px;
  background: #fff;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.06);
  padding: 20px 24px;
  position: relative;
}
.profile-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 16px;
}
.pw-link {
  font-size: 14px;
  color: var(--color-accent);
  text-decoration: none;
}
.pw-link:hover {
  text-decoration: underline;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}
.form-row {
  display: grid;
  grid-template-rows: auto auto;
}
.form-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.form-input {
  width: 100%;
  height: 44px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 0 12px;
  background: #fff;
  font-size: 14px;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(91, 140, 255, 0.15);
}
.form-input[readonly] {
  background: #f9fafb;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid var(--border-light);
}
.form-actions .spacer {
  flex: 1;
}

.btn {
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex; /* 글씨 세로 중앙 정렬 */
  align-items: center; /* 세로 중앙 */
  justify-content: center; /* 가로 중앙 */
  line-height: 1; /* 텍스트 상하 균형 */
  box-sizing: border-box; /* 테두리 포함 높이 계산 */
  vertical-align: middle; /* 주변 요소와의 정렬 */
}
.btn.primary {
  background: var(--color-accent);
  color: #fff;
  box-shadow: 0 6px 14px rgba(91, 140, 255, 0.25);
}
.btn.ghost {
  background: #fff;
  border-color: var(--border-light);
  color: var(--text-primary);
}
.btn.danger {
  background: #fff;
  border-color: #fecaca;
  color: #ef4444;
}

/* 잠금 상태 비주얼 (편집 비활성) */
.profile-card.is-locked {
  opacity: 0.6;
}
.profile-card.is-locked::after {
  content: '비밀번호 확인 후 수정할 수 있습니다';
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--text-secondary);
  font-weight: 700;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  pointer-events: none;
}

/* 반응형 */
@media (max-width: 820px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .verify-row {
    grid-template-columns: 120px 1fr;
  }
}
@media (max-width: 520px) {
  .verify-row {
    grid-template-columns: 110px 1fr;
  }
}

.pw-inline {
  display: grid;
  grid-template-columns: 1fr auto; /* 입력 + 버튼 */
  gap: 10px;
  align-items: center;
}
.btn.secondary {
  background: #fff;
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.btn.tiny {
  height: 36px;
  padding: 0 12px;
  font-size: 13px;
  border-radius: 8px;
  line-height: 36px; /* 높이와 동일 -> 완전 중앙 */
}

.btn[aria-disabled='true'] {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none; /* 비활성 시 클릭 차단 */
}
.pw-hint {
  font-size: 12px;
  color: var(--text-secondary);
}
.pw-change-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center; /* grid 내 세로 중앙 */
}
/* ===== 회원 탈퇴 다이얼로그 ===== */
.delete-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.delete-modal {
  width: min(560px, 92vw);
  background: #fff;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(16, 24, 40, 0.18);
  padding: 18px 20px 16px;
}
.delete-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.delete-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}
.delete-close {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}
.delete-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 8px 0 12px;
}
.delete-label {
  display: block;
  margin: 10px 0 6px;
  font-size: 12px;
  color: var(--text-secondary);
}
.delete-input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
}
.delete-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(91, 140, 255, 0.15);
}
.delete-textarea {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  resize: vertical;
}
.delete-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(91, 140, 255, 0.15);
}
.delete-error {
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
}
.delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

/* ===== 커스텀 모달 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  width: min(400px, 90vw);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  padding: 24px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.modal-close {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-message {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0 0 20px 0;
  word-break: keep-all;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-actions .btn {
  min-width: 80px;
  padding: 0 16px;
}

.btn-danger {
  background: #ef4444 !important;
  border-color: #ef4444 !important;
  color: #fff !important;
}

.btn-danger:hover {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .modal {
    width: calc(100vw - 40px);
    padding: 20px;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .modal-actions .btn {
    width: 100%;
    min-width: unset;
  }

  .modal-message {
    font-size: 15px;
  }
}
</style>
