import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Box,
  Typography,
} from '@mui/material';

interface SubModule {
  id: string;
  name: string;
  selected: boolean;
  superAdmin: boolean; // Y or N from table
  admin: boolean; // Y or N from table
  operationalUser: boolean; // Y or N from table
}

interface Module {
  srNo: string;
  module: string;
  subModules: SubModule[];
}

interface SelectFunctionalitiesProps {
  disabled?: boolean;
  isViewMode?: boolean;
  userRole?: string; // Super_Admin_User, Admin_User, Operational_User
  selectedFunctionalities?: Record<string, string[]>; // Pre-selected functionalities from API
  onFunctionalitiesChange?: (functionalities: Record<string, string[]>) => void; // Callback to update parent
}

const SelectFunctionalities: React.FC<SelectFunctionalitiesProps> = ({
  disabled = false,
  isViewMode = false,
  userRole = 'Super_Admin_User',
  selectedFunctionalities = {},
  onFunctionalitiesChange,
}) => {
  console.log('🎯 SelectFunctionalities component rendered');
  console.log('🎯 Props received:', {
    disabled,
    isViewMode,
    userRole,
    selectedFunctionalities,
  });
  console.log(
    '🎯 selectedFunctionalities keys:',
    Object.keys(selectedFunctionalities)
  );
  const initialModules: Module[] = useMemo(
    () => [
      {
        srNo: '01',
        module: 'My Task',
        subModules: [
          {
            id: '1',
            name: 'New RE registration/ re-submitted RE registration application',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: true,
          },
          {
            id: '2',
            name: 'RE update profile request',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: true,
          },
          {
            id: '3',
            name: 'RE Merger request',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: false,
          },
          {
            id: '4',
            name: 'RE deactivation request (Initiated by RE)',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: false,
          },
          {
            id: '5',
            name: 'RE deactivation/ suspension request (Initiated by CERSAI)',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: false,
          },
        ],
      },
      {
        srNo: '02',
        module: 'Dashboard',
        subModules: [
          {
            id: '1',
            name: 'Access to dashboard',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: true,
          },
        ],
      },
      {
        srNo: '03',
        module: 'RE management',
        subModules: [
          {
            id: '1',
            name: 'View RE details',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: true,
          },
          {
            id: '2',
            name: 'De-activate RE',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: false,
          },
          {
            id: '3',
            name: 'Suspend RE',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: false,
          },
          {
            id: '4',
            name: 'Revocation of suspension',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: false,
          },
          {
            id: '5',
            name: 'Nodal officer / IAUs Update',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: false,
          },
        ],
      },
      {
        srNo: '04',
        module: 'Master Management',
        subModules: [
          {
            id: '1',
            name: 'Dropdown Master',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '2',
            name: 'Geography masters',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '3',
            name: 'ISO Code masters',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
        ],
      },
      {
        srNo: '05',
        module: 'Sub-User management',
        subModules: [
          {
            id: '1',
            name: 'Create/modify User',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '2',
            name: 'De-activate user',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '3',
            name: 'Suspend user',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '4',
            name: 'Revocation of suspension of user',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
        ],
      },
      {
        srNo: '06',
        module: 'Billing Management System',
        subModules: [
          {
            id: '1',
            name: 'Balance Ledger',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: true,
          },
          {
            id: '2',
            name: 'Incentive claim process',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: true,
          },
          {
            id: '3',
            name: 'Refund request process',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: true,
          },
        ],
      },
      {
        srNo: '07',
        module: 'Content Management System',
        subModules: [
          {
            id: '1',
            name: 'Homepage content management',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '2',
            name: 'Download section management',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '3',
            name: 'FAQ management',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '4',
            name: 'SMS/Email template management',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '5',
            name: 'Invoice template management',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '6',
            name: 'Document validation settings',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '7',
            name: 'Charge management',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '8',
            name: 'Form validations',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: false,
          },
          {
            id: '9',
            name: 'Training Content',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: true,
          },
        ],
      },
      {
        srNo: '08',
        module: 'MIS Reports',
        subModules: [
          {
            id: '1',
            name: 'Access to MIS reports',
            selected: false,
            superAdmin: true,
            admin: true,
            operationalUser: true,
          },
        ],
      },
      {
        srNo: '09',
        module: 'Beneficial Owner (BO) Registry',
        subModules: [
          {
            id: '1',
            name: 'Access to BO Registry',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: true,
          },
        ],
      },
      {
        srNo: '10',
        module: 'Ticket Management',
        subModules: [
          {
            id: '1',
            name: 'Resolve assigned ticket',
            selected: false,
            superAdmin: false,
            admin: true,
            operationalUser: true,
          },
        ],
      },
    ],
    []
  );

  // Filter modules based on user role
  const filteredModules = useMemo(() => {
    return initialModules
      .map((module) => ({
        ...module,
        subModules: module.subModules.filter((subModule) => {
          // Check which role the user has and return only allowed sub-modules
          if (userRole === 'Super_Admin_User') {
            return subModule.superAdmin;
          } else if (userRole === 'Admin_User') {
            return subModule.admin;
          } else if (userRole === 'Operational_User') {
            return subModule.operationalUser;
          }
          return false; // Default: no access
        }),
      }))
      .filter((module) => module.subModules.length > 0); // Remove modules with no accessible sub-modules
  }, [initialModules, userRole]);

  const [modules, setModules] = useState<Module[]>(filteredModules);

  // Mapping from API codes to module and submodule names
  const API_TO_MODULE_MAP: Record<
    string,
    { module: string; subModuleName: string }
  > = {
    // MY_TASK module
    RE_REGISTRATION: {
      module: 'My Task',
      subModuleName:
        'New RE registration/ re-submitted RE registration application',
    },
    RE_UPDATE_PROFILE: {
      module: 'My Task',
      subModuleName: 'RE update profile request',
    },
    RE_MERGER: { module: 'My Task', subModuleName: 'RE Merger request' },
    RE_DEACTIVATION_BY_RE: {
      module: 'My Task',
      subModuleName: 'RE deactivation request (Initiated by RE)',
    },
    RE_DEACTIVATION_BY_CERSAI: {
      module: 'My Task',
      subModuleName:
        'RE deactivation/ suspension request (Initiated by CERSAI)',
    },

    // DASHBOARD module
    ACCESS_TO_DASHBOARD: {
      module: 'Dashboard',
      subModuleName: 'Access to dashboard',
    },

    // RE_MANAGEMENT module
    VIEW_RE_DETAILS: {
      module: 'RE management',
      subModuleName: 'View RE details',
    },
    DEACTIVATE_RE: { module: 'RE management', subModuleName: 'De-activate RE' },
    SUSPEND_RE: { module: 'RE management', subModuleName: 'Suspend RE' },
    REVOCATION_OF_RE: {
      module: 'RE management',
      subModuleName: 'Revocation of suspension',
    },
    NODAL_OFFICER_AND_IAU_UPDATE: {
      module: 'RE management',
      subModuleName: 'Nodal officer / IAUs Update',
    },

    // MASTER_MANAGEMENT module
    DROPDOWN_MASTER: {
      module: 'Master Management',
      subModuleName: 'Dropdown Master',
    },
    GEOGRAPHY_MASTERS: {
      module: 'Master Management',
      subModuleName: 'Geography masters',
    },
    ISO_CODE_MASTERS: {
      module: 'Master Management',
      subModuleName: 'ISO Code masters',
    },

    // SUB_USER_MANAGEMENT module
    CREATE_MODIFY_USER: {
      module: 'Sub-User management',
      subModuleName: 'Create/modify User',
    },
    DEACTIVATE_USER: {
      module: 'Sub-User management',
      subModuleName: 'De-activate user',
    },
    SUSPEND_USER: {
      module: 'Sub-User management',
      subModuleName: 'Suspend user',
    },
    REVOCATION_OF_SUSPEND_USER: {
      module: 'Sub-User management',
      subModuleName: 'Revocation of suspension of user',
    },

    // BILLING_MANAGEMENT_SYSTEM module
    BALANCE_LEDGER: {
      module: 'Billing Management System',
      subModuleName: 'Balance Ledger',
    },
    INCENTIVE_CLAIM_PROCESS: {
      module: 'Billing Management System',
      subModuleName: 'Incentive claim process',
    },
    REFUND_REQUEST_PROCESS: {
      module: 'Billing Management System',
      subModuleName: 'Refund request process',
    },

    // CONTENT_MANAGEMENT_SYSTEM module
    HOME_PAGE_CONTENT_MANAGEMENT: {
      module: 'Content Management System',
      subModuleName: 'Homepage content management',
    },
    DOWNLOAD_SECTION_MANAGEMENT: {
      module: 'Content Management System',
      subModuleName: 'Download section management',
    },
    FAQ_MANAGEMENT: {
      module: 'Content Management System',
      subModuleName: 'FAQ management',
    },
    SMS_AND_EMAIL_TEMPLATE_MANAGEMENT: {
      module: 'Content Management System',
      subModuleName: 'SMS/Email template management',
    },
    INVOICE_TEMPLATE_MANAGEMENT: {
      module: 'Content Management System',
      subModuleName: 'Invoice template management',
    },
    DOCUMENT_VALIDATION_SETTINGS: {
      module: 'Content Management System',
      subModuleName: 'Document validation settings',
    },
    CHARGE_MANAGEMENT: {
      module: 'Content Management System',
      subModuleName: 'Charge management',
    },
    FORM_VALIDATIONS: {
      module: 'Content Management System',
      subModuleName: 'Form validations',
    },
    TRAINING_CONTENT: {
      module: 'Content Management System',
      subModuleName: 'Training Content',
    },

    // MIS_REPORTS module
    ACCESS_TO_MIS_REPORTS: {
      module: 'MIS Reports',
      subModuleName: 'Access to MIS reports',
    },

    // BENEFICIAL_OWNER_REGISTRY module
    ACCESS_TO_BO_REGISTRY: {
      module: 'Beneficial Owner (BO) Registry',
      subModuleName: 'Access to BO Registry',
    },

    // TICKET_MANAGEMENT module
    RESOLVE_ASSIGNED_TICKET: {
      module: 'Ticket Management',
      subModuleName: 'Resolve assigned ticket',
    },
  };

  // Reverse mapping: from module name and submodule name to API code
  const MODULE_TO_API_MAP: Record<string, Record<string, string>> = {};
  Object.entries(API_TO_MODULE_MAP).forEach(
    ([apiCode, { module, subModuleName }]) => {
      if (!MODULE_TO_API_MAP[module]) {
        MODULE_TO_API_MAP[module] = {};
      }
      MODULE_TO_API_MAP[module][subModuleName] = apiCode;
    }
  );

  // Mapping from module display name to API module code
  const MODULE_NAME_TO_CODE: Record<string, string> = {
    'My Task': 'MY_TASK',
    Dashboard: 'DASHBOARD',
    'RE management': 'RE_MANAGEMENT',
    'Master Management': 'MASTER_MANAGEMENT',
    'Sub-User management': 'SUB_USER_MANAGEMENT',
    'Billing Management System': 'BILLING_MANAGEMENT_SYSTEM',
    'Content Management System': 'CONTENT_MANAGEMENT_SYSTEM',
    'MIS Reports': 'MIS_REPORTS',
    'Beneficial Owner (BO) Registry': 'BENEFICIAL_OWNER_REGISTRY',
    'Ticket Management': 'TICKET_MANAGEMENT',
  };

  // Initialize modules with pre-selected functionalities
  useEffect(() => {
    let modulesToSet = filteredModules;

    // If we have selected functionalities from API, pre-select them
    if (
      selectedFunctionalities &&
      Object.keys(selectedFunctionalities).length > 0
    ) {
      console.log('Pre-selecting functionalities:', selectedFunctionalities);

      modulesToSet = filteredModules.map((module) => ({
        ...module,
        subModules: module.subModules.map((subModule) => {
          // Check if this submodule should be selected based on API data
          let shouldSelect = false;

          // Iterate through all module keys in the API response
          Object.entries(selectedFunctionalities).forEach(
            ([moduleKey, subModuleCodes]) => {
              // Iterate through all submodule codes
              subModuleCodes.forEach((code) => {
                const mapping = API_TO_MODULE_MAP[code];
                if (mapping) {
                  console.log(
                    `Checking ${code}: API says "${mapping.module}" / "${mapping.subModuleName}" vs Current "${module.module}" / "${subModule.name}"`
                  );
                  if (
                    mapping.module === module.module &&
                    mapping.subModuleName === subModule.name
                  ) {
                    shouldSelect = true;
                    console.log(
                      `✅ MATCHED: ${code} -> ${module.module} / ${subModule.name}`
                    );
                  }
                } else {
                  console.warn(
                    `⚠️ No mapping found for code: ${code} in module: ${moduleKey}`
                  );
                }
              });
            }
          );

          return {
            ...subModule,
            selected: shouldSelect,
          };
        }),
      }));
    }

    setModules(modulesToSet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredModules, selectedFunctionalities]);

  const handleSubModuleToggle = (
    moduleIndex: number,
    subModuleIndex: number
  ) => {
    setModules((prev) => {
      const updated = [...prev];
      updated[moduleIndex].subModules[subModuleIndex].selected =
        !updated[moduleIndex].subModules[subModuleIndex].selected;

      // Convert updated modules to API format and notify parent
      if (onFunctionalitiesChange) {
        const apiFormat = convertModulesToApiFormat(updated);
        console.log(
          '🔄 Notifying parent with updated functionalities:',
          apiFormat
        );
        onFunctionalitiesChange(apiFormat);
      }

      return updated;
    });
  };

  // Helper function to convert module state to API format
  const convertModulesToApiFormat = (
    modulesData: Module[]
  ): Record<string, string[]> => {
    const result: Record<string, string[]> = {};

    modulesData.forEach((module) => {
      const moduleApiCode = MODULE_NAME_TO_CODE[module.module];
      if (!moduleApiCode) return;

      const selectedSubModules: string[] = [];
      module.subModules.forEach((subModule) => {
        if (subModule.selected) {
          const subModuleApiCode =
            MODULE_TO_API_MAP[module.module]?.[subModule.name];
          if (subModuleApiCode) {
            selectedSubModules.push(subModuleApiCode);
          }
        }
      });

      if (selectedSubModules.length > 0) {
        result[moduleApiCode] = selectedSubModules;
      }
    });

    return result;
  };

  return (
    <Box>
      <Typography
        component="label"
        sx={{
          fontFamily: 'Gilroy, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          color: '#000',
          display: 'block',
          mb: 1,
          '&::after': {
            content: '" *"',
            color: 'error.main',
          },
        }}
      >
        Select Functionalities
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <Table sx={{ minWidth: 650, width: '100%' }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#eef2ff' }}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontFamily: 'Gilroy, sans-serif',
                  py: 2,
                }}
              >
                Sr.No.
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontFamily: 'Gilroy, sans-serif',
                  py: 2,
                  textAlign: 'center',
                }}
              >
                Module
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontFamily: 'Gilroy, sans-serif',
                  py: 2,
                }}
              >
                Sub- Module
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontFamily: 'Gilroy, sans-serif',
                  py: 2,
                }}
              >
                Select
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modules.map((module, moduleIndex) => (
              <React.Fragment key={module.srNo}>
                {module.subModules.map((subModule, subModuleIndex) => (
                  <TableRow
                    key={`${module.srNo}-${subModule.id}`}
                    sx={{
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    {subModuleIndex === 0 && (
                      <TableCell
                        rowSpan={module.subModules.length}
                        sx={{
                          fontSize: '14px',
                          color: '#1a1a1a',
                          fontFamily: 'Gilroy, sans-serif',
                          borderRight: '1px solid #e0e0e0',
                          py: 1.25,
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {module.srNo}
                      </TableCell>
                    )}
                    {subModuleIndex === 0 && (
                      <TableCell
                        rowSpan={module.subModules.length}
                        sx={{
                          fontSize: '14px',
                          color: '#1a1a1a',
                          fontFamily: 'Gilroy, sans-serif',
                          borderRight: '1px solid #e0e0e0',
                          py: 1.25,
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {module.module}
                      </TableCell>
                    )}
                    <TableCell
                      sx={{
                        fontSize: '14px',
                        color: '#1a1a1a',
                        fontFamily: 'Gilroy, sans-serif',
                        borderRight: '1px solid #e0e0e0',
                        borderBottom:
                          subModuleIndex === module.subModules.length - 1
                            ? '1px solid #e0e0e0'
                            : 'none',
                        py: 1,
                      }}
                    >
                      {subModule.id}. {subModule.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1,
                        borderBottom:
                          subModuleIndex === module.subModules.length - 1
                            ? '1px solid #e0e0e0'
                            : 'none',
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={subModule.selected}
                        disabled={disabled}
                        onChange={() =>
                          handleSubModuleToggle(moduleIndex, subModuleIndex)
                        }
                        sx={{
                          color: 'rgba(0, 0, 0, 0.38)', // Grey for unchecked (default)
                          '&.Mui-checked': {
                            color: isViewMode ? '#000000' : '#4caf50', // Black in view mode, green in create mode
                          },
                          '& .MuiSvgIcon-root': {
                            fontSize: '18px',
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SelectFunctionalities;
