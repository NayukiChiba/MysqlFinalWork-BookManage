<template>
  <div class="borrowing-card">
    <div class="card-header">
      <h4>{{ record.book_title || record.book_id }}</h4>
      <span :class="['status', record.return_status]">{{ getStatusText(record.return_status) }}</span>
    </div>
    <div class="card-details">
      <div class="detail-item">
        <span class="detail-label">借阅日期：</span>
        <span class="detail-value">{{ formatDate(record.borrow_date) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">应还日期：</span>
        <span class="detail-value">{{ formatDate(record.due_date) }}</span>
      </div>
      <div v-if="overdueDays > 0" class="detail-item overdue">
        <span class="detail-label">逾期天数：</span>
        <span class="detail-value">{{ overdueDays }}天</span>
      </div>
      <div v-else-if="overdueDays === 0" class="detail-item warning">
        <span class="detail-value">今天到期</span>
      </div>
      <div v-else class="detail-item remaining">
        <span class="detail-value">剩余{{ Math.abs(overdueDays) }}天</span>
      </div>
    </div>
    <div v-if="record.return_status === 'borrowed'" class="card-actions">
      <button 
        @click="openReturnDialog"
        :disabled="returning"
        class="return-button"
      >
        {{ returning ? '还书中...' : '归还' }}
      </button>
    </div>
    
    <!-- 还书确认对话框 -->
    <div v-if="showConfirmDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="confirm-dialog">
        <div class="dialog-header">
          <h3>确认还书</h3>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="book-detail">
            <p><strong>书名：</strong>{{ record.book_title || record.book_id }}</p>
            <p><strong>借阅日期：</strong>{{ formatDate(record.borrow_date) }}</p>
            <p><strong>应还日期：</strong>{{ formatDate(record.due_date) }}</p>
            <p v-if="overdueDays > 0" class="overdue-warning">
              <strong>逾期天数：</strong>{{ overdueDays }}天
              <br><small>逾期可能会产生罚款</small>
            </p>
          </div>
        </div>
        <!-- 对话框内的消息提示 -->
        <div v-if="dialogMessage" :class="['dialog-message', dialogSuccess ? 'success' : 'error']">
          {{ dialogMessage }}
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeDialog">{{ dialogSuccess ? '关闭' : '取消' }}</button>
          <button 
            v-if="!dialogSuccess"
            class="btn-confirm" 
            @click="confirmReturn" 
            :disabled="returning"
          >
            {{ returning ? '还书中...' : '确认还书' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { bookAPI } from '../utils/api';

export default {
  name: 'BorrowingCard',
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showConfirmDialog: false,
      returning: false,
      dialogMessage: '',
      dialogSuccess: false
    };
  },
  computed: {
    overdueDays() {
      return this.record.overdue_days ?? this.calculateOverdueDays();
    }
  },
  methods: {
    calculateOverdueDays() {
      if (!this.record.due_date) return 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(this.record.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = today - dueDate;
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    
    getStatusText(status) {
      const statusMap = {
        'borrowed': '借阅中',
        'returned': '已归还',
        'overdue': '已逾期'
      };
      return statusMap[status] || status;
    },
    
    openReturnDialog() {
      this.dialogMessage = '';
      this.dialogSuccess = false;
      this.showConfirmDialog = true;
    },
    
    closeDialog() {
      this.showConfirmDialog = false;
      this.dialogMessage = '';
      // 如果还书成功，通知父组件刷新数据
      if (this.dialogSuccess) {
        this.$emit('returned', this.record);
      }
      this.dialogSuccess = false;
    },
    
    async confirmReturn() {
      this.returning = true;
      this.dialogMessage = '';
      
      try {
        const response = await bookAPI.returnBook(this.record.record_id);
        
        if (response.success || response.message) {
          this.dialogMessage = response.message || '还书成功！';
          this.dialogSuccess = true;
          // 通知父组件还书成功
          this.$emit('returned', this.record);
        } else {
          this.dialogMessage = response.error || '还书失败';
          this.dialogSuccess = false;
        }
      } catch (err) {
        this.dialogMessage = err.response?.data?.error || err.response?.data?.message || '还书过程中发生错误';
        this.dialogSuccess = false;
      } finally {
        this.returning = false;
      }
    }
  }
};
</script>

<style scoped>
.borrowing-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: box-shadow 0.3s;
}

.borrowing-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.borrowed {
  background-color: #e6f7ff;
  color: #409eff;
}

.status.returned {
  background-color: #f6ffed;
  color: #52c41a;
}

.status.overdue {
  background-color: #fff2e8;
  color: #fa8c16;
}

.card-details {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-item.overdue {
  color: #f56c6c;
  font-weight: 500;
}

.detail-item.warning {
  color: #e6a23c;
  font-weight: 500;
  justify-content: flex-start;
}

.detail-item.remaining {
  color: #67c23a;
  justify-content: flex-start;
}

.detail-label {
  color: #666;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.card-actions {
  text-align: center;
}

.return-button {
  width: 100%;
  padding: 10px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.return-button:hover:not(:disabled) {
  background-color: #66b1ff;
}

.return-button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

/* 确认对话框样式 */
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

.book-detail p {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
}

.book-detail strong {
  color: #333;
}

.overdue-warning {
  color: #f56c6c;
  background: #fef0f0;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.overdue-warning small {
  font-size: 12px;
  opacity: 0.8;
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
  background: #409eff;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #66b1ff;
}

.btn-confirm:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}
</style>
