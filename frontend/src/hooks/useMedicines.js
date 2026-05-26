import { fetchConditionMedicines, fetchConditions, fetchMedicineDetail } from '../api/medicines';

export default function useMedicines() {
  return {
    fetchConditions,
    fetchConditionMedicines,
    fetchMedicineDetail,
  };
}
