<template>
  <div class="log-item">
    <div class="log-info">
      <h4>用户: {{ log.user_name }} ({{ log.user_id }})</h4>
      <p class="log-details">
        <span>登录时间: {{ formatDateTime(log.login_time) }}</span>
        <span>IP地址: {{ log.ip_address }}</span>
        <span :class="getLoginStatusClass(log.login_status)">
          状态: {{ getLoginStatusText(log.login_status) }}
        </span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginLogCard',
  props: {
    log: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      return date.toLocaleString('zh-CN');
    },
    
    getLoginStatusClass(status) {
      switch (status) {
        case 'success': return 'status-success';
        case 'failed': return 'status-failed';
        case 'registered': return 'status-registered';
        default: return '';
      }
    },
    
    getLoginStatusText(status) {
      switch (status) {
        case 'success': return '登录成功';
        case 'failed': return '登录失败';
        case 'registered': return '注册';
        default: return status;
      }
    }
  }
};
</script>

<style scoped>
.log-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-info {
  flex: 1;
}

.log-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.log-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #666;
  font-size: 14px;
}

.log-details span {
  display: block;
}

.status-success {
  color: #67c23a;
}

.status-failed {
  color: #f56c6c;
}

.status-registered {
  color: #409eff;
}

@media (max-width: 768px) {
  .log-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
