<template>
  <div class="profile-container">
    <UserProfileHeader :userInfo="userInfo" />

    <div class="profile-content">
      <!-- 当前借阅 -->
      <div class="section">
        <h3>当前借阅</h3>
        <div v-if="loading" class="loading-message">加载中...</div>
        <div v-else-if="currentBorrowings.length === 0" class="empty-message">
          暂无当前借阅记录
        </div>
        <div v-else class="records-grid">
          <BorrowingCard 
            v-for="record in currentBorrowings" 
            :key="record.record_id"
            :record="record"
            @returned="handleReturned"
          />
        </div>
      </div>

      <!-- 历史借阅 -->
      <HistoryTable :records="allBorrowings" />

      <!-- 罚款信息 -->
      <FineSection 
        :records="fineRecords" 
        @paid="handleFinePaid"
      />
    </div>
    
    <!-- 消息提示 -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    

  </div>
</template>

<script>
import { userAPI } from '../utils/api';
import BorrowingCard from '../components/BorrowingCard.vue';
import UserProfileHeader from '../components/UserProfileHeader.vue';
import HistoryTable from '../components/HistoryTable.vue';
import FineSection from '../components/FineSection.vue';

export default {
  name: 'Profile',
  components: {
    BorrowingCard,
    UserProfileHeader,
    HistoryTable,
    FineSection
  },
  data() {
    return {
      userInfo: {},
      currentBorrowings: [],
      allBorrowings: [],
      fineRecords: [],
      loading: false,
      successMessage: ''
    };
  },
  mounted() {
    this.loadUserData();
    this.loadBorrowingRecords();
    this.loadFineRecords();
  },
  methods: {
    loadUserData() {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        this.userInfo = JSON.parse(userInfo);
      }
    },

    async loadBorrowingRecords() {
      try {
        this.loading = true;
        
        // 加载当前借阅记录
        const currentResponse = await userAPI.getCurrentBorrowingRecords();
        if (currentResponse.success) {
          this.currentBorrowings = currentResponse.data || [];
        }
        
        // 加载所有借阅记录
        const allResponse = await userAPI.getAllBorrowingRecords();
        if (allResponse.success) {
          this.allBorrowings = allResponse.data || [];
        }
      } catch (err) {
        console.error('加载借阅记录失败:', err);
      } finally {
        this.loading = false;
      }
    },

    async loadFineRecords() {
      try {
        const response = await userAPI.getFineRecords();
        if (response.success) {
          this.fineRecords = response.data || [];
        }
      } catch (err) {
        console.error('加载罚款记录失败:', err);
      }
    },

    handleReturned() {
      this.successMessage = '还书成功！';
      // 重新加载数据
      this.loadBorrowingRecords();
      this.loadFineRecords();
      // 3秒后清除消息
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    },

    handleFinePaid(fineId) {
      this.successMessage = '罚款缴纳成功！';
      // 重新加载罚款记录
      this.loadFineRecords();
      
      // 3秒后清除消息
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    },


  }
};
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

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

.loading-message {
  text-align: center;
  color: #999;
  padding: 40px;
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 40px;
  font-style: italic;
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.success-message {
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 15px 20px;
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 15px;
  }
  
  .records-grid {
    grid-template-columns: 1fr;
  }
}
</style>
