export enum Role {
  GENERAL_ADMIN = 'ADMINISTRADOR GERAL',
  STORE_ADMIN = 'ADMINISTRADOR LOJA',
  CD_ADMIN = 'ADMINISTRADOR CD',
}

export enum Store {
  ASA_NORTE = 'CLUBE ASA NORTE',
  SIA = 'CLUBE SIA',
  AGUAS_CLARAS = 'CLUBE AGUAS CLARAS',
  CD = 'CENTRO DE DISTRIBUIÇÃO', // For CD Admins
}

export enum Status {
  OPEN = 'ABERTO',
  IN_ANALYSIS = 'EM ANÁLISE',
  APPROVED = 'PROCEDENTE',
  REJECTED = 'NÃO PROCEDENTE',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  store: Store;
}

export interface Occurrence {
  id: string; // Protocolo
  title: string; // Used for search/summary
  description: string; // Observações
  productCode: string; // EAN/RMS generic reference
  productName: string; // Produto
  store: Store;
  reportedBy: string; // User ID
  reportedByName: string; // Usuário Registro
  status: Status;
  createdAt: string; // Data/Hora Reclamação
  updatedAt: string;
  cdComments?: string;
  cdDecisionBy?: string;
  cdDecisionByName?: string;
  aiAnalysis?: string;

  // Logistics Info
  receiptDate?: string; // Data/Hora Recebimento
  logisticsUnit?: string; // Un. Logística
  conjugatedDelivery?: string; // Entr. Conjugada (S/N)
  conjugatedStores?: string; // Lojas Conjugadas
  
  // Transport
  vehiclePlate?: string; // Placa
  driverName?: string; // Motorista
  transporter?: string; // Transportadora
  seal1?: string;
  seal2?: string;
  seal3?: string;

  // People
  claimantId?: string; // Reclamante ID
  claimantName?: string; // Reclamante Nome
  checkerId?: string; // Conferente ID
  checkerName?: string; // Conferente Nome
  fiscalId?: string; // Fiscal ID
  fiscalName?: string; // Fiscal Nome

  // Documentation
  issueDate?: string; // Data Emissão
  missionNumber?: string; // Missão
  invoiceNumber?: string; // Nota Fiscal
  supportNumber?: string; // Nº Suporte
  inventoryNumber?: string; // Nº Inventário
  isInventoryOpen?: string; // Inventário em aberto?
  inventoryCloseDate?: string; // Data Fechamento Inventário

  // Product Details
  rmsCode?: string; // RMS
  eanCode?: string; // EAN
  packType?: string; // EMB
  packQuantity?: number; // Qtde EMB
  pcb?: number; // PCB
  totalQuantity?: number; // Qtde Total
  totalValueNoTax?: number; // Valor total S/ICMS
  totalValueTax?: number; // Valor total C/ICMS

  // Litigation Specifics
  litigationType?: 'QUANTIDADE' | 'QUALIDADE';
  claimedQuantityEmb?: number; // Litígio Qtd (EMB)
  claimedQuantityUnit?: number; // Litígio Qtd (UN/KG)
  claimedValue?: number; // Valor Reclamado
  
  // Quality specific
  batchNumber?: string; // Lote
  manufactureDate?: string; // Data Fabricação
  expiryDate?: string; // Data Vencimento
}

export type ViewState = 'dashboard' | 'list' | 'create';
