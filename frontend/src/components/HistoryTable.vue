<template>
  <div class="section">
    <h3>历史借阅</h3>
    <div v-if="records.length === 0" class="empty-message">
      暂无历史借阅记录
    </div>
    <div v-else class="records-table">
      <table>
        <thead>
          <tr>
            <th>图书ID</th>
            <th>图书名称</th>
            <th>借阅日期</th>
            <th>归还日期</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.record_id">
            <td>{{ record.book_id }}</td>
            <td>{{ record.book_title || '-' }}</td>
            <td>{{ formatDate(record.borrow_date) }}</td>
            <td>{{ record.return_date ? formatDate(record.return_date) : '-' }}</td>
            <td>
              <span :class="['status-badge', record.return_status]">
                {{ getStatusText(record.return_status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HistoryTable',
  props: {
    records: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  methods: {
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
    }
  }
};
</script>

<style scoped>
.section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.section h3 {
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 40px;
  font-style: italic;
}

.records-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e4e7ed;
}

th {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.borrowed {
  background-color: #e6f7ff;
  color: #409eff;
}

.status-badge.returned {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-badge.overdue {
  background-color: #fff2e8;
  color: #fa8c16;
}

@media (max-width: 768px) {
  .records-table {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px;
  }
}
</style>
