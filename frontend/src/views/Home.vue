<template>
  <div class="home-container">
    <div class="welcome-section">
      <h2>欢迎使用图书管理系统</h2>
      <p>一个功能完善的图书借阅和管理系统</p>
    </div>
    
    <!-- 功能卡片区域 -->
    <div class="features-grid">
      <!-- 借书功能卡片 -->
      <div class="feature-card borrow-card">
        <div class="card-header">
          <span class="icon">📚</span>
          <h3>借书功能</h3>
        </div>
        <div class="card-content">
          <div class="borrow-form">
            <input 
              type="text" 
              v-model="borrowForm.bookId" 
              placeholder="输入图书ID"
              @keyup.enter="lookupBook"
            />
            <button @click="lookupBook" :disabled="loading">查询</button>
          </div>
          <div v-if="borrowMessage" :class="['message', borrowSuccess ? 'success' : 'error']">
            {{ borrowMessage }}
          </div>
        </div>
      </div>
      
      <!-- 图书搜索卡片 -->
      <router-link to="/search" class="feature-card">
        <div class="card-header">
          <span class="icon">🔍</span>
          <h3>图书搜索</h3>
        </div>
        <div class="card-content">
          <p>快速搜索馆藏图书</p>
        </div>
      </router-link>
      
      <!-- 借阅记录卡片 -->
      <router-link to="/borrowing-records" class="feature-card">
        <div class="card-header">
          <span class="icon">📋</span>
          <h3>借阅记录</h3>
        </div>
        <div class="card-content">
          <p>查看借阅历史</p>
        </div>
      </router-link>
      
      <!-- 罚款查询卡片 -->
      <router-link to="/fine-records" class="feature-card">
        <div class="card-header">
          <span class="icon">💰</span>
          <h3>罚款查询</h3>
        </div>
        <div class="card-content">
          <p>查看罚款记录</p>
        </div>
      </router-link>
      
      <!-- 管理面板卡片 -->
      <router-link v-if="isAdmin" to="/admin" class="feature-card admin-card">
        <div class="card-header">
          <span class="icon">⚙️</span>
          <h3>管理面板</h3>
        </div>
        <div class="card-content">
          <p>系统管理</p>
        </div>
      </router-link>
    </div>
    
    <!-- 借书确认对话框 -->
    <div v-if="showConfirmDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="confirm-dialog">
        <div class="dialog-header">
          <h3>确认借书</h3>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body" v-if="selectedBook">
          <div class="book-detail">
            <p><strong>书名：</strong>{{ selectedBook.title }}</p>
            <p><strong>作者：</strong>{{ selectedBook.author_names || '未知' }}</p>
            <p><strong>出版社：</strong>{{ selectedBook.publisher_name || '未知' }}</p>
            <p><strong>ISBN：</strong>{{ selectedBook.isbn }}</p>
            <p><strong>库存：</strong>
              <span :class="selectedBook.available_stock > 0 ? 'text-success' : 'text-danger'">
                {{ selectedBook.available_stock > 0 ? `可借 ${selectedBook.available_stock} 本` : '已借完' }}
              </span>
            </p>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeDialog">取消</button>
          <button 
            class="btn-confirm" 
            @click="confirmBorrow" 
            :disabled="loading || !selectedBook || selectedBook.available_stock <= 0"
          >
            {{ loading ? '借书中...' : '确认借书' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 书籍列表区域 -->
    <div class="books-section">
      <div class="section-header">
        <h3>馆藏图书</h3>
        <span class="book-count">共 {{ books.length }} 本</span>
      </div>
      
      <div v-if="booksLoading" class="loading-message">加载中...</div>
      <div v-else-if="books.length === 0" class="empty-message">暂无图书</div>
      
      <div v-else class="books-grid">
        <div v-for="book in books" :key="book.book_id" class="book-card">
          <div class="book-info">
            <h4 class="book-title">{{ book.title }}</h4>
            <p class="book-author">作者：{{ book.author_names || '未知' }}</p>
            <p class="book-publisher">出版社：{{ book.publisher_name || '未知' }}</p>
          </div>
          <div class="book-status">
            <span class="book-id">ID: {{ book.book_id }}</span>
            <span :class="['stock', book.available_stock > 0 ? 'available' : 'unavailable']">
              {{ book.available_stock > 0 ? `可借: ${book.available_stock}` : '已借完' }}
            </span>
          </div>
          <button 
            class="borrow-btn" 
            @click="borrowFromCard(book)"
            :disabled="book.available_stock <= 0"
          >
            {{ book.available_stock > 0 ? '借阅' : '已借完' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { bookAPI } from '../utils/api';

export default {
  name: 'Home',
  data() {
    return {
      borrowForm: { bookId: '' },
      loading: false,
      borrowMessage: '',
      borrowSuccess: false,
      isLoggedIn: false,
      isAdmin: false,
      userInfo: null,
      books: [],
      booksLoading: false,
      showConfirmDialog: false,
      selectedBook: null
    };
  },
  mounted() {
    this.checkUserStatus();
    this.loadBooks();
  },
  methods: {
    checkUserStatus() {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');
      if (token && userInfo) {
        this.isLoggedIn = true;
        this.userInfo = JSON.parse(userInfo);
        this.isAdmin = [4, 5].includes(this.userInfo.identity_type);
      }
    },
    
    async loadBooks() {
      this.booksLoading = true;
      try {
        const response = await bookAPI.getAllBooks();
        if (response.success) {
          this.books = response.data || [];
        }
      } catch (err) {
        console.error('加载图书失败:', err);
      } finally {
        this.booksLoading = false;
      }
    },
    
    lookupBook() {
      if (!this.borrowForm.bookId.trim()) {
        this.borrowMessage = '请输入图书ID';
        this.borrowSuccess = false;
        return;
      }
      
      const book = this.books.find(b => b.book_id.toString() === this.borrowForm.bookId.trim());
      if (book) {
        this.selectedBook = book;
        this.showConfirmDialog = true;
        this.borrowMessage = '';
      } else {
        this.borrowMessage = '未找到该图书';
        this.borrowSuccess = false;
      }
    },
    
    borrowFromCard(book) {
      if (!this.isLoggedIn) {
        this.borrowMessage = '请先登录';
        this.borrowSuccess = false;
        return;
      }
      this.selectedBook = book;
      this.showConfirmDialog = true;
    },
    
    closeDialog() {
      this.showConfirmDialog = false;
      this.selectedBook = null;
    },
    
    async confirmBorrow() {
      if (!this.isLoggedIn) {
        this.borrowMessage = '请先登录';
        this.borrowSuccess = false;
        this.closeDialog();
        return;
      }
      
      this.loading = true;
      try {
        const response = await bookAPI.borrowBook(this.selectedBook.book_id);
        if (response.success) {
          this.borrowMessage = '借书成功！';
          this.borrowSuccess = true;
          this.borrowForm.bookId = '';
          this.loadBooks();
        } else {
          this.borrowMessage = response.message || '借书失败';
          this.borrowSuccess = false;
        }
      } catch (err) {
        this.borrowMessage = err.response?.data?.message || '借书失败';
        this.borrowSuccess = false;
      } finally {
        this.loading = false;
        this.closeDialog();
      }
    }
  }
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-section h2 {
  color: #333;
  font-size: 28px;
  margin-bottom: 8px;
}

.welcome-section p {
  color: #666;
  font-size: 16px;
}

/* 功能卡片网格 - 4列并列 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 120px;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.card-header .icon {
  font-size: 36px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.card-content {
  flex: 1;
}

.card-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 借书卡片 */
.borrow-card {
  cursor: default;
}

.borrow-card:hover {
  transform: none;
}

.borrow-form {
  display: flex;
  gap: 8px;
}

.borrow-form input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  min-width: 0;
}

.borrow-form input:focus {
  border-color: #409eff;
  outline: none;
}

.borrow-form button {
  padding: 8px 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.borrow-form button:hover:not(:disabled) {
  background: #66b1ff;
}

.message {
  margin-top: 8px;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 11px;
  text-align: center;
}

.message.success { background: #f0f9eb; color: #67c23a; }
.message.error { background: #fef0f0; color: #f56c6c; }

/* 管理员卡片 */
.admin-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.admin-card .card-header h3,
.admin-card .card-content p {
  color: white;
}

/* 确认对话框 */
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

/* 书籍列表 */
.books-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.book-count {
  color: #999;
  font-size: 14px;
}

.loading-message, .empty-message {
  text-align: center;
  color: #999;
  padding: 40px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

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
}

.book-title {
  color: #333;
  font-size: 14px;
  margin: 0 0 6px 0;
  font-weight: 600;
}

.book-author, .book-publisher {
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

.stock.available { background: #f0f9eb; color: #67c23a; }
.stock.unavailable { background: #fef0f0; color: #f56c6c; }

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

@media (max-width: 600px) {
  .features-grid {
    flex-direction: column;
    align-items: center;
  }
  
  .feature-card {
    width: 100%;
    max-width: 300px;
  }
  
  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
