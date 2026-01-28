/**
 * Toast notification helper using react-hot-toast
 * Provides consistent, user-friendly notifications across the app
 */

import toast from 'react-hot-toast';

/**
 * Show a success toast notification
 */
export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#10B981',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '15px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  });
};

/**
 * Show an error toast notification
 */
export const showError = (message: string) => {
  toast.error(message, {
    duration: 6000,
    position: 'top-center',
    style: {
      background: '#EF4444',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '15px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  });
};

/**
 * Show an info toast notification
 */
export const showInfo = (message: string) => {
  toast(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#3B82F6',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '15px',
    },
    icon: 'ℹ️',
  });
};

/**
 * Show a loading toast notification
 * Returns a toast ID that can be used to dismiss it later
 */
export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-center',
    style: {
      background: '#6B7280',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '15px',
    },
  });
};

/**
 * Dismiss a specific toast by ID
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all active toasts
 */
export const dismissAll = () => {
  toast.dismiss();
};

export default {
  success: showSuccess,
  error: showError,
  info: showInfo,
  loading: showLoading,
  dismiss: dismissToast,
  dismissAll,
};
