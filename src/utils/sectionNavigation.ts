// utils/sectionNavigation.ts
// 1. Section to Route Mapping based on your actual routes
export const SECTION_ROUTE_MAP: Record<string, string> = {
  'Reporting Entity': '/re-register',
  'Registered Address': '/re-address-details',
  'Correspondence Address': '/re-address-details', // Both address types in same component
  'Head of Institution': '/re-institution-details',
  'Nodal Officer': '/re-nodal-officer-details',
  'Admin User One': '/re-institutional-admin-details',
  'Admin User Two': '/re-institutional-admin-details', // Both admin users in same component
};

// 2. Define the order of sections (priority for navigation)
export const SECTION_ORDER: string[] = [
  'Reporting Entity',
  'Registered Address',
  'Correspondence Address',
  'Head of Institution',
  'Nodal Officer',
  'Admin User One',
  'Admin User Two',
];

// 3. Helper function to get next section to navigate to
export const getNextSectionToNavigate = (
  pendingSections: string[]
): string | null => {
  if (!pendingSections || pendingSections.length === 0) {
    return null;
  }

  // Find the first pending section based on our defined order
  for (const section of SECTION_ORDER) {
    if (pendingSections.includes(section)) {
      return section;
    }
  }

  // If no match found in order, return the first pending section
  return pendingSections[0];
};

// 4. Helper function to get route for a section
export const getRouteForSection = (section: string): string | null => {
  return SECTION_ROUTE_MAP[section] || null;
};

// 5. Helper function to get next route to navigate to
export const getNextRoute = (pendingSections: string[]): string | null => {
  const nextSection = getNextSectionToNavigate(pendingSections);
  return nextSection ? getRouteForSection(nextSection) : null;
};

// 6. Helper function to check if a section is complete
export const isSectionComplete = (
  section: string,
  pendingSections: string[]
): boolean => {
  return !pendingSections.includes(section);
};

// 7. Helper function to get completion status for all sections
export const getSectionCompletionStatus = (
  pendingSections: string[]
): Record<string, boolean> => {
  return SECTION_ORDER.reduce(
    (acc, section) => {
      acc[section] = isSectionComplete(section, pendingSections);
      return acc;
    },
    {} as Record<string, boolean>
  );
};
