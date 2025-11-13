# Frontend Environment Configuration

## Setup

1. Install dependencies:
```bash
cd frontend
yarn install
```

2. Configure API URL:
Create a `.env` file (or set environment variable):
```
EXPO_PUBLIC_API_URL=http://localhost:5000
```

For production, use your backend URL:
```
EXPO_PUBLIC_API_URL=https://api.invoiceme.com
```

3. Start the development server:
```bash
yarn start
```

Then press:
- `w` for web
- `i` for iOS simulator
- `a` for Android emulator

## Features Implemented

### Customer Management
- ✅ Customer List Screen with search and filters
- ✅ Customer Detail Screen
- ✅ Create Customer Screen
- ✅ Edit Customer Screen
- ✅ Delete Customer functionality

### Invoice Management
- ✅ Create Invoice Screen with line items
- ✅ Customer selection for invoices

### API Integration
- ✅ API Client with error handling
- ✅ Customer API service
- ✅ Invoice API service

## Project Structure

```
frontend/
├── app/                    # Expo Router screens
│   ├── index.tsx          # Home screen
│   ├── customers/         # Customer screens
│   │   ├── index.tsx      # Customer list
│   │   ├── new.tsx        # Create customer
│   │   ├── [id].tsx       # Customer detail
│   │   └── [id]/edit.tsx  # Edit customer
│   └── invoices/          # Invoice screens
│       └── new.tsx        # Create invoice
├── services/              # API services
│   └── api/
│       ├── client.ts      # API client
│       ├── customerApi.ts # Customer API
│       └── invoiceApi.ts  # Invoice API
├── constants/            # App constants
│   ├── colors.ts         # Color palette
│   └── spacing.ts        # Spacing values
└── components/           # Reusable components
```

## Next Steps

To complete the frontend, implement:
1. Invoice Detail Screen
2. Invoice Edit Screen
3. Invoice List Screen
4. Mark Invoice as Sent functionality
5. Payment recording screens
6. Error handling improvements
7. Loading states
8. Form validation
9. Toast notifications
10. Authentication screens (when backend auth is ready)







