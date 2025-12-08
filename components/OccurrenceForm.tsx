import React, { useState } from 'react';
import { User, Occurrence } from '../types';
import { createOccurrence } from '../services/storage';
import { ChevronLeft, Save, Camera } from 'lucide-react';

interface OccurrenceFormProps {
  user: User;
  onCancel: () => void;
  onSuccess: () => void;
}

const GreenHeaderField: React.FC<{
  label: string;
  value?: string | number;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  className?: string;
  readOnly?: boolean;
  required?: boolean;
  options?: string[];
}> = ({ label, value, name, onChange, type = "text", className = "", readOnly = false, required = false, options }) => {
  return (
    <div className={`flex flex-col border border-gray-400 ${className}`}>
      <div className="bg-teal-900 text-white text-[10px] sm:text-xs font-bold px-2 py-1 uppercase tracking-wide border-b border-gray-400">
        {label}
      </div>
      {options ? (
        <select
           name={name}
           value={value}
           onChange={onChange}
           disabled={readOnly}
           className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800 focus:outline-none focus:bg-blue-50 w-full h-full bg-white"
        >
            <option value="">Selecione...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          required={required}
          rows={3}
          className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800 focus:outline-none focus:bg-blue-50 w-full h-full min-h-[60px]"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          required={required}
          className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800 focus:outline-none focus:bg-blue-50 w-full h-full"
        />
      )}
    </div>
  );
};

const OccurrenceForm: React.FC<OccurrenceFormProps> = ({ user, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<Occurrence>>({
    title: '',
    receiptDate: '',
    logisticsUnit: 'CDBR',
    conjugatedDelivery: 'N',
    conjugatedStores: '',
    vehiclePlate: '',
    driverName: '',
    transporter: '',
    seal1: '',
    seal2: '',
    seal3: '',
    claimantName: user.name,
    claimantId: user.id,
    checkerName: '',
    fiscalName: '',
    issueDate: '',
    missionNumber: '',
    invoiceNumber: '',
    supportNumber: '',
    inventoryNumber: '',
    isInventoryOpen: 'Não',
    inventoryCloseDate: '',
    description: '',
    rmsCode: '',
    eanCode: '',
    productName: '',
    packType: 'CX',
    packQuantity: 0,
    pcb: 0,
    totalQuantity: 0,
    totalValueNoTax: 0,
    totalValueTax: 0,
    litigationType: 'QUANTIDADE',
    claimedQuantityEmb: 0,
    claimedQuantityUnit: 0,
    claimedValue: 0,
    batchNumber: '',
    manufactureDate: '',
    expiryDate: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createOccurrence({
      ...formData,
      store: user.store,
      reportedBy: user.id,
      reportedByName: user.name,
      // Ensure title is set if user left it blank, maybe use product name
      title: formData.title || `Ocorrência - ${formData.productName}`
    });
    onSuccess();
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="ml-1 font-medium">Cancelar</span>
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-teal-800 hover:bg-teal-900 text-white px-6 py-2 rounded shadow-md transition-colors font-medium"
        >
          <Save size={18} />
          Salvar Ocorrência
        </button>
      </div>

      <div className="bg-white shadow-xl border border-gray-300">
        
        {/* ROW 1: Protocolo (Auto) | Data/Hora Reclamação | Usuário */}
        <div className="grid grid-cols-1 md:grid-cols-3">
            <GreenHeaderField label="Protocolo (Automático)" name="id" value="Gerado ao Salvar" onChange={() => {}} readOnly className="" />
            <GreenHeaderField label="Data/Hora Reclamação" name="date" value={new Date().toLocaleString()} onChange={() => {}} readOnly className="" />
            <GreenHeaderField label="Usuário Registro" name="user" value={user.name} onChange={() => {}} readOnly className="" />
        </div>

        {/* ROW 2: Data Recebimento | Loja | Un Log | Entr Conj | Lojas Conj */}
        <div className="grid grid-cols-2 md:grid-cols-12">
            <GreenHeaderField label="Data/Hora Recebimento" name="receiptDate" type="datetime-local" value={formData.receiptDate} onChange={handleChange} className="col-span-2 md:col-span-3" />
            <GreenHeaderField label="Loja" name="store" value={user.store} onChange={() => {}} readOnly className="col-span-2 md:col-span-3" />
            <GreenHeaderField label="Un. Logística" name="logisticsUnit" value={formData.logisticsUnit} onChange={handleChange} className="col-span-1 md:col-span-2" />
            <GreenHeaderField label="Entr. Conjugada" name="conjugatedDelivery" value={formData.conjugatedDelivery} onChange={handleChange} options={['S', 'N']} className="col-span-1 md:col-span-2" />
            <GreenHeaderField label="Lojas Conjugadas" name="conjugatedStores" value={formData.conjugatedStores} onChange={handleChange} className="col-span-2 md:col-span-2" />
        </div>

        {/* ROW 3: Placa | Motorista | Transportadora | Lacres */}
        <div className="grid grid-cols-2 md:grid-cols-12">
            <GreenHeaderField label="Placa" name="vehiclePlate" value={formData.vehiclePlate} onChange={handleChange} className="col-span-1 md:col-span-2" />
            <GreenHeaderField label="Motorista" name="driverName" value={formData.driverName} onChange={handleChange} className="col-span-1 md:col-span-3" />
            <GreenHeaderField label="Transportadora" name="transporter" value={formData.transporter} onChange={handleChange} className="col-span-2 md:col-span-4" />
            <GreenHeaderField label="Lacre 01" name="seal1" value={formData.seal1} onChange={handleChange} className="col-span-2 md:col-span-1" />
            <GreenHeaderField label="Lacre 02" name="seal2" value={formData.seal2} onChange={handleChange} className="col-span-2 md:col-span-1" />
            <GreenHeaderField label="Lacre 03" name="seal3" value={formData.seal3} onChange={handleChange} className="col-span-2 md:col-span-1" />
        </div>

        {/* ROW 4: Reclamante | Conferente | Fiscal */}
        <div className="grid grid-cols-1 md:grid-cols-3">
             <GreenHeaderField label="Reclamante" name="claimantName" value={formData.claimantName} onChange={handleChange} className="" />
             <GreenHeaderField label="Conferente" name="checkerName" value={formData.checkerName} onChange={handleChange} className="" />
             <GreenHeaderField label="Fiscal" name="fiscalName" value={formData.fiscalName} onChange={handleChange} className="" />
        </div>

        {/* ROW 5: Docs Info */}
        <div className="grid grid-cols-2 md:grid-cols-12">
             <GreenHeaderField label="Data Emissão" name="issueDate" type="date" value={formData.issueDate} onChange={handleChange} className="col-span-1 md:col-span-2" />
             <GreenHeaderField label="Missão" name="missionNumber" value={formData.missionNumber} onChange={handleChange} className="col-span-1 md:col-span-2" />
             <GreenHeaderField label="Nota Fiscal" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="col-span-1 md:col-span-2" />
             <GreenHeaderField label="Nº Suporte" name="supportNumber" value={formData.supportNumber} onChange={handleChange} className="col-span-1 md:col-span-2" />
             <GreenHeaderField label="Nº Inventário" name="inventoryNumber" value={formData.inventoryNumber} onChange={handleChange} className="col-span-2 md:col-span-2" />
             <GreenHeaderField label="Inv. Aberto?" name="isInventoryOpen" value={formData.isInventoryOpen} onChange={handleChange} options={['Sim', 'Não']} className="col-span-1 md:col-span-1" />
             <GreenHeaderField label="Dt Fec. Inv." name="inventoryCloseDate" type="date" value={formData.inventoryCloseDate} onChange={handleChange} className="col-span-1 md:col-span-1" />
        </div>

        {/* ROW 6: Observações */}
        <div className="w-full">
            <GreenHeaderField label="Observações / Descrição do Problema" name="description" type="textarea" value={formData.description} onChange={handleChange} required className="" />
        </div>

        {/* ROW 7: Product Headers */}
        <div className="grid grid-cols-2 md:grid-cols-12">
             <GreenHeaderField label="RMS" name="rmsCode" value={formData.rmsCode} onChange={handleChange} className="col-span-1 md:col-span-2" />
             <GreenHeaderField label="EAN" name="eanCode" value={formData.eanCode} onChange={handleChange} className="col-span-1 md:col-span-2" />
             <GreenHeaderField label="Produto" name="productName" value={formData.productName} onChange={handleChange} required className="col-span-2 md:col-span-7" />
             <GreenHeaderField label="EMB" name="packType" value={formData.packType} onChange={handleChange} className="col-span-2 md:col-span-1" />
        </div>

        {/* ROW 8: Product Details */}
        <div className="grid grid-cols-2 md:grid-cols-12 bg-gray-50">
             {/* Fake Photo Button */}
             <div className="col-span-2 md:col-span-3 border border-gray-400 p-2 flex items-center justify-center gap-2">
                <button type="button" className="bg-white border border-blue-500 text-blue-600 px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-blue-50">
                    <Camera size={14} /> Fotos da Missão
                </button>
                <button type="button" className="bg-white border border-gray-400 text-gray-600 px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-gray-50">
                    <Camera size={14} /> Fotos Produto
                </button>
             </div>

             <GreenHeaderField label="Qtde EMB" name="packQuantity" type="number" value={formData.packQuantity} onChange={handleChange} className="col-span-1 md:col-span-2" />
             <GreenHeaderField label="PCB" name="pcb" type="number" value={formData.pcb} onChange={handleChange} className="col-span-1 md:col-span-2" />
             <GreenHeaderField label="Qtde Total" name="totalQuantity" type="number" value={formData.totalQuantity} onChange={handleChange} className="col-span-1 md:col-span-2" />
             <GreenHeaderField label="Valor total S/ICMS" name="totalValueNoTax" type="number" value={formData.totalValueNoTax} onChange={handleChange} className="col-span-1 md:col-span-1" />
             <GreenHeaderField label="Valor total C/ICMS" name="totalValueTax" type="number" value={formData.totalValueTax} onChange={handleChange} className="col-span-2 md:col-span-2" />
        </div>

        {/* ROW 9: Litigation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Quantity/Financial */}
            <div className="border border-gray-400">
                <div className="bg-teal-900 text-white font-bold text-center py-1 uppercase tracking-wide border-b border-gray-400">
                    LITÍGIO
                </div>
                <div className="grid grid-cols-4">
                    <GreenHeaderField label="Tipo" name="litigationType" value={formData.litigationType} onChange={handleChange} options={['QUANTIDADE', 'QUALIDADE']} className="col-span-4" />
                    
                    <GreenHeaderField label="Qtd Reclamada (EMB)" name="claimedQuantityEmb" type="number" value={formData.claimedQuantityEmb} onChange={handleChange} className="col-span-2" />
                    <GreenHeaderField label="Valor Reclamado" name="claimedValue" type="number" value={formData.claimedValue} onChange={handleChange} className="col-span-2" />
                </div>
            </div>

            {/* Right: Quality */}
             <div className="border border-gray-400 border-l-0 md:border-l">
                <div className="bg-teal-900 text-white font-bold text-center py-1 uppercase tracking-wide border-b border-gray-400">
                    DADOS QUALIDADE
                </div>
                <div className="grid grid-cols-3">
                    <GreenHeaderField label="Lote" name="batchNumber" value={formData.batchNumber} onChange={handleChange} className="col-span-3" />
                    <GreenHeaderField label="Data Fabricação" name="manufactureDate" type="date" value={formData.manufactureDate} onChange={handleChange} className="col-span-1" />
                    <GreenHeaderField label="Data Vencimento" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className="col-span-2" />
                </div>
            </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
             <label className="block text-sm font-bold text-gray-700 mb-1">Motivo / Título Simplificado</label>
             <input
               type="text"
               name="title"
               value={formData.title}
               onChange={handleChange}
               placeholder="Ex: Produto avariado na entrega"
               className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
               required
             />
        </div>

      </div>
    </div>
  );
};

export default OccurrenceForm;
