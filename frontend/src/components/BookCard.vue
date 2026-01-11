<template>
  <div class="book-card">
    <div class="book-info" @click="$emit('click', book)">
      <h4 class="book-title">{{ book.title }}</h4>
      <p class="book-author">作者：{{ book.author_names || book.authors || '未知' }}</p>
      <p class="book-publisher">出版社：{{ book.publisher_name || '未知' }}</p>
      <p v-if="book.isbn" class="book-isbn">ISBN：{{ book.isbn }}</p>
      <p v-if="book.publication_year" class="book-year">出版年份：{{ book.publication_year }}</p>
    </div>
    <div class="book-status">
      <span class="book-id">ID: {{ book.book_id }}</span>
      <span :class="['stock', availableStock > 0 ? 'available' : 'unavailable']">
        {{ availableStock > 0 ? `可借: ${availableStock}` : '已借完' }}
      </span>
    </div>
    <button 
      class="borrow-btn" 
      @click="openBorrowDialog"
      :disabled="availableStock <= 0"
    >
      {{ availableStock > 0 ? '借阅' : '已借完' }}
    </button>
    
    <!-- 借书确认对话框 -->
    <div v-if="showConfirmDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="confirm-dialog">
        <div class="dialog-header">
          <h3>确认借书</h3>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="book-detail">
            <p><strong>书名：</strong>{{ book.title }}</p>
            <p><strong>作者：</strong>{{ book.author_names || book.authors || '未知' }}</p>
            <p><strong>出版社：</strong>{{ book.publisher_name || '未知' }}</p>
            <p v-if="book.isbn"><strong>ISBN：</strong>{{ book.isbn }}</p>
            <p><strong>库存：</strong>
              <span :class="availableStock > 0 ? 'text-success' : 'text-danger'">
                {{ availableStock > 0 ? `可借 ${availableStock} 本` : '已借完' }}
              </span>
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
            @click="confirmBorrow" 
            :disabled="loading || availableStock <= 0"
          >
            {{ loading ? '借书中...' : '确认借书' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { bookAPI } from '../utils/api';

export default {
  name: 'BookCard',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showConfirmDialog: false,
      loading: false,
      dialogMessage: '',
      dialogSuccess: false
    };
  },
  computed: {
    // 兼容不同的字段名
    availableStock() {
      return this.book.available_stock ?? this.book.current_stock ?? 0;
    },
    isLoggedIn() {
      return !!localStorage.getItem('token');
    }
  },
  methods: {
    openBorrowDialog() {
      if (!this.isLoggedIn) {
        this.dialogMessage = '请先登录';
        this.dialogSuccess = false;
        this.showConfirmDialog = true;
        return;
      }
      this.dialogMessage = '';
      this.dialogSuccess = false;
      this.showConfirmDialog = true;
    },
    
    closeDialog() {
      this.showConfirmDialog = false;
      this.dialogMessage = '';
      this.dialogSuccess = false;
      // 如果借阅成功，通知父组件刷新数据
      if (this.dialogSuccess) {
        this.$emit('borrowed', this.book);
      }
    },
    
    async confirmBorrow() {
      if (!this.isLoggedIn) {
        this.dialogMessage = '请先登录';
        this.dialogSuccess = false;
        return;
      }
      
      this.loading = true;
      this.dialogMessage = '';
      try {
        const response = await bookAPI.borrowBook(this.book.book_id);
        if (response.success) {
          this.dialogMessage = '借书成功！';
          this.dialogSuccess = true;
          // 通知父组件借阅成功
          this.$emit('borrowed', this.book);
        } else {
          this.dialogMessage = response.error || response.message || '借书失败';
          this.dialogSuccess = false;
        }
      } catch (err) {
        this.dialogMessage = err.response?.data?.error || err.response?.data?.message || '借书失败';
        this.dialogSuccess = false;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.book-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.2s;
  border: 1px solid #eee;
}

.book-card:hover {
  background: #f0f7ff;
  border-color: #409eff;
}

.book-info {
  margin-bottom: 10px;
  cursor: pointer;
}

.book-title {
  color: #333;
  font-size: 14px;
  margin: 0 0 6px 0;
  font-weight: 600;
}

.book-author, .book-publisher, .book-isbn, .book-year {
  color: #666;
  font-size: 12px;
  margin: 2px 0;
}

.book-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #eee;
  margin-bottom: 10px;
}

.book-id {
  color: #999;
  font-size: 11px;
  font-family: monospace;
}

.stock {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.stock.available { 
  background: #f0f9eb; 
  color: #67c23a; 
}

.stock.unavailable { 
  background: #fef0f0; 
  color: #f56c6c; 
}

.borrow-btn {
  width: 100%;
  padding: 8px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.borrow-btn:hover:not(:disabled) {
  background: #66b1ff;
}

.borrow-btn:disabled {
  background: #c0c4cc;
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

.text-success { color: #67c23a; }
.text-danger { color: #f56c6c; }

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
