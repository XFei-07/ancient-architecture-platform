<script setup lang="ts">
import { ref } from "vue";
import CountUp from "@/components/count-up";

const duration = ref(2);
</script>

<template>
  <ul class="user_Overview flex">
    <li class="user_Overview-item" style="color: #F5F0E8">
      <div class="user_Overview_nums allnum">
        <CountUp :endVal="2170" :duration="duration" />
      </div>
      <p>古建筑类国保（处）</p>
    </li>
    <li class="user_Overview-item" style="color: #7BAA9E">
      <div class="user_Overview_nums online">
        <CountUp :endVal="5061" :duration="duration" />
      </div>
      <p>全国重点文保总数（最新公开源）</p>
    </li>
    <li class="user_Overview-item" style="color: #D4A847">
      <div class="user_Overview_nums offline">
        <CountUp :endVal="14" :duration="duration">
          <template #suffix>+</template>
        </CountUp>
      </div>
      <p>涉及历史时期/朝代</p>
    </li>
    <li class="user_Overview-item" style="color: #C04851">
      <div class="user_Overview_nums laramnum">
        <CountUp :endVal="31" :duration="duration" />
      </div>
      <p>31省区市</p>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.left-top {
  width: 100%;
  height: 100%;
}

.user_Overview {
  li {
    flex: 1;

    p {
      text-align: center;
      height: 16px;
      font-size: 16px;
    }

    .user_Overview_nums {
      width: 100px;
      height: 100px;
      text-align: center;
      line-height: 100px;
      font-size: 22px;
      margin: 50px auto 30px;
      background-size: cover;
      background-position: center center;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }

      &.bgdonghua::before {
        animation: rotating 14s linear infinite;
      }
    }

    .allnum {
      &::before {
        background: radial-gradient(circle, rgba(245,240,232,0.15) 30%, rgba(201,169,110,0.08) 60%, transparent 70%);
        border-radius: 50%;
      }
    }

    .online {
      &::before {
        background: radial-gradient(circle, rgba(123,170,158,0.15) 30%, rgba(123,170,158,0.08) 60%, transparent 70%);
        border-radius: 50%;
      }
    }

    .offline {
      &::before {
        background: radial-gradient(circle, rgba(212,168,71,0.15) 30%, rgba(212,168,71,0.08) 60%, transparent 70%);
        border-radius: 50%;
      }
    }

    .laramnum {
      &::before {
        background: radial-gradient(circle, rgba(192,72,81,0.15) 30%, rgba(192,72,81,0.08) 60%, transparent 70%);
        border-radius: 50%;
      }
    }
  }
}
</style>
