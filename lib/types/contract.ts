/**
 * Tipos TypeScript para la entidad Contract del frontend
 * Basado en la entidad Contract del backend
 */

import { Currency } from "./work";

export interface Contract {
  id: string;
  work_id: string;
  supplier_id: string;
  rubric_id: string;
  amount_total: number;
  amount_executed: number;
  currency: Currency;
  file_url?: string;
  payment_terms?: string;
  is_blocked: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContractData {
  work_id: string;
  supplier_id: string;
  rubric_id: string;
  amount_total: number;
  amount_executed?: number;
  currency: Currency;
  file_url?: string;
  payment_terms?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateContractData {
  supplier_id?: string;
  rubric_id?: string;
  amount_total?: number;
  amount_executed?: number;
  currency?: Currency;
  file_url?: string;
  payment_terms?: string;
  is_blocked?: boolean;
  start_date?: string;
  end_date?: string;
}

