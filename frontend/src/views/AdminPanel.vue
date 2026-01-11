<template>
  <div class="admin-panel-container">
    <div class="panel-header">
      <h2>管理员面板</h2>
    </div>
    
    <div class="panel-tabs">
      <button 
        :class="{ active: activeTab === 'users' }" 
        @click="switchTab('users')"
      >
        用户管理
      </button>
      <button 
        :class="{ active: activeTab === 'records' }" 
        @click="switchTab('records')"
      >
        借阅记录
      </button>
      <button 
        :class="{ active: activeTab === 'fines' }" 
        @click="switchTab('fines')"
      >
        罚款记录
      </button>
      <button 
        :class="{ active: activeTab === 'logs' }" 
        @click="switchTab('logs')"
      >
        登录日志
      </button>
    </div>
    
    <div class="panel-content">
      <!-- 用户管理 -->
      <div v-if="activeTab === 'users'" class="users-management">
        <div class="section-header">
          <h3>用户管理</h3>
          <div class="search-container">
            <input 
              type="text" 
              v-model="userSearchKeyword" 
              placeholder="搜索用户ID或姓名"
              @keyup.enter="searchUsers"
            />
            <button @click="searchUsers">搜索</button>
          </div>
        </div>
        
        <div class="users-list" v-if="users.length > 0">
          <UserCard 
            v-for="user in users" 
            :key="user.uid" 
            :user="user"
            :isSuperAdmin="isSuperAdmin"
            @statusChanged="manageUser"
            @adminChanged="manageAdmin"
          />
        </div>
        <div v-else class="no-data">
          <p>暂无用户数据</p>
        </div>
      </div>
      
      <!-- 借阅记录 -->
      <div v-if="activeTab === 'records'" class="records-management">
        <div class="section-header">
          <h3>所有借阅记录</h3>
        </div>
        
        <div class="records-list" v-if="borrowingRecords.length > 0">
          <RecordCard 
            v-for="record in borrowingRecords" 
            :key="record.record_id"
            :record="record"
          />
        </div>
        <div v-else class="no-data">
          <p>暂无借阅记录</p>
        </div>
      </div>
      
      <!-- 罚款记录 -->
      <div v-if="activeTab === 'fines'" class="fines-management">
        <div class="section-header">
          <h3>所有罚款记录</h3>
        </div>
        
        <div class="fines-list" v-if="fineRecords.length > 0">
          <FineCard 
            v-for="record in fineRecords" 
            :key="record.fine_id"
            :record="record"
          />
        </div>
        <div v-else class="no-data">
          <p>暂无罚款记录</p>
        </div>
      </div>
      
      <!-- 登录日志 -->
      <div v-if="activeTab === 'logs'" class="logs-management">
        <div class="section-header">
          <h3>用户登录日志</h3>
        </div>
        
        <div class="logs-list" v-if="loginLogs.length > 0">
          <LoginLogCard 
            v-for="log in loginLogs" 
            :key="log.log_id"
            :log="log"
          />
        </div>
        <div v-else class="no-data">
          <p>暂无登录日志</p>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="success" class="success-message">
      {{ success }}
    </div>
  </div>
</template>

<script>
import { adminAPI } from '../utils/api';
import UserCard from '../components/UserCard.vue';
import RecordCard from '../components/RecordCard.vue';
import FineCard from '../components/FineCard.vue';
import LoginLogCard from '../components/LoginLogCard.vue';

export default {
  name: 'AdminPanel',
  components: {
    UserCard,
    RecordCard,
    FineCard,
    LoginLogCard
  },
  data() {
    return {
      activeTab: 'users',
      userSearchKeyword: '',
      users: [],
      borrowingRecords: [],
      fineRecords: [],
      loginLogs: [],
      loading: false,
      error: '',
      success: ''
    };
  },
  computed: {
    // 检查当前用户是否是超级管理员
    isSuperAdmin() {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        return user.identity_type >= 5;
      }
      return false;
    }
  },
  mounted() {
    this.loadTabData();
  },
  methods: {
    async loadTabData() {
      this.error = '';
      this.loading = true;
      
      try {
        switch (this.activeTab) {
          case 'users':
            await this.loadUsers();
            break;
          case 'records':
            await this.loadBorrowingRecords();
            break;
          case 'fines':
            await this.loadFineRecords();
            break;
          case 'logs':
            await this.loadLoginLogs();
            break;
        }
      } catch (err) {
        this.error = '加载数据过程中发生错误';
      } finally {
        this.loading = false;
      }
    },
    
    async loadUsers() {
      const response = await adminAPI.getAllUsers();
      if (response.success) {
        this.users = response.data || [];
      } else {
        throw new Error(response.message || '加载用户数据失败');
      }
    },
    
    async loadBorrowingRecords() {
      const response = await adminAPI.getAllBorrowingRecords();
      if (response.success) {
        this.borrowingRecords = response.data || [];
      } else {
        throw new Error(response.message || '加载借阅记录失败');
      }
    },
    
    async loadFineRecords() {
      const response = await adminAPI.getAllFineRecords();
      if (response.success) {
        this.fineRecords = response.data || [];
      } else {
        throw new Error(response.message || '加载罚款记录失败');
      }
    },
    
    async loadLoginLogs() {
      const response = await adminAPI.getUserLoginLogs();
      if (response.success) {
        this.loginLogs = response.data || [];
      } else {
        throw new Error(response.message || '加载登录日志失败');
      }
    },
    
    async searchUsers() {
      this.error = '';
      this.loading = true;
      
      try {
        // 这里应该调用实际的搜索API
        // 为了简化，我们只在本地过滤用户数据
        await this.loadUsers();
        
        if (this.userSearchKeyword) {
          this.users = this.users.filter(user => 
            user.uid.includes(this.userSearchKeyword) || 
            user.name.includes(this.userSearchKeyword)
          );
        }
      } catch (err) {
        this.error = '搜索用户过程中发生错误';
      } finally {
        this.loading = false;
      }
    },
    
    async manageUser(userId, action) {
      this.error = '';
      this.success = '';
      
      try {
        const response = await adminAPI.manageUser(userId, action);
        
        if (response.success) {
          this.success = action === 'suspend' ? '用户账户已冻结' : '用户账户已激活';
          // 重新加载用户数据
          await this.loadUsers();
          // 3秒后清除消息
          setTimeout(() => {
            this.success = '';
          }, 3000);
        } else {
          this.error = response.message || '操作失败';
        }
      } catch (err) {
        this.error = '操作过程中发生错误';
      }
    },
    
    async manageAdmin(userId, action) {
      this.error = '';
      this.success = '';
      
      try {
        const response = await adminAPI.manageAdmin(userId, action);
        
        if (response.success) {
          this.success = action === 'promote' ? '已提升为管理员' : '已取消管理员权限';
          // 重新加载用户数据
          await this.loadUsers();
          // 3秒后清除消息
          setTimeout(() => {
            this.success = '';
          }, 3000);
        } else {
          this.error = response.error || response.message || '操作失败';
        }
      } catch (err) {
        this.error = err.response?.data?.error || '操作过程中发生错误';
      }
    },
    
    switchTab(tab) {
      this.activeTab = tab;
      this.loadTabData();
    }
  }
};
</script>

<style scoped>
.admin-panel-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.panel-header {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.panel-header h2 {
  margin: 0;
  color: #333;
  text-align: center;
}

.panel-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.panel-tabs button {
  padding: 10px 20px;
  margin: 5px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.panel-tabs button.active {
  background-color: #409eff;
  color: white;
}

.panel-tabs button:hover:not(.active) {
  background-color: #e0e0e0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.search-container {
  display: flex;
  gap: 10px;
}

.search-container input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-container input:focus {
  border-color: #409eff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.search-container button {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-container button:hover {
  background-color: #66b1ff;
}

.users-list, .records-list, .fines-list, .logs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  text-align: center;
}

.success-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f9ff;
  color: #409eff;
  border: 1px solid #d0e9ff;
  border-radius: 4px;
  text-align: center;
}

@media (max-width: 768px) {
  .users-list, .records-list, .fines-list, .logs-list {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
