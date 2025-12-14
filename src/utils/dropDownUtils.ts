// Define interfaces for the data structures
interface Regulator {
  code: string;
  name: string;
  status: string;
}

interface Constitution {
  code: string;
  name: string;
  status: string;
}

interface InstitutionType {
  code: string;
  name: string;
  status: string;
}

interface InstitutionTypeGroup {
  regulator: string;
  types: InstitutionType[];
}

interface SelectOption {
  value: string;
  label: string;
}

export const formatRegulatorsForSelect = (
  regulators: Regulator[]
): SelectOption[] => {
  return regulators
    .filter((reg) => reg.status === 'ACTIVE')
    .map((reg) => ({
      value: reg.code,
      label: reg.name,
    }));
};

export const formatConstitutionsForSelect = (
  constitutions: Constitution[]
): SelectOption[] => {
  return constitutions
    .filter((constitution) => constitution.status === 'ACTIVE') // Fixed: 'const' is a reserved word
    .map((constitution) => ({
      value: constitution.code,
      label: constitution.name,
    }));
};

export const formatInstitutionTypesForSelect = (
  institutionTypes: InstitutionTypeGroup[],
  selectedRegulator: string | undefined
): SelectOption[] => {
  if (!selectedRegulator) return [];

  const regulatorTypes = institutionTypes.find(
    (item) => item.regulator === selectedRegulator
  );

  if (!regulatorTypes) return [];

  return regulatorTypes.types
    .filter((type) => type.status === 'ACTIVE')
    .map((type) => ({
      value: type.name,
      label: type.name,
    }));
};
