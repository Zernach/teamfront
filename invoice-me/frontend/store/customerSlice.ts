import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomerSummary, CustomerDetail } from '../services/api/customerApi';

export interface CustomerState {
  customers: CustomerSummary[];
  customerDetails: Record<string, CustomerDetail>; // Cache customer details by ID
  lastUpdated: number | null;
}

const initialState: CustomerState = {
  customers: [],
  customerDetails: {},
  lastUpdated: null,
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<CustomerSummary[]>) => {
      state.customers = action.payload;
      state.lastUpdated = Date.now();
    },
    addCustomer: (state, action: PayloadAction<CustomerSummary>) => {
      // Check if customer already exists (by ID)
      const existingIndex = state.customers.findIndex(
        (c) => c.id === action.payload.id
      );
      if (existingIndex === -1) {
        // Add new customer at the beginning of the list
        state.customers.unshift(action.payload);
      } else {
        // Update existing customer
        state.customers[existingIndex] = action.payload;
      }
      state.lastUpdated = Date.now();
    },
    updateCustomer: (state, action: PayloadAction<CustomerSummary>) => {
      const index = state.customers.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
      // Also update in customerDetails cache if it exists
      if (state.customerDetails[action.payload.id]) {
        const detail = state.customerDetails[action.payload.id];
        state.customerDetails[action.payload.id] = {
          ...detail,
          fullName: action.payload.fullName,
          email: action.payload.email,
          status: action.payload.status,
          outstandingBalance: action.payload.outstandingBalance,
          activeInvoicesCount: action.payload.activeInvoicesCount,
        };
      }
      state.lastUpdated = Date.now();
    },
    removeCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter((c) => c.id !== action.payload);
      delete state.customerDetails[action.payload];
      state.lastUpdated = Date.now();
    },
    setCustomerDetail: (state, action: PayloadAction<CustomerDetail>) => {
      state.customerDetails[action.payload.id] = action.payload;
    },
    clearCustomers: (state) => {
      state.customers = [];
      state.customerDetails = {};
      state.lastUpdated = null;
    },
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  removeCustomer,
  setCustomerDetail,
  clearCustomers,
} = customerSlice.actions;

export default customerSlice.reducer;

