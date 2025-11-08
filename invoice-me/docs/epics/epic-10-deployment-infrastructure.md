# Epic 10: Deployment & Infrastructure

**Source:** PRD-InvoiceMe-Detailed.md - Section 10  
**Date:** 2025-11-08

---

## 10. Deployment & Infrastructure

### 10.1 Backend Deployment (AWS)

**Architecture:**
```
Internet → ALB → ECS Fargate (Spring Boot) → RDS PostgreSQL
                        ↓
                   ElastiCache Redis (session cache)
```

**Environment Configuration:**
- **Dev**: t3.small ECS, db.t3.micro RDS
- **Prod**: t3.medium ECS (2+ instances), db.t3.small RDS (Multi-AZ)

**Required Environment Variables:**
```
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
JWT_SECRET
JWT_EXPIRATION
REDIS_HOST
REDIS_PORT
```

### 10.2 Frontend Deployment

**Mobile App:**
- Build with EAS (Expo Application Services)
- Deploy to TestFlight (iOS) and Google Play Internal Testing
- Over-the-air updates enabled for non-native changes

**Web Version (Optional):**
- Deploy to Vercel/Netlify
- Environment-specific configs

---

