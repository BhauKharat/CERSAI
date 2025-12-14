import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import kycReducer from './slices/kycSlice';
import uiReducer from './slices/uiSlice';
import dynamicFormReducer from '../component/features/RERegistration/slice/formSlice';
import suspensionDetailsReducer from '../component/features/UserManagement/CreateModifyUser/slice/suspensionDetailsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  kyc: kycReducer,
  ui: uiReducer,
  dynamicForm: dynamicFormReducer,
  suspensionDetails: suspensionDetailsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
