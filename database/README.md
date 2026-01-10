# BookManage 数据库文档

## 数据库名称

`bookmanage`

---

## 表结构

### 用户模块 (`tables/users/`)

#### `user_types` - 用户类型表

| 字段             | 类型         | 说明            |
| ---------------- | ------------ | --------------- |
| type_id          | INT          | 主键            |
| type_name        | VARCHAR(255) | 类型名称 (唯一) |
| max_borrow_count | INT          | 最大借阅数量    |
| max_borrow_days  | INT          | 最大借阅天数    |

**预设数据：**
| type_id | type_name | max_borrow_count | max_borrow_days |
|---------|-----------|------------------|-----------------|
| 1 | 学生 | 5 | 30 |
| 2 | 教师 | 10 | 60 |
| 3 | 校外人员 | 3 | 15 |
| 4 | 管理员 | 20 | 90 |
| 5 | 超级管理员 | 50 | 180 |

#### `borrowers` - 借阅者表

| 字段              | 类型         | 说明                      |
| ----------------- | ------------ | ------------------------- |
| uid               | VARCHAR(50)  | 主键，用户 ID             |
| name              | VARCHAR(100) | 姓名                      |
| phone             | VARCHAR(20)  | 电话                      |
| identity_type     | INT          | 外键 → user_types.type_id |
| student_id        | VARCHAR(50)  | 学号 (学生)               |
| employee_id       | VARCHAR(50)  | 工号 (教师/管理员)        |
| borrowed_count    | INT          | 当前借阅数量              |
| registration_date | DATE         | 注册日期                  |
| borrowing_status  | ENUM         | 状态: active/suspended    |

#### `user_auth` - 用户认证表

| 字段          | 类型         | 说明                       |
| ------------- | ------------ | -------------------------- |
| user_id       | VARCHAR(50)  | 主键，外键 → borrowers.uid |
| password_hash | VARCHAR(255) | 密码哈希 (SHA2-256)        |
| is_admin      | TINYINT(1)   | 是否管理员                 |
| created_at    | TIMESTAMP    | 创建时间                   |
| updated_at    | TIMESTAMP    | 更新时间                   |

#### `login_logs` - 登录日志表

| 字段       | 类型        | 说明                 |
| ---------- | ----------- | -------------------- |
| log_id     | VARCHAR(50) | 主键                 |
| user_id    | VARCHAR(50) | 外键 → borrowers.uid |
| login_time | DATETIME    | 登录时间             |

---

### 图书模块 (`tables/books/`)

#### `publishers` - 出版社表

| 字段           | 类型         | 说明       |
| -------------- | ------------ | ---------- |
| publisher_id   | VARCHAR(50)  | 主键       |
| publisher_name | VARCHAR(100) | 出版社名称 |

#### `authors` - 作者表

| 字段        | 类型         | 说明     |
| ----------- | ------------ | -------- |
| author_id   | VARCHAR(50)  | 主键     |
| author_name | VARCHAR(100) | 作者姓名 |
| birth_date  | DATE         | 出生日期 |
| nationality | VARCHAR(50)  | 国籍     |

#### `tags` - 标签表

| 字段     | 类型         | 说明            |
| -------- | ------------ | --------------- |
| tag_id   | VARCHAR(50)  | 主键            |
| tag_name | VARCHAR(100) | 标签名称 (唯一) |

#### `books` - 图书表

| 字段             | 类型         | 说明                           |
| ---------------- | ------------ | ------------------------------ |
| book_id          | VARCHAR(50)  | 主键                           |
| title            | VARCHAR(200) | 书名                           |
| isbn             | VARCHAR(20)  | ISBN                           |
| publisher_id     | VARCHAR(50)  | 外键 → publishers.publisher_id |
| publication_year | YEAR         | 出版年份                       |
| total_stock      | INT          | 总库存                         |
| current_stock    | INT          | 当前库存                       |
| location         | VARCHAR(100) | 存放位置                       |

#### `book_authors` - 图书-作者关联表

| 字段      | 类型        | 说明                           |
| --------- | ----------- | ------------------------------ |
| book_id   | VARCHAR(50) | 主键之一，外键 → books.book_id |
| author_id | VARCHAR(50) | 主键之一                       |

#### `book_tags` - 图书-标签关联表

| 字段    | 类型        | 说明                           |
| ------- | ----------- | ------------------------------ |
| book_id | VARCHAR(50) | 主键之一，外键 → books.book_id |
| tag_id  | VARCHAR(50) | 主键之一，外键 → tags.tag_id   |

---

### 交易模块 (`tables/transactions/`)

#### `borrowing_records` - 借阅记录表

| 字段               | 类型        | 说明                            |
| ------------------ | ----------- | ------------------------------- |
| record_id          | VARCHAR(50) | 主键                            |
| borrower_id        | VARCHAR(50) | 外键 → borrowers.uid            |
| book_id            | VARCHAR(50) | 外键 → books.book_id            |
| borrow_date        | DATE        | 借阅日期                        |
| due_date           | DATE        | 应还日期                        |
| return_status      | ENUM        | 状态: borrowed/returned/overdue |
| return_date        | DATE        | 还书日期                        |
| actual_return_date | DATE        | 实际还书日期                    |
| overdue_days       | INT         | 逾期天数                        |

#### `fine_records` - 罚款记录表

| 字段                | 类型          | 说明                               |
| ------------------- | ------------- | ---------------------------------- |
| fine_id             | VARCHAR(50)   | 主键                               |
| borrowing_record_id | VARCHAR(50)   | 外键 → borrowing_records.record_id |
| borrower_id         | VARCHAR(50)   | 外键 → borrowers.uid               |
| book_id             | VARCHAR(50)   | 外键 → books.book_id               |
| borrow_date         | DATE          | 借阅日期                           |
| due_date            | DATE          | 应还日期                           |
| overdue_days        | INT           | 逾期天数                           |
| return_status       | ENUM          | 状态: returned/overdue             |
| fine_amount         | DECIMAL(10,2) | 罚款金额                           |
| payment_status      | ENUM          | 支付状态: unpaid/paid              |

---

## 存储过程 (`schema/procedures/`)

### 认证模块 (`auth/`)

- `userRegister` - 用户注册
- `userLogin` - 用户登录

### 图书模块 (`books/`)

- `addBook` - 添加图书
- `deleteBook` - 删除图书
- `updateBook` - 更新图书
- `getBookById` - 根据 ID 获取图书
- `getAllBooks` - 获取所有图书
- `searchBooks` - 搜索图书
- `borrowBook` - 借书
- `returnBook` - 还书

### 用户模块 (`users/`)

- `getUserById` - 根据 ID 获取用户
- `updateUser` - 更新用户
- `getUserBorrowingRecords` - 获取用户借阅记录
- `getUserFineRecords` - 获取用户罚款记录

### 管理员模块 (`admin/`)

- `getAllBorrowingRecords` - 获取所有借阅记录
- `getAllFineRecords` - 获取所有罚款记录
- `getUserLoginLogs` - 获取用户登录日志
- `manageUser` - 管理用户 (冻结/解冻)
- `manageAdmin` - 管理管理员

---

## 函数 (`schema/functions/`)

### 计算函数 (`calculations/`)

- `calculateFine` - 计算罚款金额
- `getOverdueDays` - 计算逾期天数

### 统计函数 (`statistics/`)

- `getBookCount` - 获取图书总数
- `getUserBorrowedCount` - 获取用户借阅数量

---

## 事件 (`schema/events/`)

- `dailyCleanUp` - 每日清理
- `dailyFineCalculation` - 每日罚款计算
- `dailyOverdueCheck` - 每日逾期检查

---

## 外键关系图

```
user_types (1) ──────< borrowers (N)
                           │
                           ├──< user_auth (1)
                           ├──< login_logs (N)
                           ├──< borrowing_records (N) ──< fine_records (N)
                           │           │
publishers (1) ──< books (N) ──────────┘
                     │
                     ├──< book_authors (N)
                     └──< book_tags (N) ──> tags (N)
```

---

## 测试数据

运行 `backend/tests/test_data.sql` 初始化测试数据：

- 用户 S001 (学生，密码: password123)
- 用户 A001 (管理员，密码: admin123)
- 图书 B001 (测试图书)
