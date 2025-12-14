import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from '../component/common/Spinner';
import RegistrationPage from '../component/register/EntityForm/registrationPage';
// const RegistrationPage = lazy(
//   () => import('../component/register/EntityForm/registrationPage')
// );
import AddressDetails from '../component/register/AddressDetails/addressDetails';
// const AddressDetails = lazy(
//   () => import('../component/register/AddressDetails/addressDetails')
// );
import InstitutionDetails from '../component/register/InstitutionDetails/institutionDetails';
import InstitutionAdminDetails from '../component/register/institutionAdminDetails/institutuionAdminDetails';
import NodalOfficerDetails from '../component/register/NodalOfficerDetails/nodalOfficerDetails';
import FormPreview from '../component/register/FormPreview/formPreview';
// import TrackStatus from '../component/register/TrackStatus/trackStatus';
// const InstitutionDetails = lazy(
//   () => import('../component/register/InstitutionDetails/institutionDetails')
// );
// const InstitutionAdminDetails = lazy(
//   () =>
//     import(
//       '../component/register/institutionAdminDetails/institutuionAdminDetails'
//     )
// );
// const NodalOfficerDetails = lazy(
//   () => import('../component/register/NodalOfficerDetails/nodalOfficerDetails')
// );
// const FormPreview = lazy(
//   () => import('../component/register/FormPreview/formPreview')
// );
const TrackStatus = lazy(
  () => import('../component/register/TrackStatus/trackStatus')
);
// import LoginPage from '../pages/LoginPage';
const LoginPage = lazy(
  () => import('../component/features/Authenticate/login/LoginPage')
);
import SignUp from '../component/features/Authenticate/signup/SignUp';
// import PasswordsSetupOtp from '../component/authentication/passwordSetup/PasswordSetupOtp';
// const PasswordsSetupOtp = lazy(
//   () => import('../component/authentication/passwordSetup/PasswordSetupOtp')
// );
// import SetNewPassword from '../component/authentication/passwordSetup/SetNewPassword';
const SetNewPassword = lazy(
  () =>
    import('../component/features/Authenticate/setupPassword/SetNewPassword')
);
// import SetForgotNewPassword from '../component/authentication/passwordSetup/setForgotNewPassword';
const SetForgotNewPassword = lazy(
  () =>
    import(
      '../component/features/Authenticate/forgetNewPassword/setForgotNewPassword'
    )
);
// import ForgotPassword from '../component/authentication/forgetPassword/ForgotPassword';
const ForgotPassword = lazy(
  () =>
    import('../component/features/Authenticate/forgetPassword/ForgotPassword')
);
import ForgotUserID from '../component/features/Authenticate/forgotUserId/ForgotUserID';
import TrackStatusForm from '../component/features/RERegistration/TrackStatusForm';
import RERegistrationContainer from '../component/features/RERegistration/RERegistrationContainer';
import REUpdationConatiner from '../component/features/RERegistration/REUpdationConatiner';
import UpdateTrackStatusStep from '../component/features/RERegistration/updateSteps/UpdateTrackStatusStep';
import TrackStatusEditContainer from '../component/features/RERegistration/EditTrackStatus/TrackStatusEditContainer';
// import { ReinitializeGuard } from '../component/ReinitializeGuard/ReinitializeGuard';
const ReinitializeGuard = lazy(() =>
  import('../component/ReinitializeGuard/ReinitializeGuard').then((module) => ({
    default: module.ReinitializeGuard,
  }))
);
const REPortalRoutes = lazy(() => import('./REPortalRoutes'));
const CKYCRRoutes = lazy(() => import('./CKYCRRoutes'));
// const RELoginPage = lazy(() => import('../pages/RELoginPage'));

const AppRoutes: React.FC = () => {
  return (
    <Router basename="/ckyc">
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route index element={<Navigate to="/login" replace />} />
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/re-signup" element={<SignUp />} />
          {/* <Route path="/re-login" element={<RELoginPage />} /> */}
          {/* <Route path="/signup" element={<SignUp />} /> */}

          {/* <Route
            path="/re-password-setup-otp"
            element={<PasswordsSetupOtp />}
          /> */}
          <Route path="/re-set-new-password" element={<SetNewPassword />} />
          <Route
            path="/re-set-forget-new-password/:userId"
            element={<SetForgotNewPassword />}
          />
          <Route path="/re-forgot-password" element={<ForgotPassword />} />
          <Route
            path="/re/re-forgot-password"
            element={<ForgotPassword reg />}
          />
          <Route path="/re-forgot-user-id" element={<ForgotUserID />} />

          {/*
          Nested routes for the RE Portal, all under the "/re" base path.
          The REPortalRoutes component handles all the dashboard and feature routes.
        */}
          <Route path="/re/*" element={<REPortalRoutes />} />
          {/*
          Nested routes for the CERSAI Admin Portal, all under the "/ckycrr" base path.
          The AdminPortalRoutes component handles all the dashboard and feature routes.
        */}
          <Route path="/ckycrr-admin/*" element={<CKYCRRoutes />} />

          {/*
            Correct Pattern 2:
            Protect a specific set of routes that are NOT inside the main layout.
            This demonstrates using both the `ProtectedRoute` and `ReinitializeGuard` as wrappers.
          */}
          {/* Entity Registration Step Routes */}
          <Route
            path="/update-entity-profile"
            element={<REUpdationConatiner />}
          />

          <Route
            path="/update-track-status"
            element={<UpdateTrackStatusStep />}
          />

          <Route path="/entity-profile" element={<RERegistrationContainer />} />
          <Route
            path="/address-details"
            element={<RERegistrationContainer />}
          />
          <Route
            path="/head-of-institution"
            element={<RERegistrationContainer />}
          />
          <Route path="/nodal-officer" element={<RERegistrationContainer />} />
          <Route
            path="/admin-user-details"
            element={<RERegistrationContainer />}
          />
          <Route path="/form-preview" element={<RERegistrationContainer />} />

          <Route path="/track-status" element={<TrackStatusForm />} />

          <Route
            path="/modify-entity-profile"
            element={<TrackStatusEditContainer />}
          />
          <Route
            path="/modify-address-details"
            element={<TrackStatusEditContainer />}
          />
          <Route
            path="/modify-head-of-institution"
            element={<TrackStatusEditContainer />}
          />
          <Route
            path="/modify-nodal-officer"
            element={<TrackStatusEditContainer />}
          />
          <Route
            path="/modify-admin-user-details"
            element={<TrackStatusEditContainer />}
          />
          <Route
            path="/modify-form-preview"
            element={<TrackStatusEditContainer />}
          />

          <Route element={<ReinitializeGuard />}>
            <Route path="/re-register" element={<RegistrationPage />} />

            <Route path="/re-address-details" element={<AddressDetails />} />

            <Route
              path="/re-institution-details"
              element={<InstitutionDetails />}
            />
            <Route
              path="/re-nodal-officer-details"
              element={<NodalOfficerDetails />}
            />
            <Route
              path="/re-institutional-admin-details"
              element={<InstitutionAdminDetails />}
            />
            <Route path="/re-form-preview" element={<FormPreview />} />
            <Route path="/re-trackStatus" element={<TrackStatus />} />
          </Route>
          {/* Catch-all for 404 pages (optional but good practice) */}
          <Route path="*" element={<div>404 Page Not Found</div>} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </Router>
  );
};

export default AppRoutes;
