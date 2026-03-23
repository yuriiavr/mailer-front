import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null,
  type: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    clearNotification: (state) => {
      state.message = null;
      state.type = null;
    },
  },
});

export const { showNotification, clearNotification } = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
export const selectNotification = (state) => state.notifications;