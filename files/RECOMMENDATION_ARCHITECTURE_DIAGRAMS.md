# Recommendation System - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
├──────────────────┬──────────────────┬──────────────────┬─────────┤
│  Home Page       │  Product Page    │  Cart Page       │ Other   │
│                  │                  │                  │         │
│ - Shows          │ - Displays       │ - Shows          │         │
│   Recommendations│   Product        │   Recommendations│         │
│ - Tracks Browsing│ - Tracks Views   │ - Tracks Interest│         │
└──────────┬───────┴────────┬─────────┴────────┬────────┴─────────┘
           │                │                   │
           └────────────────┼───────────────────┘
                            │
                   ┌────────▼────────┐
                   │ useRecommendations
                   │ Hook/Middleware │
                   └────────┬────────┘
                            │
                   ┌────────▼─────────────────┐
                   │  Frontend Tracking       │
                   ├──────────────────────────┤
                   │ - useTrackProductView    │
                   │ - useTrackProductPurchase│
                   │ - Async HTTP Calls       │
                   └────────┬─────────────────┘
                            │
                   ┌────────▼─────────────────────────────┐
                   │  BACKEND API ENDPOINTS               │
                   ├─────────────────────────────────────┤
                   │ POST /api/recommendations/          │
                   │   - /recommendations                │
                   │   - /track-view                     │
                   │   - /track-purchase                 │
                   │   - /user-preferences               │
                   │   - /:strategy                      │
                   └────────┬───────────────────────────┘
                            │
        ┌───────────────────┼──────────────────────┐
        │                   │                      │
   ┌────▼────────┐  ┌──────▼──────┐  ┌───────────▼──┐
   │ Recommendation
   │ Controller   │  │ Track View   │  │ Track Purchase│
   │              │  │ Logic        │  │ Logic         │
   └────┬────────┘  └──────┬───────┘  └───────────┬──┘
        │                  │                      │
        └──────────────────┼──────────────────────┘
                           │
                   ┌───────▼────────┐
                   │  DATA UPDATE   │
                   ├────────────────┤
                   │ User Model:    │
                   │ - viewedProducts
                   │ - purchasedProducts
                   │ - preferences  │
                   └───────┬────────┘
                           │
                   ┌───────▼────────┐
                   │   DATABASE     │
                   ├────────────────┤
                   │ MongoDB        │
                   │ Collections:   │
                   │ - users        │
                   │ - products     │
                   │ - orders       │
                   └───────┬────────┘
                           │
        ┌──────────────────┼─────────────────┐
        │                  │                 │
   ┌────▼───────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │ RECOMMENDATION ENGINE                    │
   ├──────────────────────────────────────────┤
   │                                          │
   │  ┌─────────────────────────────────┐    │
   │  │ Content-Based (35%)             │    │
   │  │ - Product Similarity (0-1)      │    │
   │  │ - Category Match                │    │
   │  │ - Price Range Similarity        │    │
   │  │ - Rating Similarity             │    │
   │  └─────────────────────────────────┘    │
   │                                          │
   │  ┌─────────────────────────────────┐    │
   │  │ Collaborative (30%)             │    │
   │  │ - Similar Users Analysis        │    │
   │  │ - Purchase Pattern Matching     │    │
   │  │ - User-Based Similarity         │    │
   │  └─────────────────────────────────┘    │
   │                                          │
   │  ┌─────────────────────────────────┐    │
   │  │ Popularity (20%)                │    │
   │  │ - Bestseller Status             │    │
   │  │ - Ratings Score                 │    │
   │  │ - Review Count                  │    │
   │  └─────────────────────────────────┘    │
   │                                          │
   │  ┌─────────────────────────────────┐    │
   │  │ Category-Based (15%)            │    │
   │  │ - Favorite Categories           │    │
   │  │ - SubCategory Preferences       │    │
   │  │ - Price Range Preferences       │    │
   │  └─────────────────────────────────┘    │
   │                                          │
   │  ┌─────────────────────────────────┐    │
   │  │ Hybrid Scoring                  │    │
   │  │ Final_Score = Weighted Sum      │    │
   │  │ Rank & Return Top N             │    │
   │  └─────────────────────────────────┘    │
   │                                          │
   └─────────────────────┬──────────────────┘
                         │
                  ┌──────▼──────┐
                  │ Recommended │
                  │ Products    │
                  │ (Ranked)    │
                  └──────┬──────┘
                         │
                   ┌─────▼──────┐
                   │  Frontend  │
                   │ Receives & │
                   │  Displays  │
                   └────────────┘
```

## Data Flow - View Tracking

```
User Views Product
       │
       ▼
┌─────────────────────────────┐
│ ProductDetail Component     │
│ useTrackProductView Hook    │
└──────────┬──────────────────┘
           │ (1 second delay)
           ▼
┌─────────────────────────────┐
│ POST /track-view            │
│ { userId, productId }       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ recommendationController    │
│ trackProductView()          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ User Model Update:          │
│ - Add to viewedProducts     │
│ - Increment viewCount       │
│ - Update preferences        │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Save to Database            │
│ viewedProducts: [{          │
│   productId,                │
│   viewedAt: Date.now(),     │
│   viewCount: 1              │
│ }]                          │
└─────────────────────────────┘
```

## Data Flow - Purchase Tracking

```
User Completes Order
       │
       ▼
┌─────────────────────────────┐
│ placeOrder() or             │
│ placeOrderRazorpay()        │
│ in orderController          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ trackPurchase()             │
│ Async Call:                 │
│ POST /track-purchase        │
│ { userId, productIds }      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ recommendationController    │
│ trackProductPurchase()      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ User Model Update:          │
│ - Add to purchasedProducts  │
│ - Update category prefs     │
│ - Track price range         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Save to Database            │
│ purchasedProducts: [{       │
│   productId,                │
│   purchasedAt: Date.now()   │
│ }]                          │
└─────────────────────────────┘
```

## Recommendation Request Flow

```
Frontend Request
POST /api/recommendations/recommendations
Body: { userId, strategy: 'hybrid', limit: 8 }
       │
       ▼
┌──────────────────────────────────────┐
│ recommendationController             │
│ getRecommendations()                 │
│ - Validate userId                    │
│ - Check user exists                  │
└──────────┬─────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ RecommendationEngine                 │
│ .getRecommendations(userId, 'hybrid')│
└──────────┬─────────────────────────┘
           │
      ┌────┴────────────────────────────────────┐
      │                                         │
      ▼                                         ▼
┌──────────────────┐  ┌──────────────────┐     │
│ Parallel Async   │  │ Parallel Async   │     │
│ Processing       │  │ Processing       │     │
│ (4 in parallel)  │  │ (4 in parallel)  │     │
└──────────────────┘  └──────────────────┘     │
      │    │    │    │                         │
      │    │    │    │                         │
      ▼    ▼    ▼    ▼                         │
  ┌─────────────────────────────────────┐     │
  │ Content-Based: 200 products ranked  │     │
  │ Collaborative: 150 products ranked  │     │
  │ Popularity: 100 products ranked     │     │
  │ Category: 80 products ranked        │     │
  └──────────┬────────────────────────┘     │
             │                              │
             ▼                              │
  ┌─────────────────────────────────────┐   │
  │ Hybrid Scoring                      │   │
  │ Calculate combined score for each   │   │
  │ product using configured weights:   │   │
  │ - Content: 0.35                     │   │
  │ - Collab: 0.30                      │   │
  │ - Popularity: 0.20                  │   │
  │ - Category: 0.15                    │   │
  └──────────┬────────────────────────┘   │
             │                            │
             ▼                            │
  ┌─────────────────────────────────────┐ │
  │ Ranking & Selection                 │ │
  │ - Sort by final score               │ │
  │ - Take top 8 (limit)                │ │
  │ - Fetch full product details        │ │
  └──────────┬────────────────────────┘ │
             │                          │
             └──────────┬───────────────┘
                        │
                        ▼
                ┌──────────────────┐
                │ Response:        │
                │ {                │
                │  success: true,  │
                │  strategy: 'hybrid'
                │  count: 8,       │
                │  data: [         │
                │    {...product1},
                │    {...product2},
                │    ...           │
                │  ]               │
                │ }                │
                └──────────────────┘
                        │
                        ▼
                Frontend Display
                Recommendations
                Grid Component
```

## Algorithm Comparison

```
┌────────────────────────────────────────────────────────────┐
│                   ALGORITHM COMPARISON                     │
├────────────────┬─────────────┬──────────┬──────────────────┤
│ Strategy       │ Speed       │ Accuracy │ Best For         │
├────────────────┼─────────────┼──────────┼──────────────────┤
│ Content-Based  │ ⚡⚡⚡ Fast  │ ★★★     │ Similar Items    │
├────────────────┼─────────────┼──────────┼──────────────────┤
│ Collaborative  │ ⚡⚡ Medium  │ ★★★★    │ Cross-Sell       │
├────────────────┼─────────────┼──────────┼──────────────────┤
│ Popularity     │ ⚡⚡⚡ Fast  │ ★★      │ New Users        │
├────────────────┼─────────────┼──────────┼──────────────────┤
│ Category-Based │ ⚡⚡ Medium  │ ★★★     │ Category Browse  │
├────────────────┼─────────────┼──────────┼──────────────────┤
│ Hybrid         │ ⚡⚡ Medium  │ ★★★★★  │ Overall Best     │
└────────────────┴─────────────┴──────────┴──────────────────┘
```

## Similarity Scoring

```
Content-Based Similarity Calculation:

Product A vs Product B
        │
        ├─ Category Match?        → +0.40 if YES
        │
        ├─ SubCategory Match?     → +0.30 if YES
        │
        ├─ Price Range Similar?   → +0.20 if within ±30%
        │ (within ±30%)
        │
        └─ Rating Similar?        → +0.10 if within ±1 rating
          (within ±1 star)

                Total = 0.00 to 1.00
                (Normalized: 0% to 100%)

Example:
   Product: "Men's Blue T-Shirt, $25, 4.5★"
   Candidate: "Men's Green T-Shirt, $27, 4.3★"
   
   ✓ Category (Men) = +0.40
   ✓ SubCategory (T-Shirt) = +0.30
   ✓ Price ($27 within ±30% of $25) = +0.20
   ✓ Rating (4.3 within ±1 of 4.5) = +0.10
   ─────────────────────────
   Total Similarity = 1.00 (100% Similar!)
```

## User Journey

```
New User
   │
   ├─ Register/Login
   │  └─ Minimal Data
   │
   ├─ Browse Products (Day 1)
   │  └─ Views tracked
   │  └─ Popularity-Based Recommendations
   │
   ├─ View More Products (Day 2-3)
   │  └─ Views tracked
   │  └─ Category-Based Recommendations
   │
   ├─ First Purchase
   │  └─ Purchase tracked
   │  └─ Preferences updated
   │
   ├─ Browse Similar Products
   │  └─ Content-Based + Collaborative
   │
   ├─ More Purchases
   │  └─ Collaborative Filtering active
   │  └─ Pattern recognition
   │
   └─ Established User
      └─ Hybrid Algorithm (All 5 strategies)
      └─ Highly Personalized
      └─ Best Accuracy
```

---

This diagram visualizes the complete architecture and data flow of your recommendation system. Each component works together to provide personalized product suggestions to your users! 🎯
