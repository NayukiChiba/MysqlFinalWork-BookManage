<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
    <div class="confirm-dialog">
      <div class="dialog-header">
        <h3>缴纳罚款</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      <div class="dialog-body">
        <div class="pay-info">
          <p class="pay-notice">📢 正在开发支付功能</p>
          <p class="pay-amount">待缴金额: <strong>¥{{ amount }}</strong></p>
          <p class="pay-desc">点击"确认支付"将模拟完成支付流程</p>
        </div>
      </div>
      <div v-if="message" :class="['dialog-message', success ? 'success' : 'error']">
        {{ message }}
      </div>
      <div class="dialog-footer">
        <button class="btn-cancel" @click="handleClose">{{ success ? '关闭' : '取消' }}</button>
        <button 
          v-if="!success"
          class="btn-confirm" 
          @click="handleConfirm"
          :disabled="paying"
        >
          {{ paying ? '处理中...' : '确认支付' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { userAPI } from '../utils/api';

export default {
  name: 'PaymentDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    amount: {
      type: [String, Number],
      default: '0'
    },
    fineId: {
      type: [String, Number],
      default: null
    },
    // 是否支付所有罚款
    payAll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      paying: false,
      message: '',
      success: false
    };
  },
  watch: {
    visible(val) {
      if (val) {
        // 重置状态
        this.message = '';
        this.success = false;
        this.paying = false;
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    
    async handleConfirm() {
      this.paying = true;
      this.message = '';
      
      try {
        let response;
        
        if (this.payAll) {
          // 缴纳所有罚款
          response = await userAPI.payAllFines();
        } else if (this.fineId) {
          // 缴纳单个罚款
          response = await userAPI.payFine(this.fineId);
        } else {
          throw new Error('缺少罚款信息');
        }
        
        if (response.success) {
          this.message = response.message || '支付成功！';
          this.success = true;
          // 通知父组件支付成功
          this.$emit('paid', this.fineId);
        } else {
          this.message = response.error || '支付失败，请重试';
          this.success = false;
        }
      } catch (err) {
        this.message = err.response?.data?.error || '支付失败，请重试';
        this.success = false;
      } finally {
        this.paying = false;
      }
    }
  }
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.close-btn:hover {
  color: #333;
}

.dialog-body {
  padding: 20px;
}

.pay-info {
  text-align: center;
}

.pay-notice {
  font-size: 16px;
  color: #e6a23c;
  margin-bottom: 15px;
}

.pay-amount {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.pay-amount strong {
  color: #f56c6c;
}

.pay-desc {
  font-size: 14px;
  color: #999;
}

.dialog-message {
  margin: 0 20px 15px;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
}

.dialog-message.success {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.dialog-message.error {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.btn-cancel, .btn-confirm {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e8e8e8;
}

.btn-confirm {
  background: #67c23a;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #85ce61;
}

.btn-confirm:disabled {
  background: #b3e19d;
  cursor: not-allowed;
}
</style>
