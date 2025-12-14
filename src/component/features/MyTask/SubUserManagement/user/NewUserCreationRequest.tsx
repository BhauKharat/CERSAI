/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import * as styles from './NewUserCreationRequest.styles';
import ActionButtons from '../../../../common/buttons/ActionButtons';
import RejectConfirmationModal from '../../../../common/modals/RejectConfirmationModal';
import DecisionModal from '../../../../common/modals/DecisionModal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../redux/store';
import { fetchSubUserUserById } from './slice/SubUserSingleUserSlice';
import { getBranch } from '../../../UserManagement/CreateModifyBranch/slice/getBranchSlice';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import { formatOnlyDate } from '../../../../../utils/dateUtils';
import { formatProofOfIdentity } from '../../../../../utils/enumUtils';
import {
  fetchCountryCodes,
  Country as CountryCode,
} from '../../../../../utils/countryUtils';

const NewUserCreationRequest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const [workFlowId, setWorkFlowId] = useState('');
  const location = useLocation();
  // const isModification = location.pathname.includes('modification');
  const [, setIsFormDisabled] = useState(false);
  const [isModification, setIsModification] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'approve' as 'approve' | 'reject',
    title: '',
    message: '',
    listBefore: [] as string[],
    listAfter: [] as string[],
  });
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    regionName: '',
    regionCode: '',
    branchName: '',
    branchCode: '',
    userType: '',
    citizenship: '',
    ckycNumber: '',
    title: '',
    firstName: '',
    middleName: '`',
    lastName: '',
    designation: '',
    emailAddress: '',
    gender: '',
    countryCode: '',
    mobileNumber: '',
    dob: '',
    poi: '',
    poiNumber: '',
    employeeId: '',
    officeAddress: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    country: '',
    stateUT: '',
    district: '',
    cityTown: '',
    pinCode: '',
    pinCodeOther: '',
    digipin: '',
  });
  const [officeAddressData, setOfficeAddressData] = useState<any[]>([]);
  const [officeAddressLoading, setOfficeAddressLoading] = useState(false);
  // Track which fields exist in userDetails for highlighting
  const [userDetailsFields, setUserDetailsFields] = useState<Set<string>>(
    new Set()
  );
  const [regionAddressFetched, setRegionAddressFetched] = useState(false);
  const [officeAddressFetched, setOfficeAddressFetched] = useState(false);
  const [previousVersionModalOpen, setPreviousVersionModalOpen] =
    useState(false);
  const [previousVersionLoading, setPreviousVersionLoading] = useState(false);
  const [previousVersionData, setPreviousVersionData] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [allCountries, setAllCountries] = useState<CountryCode[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await fetchCountryCodes();
        setAllCountries(countries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);

      // Get data from navigation state (passed from list page)
      const locationState = location.state as any;
      const passedUserData = locationState?.userData;
      const passedWorkflowId = locationState?.workflowId;
      const passedUserId = locationState?.userId;
      const passedWorkflowData = locationState?.workflowData;
      // Helper function to extract and format date from array [year, month, day]
      const formatDateFromArray = (
        dateArray: number[] | string | undefined
      ): string => {
        if (!dateArray) return '';
        if (typeof dateArray === 'string') {
          // If it's already a string, parse it and reformat to DD-MM-YYYY
          const dateObj = new Date(dateArray);
          if (!isNaN(dateObj.getTime())) {
            return formatOnlyDate(dateObj).replace(/\//g, '/');
          }
          return dateArray; // Return as-is if invalid date
        }
        if (Array.isArray(dateArray) && dateArray.length === 3) {
          const [year, month, day] = dateArray;
          const dateObj = new Date(year, month - 1, day);
          return formatOnlyDate(dateObj).replace(/\//g, '/');
        }
        return '';
      };

      // Helper function to update address fields
      const updateAddressFields = (addressData: any) => {
        setFormData((prev) => ({
          ...prev,
          addressLine1: addressData?.line1 || prev.addressLine1 || '',
          addressLine2: addressData?.line2 || prev.addressLine2 || '',
          addressLine3: addressData?.line3 || prev.addressLine3 || '',
          country:
            addressData?.countryCode ||
            addressData?.country ||
            prev.country ||
            '',
          stateUT: addressData?.state || prev.stateUT || '',
          district: addressData?.district || prev.district || '',
          cityTown:
            addressData?.cityTown || addressData?.city || prev.cityTown || '',
          pinCode:
            addressData?.pinCode || addressData?.pincode || prev.pinCode || '',
          pinCodeOther:
            addressData?.alternatePinCode ||
            addressData?.alternatePincode ||
            prev.pinCodeOther ||
            '',
          digipin:
            addressData?.digiPin || addressData?.digipin || prev.digipin || '',
        }));
      };

      // Helper function to fetch address from API
      const fetchAddressFromAPI = async (
        userType: string,
        regionName?: string
      ) => {
        try {
          const queryParams = new URLSearchParams();
          queryParams.append('userType', userType);
          if (regionName) {
            queryParams.append('regionName', regionName);
          }

          const url = `${API_ENDPOINTS.get_sub_users_address}?${queryParams.toString()}`;
          const response = await Secured.get(url);

          if (response.data && response.data.success === true) {
            const addressData = response.data.data;
            updateAddressFields(addressData);
          } else {
            console.error(response.data);
          }
        } catch (error) {
          console.error(error);
        }
      };

      // Helper function to fetch office addresses
      const fetchOfficeAddresses = async () => {
        // Prevent multiple calls
        if (officeAddressFetched || officeAddressLoading) {
          return [];
        }
        try {
          setOfficeAddressLoading(true);
          setOfficeAddressFetched(true);
          const response = await Secured.get(
            API_ENDPOINTS.get_sub_users_address
          );

          let addresses: any[] = [];
          if (response.data) {
            if (response.data.success === true && response.data.data) {
              addresses = Array.isArray(response.data.data)
                ? response.data.data
                : [];
            } else if (Array.isArray(response.data.data)) {
              addresses = response.data.data;
            } else if (Array.isArray(response.data)) {
              addresses = response.data;
            }
          }

          setOfficeAddressData(addresses);
          return addresses;
        } catch (error) {
          console.error('Error fetching office addresses:', error);
          setOfficeAddressData([]);
          return [];
        } finally {
          setOfficeAddressLoading(false);
        }
      };

      // Helper function to populate form from workflow data
      const populateFormFromWorkflowData = (workflowData: any) => {
        const userDetails = workflowData?.payload?.userDetails || {};
        const concernedUserDetails =
          workflowData?.payload?.concernedUserDetails || {};
        const metaData = workflowData?.meta_data || {};

        // Note: userId and role are excluded from highlighting as per requirements
        const fieldsInUserDetails = new Set<string>();
        // Check for regionCode first, and if it exists, also highlight regionName (they're related)
        const hasRegionCode =
          'regionCode' in userDetails || 'regionCode' in concernedUserDetails;
        const hasRegionName =
          'regionName' in userDetails ||
          'region' in userDetails ||
          'regionName' in concernedUserDetails ||
          'region' in concernedUserDetails;

        if (hasRegionCode) {
          fieldsInUserDetails.add('regionCode');
          // If regionCode is present, also highlight regionName field
          fieldsInUserDetails.add('regionName');
        }
        // Also check for regionName/region directly in case it exists without regionCode
        if (hasRegionName) {
          fieldsInUserDetails.add('regionName');
        }

        // If regionName is highlighted, also highlight all address fields
        if (hasRegionCode || hasRegionName) {
          fieldsInUserDetails.add('addressLine1');
          fieldsInUserDetails.add('addressLine2');
          fieldsInUserDetails.add('addressLine3');
          fieldsInUserDetails.add('country');
          fieldsInUserDetails.add('stateUT');
          fieldsInUserDetails.add('district');
          fieldsInUserDetails.add('cityTown');
          fieldsInUserDetails.add('pinCode');
          fieldsInUserDetails.add('pinCodeOther');
          fieldsInUserDetails.add('digipin');
        }
        // Check for branchCode first, and if it exists, also highlight branchName (they're related)
        const hasBranchCode =
          'branchCode' in userDetails || 'branchCode' in concernedUserDetails;
        const hasBranchName =
          'branchName' in userDetails ||
          'branch' in userDetails ||
          'branchName' in concernedUserDetails ||
          'branch' in concernedUserDetails;

        if (hasBranchCode) {
          fieldsInUserDetails.add('branchCode');
          // If branchCode is present, also highlight branchName field
          fieldsInUserDetails.add('branchName');
        }
        // Also check for branchName/branch directly in case it exists without branchCode
        if (hasBranchName) {
          fieldsInUserDetails.add('branchName');
        }
        if ('citizenship' in userDetails)
          fieldsInUserDetails.add('citizenship');
        if ('ckycNumber' in userDetails) fieldsInUserDetails.add('ckycNumber');
        if ('title' in userDetails) fieldsInUserDetails.add('title');
        if ('firstName' in userDetails) fieldsInUserDetails.add('firstName');
        if ('middleName' in userDetails) fieldsInUserDetails.add('middleName');
        if ('lastName' in userDetails) fieldsInUserDetails.add('lastName');
        if ('designation' in userDetails)
          fieldsInUserDetails.add('designation');
        if ('email' in userDetails) fieldsInUserDetails.add('email');
        if ('gender' in userDetails) fieldsInUserDetails.add('gender');
        if ('countryCode' in userDetails)
          fieldsInUserDetails.add('countryCode');
        if ('mobile' in userDetails) fieldsInUserDetails.add('mobile');
        if ('dob' in userDetails) fieldsInUserDetails.add('dob');
        if ('proofOfIdentity' in userDetails)
          fieldsInUserDetails.add('proofOfIdentity');
        if ('proofOfIdentityNumber' in userDetails)
          fieldsInUserDetails.add('proofOfIdentityNumber');
        if ('employeeCode' in userDetails)
          fieldsInUserDetails.add('employeeCode');
        if ('sameAsRegisteredAddress' in userDetails) {
          fieldsInUserDetails.add('sameAsRegisteredAddress');
          // If sameAsRegisteredAddress is present, also highlight all address fields
          fieldsInUserDetails.add('addressLine1');
          fieldsInUserDetails.add('addressLine2');
          fieldsInUserDetails.add('addressLine3');
          fieldsInUserDetails.add('country');
          fieldsInUserDetails.add('stateUT');
          fieldsInUserDetails.add('district');
          fieldsInUserDetails.add('cityTown');
          fieldsInUserDetails.add('pinCode');
          fieldsInUserDetails.add('pinCodeOther');
          fieldsInUserDetails.add('digipin');
        }
        if (userDetails.address && typeof userDetails.address === 'object') {
          if ('line1' in userDetails.address || 'addressLine1' in userDetails)
            fieldsInUserDetails.add('addressLine1');
          if ('line2' in userDetails.address || 'addressLine2' in userDetails)
            fieldsInUserDetails.add('addressLine2');
          if ('line3' in userDetails.address || 'addressLine3' in userDetails)
            fieldsInUserDetails.add('addressLine3');
          if (
            'countryCode' in userDetails.address ||
            'country' in userDetails.address
          )
            fieldsInUserDetails.add('country');
          if ('state' in userDetails.address)
            fieldsInUserDetails.add('stateUT');
          if ('district' in userDetails.address)
            fieldsInUserDetails.add('district');
          if (
            'cityTown' in userDetails.address ||
            'city' in userDetails.address
          )
            fieldsInUserDetails.add('cityTown');
          if (
            'pinCode' in userDetails.address ||
            'pincode' in userDetails.address
          )
            fieldsInUserDetails.add('pinCode');
          if (
            'alternatePinCode' in userDetails.address ||
            'alternatePincode' in userDetails.address
          )
            fieldsInUserDetails.add('pinCodeOther');
          if (
            'digiPin' in userDetails.address ||
            'digipin' in userDetails.address
          )
            fieldsInUserDetails.add('digipin');
        }

        setUserDetailsFields(fieldsInUserDetails);

        const sameAsRegisteredAddress = userDetails.sameAsRegisteredAddress;
        const userTypeToUse =
          userDetails.role ||
          concernedUserDetails.userType ||
          metaData.role ||
          '';

        const initialOfficeAddress =
          sameAsRegisteredAddress === true ? 'registered' : '';

        const shouldSkipAddressPopulation =
          sameAsRegisteredAddress === true && userTypeToUse === 'IU';

        setFormData({
          regionName:
            userDetails.regionName ||
            userDetails.region ||
            concernedUserDetails.regionName ||
            concernedUserDetails.region ||
            metaData.region ||
            '',
          regionCode:
            userDetails.regionCode || concernedUserDetails.regionCode || '',
          branchName:
            userDetails.branchName ||
            userDetails.branch ||
            concernedUserDetails.branchName ||
            concernedUserDetails.branch ||
            metaData.branch ||
            '',
          branchCode:
            userDetails.branchCode || concernedUserDetails.branchCode || '',
          userType: userTypeToUse,
          citizenship: userDetails.citizenship || '',
          ckycNumber: userDetails.ckycNumber || metaData.ckycNo || '',
          title: userDetails.title || '',
          firstName: userDetails.firstName || '',
          middleName: userDetails.middleName || '',
          lastName: userDetails.lastName || '',
          designation: userDetails.designation || '',
          emailAddress: userDetails.email || metaData.email || '',
          gender: userDetails.gender || '',
          countryCode: userDetails.countryCode || '',
          mobileNumber: userDetails.mobile || metaData.mobile || '',
          dob: formatDateFromArray(userDetails.dob) || '',
          poi: userDetails.proofOfIdentity || '',
          poiNumber: userDetails.proofOfIdentityNumber || '',
          employeeId: userDetails.employeeCode || '',
          officeAddress: initialOfficeAddress,
          // Only populate address fields if we're not waiting for office addresses API
          addressLine1: shouldSkipAddressPopulation
            ? ''
            : userDetails.address?.line1 || userDetails.addressLine1 || '',
          addressLine2: shouldSkipAddressPopulation
            ? ''
            : userDetails.address?.line2 || userDetails.addressLine2 || '',
          addressLine3: shouldSkipAddressPopulation
            ? ''
            : userDetails.address?.line3 || userDetails.addressLine3 || '',
          country: shouldSkipAddressPopulation
            ? ''
            : userDetails.address?.countryCode ||
              userDetails.address?.country ||
              '',
          stateUT: shouldSkipAddressPopulation
            ? ''
            : userDetails.address?.state || '',
          district: shouldSkipAddressPopulation
            ? ''
            : userDetails.address?.district || '',
          cityTown: shouldSkipAddressPopulation
            ? ''
            : userDetails.address?.cityTown || userDetails.address?.city || '',
          pinCode: shouldSkipAddressPopulation
            ? ''
            : userDetails.address?.pinCode ||
              userDetails.address?.pincode ||
              '',
          pinCodeOther: shouldSkipAddressPopulation
            ? ''
            : userDetails.address?.alternatePinCode ||
              userDetails.address?.alternatePincode ||
              '',
          digipin: shouldSkipAddressPopulation
            ? ''
            : userDetails.address?.digiPin ||
              userDetails.address?.digipin ||
              '',
        });
        setIsFormDisabled(true);
        setIsModification(
          location.pathname.includes('user-modification-request')
        );
        setLoading(false);

        // Fetch office addresses if userType is IU
        if (userTypeToUse === 'IU') {
          fetchOfficeAddresses()
            .then((addresses) => {
              if (addresses && addresses.length > 0) {
                // Determine which address to use based on sameAsRegisteredAddress
                let selectedAddress: any = null;
                let addressTypeLabel: string = '';

                if (
                  sameAsRegisteredAddress === false ||
                  sameAsRegisteredAddress === 'false'
                ) {
                  // Use correspondence address when sameAsRegisteredAddress is false
                  selectedAddress = addresses.find(
                    (addr: any) =>
                      (addr.address_type || addr.addressType) ===
                        'CORRESPONDENCE' ||
                      (addr.address_type || addr.addressType)?.toLowerCase() ===
                        'correspondence'
                  );
                  addressTypeLabel = 'correspondence';
                } else {
                  // Use registered address when sameAsRegisteredAddress is true or undefined
                  selectedAddress = addresses.find(
                    (addr: any) =>
                      (addr.address_type || addr.addressType) ===
                        'REGISTERED' ||
                      (addr.address_type || addr.addressType)?.toLowerCase() ===
                        'registered'
                  );
                  addressTypeLabel = 'registered';
                }

                if (selectedAddress) {
                  // Update form data with selected address
                  setFormData((prev) => ({
                    ...prev,
                    officeAddress: addressTypeLabel,
                    addressLine1:
                      selectedAddress.line1 || prev.addressLine1 || '',
                    addressLine2:
                      selectedAddress.line2 ||
                      selectedAddress.line_2 ||
                      prev.addressLine2 ||
                      '',
                    addressLine3:
                      selectedAddress.line3 ||
                      selectedAddress.line_3 ||
                      prev.addressLine3 ||
                      '',
                    country: selectedAddress.country || prev.country || '',
                    stateUT: selectedAddress.state || prev.stateUT || '',
                    district: selectedAddress.district || prev.district || '',
                    cityTown:
                      selectedAddress.city ||
                      selectedAddress.cityTown ||
                      prev.cityTown ||
                      '',
                    pinCode:
                      selectedAddress.pincode ||
                      selectedAddress.pin_code ||
                      prev.pinCode ||
                      '',
                    pinCodeOther:
                      selectedAddress.pincode_other || prev.pinCodeOther || '',
                    digipin:
                      selectedAddress.digipin ||
                      selectedAddress.digi_pin ||
                      prev.digipin ||
                      '',
                  }));
                } else {
                  console.warn(
                    `${addressTypeLabel} address not found in office addresses`
                  );
                }
              } else {
                console.warn('No addresses available from API');
              }
            })
            .catch((error) => {
              console.error('Error in fetchOfficeAddresses promise:', error);
            });
        }

        // Fetch branch address if userType is IBU
        if (
          userTypeToUse === 'IBU' ||
          userTypeToUse === 'INSTITUTIONAL_BRANCH_USER'
        ) {
          const branchCodeToUse =
            userDetails.branchCode ||
            concernedUserDetails.branchCode ||
            metaData.branchCode ||
            '';

          if (branchCodeToUse) {
            dispatch(getBranch(branchCodeToUse))
              .unwrap()
              .then((branchData) => {
                if (branchData && branchData.address) {
                  // Populate form with branch address
                  setFormData((prev) => ({
                    ...prev,
                    addressLine1:
                      branchData.address.line1 || prev.addressLine1 || '',
                    addressLine2:
                      branchData.address.line2 || prev.addressLine2 || '',
                    addressLine3: prev.addressLine3 || '', // API doesn't have line3
                    country:
                      branchData.address.countryCode || prev.country || '',
                    stateUT: branchData.address.state || prev.stateUT || '',
                    district:
                      branchData.address.district || prev.district || '',
                    cityTown:
                      branchData.address.city ||
                      branchData.address.cityTown ||
                      prev.cityTown ||
                      '',
                    pinCode: branchData.address.pinCode || prev.pinCode || '',
                    pinCodeOther: prev.pinCodeOther || '',
                    digipin: prev.digipin || '',
                  }));
                }
              })
              .catch((error) => {
                console.error('Error fetching branch address:', error);
              });
          }
        }

        // fetch address from the other API (as fallback for non-IU users)
        if (sameAsRegisteredAddress === true && userTypeToUse !== 'IU') {
          const regionNameToUse =
            userDetails.regionName || concernedUserDetails.regionName || '';

          if (userTypeToUse) {
            fetchAddressFromAPI(userTypeToUse, regionNameToUse);
          }
        }
      };

      // Helper function to populate form from user data
      const populateFormFromData = (
        userData: any,
        preserveUserDetailsFields = false,
        fieldsToPreserve: Set<string> = new Set()
      ) => {
        if (!preserveUserDetailsFields) {
          setUserDetailsFields(new Set());
        } else if (fieldsToPreserve.size > 0) {
          setUserDetailsFields((prev) => {
            const merged = new Set(prev);
            fieldsToPreserve.forEach((field) => merged.add(field));
            return merged;
          });
        }

        const userTypeToUse = userData?.userType || '';
        setFormData((prev) => {
          // Use the passed fieldsToPreserve or the current userDetailsFields state
          const fieldsToCheck =
            preserveUserDetailsFields && fieldsToPreserve.size > 0
              ? fieldsToPreserve
              : preserveUserDetailsFields
                ? userDetailsFields
                : new Set<string>();

          // Helper to determine if we should use userData or prev value
          const getValue = (
            fieldName: string,
            userDataValue: any,
            prevValue: any
          ) => {
            if (preserveUserDetailsFields && fieldsToCheck.has(fieldName)) {
              // If field is in userDetailsFields, preserve the previous value (from workflow)
              // Always prioritize prevValue when preserving fields
              return prevValue !== '' &&
                prevValue !== null &&
                prevValue !== undefined
                ? prevValue
                : userDataValue || '';
            }
            // Otherwise, use userData value if available, else keep previous value
            return userDataValue || prevValue || '';
          };

          return {
            regionName: getValue(
              'regionName',
              userData?.regionName || userData?.region,
              prev.regionName
            ),
            regionCode: getValue(
              'regionCode',
              userData?.regionCode,
              prev.regionCode
            ),
            branchName: getValue(
              'branchName',
              userData?.branchName || userData?.branch,
              prev.branchName
            ),
            branchCode: getValue(
              'branchCode',
              userData?.branchCode,
              prev.branchCode
            ),
            userType: userTypeToUse || prev.userType || '',
            citizenship: getValue(
              'citizenship',
              userData?.citizenship,
              prev.citizenship
            ),
            ckycNumber: getValue(
              'ckycNumber',
              userData?.ckycNumber,
              prev.ckycNumber
            ),
            title: getValue('title', userData?.title, prev.title),
            firstName: getValue(
              'firstName',
              userData?.firstName,
              prev.firstName
            ),
            middleName: getValue(
              'middleName',
              userData?.middleName,
              prev.middleName
            ),
            lastName: getValue('lastName', userData?.lastName, prev.lastName),
            designation: getValue(
              'designation',
              userData?.designation,
              prev.designation
            ),
            emailAddress: getValue(
              'email',
              userData?.emailAddress || userData?.email,
              prev.emailAddress
            ),
            gender: getValue('gender', userData?.gender, prev.gender),
            countryCode: getValue(
              'countryCode',
              userData?.countryCode,
              prev.countryCode
            ),
            mobileNumber: getValue(
              'mobile',
              userData?.mobileNumber || userData?.mobile,
              prev.mobileNumber
            ),
            dob: getValue('dob', formatDateFromArray(userData?.dob), prev.dob),
            poi: getValue(
              'proofOfIdentity',
              userData?.poi || userData?.proofOfIdentity,
              prev.poi
            ),
            poiNumber: getValue(
              'proofOfIdentityNumber',
              userData?.poiNumber || userData?.proofOfIdentityNumber,
              prev.poiNumber
            ),
            employeeId: getValue(
              'employeeCode',
              userData?.employeeId || userData?.employeeCode,
              prev.employeeId
            ),
            // Preserve officeAddress if it was set from workflow data (when preserveUserDetailsFields is true)
            officeAddress: preserveUserDetailsFields
              ? prev.officeAddress || ''
              : '',
            addressLine1: getValue(
              'addressLine1',
              userData?.address?.line1 || userData?.addressResponseDto?.line1,
              prev.addressLine1
            ),
            addressLine2: getValue(
              'addressLine2',
              userData?.address?.line2 || userData?.addressResponseDto?.line2,
              prev.addressLine2
            ),
            addressLine3: getValue(
              'addressLine3',
              userData?.address?.line3 || userData?.addressResponseDto?.line3,
              prev.addressLine3
            ),
            country: getValue(
              'country',
              userData?.address?.countryCode ||
                userData?.addressResponseDto?.countryCode ||
                userData?.addressResponseDto?.country,
              prev.country
            ),
            stateUT: getValue(
              'stateUT',
              userData?.address?.state || userData?.addressResponseDto?.state,
              prev.stateUT
            ),
            district: getValue(
              'district',
              userData?.address?.district ||
                userData?.addressResponseDto?.district,
              prev.district
            ),
            cityTown: getValue(
              'cityTown',
              userData?.address?.cityTown ||
                userData?.address?.city ||
                userData?.addressResponseDto?.city ||
                userData?.addressResponseDto?.cityTown,
              prev.cityTown
            ),
            pinCode: getValue(
              'pinCode',
              userData?.address?.pinCode ||
                userData?.address?.pincode ||
                userData?.addressResponseDto?.pincode ||
                userData?.addressResponseDto?.pinCode,
              prev.pinCode
            ),
            pinCodeOther: getValue(
              'pinCodeOther',
              userData?.address?.alternatePinCode ||
                userData?.address?.alternatePincode ||
                userData?.addressResponseDto?.alternatePincode ||
                userData?.addressResponseDto?.alternatePinCode,
              prev.pinCodeOther
            ),
            digipin: getValue(
              'digipin',
              userData?.address?.digiPin ||
                userData?.address?.digipin ||
                userData?.addressResponseDto?.digipin ||
                userData?.addressResponseDto?.digiPin,
              prev.digipin
            ),
          };
        });

        setIsFormDisabled(true);
        setIsModification(
          location.pathname.includes('user-modification-request')
        );
        setLoading(false);

        // Fetch office addresses if userType is IU
        if (userTypeToUse === 'IU') {
          fetchOfficeAddresses();
        }

        // Fetch region address for IRA and IRU users using region API
        const isRegionalUser =
          userTypeToUse === 'IRA' ||
          userTypeToUse === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
          userTypeToUse === 'IRU' ||
          userTypeToUse === 'INSTITUTIONAL_REGIONAL_USER' ||
          userTypeToUse === 'IBU' ||
          userTypeToUse === 'INSTITUTIONAL_BRANCH_USER';
        const regionCodeToFetch = userData?.regionCode;

        if (isRegionalUser && regionCodeToFetch && !preserveUserDetailsFields) {
          Secured.get(API_ENDPOINTS.get_region_by_code(regionCodeToFetch))
            .then((response) => {
              if (response.data && response.data.success === true) {
                const regionData = response.data.data;
                const regionAddress = regionData?.address;
                if (regionAddress) {
                  setFormData((prev) => ({
                    ...prev,
                    regionName: regionData.regionName || prev.regionName || '',
                    addressLine1:
                      regionAddress.line1 || prev.addressLine1 || '',
                    addressLine2:
                      regionAddress.line2 || prev.addressLine2 || '',
                    addressLine3:
                      regionAddress.line3 || prev.addressLine3 || '',
                    country:
                      regionAddress.countryCode ||
                      regionAddress.country ||
                      prev.country ||
                      '',
                    stateUT: regionAddress.state || prev.stateUT || '',
                    district: regionAddress.district || prev.district || '',
                    cityTown:
                      regionAddress.city ||
                      regionAddress.cityTown ||
                      prev.cityTown ||
                      '',
                    pinCode:
                      regionAddress.pinCode ||
                      regionAddress.pincode ||
                      prev.pinCode ||
                      '',
                    pinCodeOther:
                      regionAddress.alternatePinCode ||
                      regionAddress.alternatePincode ||
                      prev.pinCodeOther ||
                      '',
                    digipin:
                      regionAddress.digiPin ||
                      regionAddress.digipin ||
                      prev.digipin ||
                      '',
                  }));
                }
              }
            })
            .catch((error) => {
              console.error(
                'Error fetching region data for regional user:',
                error
              );
            });
        }
      };

      // If we have workflow data from navigation state, use it first for prepopulation
      if (passedWorkflowData) {
        // Set workflowId if available
        if (passedWorkflowId || passedWorkflowData.workflow_id) {
          setWorkFlowId(passedWorkflowId || passedWorkflowData.workflow_id);
        }

        // Extract userDetailsFields before calling populateFormFromWorkflowData
        const userDetails = passedWorkflowData.payload?.userDetails || {};
        const concernedUserDetails =
          passedWorkflowData.payload?.concernedUserDetails || {};
        const metaData = passedWorkflowData.meta_data || {};
        // Note: userId and role are excluded from highlighting as per requirements
        const currentUserDetailsFields = new Set<string>();
        // Check for regionCode first, and if it exists, also highlight regionName (they're related)
        const hasRegionCode =
          'regionCode' in userDetails ||
          'regionCode' in concernedUserDetails ||
          'regionCode' in metaData;
        const hasRegionName =
          'regionName' in userDetails ||
          'region' in userDetails ||
          'regionName' in concernedUserDetails ||
          'region' in concernedUserDetails ||
          'region' in metaData;

        if (hasRegionCode) {
          currentUserDetailsFields.add('regionCode');
          // If regionCode is present, also highlight regionName field
          currentUserDetailsFields.add('regionName');
        }
        if (hasRegionName) {
          currentUserDetailsFields.add('regionName');
        }
        if (hasRegionCode || hasRegionName) {
          currentUserDetailsFields.add('addressLine1');
          currentUserDetailsFields.add('addressLine2');
          currentUserDetailsFields.add('addressLine3');
          currentUserDetailsFields.add('country');
          currentUserDetailsFields.add('stateUT');
          currentUserDetailsFields.add('district');
          currentUserDetailsFields.add('cityTown');
          currentUserDetailsFields.add('pinCode');
          currentUserDetailsFields.add('pinCodeOther');
          currentUserDetailsFields.add('digipin');
        }
        const hasBranchName =
          'branchName' in userDetails ||
          'branch' in userDetails ||
          'branchName' in concernedUserDetails ||
          'branch' in concernedUserDetails ||
          'branch' in metaData;
        const hasBranchCode =
          'branchCode' in userDetails ||
          'branchCode' in concernedUserDetails ||
          'branchCode' in metaData;

        if (hasBranchName) currentUserDetailsFields.add('branchName');
        if (hasBranchCode) currentUserDetailsFields.add('branchCode');
        if ('citizenship' in userDetails)
          currentUserDetailsFields.add('citizenship');
        if ('ckycNumber' in userDetails)
          currentUserDetailsFields.add('ckycNumber');
        if ('title' in userDetails) currentUserDetailsFields.add('title');
        if ('firstName' in userDetails)
          currentUserDetailsFields.add('firstName');
        if ('middleName' in userDetails)
          currentUserDetailsFields.add('middleName');
        if ('lastName' in userDetails) currentUserDetailsFields.add('lastName');
        if ('designation' in userDetails)
          currentUserDetailsFields.add('designation');
        if ('email' in userDetails) currentUserDetailsFields.add('email');
        if ('gender' in userDetails) currentUserDetailsFields.add('gender');
        if ('countryCode' in userDetails)
          currentUserDetailsFields.add('countryCode');
        if ('mobile' in userDetails) currentUserDetailsFields.add('mobile');
        if ('dob' in userDetails) currentUserDetailsFields.add('dob');
        if ('proofOfIdentity' in userDetails)
          currentUserDetailsFields.add('proofOfIdentity');
        if ('proofOfIdentityNumber' in userDetails)
          currentUserDetailsFields.add('proofOfIdentityNumber');
        if ('employeeCode' in userDetails)
          currentUserDetailsFields.add('employeeCode');
        if ('sameAsRegisteredAddress' in userDetails)
          currentUserDetailsFields.add('sameAsRegisteredAddress');
        if (userDetails.address && typeof userDetails.address === 'object') {
          if ('line1' in userDetails.address || 'addressLine1' in userDetails)
            currentUserDetailsFields.add('addressLine1');
          if ('line2' in userDetails.address || 'addressLine2' in userDetails)
            currentUserDetailsFields.add('addressLine2');
          if ('line3' in userDetails.address || 'addressLine3' in userDetails)
            currentUserDetailsFields.add('addressLine3');
          if (
            'countryCode' in userDetails.address ||
            'country' in userDetails.address
          )
            currentUserDetailsFields.add('country');
          if ('state' in userDetails.address)
            currentUserDetailsFields.add('stateUT');
          if ('district' in userDetails.address)
            currentUserDetailsFields.add('district');
          if (
            'cityTown' in userDetails.address ||
            'city' in userDetails.address
          )
            currentUserDetailsFields.add('cityTown');
          if (
            'pinCode' in userDetails.address ||
            'pincode' in userDetails.address
          )
            currentUserDetailsFields.add('pinCode');
          if (
            'alternatePinCode' in userDetails.address ||
            'alternatePincode' in userDetails.address
          )
            currentUserDetailsFields.add('pinCodeOther');
          if (
            'digiPin' in userDetails.address ||
            'digipin' in userDetails.address
          )
            currentUserDetailsFields.add('digipin');
        }

        // Populate form from workflow data immediately
        populateFormFromWorkflowData(passedWorkflowData);

        // Optionally fetch fresh data in background (but don't wait for it)
        const userIdToFetch =
          passedUserId ||
          passedWorkflowData.meta_data?.userId ||
          passedWorkflowData.payload?.concernedUserDetails?.userId;
        if (userIdToFetch) {
          dispatch(fetchSubUserUserById(userIdToFetch))
            .then((action: any) => {
              const userData = action?.payload || action;
              // Update form with fresh data if available, but preserve userDetailsFields
              populateFormFromData(userData, true, currentUserDetailsFields);
            })
            .catch(() => {
              // If fetch fails, keep the workflow data
            });
        }
        return;
      }

      let userId = id;
      let isWorkflowId = false;

      if (passedUserData) {
        userId = passedUserId || passedUserData.userId || id;
        if (!userId || userId === id) {
          isWorkflowId = true;
        }
      }

      // If we have user data from navigation state, use it first
      if (passedUserData && passedUserData.userId) {
        // Set workflowId if available
        if (passedWorkflowId) {
          setWorkFlowId(passedWorkflowId);
        }

        // Try to fetch fresh data, but also use passed data as fallback
        dispatch(fetchSubUserUserById(passedUserData.userId))
          .then((action: any) => {
            const userData = action?.payload || action;
            populateFormFromData(userData);
          })
          .catch(() => {
            // If fetch fails, use passed data
            populateFormFromData(passedUserData);
          });
        return;
      }

      const workflowPayload = {
        filters: [
          {
            operation: isWorkflowId ? 'AND' : 'OR',
            filters: isWorkflowId ? { workflow_id: id } : { userId: userId },
          },
        ],
        page: 1,
        pageSize: 1,
        isPendingRequestAPI: true,
        sortBy: 'created_at',
        sortDesc: true,
      };

      Secured.post(
        API_ENDPOINTS.get_sub_users_workflow_pending_requests,
        workflowPayload
      )
        .then((workflowResponse: any) => {
          const workflowData = workflowResponse.data;
          const content = workflowData?.data?.content || [];
          const workflowItem = content[0] || {};
          const workflowId =
            workflowItem.workflow_id || workflowItem.workflowId;
          const metaData =
            workflowItem.meta_data || workflowItem.metaData || {};
          const payload = workflowItem.payload || {};
          const concernedUserDetails = payload.concernedUserDetails || {};

          // Extract userId from metadata, if not found use workflowId
          const extractedUserId =
            metaData.userId ||
            concernedUserDetails.userId ||
            workflowItem.userId;

          if (workflowId) {
            setWorkFlowId(workflowId);
          }

          // Store userId for use in "View Previous Version"
          if (extractedUserId) {
            setCurrentUserId(extractedUserId);
          } else if (id) {
            // Fallback to id if userId not found
            setCurrentUserId(id);
          }

          // Use extracted userId if found, otherwise use workflowId
          const finalUserId = extractedUserId || workflowId || id;

          if (!extractedUserId && workflowId) {
            // If userId is not found, use workflowId for fetching
          }

          // This ensures fields in userDetails are populated correctly
          const currentUserDetailsFields = new Set<string>();
          if (workflowItem.payload?.userDetails || workflowItem.payload) {
            // Extract userDetailsFields before calling populateFormFromWorkflowData
            const userDetails = workflowItem.payload?.userDetails || {};
            const concernedUserDetails =
              workflowItem.payload?.concernedUserDetails || {};
            const hasRegionCode =
              'regionCode' in userDetails ||
              'regionCode' in concernedUserDetails;
            const hasRegionName =
              'regionName' in userDetails ||
              'region' in userDetails ||
              'regionName' in concernedUserDetails ||
              'region' in concernedUserDetails;

            if (hasRegionCode) {
              currentUserDetailsFields.add('regionCode');
              // If regionCode is present, also highlight regionName field
              currentUserDetailsFields.add('regionName');
            }
            // Also check for regionName/region directly in case it exists without regionCode
            if (hasRegionName) {
              currentUserDetailsFields.add('regionName');
            }

            // If regionName is highlighted, also highlight all address fields
            if (hasRegionCode || hasRegionName) {
              currentUserDetailsFields.add('addressLine1');
              currentUserDetailsFields.add('addressLine2');
              currentUserDetailsFields.add('addressLine3');
              currentUserDetailsFields.add('country');
              currentUserDetailsFields.add('stateUT');
              currentUserDetailsFields.add('district');
              currentUserDetailsFields.add('cityTown');
              currentUserDetailsFields.add('pinCode');
              currentUserDetailsFields.add('pinCodeOther');
              currentUserDetailsFields.add('digipin');
            }
            // Check for branchCode first, and if it exists, also highlight branchName (they're related)
            const hasBranchCode =
              'branchCode' in userDetails ||
              'branchCode' in concernedUserDetails;
            const hasBranchName =
              'branchName' in userDetails ||
              'branch' in userDetails ||
              'branchName' in concernedUserDetails ||
              'branch' in concernedUserDetails;

            if (hasBranchCode) {
              currentUserDetailsFields.add('branchCode');
              // If branchCode is present, also highlight branchName field
              currentUserDetailsFields.add('branchName');
            }
            // Also check for branchName/branch directly in case it exists without branchCode
            if (hasBranchName) {
              currentUserDetailsFields.add('branchName');
            }
            if ('citizenship' in userDetails)
              currentUserDetailsFields.add('citizenship');
            if ('ckycNumber' in userDetails)
              currentUserDetailsFields.add('ckycNumber');
            if ('title' in userDetails) currentUserDetailsFields.add('title');
            if ('firstName' in userDetails)
              currentUserDetailsFields.add('firstName');
            if ('middleName' in userDetails)
              currentUserDetailsFields.add('middleName');
            if ('lastName' in userDetails)
              currentUserDetailsFields.add('lastName');
            if ('designation' in userDetails)
              currentUserDetailsFields.add('designation');
            if ('email' in userDetails) currentUserDetailsFields.add('email');
            if ('gender' in userDetails) currentUserDetailsFields.add('gender');
            if ('countryCode' in userDetails)
              currentUserDetailsFields.add('countryCode');
            if ('mobile' in userDetails) currentUserDetailsFields.add('mobile');
            if ('dob' in userDetails) currentUserDetailsFields.add('dob');
            if ('proofOfIdentity' in userDetails)
              currentUserDetailsFields.add('proofOfIdentity');
            if ('proofOfIdentityNumber' in userDetails)
              currentUserDetailsFields.add('proofOfIdentityNumber');
            if ('employeeCode' in userDetails)
              currentUserDetailsFields.add('employeeCode');
            if ('sameAsRegisteredAddress' in userDetails)
              currentUserDetailsFields.add('sameAsRegisteredAddress');
            if (
              userDetails.address &&
              typeof userDetails.address === 'object'
            ) {
              if (
                'line1' in userDetails.address ||
                'addressLine1' in userDetails
              )
                currentUserDetailsFields.add('addressLine1');
              if (
                'line2' in userDetails.address ||
                'addressLine2' in userDetails
              )
                currentUserDetailsFields.add('addressLine2');
              if (
                'line3' in userDetails.address ||
                'addressLine3' in userDetails
              )
                currentUserDetailsFields.add('addressLine3');
              if (
                'countryCode' in userDetails.address ||
                'country' in userDetails.address
              )
                currentUserDetailsFields.add('country');
              if ('state' in userDetails.address)
                currentUserDetailsFields.add('stateUT');
              if ('district' in userDetails.address)
                currentUserDetailsFields.add('district');
              if (
                'cityTown' in userDetails.address ||
                'city' in userDetails.address
              )
                currentUserDetailsFields.add('cityTown');
              if (
                'pinCode' in userDetails.address ||
                'pincode' in userDetails.address
              )
                currentUserDetailsFields.add('pinCode');
              if (
                'alternatePinCode' in userDetails.address ||
                'alternatePincode' in userDetails.address
              )
                currentUserDetailsFields.add('pinCodeOther');
              if (
                'digiPin' in userDetails.address ||
                'digipin' in userDetails.address
              )
                currentUserDetailsFields.add('digipin');
            }

            populateFormFromWorkflowData(workflowItem);
          }

          // Then fetch user data to fill in any missing fields
          dispatch(fetchSubUserUserById(finalUserId))
            .then((action: any) => {
              const userData = action?.payload || action;
              setUserDetailsFields((prev) => {
                const merged = new Set(prev);
                currentUserDetailsFields.forEach((field) => merged.add(field));

                return merged;
              });
              populateFormFromData(userData, true, currentUserDetailsFields);

              // Fetch office addresses if userType is IU
              const userTypeToUse = userData?.userType || '';
              if (userTypeToUse === 'IU') {
                fetchOfficeAddresses();
              }
            })
            .catch((error) => {
              console.error('Failed to fetch user data:', error);
              // Even if user data fetch fails, we still have workflow data populated
              setLoading(false);
            });
        })
        .catch((error) => {
          console.error('Failed to fetch workflow data:', error);
          // If workflow fetch fails, try using id directly as userId or workflowId
          dispatch(fetchSubUserUserById(id))
            .then((action: any) => {
              const userData = action?.payload || action;
              populateFormFromData(userData);
            })
            .catch((userError) => {
              console.error('Failed to fetch user data:', userError);
              setLoading(false);
            });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id, location.pathname, location.state]);

  // Helper function to get user role display name
  const getUserRoleDisplayName = (userType: string): string => {
    const roleMap: Record<string, string> = {
      IBU: 'Institutional Branch User',
      IRA: 'Institutional Regional Admin',
      IRU: 'Institutional Regional User',
      IAU: 'Institutional Admin User',
      IU: 'Institutional User',
      NO: 'Nodal Officer',
      HOI: 'Head of Institution',
    };
    const displayName = roleMap[userType] || userType;
    return `${displayName} [${userType}]`;
  };

  const handleFetchPreviousVersion = async () => {
    // Get userId from various sources
    const userIdToUse =
      currentUserId ||
      id ||
      location.state?.userId ||
      location.state?.workflowData?.meta_data?.userId ||
      location.state?.workflowData?.payload?.concernedUserDetails?.userId;

    if (!userIdToUse) {
      console.error('User ID not available');
      return;
    }

    try {
      setPreviousVersionLoading(true);
      setPreviousVersionModalOpen(true);

      const payload = [
        {
          operation: 'OR',
          filters: {
            userId: userIdToUse,
          },
        },
      ];

      // Use existing API endpoint for fetching sub-users
      const apiEndpoint = `${API_ENDPOINTS.get_sub_users}?page=0&size=1000&sortBy=branchCode,asc`;

      const response = await Secured.post(apiEndpoint, payload);

      if (
        response.data?.data?.content &&
        response.data.data.content.length > 0
      ) {
        const userData = response.data.data.content[0];
        console.log('Previous version API response:', userData);

        // Map office address type to display name
        let officeAddressDisplay = '-';
        if (userData.addressResponseDto?.addressType) {
          const addressType = userData.addressResponseDto.addressType;
          if (addressType === 'REGISTERED') {
            officeAddressDisplay = 'Registered Address';
          } else if (addressType === 'CORRESPONDENCE') {
            officeAddressDisplay = 'Correspondence Address';
          } else {
            officeAddressDisplay = addressType;
          }
        }

        // Ensure address fields are properly mapped
        const mappedUserData = {
          ...userData,
          officeAddress: officeAddressDisplay,
          branchName: userData.branchName || userData.branch || '-',
          // Ensure addressResponseDto has digipin field accessible
          addressResponseDto: {
            ...userData.addressResponseDto,
            digipin:
              userData.addressResponseDto?.digipin ||
              userData.addressResponseDto?.digiPin ||
              '-',
          },
        };

        console.log('Mapped previous version data:', mappedUserData);
        console.log('Branch name:', mappedUserData.branchName);
        console.log('Digipin:', mappedUserData.addressResponseDto?.digipin);

        // Add officeAddress field to the data
        setPreviousVersionData(mappedUserData);
      } else {
        console.error('No previous version data found');
        setPreviousVersionData(null);
      }
    } catch (error) {
      console.error('Error fetching previous version:', error);
      setPreviousVersionData(null);
    } finally {
      setPreviousVersionLoading(false);
    }
  };

  const handleApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!workFlowId) {
      console.error('Workflow ID is missing');
      setModalState({
        isOpen: true,
        type: 'reject',
        title: 'Error',
        message: 'Workflow ID is missing. Cannot approve request.',
        listBefore: [],
        listAfter: [],
      });
      return;
    }

    try {
      // Prepare approval payload
      const approvalPayload = {
        workflowId: workFlowId,
        action: 'APPROVE',
        reason: 'ok approve',
        remarks: 'ok approve',
      };

      // Call the approval API
      const response = await Secured.post(
        API_ENDPOINTS.sub_users_workflow_approval,
        approvalPayload
      );

      if (
        response.data &&
        (response.data.success === true || response.status === 200)
      ) {
        // Determine the success message based on modification status
        const userName = formData?.firstName
          ? `${formData.firstName} ${formData.middleName || ''} ${formData.lastName || ''}`.trim()
          : formData?.emailAddress || 'User';

        const userType = formData?.userType || '';
        const employeeId = formData?.employeeId || '';
        const regionName = formData?.regionName || '';
        const regionCode = formData?.regionCode || '';
        const branchName = formData?.branchName || '';
        const branchCode = formData?.branchCode || '';

        // Format: "User\n\n[Name] - [Type] - [Code]\n\ncreated successfully\nfor Region [Name - Code]\nand Branch [Name - Code]"
        const userInfo = `${userName} - ${userType}${employeeId ? ` - ${employeeId}` : ''}`;
        const regionInfo =
          regionName && regionCode
            ? `[${regionName} – ${regionCode}]`
            : regionName || '';
        const branchInfo =
          branchName && branchCode
            ? `[${branchName} -${branchCode}]`
            : branchName || '';

        const successAction = isModification
          ? 'modified successfully'
          : 'created successfully';

        let message = `${userInfo}\n\n${successAction}`;
        if (regionInfo) {
          message += `\nfor Region ${regionInfo}`;
        }
        if (branchInfo) {
          message += `\nand Branch ${branchInfo}`;
        }

        setModalState({
          isOpen: true,
          type: 'approve',
          title: 'User',
          message: message,
          listBefore: [],
          listAfter: [],
        });
      } else {
        // Handle API error response
        const errorMessage =
          response.data?.message ||
          response.data?.errorMessage ||
          'Failed to approve the request';
        setModalState({
          isOpen: true,
          type: 'reject',
          title: 'Error',
          message: errorMessage,
          listBefore: [],
          listAfter: [],
        });
      }
    } catch (error: any) {
      console.error(error);
      // Handle error response
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errorMessage ||
        error?.message ||
        'An error occurred while processing your request.';
      setModalState({
        isOpen: true,
        type: 'reject',
        title: 'Error',
        message: errorMessage,
        listBefore: [],
        listAfter: [],
      });
    }
  };

  const handleRejectClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (remark: string) => {
    if (!workFlowId) {
      setModalState({
        isOpen: true,
        type: 'reject',
        title: 'Error',
        message: 'Workflow ID is missing. Cannot reject request.',
        listBefore: [],
        listAfter: [],
      });
      setRejectModalOpen(false);
      return;
    }

    try {
      // Prepare rejection payload
      const rejectionPayload = {
        workflowId: workFlowId,
        action: 'REJECT',
        reason: remark || 'ok approve',
        remarks: remark || 'ok approve',
      };

      // Call the rejection API
      const response = await Secured.post(
        API_ENDPOINTS.sub_users_workflow_approval,
        rejectionPayload
      );

      if (
        response.data &&
        (response.data.success === true ||
          response.status === 200 ||
          response.data?.data?.workflowStatus === 'REJECTED')
      ) {
        // Determine the rejection message based on modification status
        const rejectionMessage = isModification
          ? 'User Modification Request Rejected'
          : 'User Creation Request Rejected';

        setModalState({
          isOpen: true,
          type: 'reject',
          title: '',
          message: rejectionMessage,
          listBefore: [],
          listAfter: [],
        });
      } else {
        // Handle API error response
        const errorMessage =
          response.data?.message ||
          response.data?.data?.message ||
          response.data?.errorMessage ||
          'Failed to reject the request';
        setModalState({
          isOpen: true,
          type: 'reject',
          title: 'Error',
          message: errorMessage,
          listBefore: [],
          listAfter: [],
        });
      }
    } catch (error: any) {
      console.error(error);
      // Handle error response
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.response?.data?.errorMessage ||
        error?.message ||
        'An error occurred while processing your request.';
      setModalState({
        isOpen: true,
        type: 'reject',
        title: 'Error',
        message: errorMessage,
        listBefore: [],
        listAfter: [],
      });
    } finally {
      setRejectModalOpen(false);
    }
  };

  const handleModalClose = () => {
    setModalState((prev) => {
      // Redirect based on modification status after closing modal (for both approve and reject)
      if (prev.type === 'approve' || prev.type === 'reject') {
        // Use setTimeout to ensure modal closes before navigation
        setTimeout(() => {
          if (isModification) {
            navigate('/re/sub-user-management/user/list/modify');
          } else {
            navigate('/re/sub-user-management/user/list/create');
          }
        }, 100);
      }
      return { ...prev, isOpen: false };
    });
  };

  const [previousRegionCode, setPreviousRegionCode] = useState<string>('');

  // Fetch region address details when regionCode is available
  useEffect(() => {
    const fetchRegionAddress = async () => {
      // Reset flag if regionCode changed
      if (formData.regionCode !== previousRegionCode) {
        setRegionAddressFetched(false);
        setPreviousRegionCode(formData.regionCode);
      }

      // For IRA, IRU, IBU users, always fetch region details if regionCode is available
      const isRegionalUser =
        formData.userType === 'IRA' ||
        formData.userType === 'INSTITUTIONAL_REGIONAL_ADMIN' ||
        formData.userType === 'IRU' ||
        formData.userType === 'INSTITUTIONAL_REGIONAL_USER';
      //  ||
      // formData.userType === 'IBU' ||
      // formData.userType === 'INSTITUTIONAL_BRANCH_USER';

      const needsRegionName = !formData.regionName;
      const shouldFetch = isRegionalUser ? true : needsRegionName;

      if (formData.regionCode && !regionAddressFetched && shouldFetch) {
        try {
          const response = await Secured.get(
            API_ENDPOINTS.get_region_by_code(formData.regionCode)
          );

          if (response.data && response.data.success === true) {
            const regionData = response.data.data;
            const address = regionData?.address;

            if (regionData) {
              // Prefill region name and address fields from region data
              setFormData((prev) => {
                return {
                  ...prev,
                  // Always populate region name from API response
                  regionName: regionData.regionName || prev.regionName || '',
                  addressLine1: isRegionalUser
                    ? address?.line1 || ''
                    : address?.line1 || prev.addressLine1 || '',
                  addressLine2: isRegionalUser
                    ? address?.line2 || ''
                    : address?.line2 || prev.addressLine2 || '',
                  addressLine3: isRegionalUser
                    ? address?.line3 || ''
                    : address?.line3 || prev.addressLine3 || '',
                  country: isRegionalUser
                    ? address?.countryCode || address?.country || ''
                    : address?.countryCode ||
                      address?.country ||
                      prev.country ||
                      '',
                  stateUT: isRegionalUser
                    ? address?.state || ''
                    : address?.state || prev.stateUT || '',
                  district: isRegionalUser
                    ? address?.district || ''
                    : address?.district || prev.district || '',
                  cityTown: isRegionalUser
                    ? address?.cityTown || address?.city || ''
                    : address?.cityTown || address?.city || prev.cityTown || '',
                  pinCode: isRegionalUser
                    ? address?.pinCode || address?.pincode || ''
                    : address?.pinCode ||
                      address?.pincode ||
                      prev.pinCode ||
                      '',
                  pinCodeOther: isRegionalUser
                    ? address?.alternatePinCode ||
                      address?.alternatePincode ||
                      ''
                    : address?.alternatePinCode ||
                      address?.alternatePincode ||
                      prev.pinCodeOther ||
                      '',
                  digipin: isRegionalUser
                    ? address?.digiPin || address?.digipin || ''
                    : address?.digiPin ||
                      address?.digipin ||
                      prev.digipin ||
                      '',
                };
              });
              setRegionAddressFetched(true);

              setTimeout(() => {}, 100);
            }
          } else {
            console.error('Failed to fetch region address:', response.data);
          }
        } catch (error) {
          console.error('Error fetching region address:', error);
        }
      }
    };

    fetchRegionAddress();
  }, [
    formData.regionCode,
    formData.regionName,
    formData.userType,
    formData.addressLine1,
    formData.country,
    formData.stateUT,
    formData.district,
    formData.cityTown,
    regionAddressFetched,
    previousRegionCode,
  ]);

  // Debug: Watch regionName changes
  useEffect(() => {}, [formData.regionName]);

  // const handleDateChange = (newValue: dayjs.Dayjs | null) => {
  //   if (newValue) {
  //     setFormData((prev) => ({ ...prev, dateOfBirth: newValue }));
  //   }
  // };

  // Helper function to check if a field should be highlighted
  const shouldHighlightField = (fieldName: string): boolean => {
    return isModification && userDetailsFields.has(fieldName);
  };

  // Breadcrumb data
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'User', path: '/re/sub-user-management/user' },
    {
      label: isModification ? 'Modification' : 'Creation',
      path: isModification
        ? '/re/sub-user-management/user/list/modify'
        : '/re/sub-user-management/user/list/create',
    },
    { label: 'Approval' },
  ];

  const renderField = (children: React.ReactNode) => (
    <Box sx={styles.formFieldStyles}>{children}</Box>
  );

  // Helper function to get country name from code
  const getCountryName = (countryCode: string | undefined): string => {
    if (!countryCode) return '-';
    const country = allCountries.find(
      (c) => c.code.toUpperCase() === countryCode.toUpperCase()
    );
    return country ? country.name : countryCode;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <styles.FormContainer>
        {/* Breadcrumb and Back Button - Top */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          {/* Breadcrumb */}
          <Box sx={{ flex: 1 }}>
            <NavigationBreadCrumb crumbsData={crumbsData} />
          </Box>
          {/* Back Button - Top Right */}
          <Box>
            <Button
              startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
              onClick={() => navigate(-1)}
              sx={{
                color: '#1A1A1A',
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Back
            </Button>
          </Box>
        </Box>
        <Typography variant="h5" sx={styles.headerStyles}>
          {isModification
            ? 'User Modification Request'
            : 'New User Creation Request'}
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <Grid container spacing={2} sx={{ p: 2 }}>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                {renderField(
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={
                        shouldHighlightField('role')
                          ? styles.highlightedLabelStyles
                          : styles.labelStyles
                      }
                    >
                      User role <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      name="userRole"
                      value={formData?.userType || '-'}
                      placeholder="Enter User Role"
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                      sx={styles.textFieldStyles}
                      disabled
                    />
                  </>
                )}
              </Grid>
              {/* Show Region name for IRA, IRU, and IBU roles */}
              {(formData?.userType === 'IRA' ||
                formData?.userType === 'IRU' ||
                formData?.userType === 'IBU') && (
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  {renderField(
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={
                          shouldHighlightField('regionName')
                            ? styles.highlightedLabelStyles
                            : styles.labelStyles
                        }
                      >
                        Region name <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        name="regionName"
                        value={formData?.regionName || '-'}
                        placeholder="Enter Region Name"
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                        sx={styles.textFieldStyles}
                        disabled
                      />
                    </>
                  )}
                </Grid>
              )}
              {/* Show Branch name for IBU role */}
              {formData?.userType === 'IBU' && (
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  {renderField(
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={
                          shouldHighlightField('branchName')
                            ? styles.highlightedLabelStyles
                            : styles.labelStyles
                        }
                      >
                        Branch name <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        name="branchName"
                        value={formData?.branchName || '-'}
                        placeholder="Enter Branch Name"
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                        sx={styles.textFieldStyles}
                        disabled
                      />
                    </>
                  )}
                </Grid>
              )}
              {/* Placeholder for alignment when IBU doesn't show branch */}
              {formData?.userType !== 'IBU' && renderField(<Box />)}
            </Grid>

            <Accordion defaultExpanded sx={styles.accordionStyles}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>User Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('citizenship')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Citizenship <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="citizenship"
                          value={formData?.citizenship || '-'}
                          placeholder="Enter Citizenship"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('ckycNumber')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          CKYC Number <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="ckycNumber"
                          value={formData?.ckycNumber || '-'}
                          placeholder="Enter CKYC Number"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('title')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Title <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          select
                          fullWidth
                          name="title"
                          value={formData?.title || '-'}
                          placeholder="Enter Title"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        >
                          <MenuItem value="Mr.">Mr.</MenuItem>
                          <MenuItem value="Mrs.">Mrs.</MenuItem>
                          <MenuItem value="Ms.">Ms.</MenuItem>
                        </TextField>
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('firstName')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          First Name <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="firstName"
                          value={formData?.firstName || '-'}
                          placeholder="Enter First Name"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('middleName')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Middle Name
                        </Typography>
                        <TextField
                          fullWidth
                          name="middleName"
                          value={formData?.middleName || '-'}
                          placeholder="Enter Middle Name"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('lastName')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Last Name
                        </Typography>
                        <TextField
                          fullWidth
                          name="lastName"
                          value={formData?.lastName || '-'}
                          placeholder="Enter Last Name"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
                {/* Row 3: Gender | Date of Birth | Designation */}
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('gender')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Gender <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          select
                          fullWidth
                          name="gender"
                          value={formData?.gender || '-'}
                          placeholder="Enter Gender"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('dob')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Date of Birth <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          disabled
                          name="dob"
                          value={formData?.dob || '-'}
                          placeholder="Enter Date of Birth"
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('designation')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Designation <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="designation"
                          value={formData?.designation || '-'}
                          placeholder="Enter Designation"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
                {/* Row 4: Employee Code | Email | Country Code */}
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('employeeCode')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Employee Code <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="employeeId"
                          value={formData?.employeeId || '-'}
                          placeholder="Enter Employee Code"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('email')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Email <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="email"
                          value={formData?.emailAddress || '-'}
                          placeholder="Enter Email"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('countryCode')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Country Code <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="countryCode"
                          value={formData?.countryCode || '-'}
                          placeholder="Enter Country Code"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
                {/* Row 5: Mobile Number | Proof of Identity | Proof of Identity Number */}
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('mobile')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Mobile Number <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="mobileNumber"
                          value={formData?.mobileNumber || '-'}
                          placeholder="Enter Mobile Number"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('proofOfIdentity')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Proof of Identity{' '}
                          <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="proofOfIdentity"
                          value={formatProofOfIdentity(formData?.poi) || '-'}
                          placeholder="Enter Proof of Identity"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('proofOfIdentityNumber')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Proof of Identity Number
                        </Typography>
                        <TextField
                          fullWidth
                          name="proofOfIdentityNumber"
                          value={formData?.poiNumber || '-'}
                          placeholder="Enter Proof of Identity Number"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded sx={styles.accordionStyles}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>User Address Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Office Address - Only show for Institutional User (IU) */}
                {formData?.userType === 'IU' && (
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      {renderField(
                        <>
                          <Typography
                            variant="subtitle2"
                            sx={
                              shouldHighlightField('sameAsRegisteredAddress')
                                ? styles.highlightedLabelStyles
                                : styles.labelStyles
                            }
                          >
                            Office Address{' '}
                            <span style={{ color: 'red' }}>*</span>
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            name="officeAddress"
                            value={formData?.officeAddress || '-'}
                            placeholder="Enter Office Address"
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                officeAddress: selectedValue,
                              }));

                              // Find the selected address and populate form fields
                              if (
                                selectedValue &&
                                officeAddressData.length > 0
                              ) {
                                const selectedAddress = officeAddressData.find(
                                  (addr) =>
                                    (
                                      addr.address_type || addr.addressType
                                    )?.toLowerCase() ===
                                    selectedValue.toLowerCase()
                                );
                                if (selectedAddress) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    officeAddress: selectedValue,
                                    addressLine1:
                                      selectedAddress.line1 ||
                                      prev.addressLine1 ||
                                      '-',
                                    addressLine2:
                                      selectedAddress.line2 ||
                                      selectedAddress.line_2 ||
                                      prev.addressLine2 ||
                                      '-',
                                    addressLine3:
                                      selectedAddress.line3 ||
                                      selectedAddress.line_3 ||
                                      prev.addressLine3 ||
                                      '-',
                                    country:
                                      selectedAddress.country ||
                                      selectedAddress.countryCode ||
                                      prev.country ||
                                      '-',
                                    stateUT:
                                      selectedAddress.state ||
                                      prev.stateUT ||
                                      '-',
                                    district:
                                      selectedAddress.district ||
                                      prev.district ||
                                      '-',
                                    cityTown:
                                      selectedAddress.city ||
                                      selectedAddress.cityTown ||
                                      prev.cityTown ||
                                      '-',
                                    pinCode:
                                      selectedAddress.pincode ||
                                      selectedAddress.pin_code ||
                                      prev.pinCode ||
                                      '-',
                                    pinCodeOther:
                                      selectedAddress.pincode_other ||
                                      prev.pinCodeOther ||
                                      '-',
                                    digipin:
                                      selectedAddress.digipin ||
                                      selectedAddress.digi_pin ||
                                      prev.digipin ||
                                      '-',
                                  }));
                                }
                              }
                            }}
                            variant="outlined"
                            size="small"
                            sx={styles.textFieldStyles}
                            disabled
                          >
                            {officeAddressLoading ? (
                              <MenuItem disabled>
                                Loading address data...
                              </MenuItem>
                            ) : officeAddressData &&
                              officeAddressData.length > 0 ? (
                              officeAddressData.map((address) => {
                                const addressType =
                                  address.address_type || address.addressType;
                                return (
                                  <MenuItem
                                    key={addressType?.toLowerCase() || ''}
                                    value={addressType?.toLowerCase() || ''}
                                  >
                                    {addressType === 'REGISTERED'
                                      ? 'Registered Address'
                                      : addressType === 'CORRESPONDENCE'
                                        ? 'Correspondence Address'
                                        : addressType}
                                  </MenuItem>
                                );
                              })
                            ) : (
                              <MenuItem disabled>
                                No addresses available
                              </MenuItem>
                            )}
                          </TextField>
                        </>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}></Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}></Grid>
                  </Grid>
                )}
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('addressLine1')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Address Line 1 <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="addressLine1"
                          value={formData?.addressLine1 || '-'}
                          placeholder="Enter Address Line 1"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('addressLine2')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Address Line 2
                        </Typography>
                        <TextField
                          fullWidth
                          name="addressLine2"
                          value={formData?.addressLine2 || '-'}
                          placeholder="Enter Address Line 2"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('addressLine3')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Address Line 3
                        </Typography>
                        <TextField
                          fullWidth
                          name="addressLine3"
                          value={formData?.addressLine3 || '-'}
                          placeholder="Enter Address Line 3"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('country')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Country <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="country"
                          value={getCountryName(formData?.country)}
                          placeholder="Enter Country"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('stateUT')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          State / UT{' '}
                          {(formData?.country === 'IN' ||
                            formData?.country === 'India' ||
                            !formData?.country) && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          name="stateUT"
                          value={formData?.stateUT || '-'}
                          placeholder="Enter State / UT"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('district')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          District{' '}
                          {(formData?.country === 'IN' ||
                            formData?.country === 'India' ||
                            !formData?.country) && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          name="district"
                          value={formData?.district || '-'}
                          placeholder="Enter District"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('cityTown')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          City/Town{' '}
                          {(formData?.country === 'IN' ||
                            formData?.country === 'India' ||
                            !formData?.country) && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          name="cityTown"
                          value={formData?.cityTown || '-'}
                          placeholder="Enter City/Town"
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('pinCode')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Pin Code{' '}
                          {(formData?.country === 'IN' ||
                            formData?.country === 'India' ||
                            !formData?.country) && (
                            <span style={{ color: 'red' }}>*</span>
                          )}
                        </Typography>
                        <TextField
                          fullWidth
                          name="pinCode"
                          value={
                            formData?.pinCode === '000000'
                              ? 'Other'
                              : formData?.pinCode || '-'
                          }
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          placeholder="Enter Pin Code"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                  {/* Show Pin Code (in case of others) only if main pinCode is 000000 */}
                  {(formData?.pinCode === '000000' ||
                    formData?.pinCode === '0') && (
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      {renderField(
                        <>
                          <Typography
                            variant="subtitle2"
                            sx={
                              shouldHighlightField('pinCodeOther')
                                ? styles.highlightedLabelStyles
                                : styles.labelStyles
                            }
                          >
                            Pin Code (in case of others)
                          </Typography>
                          <TextField
                            fullWidth
                            name="pinCodeOther"
                            value={formData?.pinCodeOther || '-'}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            placeholder="Enter Pin Code"
                            sx={styles.textFieldStyles}
                            disabled
                          />
                        </>
                      )}
                    </Grid>
                  )}
                  {/* Always show Digipin */}
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                    {renderField(
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={
                            shouldHighlightField('digipin')
                              ? styles.highlightedLabelStyles
                              : styles.labelStyles
                          }
                        >
                          Digipin
                        </Typography>
                        <TextField
                          fullWidth
                          name="digipin"
                          value={formData?.digipin || '-'}
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          placeholder="Enter Digipin"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <styles.ActionButtonsContainer>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {isModification && (
              <Typography
                component="span"
                onClick={handleFetchPreviousVersion}
                sx={{
                  color: '#002CBA',
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#1565c0',
                  },
                }}
              >
                View Previous Version
              </Typography>
            )}
            {!isModification && <Box />}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ActionButtons
                onApprove={handleApprove}
                onReject={handleRejectClick}
              />
            </Box>
          </Box>
        </styles.ActionButtonsContainer>
      </styles.FormContainer>

      <DecisionModal
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        listBefore={modalState.listBefore}
        listAfter={modalState.listAfter}
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
      />

      <RejectConfirmationModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleRejectConfirm}
        title={
          isModification
            ? 'Are you sure you want to reject user modification request?'
            : 'Are you sure you want to reject new user creation request?'
        }
        remarkLabel="Remark"
        remarkPlaceholder="Type your Remark here"
        cancelLabel="Cancel"
        submitLabel="Submit"
      />

      {/* Previous Version Modal */}
      <Dialog
        open={previousVersionModalOpen}
        onClose={() => setPreviousVersionModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Gilroy, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            pb: 2,
          }}
        >
          {/* <Typography
            sx={{
              fontFamily: 'Gilroy, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#1A1A1A',
            }}
          >
            Previous User Details
          </Typography> */}
          <IconButton
            onClick={() => setPreviousVersionModalOpen(false)}
            sx={{
              padding: 0,
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <CloseIcon sx={{ color: '#1A1A1A' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {previousVersionLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography
                sx={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '14px',
                  color: '#1A1A1A',
                }}
              >
                Loading previous version data...
              </Typography>
            </Box>
          ) : previousVersionData ? (
            <Box>
              {/* Previous User Details Section */}
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  mb: 2,
                }}
              >
                Previous User Details
              </Typography>
              <Grid container spacing={2} sx={{ p: 2, mb: 3 }}>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={styles.labelStyles}>
                      User Role
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={
                        previousVersionData?.userType
                          ? getUserRoleDisplayName(previousVersionData.userType)
                          : '-'
                      }
                      placeholder="Enter User Role"
                      size="small"
                      sx={styles.textFieldStyles}
                      disabled
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={styles.labelStyles}>
                      Region Name
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={previousVersionData?.region || '-'}
                      placeholder="Enter Region Name"
                      size="small"
                      sx={styles.textFieldStyles}
                      disabled
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={styles.labelStyles}>
                      Branch Name
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={previousVersionData?.branchName || '-'}
                      placeholder="Enter Branch Name"
                      size="small"
                      sx={styles.textFieldStyles}
                      disabled
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* User Details Section */}
              <Accordion defaultExpanded sx={styles.accordionStyles}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>User Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Citizenship
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.citizenship || '-'}
                          placeholder="Enter Citizenship"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          CKYC Number
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.ckycNo || '-'}
                          placeholder="Enter CKYC Number"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Title
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.title || '-'}
                          placeholder="Enter Title"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          First Name
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.firstName || '-'}
                          placeholder="Enter First Name"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Middle Name
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.middleName || '-'}
                          placeholder="Enter Middle Name"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Last Name
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.lastName || '-'}
                          placeholder="Enter Last Name"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Gender
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.gender || '-'}
                          placeholder="Enter Gender"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Date of Birth
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.dob || '-'}
                          placeholder="Enter Date of Birth"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Designation
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.designation || '-'}
                          placeholder="Enter Designation"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Employee Code
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.employeeId || '-'}
                          placeholder="Enter Employee Code"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Email
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.email || '-'}
                          placeholder="Enter Email"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Country Code
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.countryCode || '-'}
                          placeholder="Enter Country Code"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Mobile Number
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.mobile || '-'}
                          placeholder="Enter Mobile Number"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Proof of Identity
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={formatProofOfIdentity(
                            previousVersionData?.poi || '-'
                          )}
                          placeholder="Enter Proof of Identity"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Proof of Identity Number
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={previousVersionData?.poiNumber || '-'}
                          placeholder="Enter Proof of Identity Number"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* User Address Details Section */}
              <Accordion defaultExpanded sx={styles.accordionStyles}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>User Address Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Office Address - Only show for Institutional User (IU) */}
                  {previousVersionData?.userType === 'IU' && (
                    <Grid container spacing={2} sx={{ p: 2 }}>
                      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={styles.labelStyles}
                          >
                            Office Address
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            value={previousVersionData?.officeAddress || '-'}
                            placeholder="Select Office Address"
                            size="small"
                            sx={styles.textFieldStyles}
                            disabled
                          />
                        </Box>
                      </Grid>
                      <Grid
                        size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}
                      ></Grid>
                      <Grid
                        size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}
                      ></Grid>
                    </Grid>
                  )}
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Address Line 1
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.addressResponseDto?.line1 ||
                            '-'
                          }
                          placeholder="Enter Address Line 1"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Address Line 2
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.addressResponseDto?.line2 ||
                            '-'
                          }
                          placeholder="Enter Address Line 2"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Address Line 3
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.addressResponseDto?.line3 ||
                            '-'
                          }
                          placeholder="Enter Address Line 3"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Country
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={getCountryName(
                            previousVersionData?.addressResponseDto?.country
                          )}
                          placeholder="Enter Country"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          State / UT
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.addressResponseDto?.state ||
                            '-'
                          }
                          placeholder="Enter State / UT"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          District
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.addressResponseDto?.district ||
                            '-'
                          }
                          placeholder="Enter District"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          City/Town
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.addressResponseDto?.city || '-'
                          }
                          placeholder="Enter City/Town"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Pin Code
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.addressResponseDto?.pincode ===
                            '000000'
                              ? 'Other'
                              : previousVersionData?.addressResponseDto
                                  ?.pincode || '-'
                          }
                          placeholder="Enter Pin Code"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                    {/* Show Pin Code (in case of others) only if main pinCode is 000000 */}
                    {previousVersionData?.addressResponseDto?.pincode ===
                      '000000' && (
                      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={styles.labelStyles}
                          >
                            Pin Code (in case of others)
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            value={
                              previousVersionData?.addressResponseDto
                                ?.alternatePincode || '-'
                            }
                            placeholder="Enter Pin Code"
                            size="small"
                            sx={styles.textFieldStyles}
                            disabled
                          />
                        </Box>
                      </Grid>
                    )}
                    {/* Always show Digipin */}
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={styles.labelStyles}>
                          Digipin
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={
                            previousVersionData?.addressResponseDto?.digipin ||
                            '-'
                          }
                          placeholder="Enter Digipin"
                          size="small"
                          sx={styles.textFieldStyles}
                          disabled
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '14px',
                  color: '#1A1A1A',
                }}
              >
                No previous version data available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'flex-end',
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={() => setPreviousVersionModalOpen(false)}
            sx={{
              backgroundColor: '#002CBA',
              color: 'white',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'Gilroy, sans-serif',
              minWidth: '100px',
              '&:hover': {
                backgroundColor: '#0022A3',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default NewUserCreationRequest;
