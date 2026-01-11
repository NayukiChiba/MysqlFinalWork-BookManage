<template>
  <div class="fine-item">
    <div class="fine-info">
      <h4>{{ record.book_title }}</h4>
      <p class="fine-details">
        <span>借阅人: {{ record.borrower_name }} ({{ record.borrower_id }})</span>
        <span>借阅日期: {{ formatDate(record.borrow_date) }}</span>
        <span>应还日期: {{ formatDate(record.due_date) }}</span>
        <span>逾期天数: {{ record.overdue_days }}天</span>
        <span>罚款金额: ¥{{ record.fine_amount }}</span>
        <span :class="getPaymentStatusClass(record.payment_status)">
          缴费状态: {{ getPaymentStatusText(record.payment_status) }}
        </span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FineCard',
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    
    getPaymentStatusClass(status) {
      switch (status) {
        case 'paid': return 'status-paid';
        case 'unpaid': return 'status-unpaid';
        default: return '';
      }
    },
    
    getPaymentStatusText(status) {
      switch (status) {
        case 'paid': return '已缴纳';
        case 'unpaid': return '未缴纳';
        default: return status;
      }
    }
  }
};
</script>

<style scoped>
.fine-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fine-info {
  flex: 1;
}

.fine-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.fine-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #666;
  font-size: 14px;
}

.fine-details span {
  display: block;
}

.status-paid {
  color: #67c23a;
}

.status-unpaid {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .fine-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
