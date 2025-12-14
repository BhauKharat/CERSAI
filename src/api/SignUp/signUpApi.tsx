import axios from 'axios';
import { API_ENDPOINTS } from 'Constant';

export const signUpRequest = async (payload: FormData) => {
  try {
    const response = await axios.post(API_ENDPOINTS.post_sign_up, payload);
    return response.data;
  } catch (error: unknown) {
    // Axios wraps error in response object when status is 400+
    if (axios.isAxiosError(error) && error.response) {
      // Return the full error response so the Redux thunk can use it
      return Promise.reject(error.response.data);
    } else {
      // In case of network error or unexpected issues
      return Promise.reject({
        message: 'Network error or unexpected failure.',
      });
    }
  }
};
