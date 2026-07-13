/**
 * Google Analytics 4 - Event Tracking Helper cho MockMate
 * 
 * Sử dụng:
 *   import { trackLogin, trackStartInterview } from '../services/analytics';
 *   trackLogin('email');
 *   trackStartInterview('Frontend Developer');
 */

// Helper gửi event lên GA4
const sendEvent = (eventName, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

// ==================== AUTH EVENTS ====================

/** Đăng ký thành công */
export const trackSignUp = (method = 'email') => {
  sendEvent('sign_up', { method });
};

/** Đăng nhập thành công */
export const trackLogin = (method = 'email') => {
  sendEvent('login', { method });
};

// ==================== INTERVIEW EVENTS ====================

/** Bắt đầu phỏng vấn */
export const trackStartInterview = (jobPosition) => {
  sendEvent('start_interview', {
    job_position: jobPosition,
  });
};

/** Trả lời 1 câu hỏi */
export const trackSubmitAnswer = (questionIndex, timeTakenSeconds) => {
  sendEvent('submit_answer', {
    question_index: questionIndex,
    time_taken: timeTakenSeconds,
  });
};

/** Hoàn thành phỏng vấn */
export const trackCompleteInterview = (jobPosition, score, durationSeconds) => {
  sendEvent('complete_interview', {
    job_position: jobPosition,
    score: score,
    duration_seconds: durationSeconds,
  });
};

// ==================== CV EVENTS ====================

/** Upload CV */
export const trackUploadCV = (fileType = 'pdf') => {
  sendEvent('upload_cv', {
    file_type: fileType,
  });
};

// ==================== PAYMENT / VIP EVENTS ====================

/** Xem trang VIP */
export const trackViewVipPage = () => {
  sendEvent('view_vip_page');
};

/** Mua VIP thành công */
export const trackPurchaseVip = (value = 50000) => {
  sendEvent('purchase', {
    currency: 'VND',
    value: value,
    items: [{ item_name: 'VIP Upgrade', price: value }],
  });
};

// ==================== NAVIGATION EVENTS ====================

/** Xem lịch sử phỏng vấn */
export const trackViewHistory = () => {
  sendEvent('view_history');
};

/** Xem dashboard */
export const trackViewDashboard = () => {
  sendEvent('view_dashboard');
};

export default sendEvent;
