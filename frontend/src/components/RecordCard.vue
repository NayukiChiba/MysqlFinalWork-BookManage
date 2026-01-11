<template>
  <div class="record-item">
    <div class="record-info">
      <h4>{{ record.book_title }}</h4>
      <p class="record-details">
        <span>借阅人: {{ record.borrower_name }} ({{ record.borrower_id }})</span>
        <span>借阅日期: {{ formatDate(record.borrow_date) }}</span>
        <span>应还日期: {{ formatDate(record.due_date) }}</span>
        <span v-if="record.actual_return_date">
          归还日期: {{ formatDate(record.actual_return_date) }}
        </span>
        <span :class="getStatusClass(record.return_status)">
          状态: {{ getStatusText(record.return_status) }}
        </span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecordCard',
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
    
    getStatusClass(status) {
      switch (status) {
        case 'borrowed': return 'status-borrowed';
        case 'returned': return 'status-returned';
        case 'overdue': return 'status-overdue';
        default: return '';
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case 'borrowed': return '借阅中';
        case 'returned': return '已归还';
        case 'overdue': return '已逾期';
        default: return status;
      }
    }
  }
};
</script>

<style scoped>
.record-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-info {
  flex: 1;
}

.record-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.record-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #666;
  font-size: 14px;
}

.record-details span {
  display: block;
}

.status-borrowed {
  color: #409eff;
}

.status-returned {
  color: #67c23a;
}

.status-overdue {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .record-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
