<template>
  <div class="book-search-container">
    <div class="search-form">
      <h2>图书搜索</h2>
      <div class="search-options">
        <div class="search-option" :class="{ active: searchType === 'name' }" @click="searchType = 'name'">
          书名
        </div>
        <div class="search-option" :class="{ active: searchType === 'author' }" @click="searchType = 'author'">
          作者
        </div>
        <div class="search-option" :class="{ active: searchType === 'tag' }" @click="searchType = 'tag'">
          标签
        </div>
        <div class="search-option" :class="{ active: searchType === 'publisher' }" @click="searchType = 'publisher'">
          出版社
        </div>
        <div class="search-option" :class="{ active: searchType === 'isbn' }" @click="searchType = 'isbn'">
          ISBN
        </div>
      </div>
      <div class="search-input-container">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="请输入搜索关键词"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" :disabled="searching">
          {{ searching ? '搜索中...' : '搜索' }}
        </button>
      </div>
    </div>
    
    <div class="search-results" v-if="searchResults.length > 0">
      <h3>搜索结果 <span class="result-count">共 {{ searchResults.length }} 本</span></h3>
      <div class="results-grid">
        <BookCard 
          v-for="book in searchResults" 
          :key="book.book_id"
          :book="book"
          @borrowed="handleBorrowed"
        />
      </div>
    </div>
    
    <div class="no-results" v-else-if="searched && searchResults.length === 0">
      <p>未找到相关图书</p>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { bookAPI } from '../utils/api';
import BookCard from '../components/BookCard.vue';

export default {
  name: 'BookSearch',
  components: {
    BookCard
  },
  data() {
    return {
      searchType: 'name',
      searchKeyword: '',
      searching: false,
      searched: false,
      searchResults: [],
      error: ''
    };
  },
  methods: {
    async handleSearch() {
      // 重置状态
      this.error = '';
      this.searched = false;
      
      if (!this.searchKeyword.trim()) {
        this.error = '请输入搜索关键词';
        return;
      }
      
      this.searching = true;
      
      try {
        let response;
        
        // 根据搜索类型调用不同的API
        switch (this.searchType) {
          case 'name':
            response = await bookAPI.searchByName(this.searchKeyword);
            break;
          case 'author':
            response = await bookAPI.searchByAuthor(this.searchKeyword);
            break;
          case 'tag':
            response = await bookAPI.searchByTag(this.searchKeyword);
            break;
          case 'publisher':
            response = await bookAPI.searchByPublisher(this.searchKeyword);
            break;
          case 'isbn':
            response = await bookAPI.searchByISBN(this.searchKeyword);
            break;
          default:
            throw new Error('无效的搜索类型');
        }
        
        if (response.success) {
          this.searchResults = response.data || [];
          this.searched = true;
        } else {
          this.error = response.message || '搜索失败';
        }
      } catch (err) {
        this.error = err.response?.data?.message || '搜索过程中发生错误';
      } finally {
        this.searching = false;
      }
    },
    
    handleBorrowed(book) {
      // 借阅成功后，更新库存信息
      const targetBook = this.searchResults.find(b => b.book_id === book.book_id);
      if (targetBook) {
        if (typeof targetBook.available_stock === 'number') {
          targetBook.available_stock -= 1;
        } else if (typeof targetBook.current_stock === 'number') {
          targetBook.current_stock -= 1;
        }
      }
    }
  }
};
</script>

<style scoped>
.book-search-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-form h2 {
  margin-top: 0;
  color: #333;
  text-align: center;
}

.search-options {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-option {
  padding: 10px 20px;
  margin: 5px;
  background-color: #f5f5f5;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.search-option.active {
  background-color: #409eff;
  color: white;
}

.search-option:hover:not(.active) {
  background-color: #e0e0e0;
}

.search-input-container {
  display: flex;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.search-input-container input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.search-input-container input:focus {
  border-color: #409eff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.search-input-container button {
  padding: 12px 24px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-input-container button:hover:not(:disabled) {
  background-color: #66b1ff;
}

.search-input-container button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.search-results h3 {
  margin-top: 30px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-count {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.no-results {
  text-align: center;
  margin-top: 30px;
  color: #666;
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

@media (max-width: 768px) {
  .search-options {
    flex-direction: column;
    align-items: center;
  }
  
  .search-input-container {
    flex-direction: column;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>
