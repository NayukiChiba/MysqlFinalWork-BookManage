<template>
  <div class="section">
    <h3>罚款信息</h3>
    <div v-if="records.length === 0" class="empty-message">
      暂无罚款记录
    </div>
    <div v-else>
      <div class="fine-summary">
        <div class="summary-item">
          <span class="summary-label">未缴纳罚款总额：</span>
          <span class="summary-value amount">¥{{ getUnpaidFineAmount() }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">罚款记录总数：</span>
          <span class="summary-value">{{ records.length }}条</span>
        </div>
      </div>
      <div class="fines-table">
        <table>
          <thead>
            <tr>
              <th>罚款ID</th>
              <th>关联借阅</th>
              <th>罚款金额</th>
              <th>罚款原因</th>
              <th>缴纳状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fine in records" :key="fine.fine_id">
              <td>{{ fine.fine_id }}</td>
              <td>{{ fine.record_id }}</td>
              <td class="amount">¥{{ fine.fine_amount }}</td>
              <td>{{ fine.fine_reason }}</td>
              <td>
                <span :class="['status-badge', fine.payment_status]">
                  {{ getPaymentStatusText(fine.payment_status) }}
                </span>
              </td>
              <td>
                <button 
                  v-if="fine.payment_status === 'unpaid'" 
                  @click="handlePay(fine.fine_id)"
                  class="pay-button"
                >
                  缴纳
                </button>
                <span v-else class="paid-text">已缴纳</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 支付对话框 -->
    <PaymentDialog 
      :visible.sync="showPayDialog"
      :amount="selectedFine ? selectedFine.fine_amount : '0'"
      :fineId="selectedFine ? selectedFine.fine_id : null"
      @paid="handlePaid"
      @close="closePayDialog"
    />
  </div>
</template>

<script>
import PaymentDialog from './PaymentDialog.vue';

export default {
  name: 'FineSection',
  components: {
    PaymentDialog
  },
  props: {
    records: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      showPayDialog: false,
      selectedFine: null
    };
  },
  methods: {
    handlePay(fineId) {
      this.selectedFine = this.records.find(f => f.fine_id === fineId);
      this.showPayDialog = true;
    },
    
    closePayDialog() {
      this.showPayDialog = false;
      this.selectedFine = null;
    },
    
    handlePaid(fineId) {
      // 可以在这里更新本地状态，或emit事件让父组件重新加载
      // 这里简单选择emit事件
      this.$emit('paid', fineId);
      this.closePayDialog();
    },

    getPaymentStatusText(status) {
      const statusMap = {
        'paid': '已缴纳',
        'unpaid': '未缴纳'
      };
      return statusMap[status] || status;
    },

    getUnpaidFineAmount() {
      return this.records
        .filter(fine => fine.payment_status === 'unpaid')
        .reduce((total, fine) => total + parseFloat(fine.fine_amount), 0)
        .toFixed(2);
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

.fine-summary {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
}

.summary-label {
  color: #666;
  margin-right: 8px;
}

.summary-value {
  font-weight: 500;
  color: #333;
}

.summary-value.amount {
  color: #f56c6c;
  font-size: 18px;
}

.fines-table {
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

.status-badge.paid {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-badge.unpaid {
  background-color: #fff2e8;
  color: #fa8c16;
}

.pay-button {
  padding: 6px 12px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pay-button:hover {
  background-color: #85ce61;
}

.paid-text {
  color: #999;
  font-style: italic;
}

.amount {
  color: #f56c6c;
  font-weight: 500;
}

@media (max-width: 768px) {
  .fine-summary {
    flex-direction: column;
    gap: 15px;
  }
  
  .fines-table {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px;
  }
}
</style>
