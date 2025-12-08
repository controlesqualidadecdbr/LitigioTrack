import React, { useState, useEffect } from 'react';
import { User, Role, Occurrence, Status } from '../types';
import { getOccurrences, saveOccurrence } from '../services/storage';
import { generateResolutionSuggestion } from '../services/geminiService';
import { Eye, CheckCircle, XCircle, Search, Bot, PlusCircle, X } from 'lucide-react';

interface OccurrenceListProps {
  user: User;
  onCreate: () => void;
}

const GreenHeaderDisplay: React.FC<{ label: string; value?: string | number; className?: string }> = ({ label, value, className = "" }) => (
  <div className={`flex flex-col border border-gray-400 ${className}`}>
    <div className="bg-teal-900 text-white text-[10px] sm:text-xs font-bold px-2 py-1 uppercase tracking-wide border-b border-gray-400">
      {label}
    </div>
    <div className="p-1 sm:p-2 text-xs sm:text-sm text-gray-900 bg-white h-full min-h-[28px] break-words">
      {value || '-'}
    </div>
  </div>
);

const OccurrenceList: React.FC<OccurrenceListProps> = ({ user, onCreate }) => {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [filterText, setFilterText] = useState('');
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const all = getOccurrences();
    if (user.role === Role.GENERAL_ADMIN || user.role === Role.CD_ADMIN) {
      setOccurrences(all);
    } else {
      setOccurrences(all.filter(o => o.store === user.store));
    }
  };

  const handleResolve = (status: Status) => {
    if (!selectedOccurrence) return;
    
    const updated: Occurrence = {
      ...selectedOccurrence,
      status: status,
      cdComments: adminComment,
      cdDecisionBy: user.id,
      cdDecisionByName: user.name,
      updatedAt: new Date().toISOString()
    };
    
    saveOccurrence(updated);
    loadData();
    setSelectedOccurrence(null);
    setAdminComment('');
    setAiSuggestion('');
  };

  const handleGetSuggestion = async () => {
    if(!selectedOccurrence) return;
    setIsLoadingAi(true);
    const suggestion = await generateResolutionSuggestion(selectedOccurrence);
    setAiSuggestion(suggestion);
    setIsLoadingAi(false);
  }

  const filtered = occurrences.filter(o => 
    o.title.toLowerCase().includes(filterText.toLowerCase()) ||
    o.productName.toLowerCase().includes(filterText.toLowerCase()) ||
    o.id.includes(filterText)
  );

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.APPROVED: return 'bg-green-100 text-green-700';
      case Status.REJECTED: return 'bg-red-100 text-red-700';
      case Status.IN_ANALYSIS: return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const isCdAdmin = user.role === Role.CD_ADMIN;
  const canCreate = user.role === Role.STORE_ADMIN || user.role === Role.GENERAL_ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ocorrências</h1>
          <p className="text-gray-500">
             {user.role === Role.STORE_ADMIN 
                ? `Litígios - ${user.store}` 
                : 'Gerenciamento Geral de Litígios'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {canCreate && (
                <button 
                    onClick={onCreate}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
                >
                    <PlusCircle size={18} />
                    Nova Ocorrência
                </button>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por título, ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Protocolo</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Título</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Loja</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Produto</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Data</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">#{item.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.title}</td>
                  <td className="px-6 py-4 text-gray-500">{item.store}</td>
                  <td className="px-6 py-4 text-gray-500">{item.productName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOccurrence(item)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center space-x-1"
                    >
                      <Eye size={16} />
                      <span>Detalhes</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Nenhuma ocorrência encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Details with "Green Header" Style */}
      {selectedOccurrence && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-white rounded shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="font-mono text-lg text-gray-500">#{selectedOccurrence.id}</span>
                  {selectedOccurrence.title}
                </h2>
                <div className={`mt-1 inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(selectedOccurrence.status)}`}>
                    {selectedOccurrence.status}
                </div>
              </div>
              <button onClick={() => {setSelectedOccurrence(null); setAiSuggestion('');}} className="text-gray-500 hover:text-red-500 transition-colors">
                <X size={28} />
              </button>
            </div>
            
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
                <div className="bg-white shadow border border-gray-300">
                    
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <GreenHeaderDisplay label="Protocolo" value={selectedOccurrence.id} />
                        <GreenHeaderDisplay label="Data/Hora Reclamação" value={new Date(selectedOccurrence.createdAt).toLocaleString()} />
                        <GreenHeaderDisplay label="Usuário Registro" value={selectedOccurrence.reportedByName} />
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2 md:grid-cols-12">
                        <GreenHeaderDisplay label="Data/Hora Recebimento" value={selectedOccurrence.receiptDate ? new Date(selectedOccurrence.receiptDate).toLocaleString() : ''} className="col-span-2 md:col-span-3" />
                        <GreenHeaderDisplay label="Loja" value={selectedOccurrence.store} className="col-span-2 md:col-span-3" />
                        <GreenHeaderDisplay label="Un. Logística" value={selectedOccurrence.logisticsUnit} className="col-span-1 md:col-span-2" />
                        <GreenHeaderDisplay label="Entr. Conjugada" value={selectedOccurrence.conjugatedDelivery} className="col-span-1 md:col-span-2" />
                        <GreenHeaderDisplay label="Lojas Conjugadas" value={selectedOccurrence.conjugatedStores} className="col-span-2 md:col-span-2" />
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-2 md:grid-cols-12">
                        <GreenHeaderDisplay label="Placa" value={selectedOccurrence.vehiclePlate} className="col-span-1 md:col-span-2" />
                        <GreenHeaderDisplay label="Motorista" value={selectedOccurrence.driverName} className="col-span-1 md:col-span-3" />
                        <GreenHeaderDisplay label="Transportadora" value={selectedOccurrence.transporter} className="col-span-2 md:col-span-4" />
                        <GreenHeaderDisplay label="Lacre 01" value={selectedOccurrence.seal1} className="col-span-2 md:col-span-1" />
                        <GreenHeaderDisplay label="Lacre 02" value={selectedOccurrence.seal2} className="col-span-2 md:col-span-1" />
                        <GreenHeaderDisplay label="Lacre 03" value={selectedOccurrence.seal3} className="col-span-2 md:col-span-1" />
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-1 md:grid-cols-3">
                         <GreenHeaderDisplay label="Reclamante" value={selectedOccurrence.claimantName} />
                         <GreenHeaderDisplay label="Conferente" value={selectedOccurrence.checkerName} />
                         <GreenHeaderDisplay label="Fiscal" value={selectedOccurrence.fiscalName} />
                    </div>

                    {/* Row 5 */}
                    <div className="grid grid-cols-2 md:grid-cols-12">
                         <GreenHeaderDisplay label="Data Emissão" value={selectedOccurrence.issueDate} className="col-span-1 md:col-span-2" />
                         <GreenHeaderDisplay label="Missão" value={selectedOccurrence.missionNumber} className="col-span-1 md:col-span-2" />
                         <GreenHeaderDisplay label="Nota Fiscal" value={selectedOccurrence.invoiceNumber} className="col-span-1 md:col-span-2" />
                         <GreenHeaderDisplay label="Nº Suporte" value={selectedOccurrence.supportNumber} className="col-span-1 md:col-span-2" />
                         <GreenHeaderDisplay label="Nº Inventário" value={selectedOccurrence.inventoryNumber} className="col-span-2 md:col-span-2" />
                         <GreenHeaderDisplay label="Inv. Aberto?" value={selectedOccurrence.isInventoryOpen} className="col-span-1 md:col-span-1" />
                         <GreenHeaderDisplay label="Dt Fec. Inv." value={selectedOccurrence.inventoryCloseDate} className="col-span-1 md:col-span-1" />
                    </div>

                     {/* Row 6: Obs */}
                    <div className="w-full">
                        <GreenHeaderDisplay label="Observações" value={selectedOccurrence.description} />
                    </div>

                    {/* Row 7 */}
                    <div className="grid grid-cols-2 md:grid-cols-12">
                         <GreenHeaderDisplay label="RMS" value={selectedOccurrence.rmsCode} className="col-span-1 md:col-span-2" />
                         <GreenHeaderDisplay label="EAN" value={selectedOccurrence.eanCode} className="col-span-1 md:col-span-2" />
                         <GreenHeaderDisplay label="Produto" value={selectedOccurrence.productName} className="col-span-2 md:col-span-7" />
                         <GreenHeaderDisplay label="EMB" value={selectedOccurrence.packType} className="col-span-2 md:col-span-1" />
                    </div>

                    {/* Row 8 */}
                    <div className="grid grid-cols-2 md:grid-cols-12">
                         <div className="col-span-2 md:col-span-3 border border-gray-400 p-2 flex items-center justify-center text-gray-400 italic text-xs bg-gray-50">
                             [Fotos Visualização Mockup]
                         </div>
                         <GreenHeaderDisplay label="Qtde EMB" value={selectedOccurrence.packQuantity} className="col-span-1 md:col-span-2" />
                         <GreenHeaderDisplay label="PCB" value={selectedOccurrence.pcb} className="col-span-1 md:col-span-2" />
                         <GreenHeaderDisplay label="Qtde Total" value={selectedOccurrence.totalQuantity} className="col-span-1 md:col-span-2" />
                         <GreenHeaderDisplay label="Valor Total S/ICMS" value={selectedOccurrence.totalValueNoTax ? `R$ ${selectedOccurrence.totalValueNoTax}` : ''} className="col-span-1 md:col-span-1" />
                         <GreenHeaderDisplay label="Valor Total C/ICMS" value={selectedOccurrence.totalValueTax ? `R$ ${selectedOccurrence.totalValueTax}` : ''} className="col-span-2 md:col-span-2" />
                    </div>

                     {/* Row 9: Litigation Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="border border-gray-400">
                            <div className="bg-teal-900 text-white font-bold text-center py-1 uppercase tracking-wide border-b border-gray-400 text-xs">
                                LITÍGIO ({selectedOccurrence.litigationType || '-'})
                            </div>
                            <div className="grid grid-cols-2">
                                <GreenHeaderDisplay label="Qtd Reclamada (EMB)" value={selectedOccurrence.claimedQuantityEmb} />
                                <GreenHeaderDisplay label="Valor Reclamado" value={selectedOccurrence.claimedValue ? `R$ ${selectedOccurrence.claimedValue}` : ''} />
                            </div>
                        </div>

                         <div className="border border-gray-400 border-l-0 md:border-l">
                            <div className="bg-teal-900 text-white font-bold text-center py-1 uppercase tracking-wide border-b border-gray-400 text-xs">
                                DADOS QUALIDADE
                            </div>
                            <div className="grid grid-cols-3">
                                <GreenHeaderDisplay label="Lote" value={selectedOccurrence.batchNumber} className="col-span-3" />
                                <GreenHeaderDisplay label="Data Fab." value={selectedOccurrence.manufactureDate} className="col-span-1" />
                                <GreenHeaderDisplay label="Data Venc." value={selectedOccurrence.expiryDate} className="col-span-2" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CD Admin Actions Zone */}
                {isCdAdmin && selectedOccurrence.status !== Status.APPROVED && selectedOccurrence.status !== Status.REJECTED && (
                    <div className="mt-6 bg-white p-4 rounded shadow border border-gray-200">
                       <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-800">Parecer Técnico (CD)</h3>
                          <button 
                            onClick={handleGetSuggestion}
                            disabled={isLoadingAi}
                            className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 disabled:opacity-50"
                          >
                             <Bot size={14} />
                             {isLoadingAi ? 'Analisando...' : 'Pedir sugestão à IA'}
                          </button>
                       </div>
                       
                       {aiSuggestion && (
                         <div className="mb-4 bg-purple-50 p-3 rounded text-sm text-purple-800 border border-purple-100 animate-fade-in">
                           <strong>Sugestão IA:</strong> {aiSuggestion}
                         </div>
                       )}
    
                       <textarea
                         className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm mb-4"
                         rows={4}
                         placeholder="Descreva o motivo da decisão..."
                         value={adminComment}
                         onChange={(e) => setAdminComment(e.target.value)}
                       />
                       <div className="flex gap-3">
                         <button
                           onClick={() => handleResolve(Status.APPROVED)}
                           className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                         >
                           <CheckCircle size={18} />
                           PROCEDENTE
                         </button>
                         <button
                           onClick={() => handleResolve(Status.REJECTED)}
                           className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                         >
                           <XCircle size={18} />
                           NÃO PROCEDENTE
                         </button>
                       </div>
                    </div>
                )}

                 {/* View Final Resolution */}
                {(selectedOccurrence.status === Status.APPROVED || selectedOccurrence.status === Status.REJECTED) && (
                     <div className="mt-4 bg-gray-50 p-4 rounded border border-gray-200">
                        <h4 className="font-bold text-gray-800 text-sm mb-1">Parecer Final ({selectedOccurrence.cdDecisionByName})</h4>
                        <p className="text-gray-700 text-sm">{selectedOccurrence.cdComments || "Sem observações."}</p>
                     </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OccurrenceList;
