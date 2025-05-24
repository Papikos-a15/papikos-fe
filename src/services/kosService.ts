import api from "@/libs/axios/api";
import { AxiosRequestConfig } from "axios";

export interface Kos {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  description: string;
  maxCapacity: number;
  availableRooms: number;
  price: number;
  isAvailable: boolean;
}

export interface AddKosPayload {
  ownerId: string;
  name: string;
  address: string;
  description: string;
  maxCapacity: number;
  price: number;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const addKos = async (
  kos: AddKosPayload,
  token: string,
): Promise<AddKosPayload> => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const response = await api.post(`${baseUrl}/management/add`, kos, config);
  if (response.status === 201) {
    return response.data;
  } else {
    throw new Error("Failed to add kos");
  }
};

export const fetchKosList = async (token: string): Promise<Kos[]> => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.get(`${baseUrl}/management/list`, config);
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to fetch kos list");
  }
};

export const updateKos = async (
  id: string,
  kos: Omit<Kos, "id">,
  token: string,
): Promise<Kos> => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const response = await api.put(
    `${baseUrl}/management/update/${id}`,
    kos,
    config,
  );
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to update kos");
  }
};

export const deleteKos = async (id: string, token: string): Promise<void> => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.delete(
    `${baseUrl}/management/delete/${id}`,
    config,
  );
  if (response.status !== 204) {
    throw new Error("Failed to delete kos");
  }
};
