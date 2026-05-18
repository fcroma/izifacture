export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Company {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
}

export interface Client {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
}

export interface Invoice {
  id: string;
  company_id: string;
  client_id?: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string;
  notes?: string;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  client?: Client;
  items?: InvoiceItem[];
}
