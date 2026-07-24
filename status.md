# E-Commerce Backend - Project Status Report

---

## Architecture

- **Type:** Node.js / Express 5 REST API (Backend only)
- **Database:** MongoDB (Mongoose 9) + Redis 6
- **Runtime:** ES Modules
- **Pattern:** Modular layered (Route -> Middleware -> Controller -> Service -> Model)
- **Total Files:** 56 source files, ~3,033 lines of code

---

## What's Built & Working

### Auth Module (`/auth`) - 8 endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/auth/register` | POST | Register with email/password + profile image |
| `/auth/login` | POST | Email/password login |
| `/auth/verify-email` | POST | Verify email via 6-digit OTP (Redis, 5min TTL) |
| `/auth/google-login` | POST | Google OAuth login |
| `/auth/refresh-token` | POST | Refresh access token |
| `/auth/forgot-password` | POST | Request password reset OTP |
| `/auth/reset-password` | POST | Reset password with OTP |
| `/auth/resend-otp` | POST | Resend verification OTP |
| `/auth/logout` | POST | Logout (revokes both tokens via Redis) |

### Users Module (`/user`) - 8 endpoints
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/user/profile` | GET | user/seller/admin | Get own profile |
| `/user/profile` | PATCH | user/seller/admin | Update name/email/address |
| `/user/profile-image` | PATCH | user/seller/admin | Update profile image (Cloudinary) |
| `/user/change-password` | PATCH | user/seller/admin | Change password |
| `/user/profile` | DELETE | user/seller/admin | Soft delete (30-day retention) |
| `/user/all` | GET | admin | Get all active users |
| `/user/:id/role` | PATCH | admin | Change user role |
| `/user/:id/status` | PATCH | admin | Change user status |

### Products Module (`/products`) - 9 endpoints
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/products/` | GET | public | Get all active products |
| `/products/search` | GET | public | Text search with pagination |
| `/products/filter` | GET | public | Filter by category/price with pagination |
| `/products/:id` | GET | public | Get single product |
| `/products/` | POST | seller | Create product with images (Cloudinary, max 5) |
| `/products/:id` | PATCH | seller | Edit product with image add/delete (owner only) |
| `/products/:id` | DELETE | seller/admin | Soft delete product |
| `/products/:id/stock` | PATCH | seller | Update stock count |
| `/products/seller/my-products` | GET | seller | Get seller's own products |

### Categories Module (`/categories`) - 5 endpoints
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/categories/` | GET | public | Get all categories |
| `/categories/:id` | GET | public | Get category with its products |
| `/categories/` | POST | seller/admin | Create category |
| `/categories/:id` | PATCH | admin | Edit category |
| `/categories/:id` | DELETE | admin | Delete category (safe: blocks if products exist) |

### Cart Module (`/cart`) - 5 endpoints
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/cart/` | GET | user/seller/admin | Get user's cart |
| `/cart/` | POST | user/seller/admin | Add items to cart |
| `/cart/:id` | PATCH | user/seller/admin | Update item quantity |
| `/cart/:id` | DELETE | user/seller/admin | Remove item from cart |
| `/cart/` | DELETE | user/seller/admin | Clear entire cart |

### Infrastructure
- JWT auth with access (15min) + refresh (1yr) tokens
- Token revocation via Redis
- Rate limiting on auth endpoints (5 req/15min)
- Cloudinary image uploads (users + products) with organized folder structure
- Multer file handling with temp directory
- Product image management utilities (add/delete/rollback)
- Max 5 image upload limit per request
- Cron job for expired soft-deleted account cleanup
- Joi validation on most endpoints
- CORS enabled
- Health check endpoint (`GET /check-health`)

### Database Models
- User, Product, Category, Order, Cart, Review (all defined)

---

## Fixed Bugs (as of latest commit)

| # | Issue | Fix |
|---|---|---|
| 1 | Secrets committed to git (`.env` at wrong path) | `.gitignore` now targets `src/config/.env` |
| 2 | Validation middleware did not short-circuit | Added `return` before error call |
| 3 | `InternalServerError` function name typo in auth service | Fixed to `InternalServerErrorException` |
| 4 | `await client.on("error")` - `on()` returns EventEmitter, not Promise | Removed misleading `await` |
| 5 | Product/category routes imported non-existent `uploadCategory`/`uploadProduct` | Fixed imports to use unified `upload` |
| 6 | Product images stored as local temp URLs, not uploaded to Cloudinary | Refactored to upload directly to Cloudinary with `{public_id, secure_url}` structure |
| 7 | Product image cleanup tried `fs.unlink` on HTTP URLs (always failed) | Removed local file cleanup; Cloudinary handles deletion via `destroy()` |
| 8 | No max file limit on product image uploads | Added limit of 5 images per request |
| 9 | Profile images not organized in Cloudinary | Moved to `users/{id}/profileImages` subfolder |
| 10 | `createProduct` returned `result.products` but service returns `{product, failedImages}` | Fixed controller to return `result` directly |

---

## Remaining Bugs

### Critical

| # | Issue | File |
|---|---|---|
| 1 | Category images stored as local URLs, not uploaded to Cloudinary | `category.service.js` |

### High-Priority

| # | Issue | File |
|---|---|---|
| 1 | No process exit on MongoDB connection failure - app runs without DB | `database/connection.js` |
| 2 | `createRevokeToken` is a no-op - returns string, never stores in Redis | `database/redis/redis.service.js` |
| 3 | Category image cleanup tries `fs.unlink` on HTTP URLs (always fails) | `categories/category.service.js` |
| 4 | `minPrice: 0` is falsy - filter breaks when minimum price is 0 | `products/products.service.js` |

### Medium-Priority

| # | Issue | File |
|---|---|---|
| 1 | Duplicate category name returns 404 instead of 409 | `category.service.js` |
| 2 | Cart stock decrement creates race conditions under concurrent requests | `cart.service.js` |
| 3 | OTP utility imports unused `CompareText` function | `utils/otp.utils.js` |
| 4 | `refresh-token` route has no validation middleware | `auth.route.js` |
| 5 | `resend-otp` route has no validation middleware | `auth.route.js` |
| 6 | Email sender hardcoded as "Amir Mohamed" | `send-email.utils.js` |
| 7 | `user.service.js` mixes `throw new e.NotFoundException()` vs `e.NotFoundException()` (double-throw) | `user.service.js` |

---

## What's NOT Built (Missing Features)

### Must Have (for a real product)

| Feature | Status | Notes |
|---|---|---|
| **Orders Module** | Not implemented | All 4 files are commented-out category code. Model exists but zero endpoints. |
| **Payment Integration** | Not implemented | No Stripe, PayPal, or any payment gateway. |
| **Checkout Flow** | Not implemented | Cart exists but no checkout-to-order conversion. |
| **Reviews Module** | Not implemented | All 3 files are empty (0 bytes). Model exists but zero endpoints. |
| **Coupon / Discount System** | Not implemented | Cart schema has fields but no logic. |
| **Email Verification in Real Flow** | Partial | OTP + email sending works but not integrated into full user-facing flow. |
| **Product Image Cloudinary Upload** | Working | Now uploads directly to Cloudinary with `{public_id, secure_url}` structure. Max 5 images. |
| **Category Image Cloudinary Upload** | Broken | Same issue as product images (not yet fixed). |
| **Pagination on All Listings** | Missing | GET /products, /user/all, /categories all lack pagination. |
| **Process Exit on DB Failure** | Missing | App runs without database connection. |
| **`.env.example`** | Missing | No template for required environment variables. |

### Should Have (for production quality)

| Feature | Status | Notes |
|---|---|---|
| **Tests** | Not implemented | Zero test files. No test framework installed. No test scripts. |
| **API Documentation** | Not implemented | No Swagger, OpenAPI, or Postman collection. |
| **README** | Not implemented | No project documentation at all. |
| **Docker / docker-compose** | Not implemented | No containerization. |
| **ESLint / Prettier** | Not implemented | No linting or formatting configuration. |
| **Logging** | Not implemented | No structured logging (winston, pino, etc.). |
| **Input Sanitization** | Missing | No protection against NoSQL injection or XSS. |
| **Helmet (Security Headers)** | Missing | No security headers middleware. |
| **Compression** | Missing | No gzip/brotli response compression. |

### Nice to Have (for competitive product)

| Feature | Status | Notes |
|---|---|---|
| **Wishlist** | Not implemented | |
| **Product Ratings/Reviews Aggregation** | Not implemented | Average rating on products |
| **Notifications System** | Not implemented | Email/push for order updates |
| **Search Improvements** | Missing | No full-text search index, no Elasticsearch |
| **Image Optimization** | Missing | No resizing/compression on upload |
| **Webhook for Payment Events** | Not implemented | |
| **Inventory Management** | Basic | Only stock count, no low-stock alerts |
| **Admin Dashboard API** | Minimal | Only user management, no analytics/stats |
| **Multi-language Support** | Not implemented | |
| **Rate Limiting Beyond Auth** | Missing | Only auth routes are rate-limited |
| **Request ID / Tracing** | Not implemented | |
| **Graceful Shutdown** | Not implemented | No SIGTERM handling for DB/Redis cleanup |
| **CI/CD Pipeline** | Not implemented | No GitHub Actions or similar |

---

## Summary Checklist

```
[x] Auth (register, login, logout, OTP, Google OAuth, password reset)
[x] User profiles (CRUD, soft delete, role management)
[x] Products (CRUD, search, filter, stock management)
[x] Categories (CRUD, safe delete)
[x] Cart (add, update, remove, clear, auto-expire)
[x] JWT auth with token revocation
[x] Rate limiting
[x] Image upload (Cloudinary for users + products)
[ ] Orders (model exists, zero implementation)
[ ] Reviews (model exists, zero implementation)
[ ] Payment integration
[ ] Checkout flow (cart -> order)
[ ] Coupons / discounts
[ ] Category images via Cloudinary (currently broken - local temp)
[ ] Pagination on all listing endpoints
[x] Fix validation middleware short-circuit bug
[x] Fix auth service InternalServerError function name
[ ] Tests (unit + integration)
[ ] API documentation (Swagger/OpenAPI)
[ ] README
[ ] .env.example
[ ] Docker
[ ] ESLint + Prettier
[ ] Structured logging
[ ] Security hardening (helmet, sanitization)
[ ] Wishlist
[ ] Notifications
[ ] Search optimization
[ ] Admin analytics/stats
```
