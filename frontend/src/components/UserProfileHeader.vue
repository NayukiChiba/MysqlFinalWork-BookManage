<template>
  <div class="profile-header">
    <h2>个人中心</h2>
    <div class="user-info">
      <div class="info-item">
        <span class="label">用户ID：</span>
        <span class="value">{{ userInfo.uid }}</span>
      </div>
      <div class="info-item">
        <span class="label">姓名：</span>
        <span class="value">{{ userInfo.name }}</span>
      </div>
      <div class="info-item">
        <span class="label">身份类型：</span>
        <span class="value">{{ getIdentityTypeText(userInfo.identity_type) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfileHeader',
  props: {
    userInfo: {
      type: Object,
      required: true
    }
  },
  methods: {
    getIdentityTypeText(type) {
      const types = {
        1: '学生',
        2: '教师',
        3: '管理员',
        4: '管理员',
        5: '超级管理员'
      };
      return types[type] || '未知';
    }
  }
};
</script>

<style scoped>
.profile-header {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
}

.profile-header h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.user-info {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  font-weight: 500;
  color: #666;
  margin-right: 8px;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}

@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>
