import { Client, Invoice } from "@/types";

export const mockClients: Client[] = [
  {
    id: "c1",
    company_id: "co1",
    name: "Agence Cansaas",
    email: "contact@cansaas.com",
    phone: "+221 77 123 45 67",
    address: "15 Rue Carnot, Dakar, Sénégal",
  },
  {
    id: "c2",
    company_id: "co1",
    name: "TechHub Abidjan",
    email: "info@techhub-abi.ci",
    phone: "+225 07 456 78 90",
    address: "Plateau, Abidjan, Côte d'Ivoire",
  },
  {
    id: "c3",
    company_id: "co1",
    name: "Diallo & Associés",
    email: "diallo@associes.sn",
    phone: "+221 70 987 65 43",
    address: "Almadies, Dakar, Sénégal",
  },
  {
    id: "c4",
    company_id: "co1",
    name: "Koffi Consulting",
    email: "koffi@consulting.ci",
    phone: "+225 05 321 65 87",
    address: "Cocody, Abidjan, Côte d'Ivoire",
  },
  {
    id: "c5",
    company_id: "co1",
    name: "Groupe Ndiaye",
    email: "groupe@ndiaye.sn",
    phone: "+221 76 654 32 10",
    address: "Ouakam, Dakar, Sénégal",
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv1",
    company_id: "co1",
    client_id: "c1",
    invoice_number: "INV-202601-001",
    status: "paid",
    issue_date: "2026-01-08",
    due_date: "2026-01-31",
    subtotal: 500000,
    vat_rate: 18,
    vat_amount: 90000,
    total: 590000,
    client: mockClients[0],
    items: [
      { id: "i1", invoice_id: "inv1", description: "Brand Guidelines", quantity: 2, unit_price: 150000, amount: 300000, sort_order: 0 },
      { id: "i2", invoice_id: "inv1", description: "Logo Design", quantity: 1, unit_price: 200000, amount: 200000, sort_order: 1 },
    ],
  },
  {
    id: "inv2",
    company_id: "co1",
    client_id: "c2",
    invoice_number: "INV-202601-002",
    status: "sent",
    issue_date: "2026-01-15",
    due_date: "2026-02-15",
    subtotal: 350000,
    vat_rate: 18,
    vat_amount: 63000,
    total: 413000,
    client: mockClients[1],
    items: [
      { id: "i3", invoice_id: "inv2", description: "Développement Web", quantity: 1, unit_price: 350000, amount: 350000, sort_order: 0 },
    ],
  },
  {
    id: "inv3",
    company_id: "co1",
    client_id: "c3",
    invoice_number: "INV-202601-003",
    status: "overdue",
    issue_date: "2025-12-01",
    due_date: "2026-01-01",
    subtotal: 180000,
    vat_rate: 18,
    vat_amount: 32400,
    total: 212400,
    client: mockClients[2],
    items: [
      { id: "i4", invoice_id: "inv3", description: "Audit Comptable", quantity: 3, unit_price: 60000, amount: 180000, sort_order: 0 },
    ],
  },
  {
    id: "inv4",
    company_id: "co1",
    client_id: "c4",
    invoice_number: "INV-202602-001",
    status: "draft",
    issue_date: "2026-02-01",
    due_date: "2026-03-01",
    subtotal: 750000,
    vat_rate: 18,
    vat_amount: 135000,
    total: 885000,
    client: mockClients[3],
    items: [
      { id: "i5", invoice_id: "inv4", description: "Stratégie Marketing", quantity: 1, unit_price: 500000, amount: 500000, sort_order: 0 },
      { id: "i6", invoice_id: "inv4", description: "Gestion Réseaux Sociaux", quantity: 5, unit_price: 50000, amount: 250000, sort_order: 1 },
    ],
  },
  {
    id: "inv5",
    company_id: "co1",
    client_id: "c5",
    invoice_number: "INV-202602-002",
    status: "paid",
    issue_date: "2026-02-10",
    due_date: "2026-02-28",
    subtotal: 220000,
    vat_rate: 18,
    vat_amount: 39600,
    total: 259600,
    client: mockClients[4],
    items: [
      { id: "i7", invoice_id: "inv5", description: "Formation Équipe", quantity: 2, unit_price: 110000, amount: 220000, sort_order: 0 },
    ],
  },
  {
    id: "inv6",
    company_id: "co1",
    client_id: "c1",
    invoice_number: "INV-202603-001",
    status: "sent",
    issue_date: "2026-03-05",
    due_date: "2026-04-05",
    subtotal: 400000,
    vat_rate: 18,
    vat_amount: 72000,
    total: 472000,
    client: mockClients[0],
    items: [
      { id: "i8", invoice_id: "inv6", description: "Refonte Site Web", quantity: 1, unit_price: 400000, amount: 400000, sort_order: 0 },
    ],
  },
];

export const mockCompany = {
  id: "co1",
  user_id: "u1",
  name: "Izifacture SARL",
  email: "contact@izifacture.sn",
  phone: "+221 33 800 00 00",
  address: "2 Rue du Commerce, Dakar, Sénégal",
};

export function getDashboardStats() {
  const total = mockInvoices.length;
  const totalAmount = mockInvoices.reduce((s, i) => s + i.total, 0);
  const paidAmount = mockInvoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const pendingAmount = mockInvoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.total, 0);
  return { total, totalAmount, paidAmount, pendingAmount };
}
