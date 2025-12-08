import React, { useState } from 'react';
import { Role, Store, User } from '../types';
import { Shield, Package, Store as StoreIcon, ChevronRight, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

// Usuários pré-definidos conforme solicitação
const AVAILABLE_USERS: User[] = [
  // Administradores
  { id: 'admin_geral', name: 'Roberto (Diretoria)', role: Role.GENERAL_ADMIN, store: Store.CD },
  { id: 'admin_cd', name: 'Carlos (Logística)', role: Role.CD_ADMIN, store: Store.CD },
  
  // Lojas
  { id: 'gerente_an', name: 'Ana (Gerente)', role: Role.STORE_ADMIN, store: Store.ASA_NORTE },
  { id: 'gerente_sia', name: 'Marcos (Gerente)', role: Role.STORE_ADMIN, store: Store.SIA },
  { id: 'gerente_ac', name: 'Julia (Gerente)', role: Role.STORE_ADMIN, store: Store.AGUAS_CLARAS },
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleLogin = () => {
    if (selectedUser) {
      onLogin(selectedUser);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Lado Esquerdo - Branding */}
        <div className="md:w-1/2 bg-teal-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="bg-teal-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-teal-100" />
            </div>
            <h1 className="text-4xl font-bold mb-4">LitígioTrack</h1>
            <p className="text-teal-200 text-lg leading-relaxed">
              Sistema integrado de gestão de ocorrências e litígios para Varejo e Centro de Distribuição.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="flex items-center gap-4 text-teal-300 text-sm font-medium">
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-teal-700 border-2 border-teal-900 flex items-center justify-center">A</div>
                 <div className="w-8 h-8 rounded-full bg-teal-600 border-2 border-teal-900 flex items-center justify-center">S</div>
                 <div className="w-8 h-8 rounded-full bg-teal-500 border-2 border-teal-900 flex items-center justify-center">C</div>
              </div>
              <span>Controle total das operações</span>
            </div>
          </div>

          {/* Decorative Circles */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-800 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-700 rounded-full opacity-30 blur-3xl"></div>
        </div>

        {/* Lado Direito - Seleção de Usuário */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gray-50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Acesso ao Sistema</h2>
            <p className="text-gray-500 mt-2">Selecione um perfil para simular o acesso:</p>
          </div>

          <div className="space-y-6">
            
            {/* Grupo Administração */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Administração Central</h3>
              <div className="space-y-2">
                {AVAILABLE_USERS.filter(u => u.role !== Role.STORE_ADMIN).map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center p-3 rounded-lg border transition-all ${
                      selectedUser?.id === user.id 
                      ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' 
                      : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 ${user.role === Role.GENERAL_ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                      {user.role === Role.GENERAL_ADMIN ? <Shield size={18} /> : <Package size={18} />}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    {selectedUser?.id === user.id && <div className="w-2 h-2 rounded-full bg-teal-600"></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Grupo Lojas */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Lojas (Acesso Restrito)</h3>
              <div className="space-y-2">
                {AVAILABLE_USERS.filter(u => u.role === Role.STORE_ADMIN).map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center p-3 rounded-lg border transition-all ${
                      selectedUser?.id === user.id 
                      ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' 
                      : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="p-2 rounded-lg mr-3 bg-blue-100 text-blue-700">
                      <StoreIcon size={18} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.store}</p>
                    </div>
                    {selectedUser?.id === user.id && <div className="w-2 h-2 rounded-full bg-teal-600"></div>}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-8">
            <button
              onClick={handleLogin}
              disabled={!selectedUser}
              className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                selectedUser 
                ? 'bg-teal-900 hover:bg-teal-800 text-white shadow-lg transform hover:-translate-y-0.5' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Lock size={18} />
              <span>Acessar Painel</span>
              {selectedUser && <ChevronRight size={18} />}
            </button>
          </div>

        </div>
      </div>
      
      <div className="fixed bottom-4 text-gray-400 text-xs">
        Ambiente Seguro &bull; LitígioTrack v1.0
      </div>
    </div>
  );
};

export default Login;