import {
  selectModifiableFields,
  selectWorkflowPayload,
} from '../component/features/RERegistration/slice/workflowSlice';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export type ModifiableFields = Record<string, string[]>;

const MODS_KEY = 'modifiableFields';

const buildSet = (obj?: ModifiableFields): Set<string> => {
  if (!obj) return new Set();
  const all = Object.values(obj).flatMap((v) => (Array.isArray(v) ? v : []));
  return new Set(all);
};

/**
 * Custom hook to manage modifiable fields across the app.
 */
export function useModifiableFields() {
  const workflowPayload = useSelector(selectWorkflowPayload);
  const modifiableFields = useSelector(selectModifiableFields);
  //   const payloadMods = workflowPayload?.modifiableFields;

  const [modSet, setModSet] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(MODS_KEY);
      return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const payloadMods = workflowPayload?.modifiableFields as
    | Record<string, string[]>
    | undefined;

  useEffect(() => {
    if (!payloadMods) return;
    const next = buildSet(payloadMods);
    setModSet(next);
    try {
      localStorage.setItem(MODS_KEY, JSON.stringify([...next]));
    } catch (e) {
      console.error('localStorage write failed', e);
    }
  }, [payloadMods]);

  const isModifiableField = (fieldName: string): boolean => {
    // Check instant from localStorage state
    if (modSet.has(fieldName)) return true;
    const isModifiable = Object.values(modifiableFields).some((fields) => {
      if (Array.isArray(fields)) {
        const found = fields.includes(fieldName);
        return found;
      }
      return false;
    });

    return isModifiable;
  };

  return { isModifiableField };
}
