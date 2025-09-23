<template>
  <div class="fortune-page">
    <BackButton />
    <div class="hero">
      <div class="hero-inner">
        <div class="orb" aria-hidden="true"></div>
        <h1 class="title">
          <i class="fa-solid fa-coins" aria-hidden="true"></i>
          오늘의 금전운
        </h1>
        <p class="subtitle">
          생년월일·태어난 시간·성별을 입력하면 맞추머니가 오늘의 금전 흐름을 가볍고 즐겁게 알려줘요.
        </p>
      </div>
    </div>

    <div class="content">
      <!-- 1) 입력 카드 -->
      <form class="card form-card equal-card" @submit.prevent="handleSubmit" novalidate>
        <div class="grid">
          <div class="field">
            <label for="name">이름 (선택)</label>
            <input id="name" v-model.trim="form.name" type="text" placeholder="이름을 입력하세요" />
          </div>

          <div class="field">
            <label for="birthDate">
              생년월일
              <span class="req">*</span>
            </label>
            <input id="birthDate" v-model="form.birthDate" type="date" required />
            <p v-if="touched.birthDate && !form.birthDate" class="error">생년월일을 입력해 주세요.</p>
          </div>

          <div class="field">
            <label for="birthTime">
              태어난 시간
              <small>(선택)</small>
            </label>
            <div class="time-row">
              <input id="birthTime" v-model="form.birthTime" type="time" :disabled="form.timeUnknown" />
              <label class="chk">
                <input type="checkbox" v-model="form.timeUnknown" />
                시간을 모르겠어요
              </label>
            </div>
          </div>

          <div class="field gender">
            <span class="label">
              성별
              <span class="req">*</span>
            </span>
            <div class="segmented">
              <label :class="['seg', form.gender === 'MALE' && 'active']">
                <input type="radio" name="gender" value="MALE" v-model="form.gender" />
                남성
              </label>
              <label :class="['seg', form.gender === 'FEMALE' && 'active']">
                <input type="radio" name="gender" value="FEMALE" v-model="form.gender" />
                여성
              </label>
            </div>
            <p v-if="touched.gender && !form.gender" class="error">성별을 선택해 주세요.</p>
          </div>
        </div>
        <div class="actions">
          <button class="btn primary" type="submit" :disabled="loadingReport || loadingTasks">
            <span v-if="!loadingReport && !loadingTasks">금전운 보기</span>
            <span v-else class="spinner small"></span>
          </button>
          <button class="btn ghost" type="button" @click="resetForm" :disabled="loadingReport || loadingTasks">
            초기화
          </button>
        </div>
      </form>

      <!-- ▶ connector 1: 입력 → 리포트 -->
      <div class="connector" :class="{ active: step >= 2 }">
        <i class="fa-solid fa-arrow-right"></i>
      </div>

      <!-- 2) 금전운 리포트 카드 -->
      <div class="card result-card equal-card" v-if="step >= 2">
        <div class="result-header">
          <img class="bot-avatar" src="@/assets/chatbot_images/chatbot_cat.png" alt="맞추머니" />
          <div class="meta">
            <div class="name">맞추머니 챗봇</div>
            <div class="desc">금전운 리포트</div>
          </div>
        </div>
        <div class="result-body">
          <div v-if="loadingReport" class="loading-wrap">
            <div class="spinner"></div>
            <p>금전운을 분석하고 있어요…</p>
          </div>
          <div v-else class="bubble" v-html="formatted(resultText)"></div>
        </div>
        <div class="result-actions" v-if="!loadingReport && resultText">
          <button class="btn secondary tiny" @click="copyToClipboard">복사하기</button>
          <button class="btn tiny" @click="seeAgain">다시 보기</button>
        </div>
      </div>

      <!-- ▶ connector 2: 리포트 → 투두 -->
      <div class="connector" :class="{ active: step >= 3 }">
        <i class="fa-solid fa-arrow-right"></i>
      </div>

      <!-- 3) 오늘 하면 좋은 일 카드 -->
      <div class="card todo-card equal-card" v-if="step >= 3">
        <div class="todo-header">
          <div class="todo-title">
            <i class="fa-solid fa-list-check" aria-hidden="true"></i>
            오늘 하면 좋은 일 3가지
          </div>
          <div class="todo-sub">금전운을 바탕으로 한 실천 가이드</div>
        </div>
        <div class="todo-body">
          <div v-if="loadingTasks" class="loading-wrap">
            <div class="spinner"></div>
            <p>실천 가이드를 정리하는 중…</p>
          </div>
          <ol v-else class="todo-list">
            <li v-for="(t, i) in tasks" :key="i" class="todo-item">
              <span class="check" aria-hidden="true"></span>
              <span class="todo-text">{{ t }}</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import BackButton from '@/components/common/BackButton.vue';
import { useCustomModal } from '@/composables/useCustomModal';

// Ensure Font Awesome CSS is available (fallback injector)
onMounted(() => {
  const id = 'fa-cdn-stylesheet';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
    link.crossOrigin = 'anonymous';
    link.referrerPolicy = 'no-referrer';
    document.head.appendChild(link);
  }
});

const form = ref({
  name: '',
  birthDate: '', // YYYY-MM-DD
  birthTime: '', // HH:MM
  timeUnknown: false,
  gender: '', // MALE | FEMALE | OTHER
});

const touched = ref({ birthDate: false, gender: false });
const step = ref(1); // 1=입력, 2=리포트, 3=투두
const { showAlert, showSuccess } = useCustomModal();
const loadingReport = ref(false);
const loadingTasks = ref(false);
const resultText = ref('');
const tasks = ref([]);

const resetForm = () => {
  form.value = {
    name: '',
    birthDate: '',
    birthTime: '',
    timeUnknown: false,
    gender: '',
  };
  touched.value = { birthDate: false, gender: false };
  resultText.value = '';
  tasks.value = [];
  step.value = 1;
  loadingReport.value = false;
  loadingTasks.value = false;
};

const systemPrompt = `너는 친절한 '금전운' 도우미야. 과장/불안 조장 없이 오늘의 "돈의 흐름"을 명확하게 설명해.
반드시 아래 두 블록을 이 순서로 출력해. 인사말·호칭(예: 안녕하세요, ~님)·도입 멘트는 절대 쓰지 말고 곧바로 내용만 작성해:
<REPORT>
오늘의 금전운 리포트를 연속 서술로 작성해. 서론-핵심-마무리 구조로 3~6문장. 투자/지출/현금흐름 관점에서 구체적인 맥락을 주고, 단정 대신 조심스러운 표현을 사용. 존댓말. 불릿/번호 목록 금지.
</REPORT>
<ACTIONS>
- 오늘 하면 좋은 일 3가지 (한 줄씩, 동사로 시작, 구체적으로)
</ACTIONS>
규칙: 미신을 사실처럼 단정하지 말고 심리적·실천적 조언 위주. 한국어.`;

const handleSubmit = async () => {
  touched.value.birthDate = true;
  touched.value.gender = true;
  if (!form.value.birthDate || !form.value.gender) return;

  const { name, birthDate, birthTime, timeUnknown, gender } = form.value;
  const prettyTime = timeUnknown || !birthTime ? '모름' : birthTime;
  const userLine = [
    name ? `이름: ${name}` : null,
    `생년월일: ${birthDate}`,
    `태어난 시간: ${prettyTime}`,
    `성별: ${gender}`,
  ]
    .filter(Boolean)
    .join(' | ');

  const message = `다음 사용자의 오늘 금전운을 위 형식에 맞춰 작성해줘.\n${userLine}`;

  try {
    // 1) 입력 → 리포트
    step.value = 2;
    loadingReport.value = true;
    resultText.value = '';
    tasks.value = [];

    const token = sessionStorage.getItem('accessToken');
    const res = await axios.post(
      '/api/chatbot',
      { message, systemPrompt },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    const raw = (res?.data?.reply || '').trim();
    const { report, actions } = extractSections(raw);
    resultText.value = report || '운세를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.';

    // 2) 리포트 완료 → 투두
    loadingReport.value = false;
    step.value = 3;
    loadingTasks.value = true;
    tasks.value = actions.length ? actions.slice(0, 3) : [];

    setTimeout(() => {
      loadingTasks.value = false;
    }, 450);
  } catch (e) {
    console.error(e);
    resultText.value = '서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
    loadingReport.value = false;
    loadingTasks.value = false;
  }
};

const extractSections = (text) => {
  const out = { report: '', actions: [] };
  if (!text) return out;

  // Normalize
  let t = String(text)
    .replace(/^\uFEFF/, '')
    .trim();

  // Prefer explicit sections
  const reportMatch = t.match(/<REPORT>[\s\S]*?<\/REPORT>/i);
  const actionsMatch = t.match(/<ACTIONS>[\s\S]*?<\/ACTIONS>/i);
  if (reportMatch) {
    out.report = reportMatch[0].replace(/<\/?REPORT>/gi, '').trim();
  }
  if (actionsMatch) {
    const body = actionsMatch[0].replace(/<\/?ACTIONS>/gi, '').trim();
    out.actions = body
      .split(/\r?\n/)
      .map((s) => s.replace(/^[-•\d).\s]+/, '').trim())
      .filter(Boolean);
  }

  // Fallbacks when markers are missing
  if (!out.report) {
    // Drop common greetings / salutations on the first lines
    t = t.replace(/^안녕하세요[^\n]*\n+/gi, '').replace(/^.*?님[^\n]*\n+/gi, '');

    // Use the first meaningful paragraph (not too short and not a greeting)
    const paras = t
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const firstIdx = paras.findIndex(
      (p) => p.length > 30 && !/^안녕하세요/i.test(p) && !/안내해\s*드리겠습니다|안내해드리겠습니다/.test(p)
    );
    const chosen = firstIdx >= 0 ? paras[firstIdx] : paras[0] || t;
    out.report = chosen.trim();
  }

  if (!out.actions.length) {
    // Try to collect bullet/numbered lines
    const candidates = t
      .split(/\r?\n/)
      .filter((s) => /^\s*[-•\d).]/.test(s))
      .map((s) => s.replace(/^\s*[-•\d).\s]+/, '').trim())
      .filter(Boolean);
    out.actions =
      candidates.length >= 3
        ? candidates.slice(0, 3)
        : ['지출 계획 점검하기', '중요 거래는 문서 재확인하기', '불필요한 소비 줄이고 예산 기록하기'];
  }
  return out;
};

const formatted = (text) => {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text; // HTML이면 그대로
  return text.replace(/\n/g, '<br />');
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(resultText.value);
    await showSuccess('운세 내용을 복사했어요.', '복사 완료');
  } catch (_) {
    await showAlert('복사에 실패했어요.', '복사 실패');
  }
};

const seeAgain = () => {
  resultText.value = '';
};
</script>

<style scoped>
/* 레이아웃 */
.fortune-page {
  min-height: 100%;
  background: radial-gradient(1200px 600px at 80% -10%, rgba(175, 199, 255, 0.25), transparent 60%),
    radial-gradient(1000px 500px at -10% 10%, rgba(255, 204, 229, 0.25), transparent 55%), var(--bg-body, #f7f9fc);
  color: var(--text-primary, #111827);
}

.hero {
  padding: 44px 16px 8px;
  text-align: center;
  position: relative;
}
.hero-inner {
  max-width: 880px;
  margin: 0 auto;
  position: relative;
}
.orb {
  position: absolute;
  inset: -40px auto auto 50%;
  width: 220px;
  height: 220px;
  transform: translateX(-50%);
  border-radius: 50%;
  filter: blur(24px);
  background: conic-gradient(
    from 120deg,
    rgba(91, 140, 255, 0.22),
    rgba(255, 160, 200, 0.22),
    rgba(91, 140, 255, 0.22)
  );
  opacity: 0.9;
  pointer-events: none;
}
.title {
  font-size: 32px;
  font-weight: 900;
  margin: 0;
}
.subtitle {
  margin-top: 10px;
  color: var(--text-secondary, #6b7280);
}

.content {
  width: min(1600px, 100%);
  margin: 18px auto 64px;
  padding: 0 24px;
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 48px 1fr 48px 1fr; /* card, arrow, card, arrow, card */
  align-items: stretch;
}
/* ✅ Tablet/Desktop-narrow: 세로 재배치 */
@media (max-width: 1280px) {
  .content {
    grid-template-columns: 1fr; /* 세로 스택 */
    gap: 18px;
    padding: 0 16px;
  }
  .connector {
    display: none;
  }
  .equal-card {
    min-height: 620px;
  }
}
.connector {
  display: grid;
  align-items: center;
  justify-items: center;
  color: var(--text-secondary, #6b7280);
  font-size: 22px;
  opacity: 0.5;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
.connector.active {
  opacity: 1;
}
.equal-card {
  height: 100%; /* grid row 높이에 맞춰 동일 높이로 */
  min-height: 0; /* 과도한 빈 공간 제거 */
  display: flex;
  flex-direction: column;
}
.form-card {
  padding: 20px;
}

@media (max-width: 980px) {
  .content {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 16px;
  box-shadow: 0 10px 26px rgba(16, 24, 40, 0.06);
}

.grid {
  display: grid;
  grid-template-columns: 1fr; /* 모든 해상도에서 단일 컬럼 입력 */
  gap: 16px 0;
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
}
.field label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 8px;
}
.field input[type='text'],
.field input[type='date'],
.field input[type='time'] {
  height: 44px;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  background: #fff;
}
.field input:focus {
  outline: none;
  border-color: var(--color-accent, #5b8cff);
  box-shadow: 0 0 0 3px rgba(91, 140, 255, 0.15);
}
.req {
  color: #ef4444;
}
.error {
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
}

.time-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}
.chk {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
}

.gender .label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 8px;
  display: block;
}
.segmented {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.seg {
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 12px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #374151;
  background: #fff;
  cursor: pointer;
}
.seg input {
  display: none;
}
.seg.active {
  border-color: var(--color-accent, #5b8cff);
  box-shadow: 0 0 0 3px rgba(91, 140, 255, 0.15);
  color: var(--color-accent, #5b8cff);
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 6px;
}
.btn {
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.btn.primary {
  background: var(--color-accent, #5b8cff);
  color: #fff;
  box-shadow: 0 6px 14px rgba(91, 140, 255, 0.25);
}
.btn.ghost {
  background: #fff;
  border-color: var(--border-light, #e5e7eb);
  color: var(--text-primary, #111827);
}
.btn.secondary {
  background: #fff;
  border-color: var(--color-accent, #5b8cff);
  color: var(--color-accent, #5b8cff);
}
.btn.tiny {
  height: 36px;
  padding: 0 12px;
  font-size: 13px;
  border-radius: 8px;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #e5edff;
  border-top: 3px solid var(--color-accent, #5b8cff);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
.spinner.small {
  width: 18px;
  height: 18px;
  border-width: 2px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 결과 카드 */
.result-card {
  padding: 18px;
}
.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light, #e5e7eb);
}
.bot-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #cfe5a2;
  background: #fff;
}
.meta .name {
  font-weight: 900;
}
.meta .desc {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.result-body {
  padding: 12px 2px;
}
.loading-wrap {
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 24px 0;
  color: var(--text-secondary, #6b7280);
}
.bubble {
  background: #f6fbff;
  border: 1px solid #e6f0ff;
  border-radius: 16px;
  padding: 14px 16px;
  color: #111827;
  line-height: 1.6;
}

.result-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 8px;
}

/* 오늘 하면 좋은 일 카드 */
.todo-card {
  padding: 18px;
}
.todo-header {
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  padding-bottom: 10px;
  margin-bottom: 6px;
}
.todo-title {
  font-weight: 900;
}
.todo-sub {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}
.todo-body {
  padding: 12px 2px;
}
.todo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}
.todo-item {
  display: grid;
  grid-template-columns: 22px 1fr;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e6f0ff;
  border-radius: 12px;
  background: #fdfefe;
}
.todo-item .check {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-accent, #5b8cff);
  border-radius: 4px;
}
.todo-text {
  font-weight: 700;
}

@media (max-width: 768px) {
  .connector {
    display: grid !important;
    place-items: center;
  }
  .connector i::before {
    content: '\f063'; /* fa-arrow-down */
  }
}
</style>
