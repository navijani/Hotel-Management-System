import axios from 'axios';

export interface HotelBranch {
  branch_id: number;
  branch_name: string;
  city: string;
}

export const fetchBranches = async (): Promise<HotelBranch[]> => {
  const response = await axios.get<HotelBranch[]>('/api/branches');
  if (!Array.isArray(response.data)) {
    throw new Error('The branch service returned an invalid response.');
  }
  return response.data;
};
