<script setup>
import { formatDateString } from '@/util/dateFormatter';
import { roundToTwoDecimalPlaces } from '@/util/numberFormatter';
defineProps({
  saving: {
    type: Object,
    required: true,
    default: () => ({
      title: '',
      startDate: '',
      endDate: '',
      rate: '',
      logoUrl: 'https://www.gcsw.co.kr/theme/basic/images/sub/spo_bank2.png',
    }),
  },
});
</script>

<template>
  <div class="saving-card">
    <!-- <img :src="saving.logoUrl" alt="company" class="product-logo" /> -->
    <div class="card-content">
      <div class="card-title">{{ saving.title }}</div>
      <div class="card-info">
        <div class="date-section">
          <div class="info-row">
            <div class="label">신규일</div>
            <div class="value">{{ formatDateString(saving.start_date) }}</div>
          </div>
          <div class="info-row">
            <div class="label">만기일</div>
            <div class="value">{{ formatDateString(saving.end_date) }}</div>
          </div>
        </div>
        <div class="rate-section">
          <div class="label">금리</div>
          <div class="rate">{{ roundToTwoDecimalPlaces(saving.rate) }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.saving-card {
  background-color: var(--color-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--spacing-lg);
  gap: var(--spacing-md);
  box-shadow: var(--shadow-card);
}

.product-logo {
  width: 24%;
  max-width: 200px;
}

.card-content {
  width: clamp(250px, 100%, 8000px);
}

.card-title {
  font-weight: bold;
  font-size: var(--font-size-2xl);
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: end;
  font-size: var(--font-size-base);
  color: var(--color-title);
}

.date-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.rate-section {
  display: flex;
  align-items: end;
  gap: var(--spacing-sm);
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.value,
.label {
  color: var(--color-title);
  font-weight: bold;
}

.rate {
  color: var(--color-accent);
  font-weight: bold;
  font-size: var(--font-size-xl);
}
</style>
