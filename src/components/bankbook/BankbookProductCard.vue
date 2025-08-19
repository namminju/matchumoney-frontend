<template>
  <div
    class="product-card"
    :class="
      props.index === 0
        ? 'top-recommendation'
        : props.index === 1
        ? 'second-recommendation'
        : props.index === 2
        ? 'third-recommendation'
        : ''
    "
    @click="goToDetail(saving.id)"
  >
    <div class="rank-badge">{{ props.index + 1 }}</div>
    <div class="product-card__logo-box">
      <img
        :src="saving.companyImage"
        loading="lazy"
        alt="logo"
        class="product-card__logo"
        v-if="saving.companyImage"
      />
      <img
        src="../../assets/logo_dis.png"
        alt="logo"
        class="product-card__logo"
        v-else
      />
      <div class="button-container">
        <LikeToggle
          :productId="saving.id"
          productType="saving-products"
          :initialLiked="saving.isLiked"
          :initialCount="saving.likeCount"
          @update="
            ({ liked, count }) => {
              saving.isLiked = liked;
              saving.likeCount = count;
            }
          "
          @click.stop
        />

        <CompareButton
          :productId="saving.id"
          :productType="productType"
          @click.stop
        />
      </div>
    </div>
    <div class="product-card__content-box">
      <div>
        <div>
          <div class="product-card__title">{{ saving.title }}</div>
          <div class="product-card__company">{{ saving.company }}</div>
        </div>
        <div class="info-container">
          <div class="product-card__badge">{{ saving.period }}개월</div>
          <div class="product-card__info">
            <span class="text-bold"> 최고 금리: </span>
            <span class="product-card__rate--highlight">
              {{ ' ' + roundToTwoDecimalPlaces(saving.maxRate) + '% ' }}
            </span>
            {{ ' /\n' }}
            <span>기준 금리: </span>
            <span>{{ ' ' + roundToTwoDecimalPlaces(saving.baseRate) }}%</span>
          </div>
        </div>
      </div>
      <div
        class="product-card__info product-card__info--highlight"
        v-if="saving.betterThan > 0"
      >
        기존 대비 최대
        <span class="product-card__compare--highlight"
          >+{{ roundToTwoDecimalPlaces(saving.betterThan) }}%↑</span
        >
      </div>
    </div>
    <FavoriteToggle
      @click.stop
      v-model="saving.isStarred"
      :productId="saving.id"
      :productType="productType"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import FavoriteToggle from '@/components/common/FavoriteToggle.vue';
import CompareButton from '@/components/common/CompareButton.vue';
import { roundToTwoDecimalPlaces } from '@/util/numberFormatter';
import { ProductType } from '@/constants/productTypes';
import { useRouter } from 'vue-router';
import LikeToggle from '../common/LikeToggle.vue';

const router = useRouter();

function goToDetail(id) {
  router.push(`/detail/saving/${id}`);
}
const productType = ProductType.SAVING;
const props = defineProps({
  saving: {
    type: Object,
    required: true,
  },
  index: Number,
});
</script>

<style scoped>
.product-card {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: space-evenly;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-accent);

  position: relative;
  transition: all 0.2s ease;
  background: var(--bg-card);

  border-radius: var(--spacing-md);

  cursor: pointer;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.top-recommendation {
  border-color: var(--color-warning);
  background: linear-gradient(
    135deg,
    var(--color-warning-light) 0%,
    var(--bg-card) 100%
  );
}
.product-card__logo-box {
  overflow: visible;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.product-card__logo {
  width: 100%;
  height: 6rem;
  object-fit: contain;
  border-radius: 50%;
}

.product-card__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.3;
  /* white-space: nowrap; */
  /* text-overflow: ellipsis; */
  display: block;
  max-width: 100%;
  min-width: 0;
}

.product-card__company {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
}

.product-card__info {
  font-size: var(--font-size-sm);
  white-space: inherit;
  color: var(--text-secondary);
  line-height: 2;
}

.product-card__rate--highlight {
  font-size: var(--font-size-xl);
  color: var(--color-accent);
  font-weight: bold;
}

.product-card__compare--highlight {
  font-size: var(--font-size-base);
  font-weight: bold;
}

.product-card__badge {
  height: auto;
  padding: 0.1rem 0.4rem;
  border-radius: 2rem;
  align-self: center;
  display: inline-block;
  border-radius: 0.4rem;
  font-size: var(--font-size-base);
  font-weight: bold;
  background: var(--color-info-light);
  color: var(--color-info-dark);
}

.product-card__content-box {
  width: 76%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@media (max-width: 1024px) {
  .product-card__title {
    font-size: var(--font-size-2xl);
  }
  .product-card__company {
    font-size: var(--font-size-base);
  }
  .product-card__info {
    font-size: var(--font-size-base);
  }
  .product-card__rate--highlight {
    font-size: var(--font-size-md);
  }
}

.rank-badge {
  position: absolute;
  top: calc(-1 * var(--spacing-sm));
  left: calc(-1 * var(--spacing-sm));
  width: 32px;
  height: 32px;
  background: var(--color-accent);
  color: var(--color-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 700;
  box-shadow: var(--shadow-md);
  border: 2px solid var(--bg-card);
}

.top-recommendation .rank-badge {
  background: var(--color-warning);
  color: white;
}

.text-bold {
  font-weight: bold;
  font-size: var(--font-size-base);
}
.product-card__info--highlight {
  color: var(--color-success-dark);
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  margin-top: var(--spacing-xs);
  background: var(--color-success-light);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  border: 1.5px solid var(--color-white);
  box-shadow: var(--shadow-md);
} /* 예상 혜택 정보 - card-details 안으로 이동 */

.product-card__info--highlight:hover {
  transform: translateY(-1px);
}
.button-container {
  display: flex;
  gap: 0.2rem;
  margin-top: 0.2rem;
  align-items: center; /* 추가 */
  justify-content: center; /* 추가 */
}
.info-container {
  gap: 0.4rem;
  display: flex;
}
@media (max-width: 640px) {
  .product-card {
    display: flex;
  }

  .product-card__logo-box {
    flex: 2; /* 첫 번째 칸 비율 */
  }

  .product-card__content-box {
    flex: 5; /* 두 번째 칸 비율 */
    width: auto; /* 기존 width 제거 */
  }
  .button-container,
  .info-container {
    display: initial;
    justify-self: end;
  }
  .button-container {
    display: flex; /* initial에서 flex로 변경 */
    flex-direction: column; /* 추가 */
    align-items: center; /* 추가 */
    justify-content: center; /* 추가 */
    gap: 0.2rem;
  }
  .product-card__title {
    font-size: var(--font-size-xl);
  }

  .text-bold,
  .product-card__badge {
    font-size: var(--font-size-base);
  }

  .product-card__company {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--color-dark);
    margin-bottom: 2px;
  }
  .product-card__rate--highlight {
    font-size: var(--font-size-xl);
    color: var(--color-accent);
    font-weight: bold;
  }
  .product-card {
    gap: var(--spacing-sm);
  }
  .product-card__info {
    font-size: var(--font-size-base);
  }
  .product-card__logo-box {
    justify-content: center;
  }
}
</style>
