<template>
  <div class="product-card">
    <div class="product-card__header">
      <div>
        <div class="product-card__company">{{ saving.company }}</div>
        <div class="product-card__title">{{ saving.title }}</div>
      </div>
      <FavoriteToggle v-model="saving.is_starred" />
    </div>

    <div class="product-card__body" @click="onClick">
      <div class="product-card__logo-box">
        <img
          src="../../assets/bank-Logos/BK_HANA_Profile.png"
          alt="logo"
          class="product-card__logo"
        />
        <CompareButton @click="onCompareClick" />
      </div>

      <div class="product-card__info">
        <div class="product-card__row">
          <span>최고 금리</span>
          <span class="product-card__highlight"
            >{{ roundToTwoDecimalPlaces(saving.max_rate) }}%</span
          >
        </div>
        <div class="product-card__row">
          <span>기본 금리</span>
          <span>{{ roundToTwoDecimalPlaces(saving.base_rate) }}%</span>
        </div>
        <div class="product-card__row">
          <span>금액</span>
          <span v-if="saving.amount"
            >매달 {{ Number(saving.amount).toLocaleString('ko-KR') }}원
            이하</span
          >
          <span v-else>제한 조건 없음</span>
        </div>
        <div class="product-card__row">
          <span>개월 수</span>
          <span>{{ saving.period }}개월</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import CompareButton from '@/components/common/CompareButton.vue';
import { roundToTwoDecimalPlaces } from '@/util/numberFormatter';
const props = defineProps({
  saving: {
    type: Object,
    required: true,
  },
});
const onCompareClick = () => {
  console.log(`${props.saving.id} 비교 추가 클릭됨`);
  // 향후 비교목록에 저장하는 로직 추가 가능
};

const onClick = () => {
  console.log(`${props.saving.id} 상세보러 가자!!`);
  // 향후 비교목록에 저장하는 로직 추가 가능
};
</script>

<style scoped>
.product-card {
  width: 100%;
  background-color: var(--color-light);
  box-shadow: var(--shadow-xl);
  border-radius: var(--spacing-md);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-md) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.product-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-card__company {
  font-size: var(--font-size-base);
  color: var(--color-gray-400);
  font-weight: bold;
}

.product-card__title {
  font-size: var(--font-size-2xl);
  color: var(--color-title);
  font-weight: bold;
}

.product-card__body {
  display: flex;
  gap: 5%;
}

.product-card__logo-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-xs);
  width: 24%;
  height: 100%;
  text-align: center;
}

.product-card__logo {
  width: 100%;
  object-fit: contain;
  border-radius: 50%;
  margin: auto;
}

.product-card__info {
  width: 68%;
  display: grid;
  align-items: center;
  grid-template-columns:
    1fr
    2fr;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-500);
}

.product-card__row {
  display: contents; /* 자식 span이 직접 grid 셀 차지하도록 */
}

.product-card__highlight {
  font-size: var(--font-size-base);
  color: var(--color-accent);
  font-weight: bold;
}
</style>
