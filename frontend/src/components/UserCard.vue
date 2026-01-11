<template>
  <div class="user-item">
    <div class="user-info">
      <h4>{{ user.name }} ({{ user.uid }})</h4>
      <p class="user-details">
        <span>身份: {{ getIdentityTypeText(user.identity_type) }}</span>
        <span>手机号: {{ user.phone }}</span>
        <span>借阅数量: {{ user.borrowed_count }}</span>
        <span :class="getStatusClass(user.borrowing_status)">
          状态: {{ getStatusText(user.borrowing_status) }}
        </span>
      </p>
    </div>
    <div class="user-actions">
      <button 
        @click="$emit('statusChanged', user.uid, user.borrowing_status === 'active' ? 'suspend' : 'activate')"
        :class="user.borrowing_status === 'active' ? 'suspend-button' : 'activate-button'"
      >
        {{ user.borrowing_status === 'active' ? '冻结账户' : '激活账户' }}
      </button>
      <button 
        v-if="isSuperAdmin && user.identity_type < 3"
        @click="$emit('adminChanged', user.uid, 'promote')"
        class="admin-button promote-button"
      >
        提升为管理员
      </button>
      <button 
        v-if="isSuperAdmin && user.identity_type >= 3 && user.identity_type < 5"
        @click="$emit('adminChanged', user.uid, 'demote')"
        class="admin-button demote-button"
      >
        取消管理员
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserCard',
  props: {
    user: {
      type: Object,
      required: true
    },
    isSuperAdmin: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getIdentityTypeText(type) {
      switch (type) {
        case 1: return '学生';
        case 2: return '教师';
        case 3: return '管理员';
        case 4: return '管理员';
        case 5: return '超级管理员';
        default: return '未知';
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'active': return 'status-active';
        case 'suspended': return 'status-suspended';
        default: return '';
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case 'active': return '正常';
        case 'suspended': return '已冻结';
        default: return status;
      }
    }
  }
};
</script>

<style scoped>
.user-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  flex: 1;
}

.user-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #666;
  font-size: 14px;
}

.user-details span {
  display: block;
}

.user-actions {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suspend-button, .activate-button, .admin-button {
  padding: 8px 16px;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.suspend-button {
  background-color: #f56c6c;
}

.suspend-button:hover {
  background-color: #f78989;
}

.activate-button {
  background-color: #67c23a;
}

.activate-button:hover {
  background-color: #85ce61;
}

.promote-button {
  background-color: #e6a23c;
}

.promote-button:hover {
  background-color: #ebb563;
}

.demote-button {
  background-color: #909399;
}

.demote-button:hover {
  background-color: #a6a9ad;
}

.status-active {
  color: #67c23a;
}

.status-suspended {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .user-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user-actions {
    margin-left: 0;
    margin-top: 15px;
    align-self: flex-end;
  }
}
</style>
