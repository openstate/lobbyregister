import { SBI_CODES } from '$lib/constants';

export const getSectorName = (sectorCode: string) => {
  return SBI_CODES.get(sectorCode) || sectorCode;
};
