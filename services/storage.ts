import { Occurrence, User, Role, Store, Status } from '../types';

const STORAGE_KEY_OCCURRENCES = 'litigios_occurrences';

const MOCK_OCCURRENCES: Occurrence[] = [
  // --- ASA NORTE ---
  {
    id: '0449035006122025',
    title: 'Produto Avariado na Entrega',
    description: 'Cliente relatou que o produto chegou com a caixa amassada e o item quebrado.',
    productCode: '3615004337761',
    productName: 'PNEU WESTLAKE 195 55R16 Z108 87V CR65782',
    store: Store.ASA_NORTE,
    reportedBy: 'gerente_an',
    reportedByName: 'Ana (Gerente AN)',
    status: Status.OPEN,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    receiptDate: '2025-12-06T11:00',
    logisticsUnit: 'CDBR',
    transporter: 'TRANSPORTES FRAMENTO LTDA',
    vehiclePlate: 'TTN9I78',
    driverName: 'FRAMETNO',
    missionNumber: '5294173',
    rmsCode: '5186846',
    eanCode: '3615004337761',
    packType: 'CX',
    claimedQuantityEmb: 1,
    claimedValue: 150.00,
    litigationType: 'QUALIDADE'
  },
  // --- SIA ---
  {
    id: '0449035006122026',
    title: 'Falta de Item no Pedido',
    description: 'Pedido com 5 itens, cliente recebeu apenas 4. Conferido na entrega.',
    productCode: '554433',
    productName: 'Kit Ferramentas Profissional',
    store: Store.SIA,
    reportedBy: 'gerente_sia',
    reportedByName: 'Marcos (Gerente SIA)',
    status: Status.APPROVED,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    cdComments: 'Verificado nas câmeras de segurança do CD, o item realmente não foi bipado na saída.',
    cdDecisionBy: 'admin_cd',
    cdDecisionByName: 'Carlos (Logística)',
    transporter: 'LOG LOGISTICA',
    missionNumber: '555123',
    litigationType: 'QUANTIDADE',
    claimedValue: 450.00,
    claimedQuantityEmb: 1
  },
  // --- ÁGUAS CLARAS ---
  {
    id: '0449035006122027',
    title: 'Troca Recusada Indevidamente',
    description: 'Cliente alega que defeito é de fábrica, loja recusou por mau uso, mas fiscalização técnica indica vício oculto.',
    productCode: '998877',
    productName: 'Liquidificador Turbo',
    store: Store.AGUAS_CLARAS,
    reportedBy: 'gerente_ac',
    reportedByName: 'Julia (Gerente AC)',
    status: Status.REJECTED,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    cdComments: 'Produto apresenta sinais claros de queda pelo cliente (plástico trincado na base). Não procede garantia.',
    cdDecisionBy: 'admin_cd',
    cdDecisionByName: 'Carlos (Logística)',
    missionNumber: '999888',
    litigationType: 'QUALIDADE',
    claimedValue: 120.00
  },
  // --- MAIS UM PARA ASA NORTE (Teste Volume) ---
  {
    id: '0449035007122028',
    title: 'Divergência de Validade',
    description: 'Lote recebido com validade inferior a 30 dias.',
    productCode: '112233',
    productName: 'Iogurte Natural 1L',
    store: Store.ASA_NORTE,
    reportedBy: 'gerente_an',
    reportedByName: 'Ana (Gerente AN)',
    status: Status.IN_ANALYSIS,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    litigationType: 'QUALIDADE',
    expiryDate: '2025-01-05',
    batchNumber: 'LT9988',
    claimedValue: 800.00
  }
];

export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY_OCCURRENCES)) {
    localStorage.setItem(STORAGE_KEY_OCCURRENCES, JSON.stringify(MOCK_OCCURRENCES));
  }
};

export const getOccurrences = (): Occurrence[] => {
  const data = localStorage.getItem(STORAGE_KEY_OCCURRENCES);
  return data ? JSON.parse(data) : [];
};

export const saveOccurrence = (occurrence: Occurrence): void => {
  const current = getOccurrences();
  const index = current.findIndex(o => o.id === occurrence.id);
  
  if (index >= 0) {
    current[index] = occurrence;
  } else {
    current.push(occurrence);
  }
  
  localStorage.setItem(STORAGE_KEY_OCCURRENCES, JSON.stringify(current));
};

export const createOccurrence = (data: Partial<Occurrence>): Occurrence => {
  // Generate a protocol ID similar to the example: 0449035006122025
  const dateStr = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const protocolId = `${random}${dateStr}`;

  const newOccurrence: Occurrence = {
    // Defaults
    title: 'Nova Ocorrência', 
    description: '',
    productCode: '',
    productName: '',
    store: Store.ASA_NORTE, // Placeholder, usually overwritten
    reportedBy: '',
    reportedByName: '',
    ...data,
    id: protocolId,
    status: Status.OPEN,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveOccurrence(newOccurrence);
  return newOccurrence;
};