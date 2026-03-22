# Recommendation System - API Testing Guide

## Testing Tools

You can test the API using:
- **Postman** - GUI REST client
- **cURL** - Command line
- **Thunder Client** - VS Code extension
- **REST Client** - VS Code extension
- **Insomnia** - REST API client

## API Endpoints

### Base URL
```
http://localhost:8000/api/recommendations
```

---

## 1. Get Recommendations (Hybrid Strategy)

### Request
```
POST /api/recommendations/recommendations
Content-Type: application/json

{
  "userId": "USER_ID_HERE",
  "strategy": "hybrid",
  "limit": 8
}
```

### cURL Example
```bash
curl -X POST http://localhost:8000/api/recommendations/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "strategy": "hybrid",
    "limit": 8
  }'
```

### Expected Response
```json
{
  "success": true,
  "strategy": "hybrid",
  "count": 8,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium Cotton T-Shirt",
      "price": 1299,
      "category": "Men",
      "subCategory": "Shirts",
      "image1": "https://example.com/image.jpg",
      "ratings": 4.5,
      "numOfReviews": 25,
      "stock": 50
    },
    // ... more products
  ]
}
```

---

## 2. Get Recommendations by Strategy

### Content-Based
```
POST /api/recommendations/recommendations/content?limit=8
Content-Type: application/json

{
  "userId": "USER_ID_HERE"
}
```

### cURL
```bash
curl -X POST "http://localhost:8000/api/recommendations/recommendations/content?limit=8" \
  -H "Content-Type: application/json" \
  -d '{"userId": "65a1b2c3d4e5f6g7h8i9j0k1"}'
```

---

### Collaborative Filtering
```
POST /api/recommendations/recommendations/collaborative?limit=8
Content-Type: application/json

{
  "userId": "USER_ID_HERE"
}
```

---

### Popularity-Based
```
POST /api/recommendations/recommendations/popularity?limit=8
Content-Type: application/json

{
  "userId": "USER_ID_HERE"
}
```

---

### Category-Based
```
POST /api/recommendations/recommendations/category?limit=8
Content-Type: application/json

{
  "userId": "USER_ID_HERE"
}
```

---

## 3. Track Product View

### Request
```
POST /api/recommendations/track-view
Content-Type: application/json

{
  "userId": "USER_ID_HERE",
  "productId": "PRODUCT_ID_HERE"
}
```

### cURL Example
```bash
curl -X POST http://localhost:8000/api/recommendations/track-view \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "productId": "507f1f77bcf86cd799439011"
  }'
```

### Response
```json
{
  "success": true,
  "message": "Product view tracked successfully"
}
```

---

## 4. Track Product Purchase

### Request
```
POST /api/recommendations/track-purchase
Content-Type: application/json

{
  "userId": "USER_ID_HERE",
  "productIds": [
    "PRODUCT_ID_1",
    "PRODUCT_ID_2",
    "PRODUCT_ID_3"
  ]
}
```

### cURL Example
```bash
curl -X POST http://localhost:8000/api/recommendations/track-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "productIds": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439013"
    ]
  }'
```

### Response
```json
{
  "success": true,
  "message": "Product purchases tracked successfully"
}
```

---

## 5. Get User Preferences

### Request
```
POST /api/recommendations/user-preferences
Content-Type: application/json

{
  "userId": "USER_ID_HERE"
}
```

### cURL Example
```bash
curl -X POST http://localhost:8000/api/recommendations/user-preferences \
  -H "Content-Type: application/json" \
  -d '{"userId": "65a1b2c3d4e5f6g7h8i9j0k1"}'
```

### Response
```json
{
  "success": true,
  "preferences": {
    "favoriteCategories": ["Men", "Sports"],
    "favoriteSubCategories": ["T-Shirts", "Shoes"],
    "priceRange": {
      "min": 500,
      "max": 5000
    }
  },
  "viewedProductsCount": 15,
  "purchasedProductsCount": 3
}
```

---

## Postman Collection

### Setup

1. **Create new Collection**: "Recommendation System"

2. **Create Environment Variables**:
   - `base_url`: `http://localhost:8000`
   - `userId`: `65a1b2c3d4e5f6g7h8i9j0k1`
   - `productId`: `507f1f77bcf86cd799439011`

### Request Examples

#### Get Recommendations (Hybrid)
```
Method: POST
URL: {{base_url}}/api/recommendations/recommendations
Headers:
  Content-Type: application/json

Body (JSON):
{
  "userId": "{{userId}}",
  "strategy": "hybrid",
  "limit": 8
}
```

#### Track View
```
Method: POST
URL: {{base_url}}/api/recommendations/track-view
Headers:
  Content-Type: application/json

Body (JSON):
{
  "userId": "{{userId}}",
  "productId": "{{productId}}"
}
```

#### Get Preferences
```
Method: POST
URL: {{base_url}}/api/recommendations/user-preferences
Headers:
  Content-Type: application/json

Body (JSON):
{
  "userId": "{{userId}}"
}
```

---

## Testing Scenarios

### Scenario 1: New User (No History)

1. **Create user** via registration
2. **Get recommendations**
   ```bash
   # Should return popularity-based (no history yet)
   curl -X POST http://localhost:8000/api/recommendations/recommendations \
     -H "Content-Type: application/json" \
     -d '{"userId": "NEW_USER_ID", "strategy": "hybrid", "limit": 8}'
   ```
   - ✅ Should return TOP products

---

### Scenario 2: User Views Products

1. **View 5 different products**
   ```bash
   # Track view 1
   curl -X POST http://localhost:8000/api/recommendations/track-view \
     -H "Content-Type: application/json" \
     -d '{"userId": "USER_ID", "productId": "PROD_ID_1"}'

   # Track view 2
   curl -X POST http://localhost:8000/api/recommendations/track-view \
     -H "Content-Type: application/json" \
     -d '{"userId": "USER_ID", "productId": "PROD_ID_2"}'
   ```

2. **Get recommendations**
   ```bash
   curl -X POST http://localhost:8000/api/recommendations/recommendations \
     -H "Content-Type: application/json" \
     -d '{"userId": "USER_ID", "strategy": "hybrid", "limit": 8}'
   ```
   - ✅ Should return SIMILAR items

---

### Scenario 3: User Makes Purchase

1. **Track purchase** (simulate from order)
   ```bash
   curl -X POST http://localhost:8000/api/recommendations/track-purchase \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "USER_ID",
       "productIds": ["PROD_ID_1", "PROD_ID_2"]
     }'
   ```

2. **Get collaborative recommendations**
   ```bash
   curl -X POST http://localhost:8000/api/recommendations/recommendations/collaborative \
     -H "Content-Type: application/json" \
     -d '{"userId": "USER_ID"}'
   ```
   - ✅ Should return COLLABORATIVE results

---

### Scenario 4: Multiple Users (Collaborative)

1. **User A** buys: [Product1, Product2, Product3]
2. **User B** buys: [Product1, Product2, Product4]
3. **Get recommendations for User B**
   ```bash
   curl -X POST http://localhost:8000/api/recommendations/recommendations/collaborative \
     -H "Content-Type: application/json" \
     -d '{"userId": "USER_B_ID"}'
   ```
   - ✅ Should recommend Product3 (bought by similar user)

---

## Performance Testing

### Load Testing
```bash
# Test recommendation speed (1 request)
time curl -X POST http://localhost:8000/api/recommendations/recommendations \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "limit": 8}'

# Expected: < 500ms
```

### Multiple Requests
```bash
# Test 10 concurrent requests (bash)
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/recommendations/recommendations \
    -H "Content-Type: application/json" \
    -d '{"userId": "USER_ID", "limit": 8}' &
done
wait
```

---

## Error Testing

### Test Missing User ID
```bash
curl -X POST http://localhost:8000/api/recommendations/recommendations \
  -H "Content-Type: application/json" \
  -d '{"strategy": "hybrid", "limit": 8}'
```

**Expected Response (400)**:
```json
{
  "success": false,
  "message": "User ID is required"
}
```

---

### Test Invalid User ID
```bash
curl -X POST http://localhost:8000/api/recommendations/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "INVALID_ID",
    "strategy": "hybrid",
    "limit": 8
  }'
```

**Expected Response (404)**:
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### Test Invalid Strategy
```bash
curl -X POST http://localhost:8000/api/recommendations/recommendations/invalid \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID"}'
```

**Expected Response (400)**:
```json
{
  "success": false,
  "message": "Invalid strategy. Valid strategies: hybrid, content, collaborative, popularity, category"
}
```

---

## REST Client (VS Code Extension)

Create `test.rest` file:

```http
@base = http://localhost:8000/api/recommendations
@userId = 65a1b2c3d4e5f6g7h8i9j0k1
@productId = 507f1f77bcf86cd799439011

### Get Hybrid Recommendations
POST {{base}}/recommendations
Content-Type: application/json

{
  "userId": "{{userId}}",
  "strategy": "hybrid",
  "limit": 8
}

### Get Content-Based Recommendations
POST {{base}}/recommendations/content
Content-Type: application/json

{
  "userId": "{{userId}}"
}

### Get Collaborative Recommendations
POST {{base}}/recommendations/collaborative
Content-Type: application/json

{
  "userId": "{{userId}}"
}

### Track Product View
POST {{base}}/track-view
Content-Type: application/json

{
  "userId": "{{userId}}",
  "productId": "{{productId}}"
}

### Track Product Purchase
POST {{base}}/track-purchase
Content-Type: application/json

{
  "userId": "{{userId}}",
  "productIds": ["{{productId}}", "507f1f77bcf86cd799439012"]
}

### Get User Preferences
POST {{base}}/user-preferences
Content-Type: application/json

{
  "userId": "{{userId}}"
}
```

---

## Database Verification

### Check User Views
```javascript
// In MongoDB Compass or mongosh
db.users.findOne(
  { _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") },
  { viewedProducts: 1 }
)
```

### Check User Purchases
```javascript
db.users.findOne(
  { _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") },
  { purchasedProducts: 1 }
)
```

### Check User Preferences
```javascript
db.users.findOne(
  { _id: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") },
  { preferences: 1 }
)
```

---

## Debugging

### Enable Logging
Edit `recommendationConfig.js`:
```javascript
debug: {
  enableLogging: true,
  logToConsole: true,
  logLevel: 'debug',
  showRecommendationScores: true
}
```

### Check Server Logs
```bash
# Watch backend logs
npm run dev
# Look for: "Recommendation", "Tracking", "Error"
```

### Check Network Requests
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter by "recommendations"
4. Check request/response details

---

## Checklist for Complete Testing

- [ ] Test getting recommendations (all 5 strategies)
- [ ] Test tracking product views
- [ ] Test tracking purchases
- [ ] Test user preferences endpoint
- [ ] Test with invalid user ID
- [ ] Test with missing parameters
- [ ] Test with multiple products (batch operations)
- [ ] Verify database updates after tracking
- [ ] Check API response times
- [ ] Test error handling
- [ ] Verify recommendations improve over time
- [ ] Test responsive display on frontend

---

This comprehensive guide covers all aspects of testing the recommendation system API! 🧪
