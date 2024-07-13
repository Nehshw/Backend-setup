import { createReducer } from '@reduxjs/toolkit';
import { updatePrices } from './action';

interface PriceState {
  prices: any[]; // Define your price object structure
}

const initialState: PriceState = {
  prices: [],
};

const priceReducer = createReducer(initialState, {
  [updatePrices.type]: (state, action) => {
    state.prices = action.payload;
  },
});

export default priceReducer;