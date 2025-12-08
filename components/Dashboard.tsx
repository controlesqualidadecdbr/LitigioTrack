import React, { useMemo } from 'react';
import { User, ViewState, Status, Role } from '../types';
import { getOccurrences } from '../services/storage';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { AlertCircle, CheckCircle, XCircle, Clock, FileDown } from 'lucide-react';

interface DashboardProps {
  user: User;
  onViewChange: (view: ViewState) => void;
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'];

const Dashboard: React.FC<DashboardProps> = ({ user, onViewChange }) => {
  const occurrences = getOccurrences();

  // Filter based on user role
  const filteredOccurrences = useMemo(() => {
    if (user.role === Role.GENERAL_ADMIN || user.role === Role.CD_ADMIN) {
      return occurrences;
    }
    return occurrences.filter(o => o.store === user.store);
  }, [occurrences, user]);

  const stats = useMemo(() => {
    return {
      open: filteredOccurrences.filter(o => o.status === Status.OPEN).length,
      analysis: filteredOccurrences.filter(o => o.status === Status.IN_ANALYSIS).length,
      approved: filteredOccurrences.filter(o => o.status === Status.APPROVED).length,
      rejected: filteredOccurrences.filter(o => o.status === Status.REJECTED).length,
      total: filteredOccurrences.length,
    };
  }, [filteredOccurrences]);

  const pieData = [
    { name: 'Aberto', value: stats.open },
    { name: 'Em Análise', value: stats.analysis },
    { name: 'Procedente', value: stats.approved },
    { name: 'Não Procedente', value: stats.rejected },
  ].filter(d => d.value > 0);

  const storeDataRaw = occurrences.reduce((acc, curr) => {
    if (!acc[curr.store]) {
      acc[curr.store] = { name: curr.store, Procedente: 0, NaoProcedente: 0, Aberto: 0 };
    }
    if (curr.status === Status.APPROVED) acc[curr.store].Procedente++;
    else if (curr.status === Status.REJECTED) acc[curr.store].NaoProcedente++;
    else acc[curr.store].Aberto++;
    return acc;
  }, {} as Record<string, any>);

  const storeData = Object.values(storeDataRaw);

  const handleExportReport = () => {
    // Basic CSV Export implementation
    const headers = ["ID", "Título", "Loja", "Produto", "Status", "Data"];
    const csvContent = [
      headers.join(","),
      ...filteredOccurrences.map(o => [o.id, `"${o.title}"`, `"${o.store}"`, `"${o.productName}"`, o.status, o.createdAt].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_litigios_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-105 duration-200">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
          <p className="text-gray-500">
             {user.role === Role.STORE_ADMIN 
                ? `Métricas - ${user.store}` 
                : 'Dashboard Geral de Tratativas'}
          </p>
        </div>
        <button 
           onClick={handleExportReport}
           className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
           <FileDown size={18} />
           <span>Gerar Relatório CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Em Aberto" value={stats.open} icon={AlertCircle} color="text-yellow-600" bg="bg-yellow-100" />
        <StatCard title="Em Análise" value={stats.analysis} icon={Clock} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Procedentes" value={stats.approved} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
        <StatCard title="Não Procedentes" value={stats.rejected} icon={XCircle} color="text-red-600" bg="bg-red-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Status das Ocorrências</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Only show Store Comparison if user is CD or General Admin */}
        {(user.role === Role.GENERAL_ADMIN || user.role === Role.CD_ADMIN) && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ocorrências por Loja</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Procedente" stackId="a" fill="#10B981" />
                  <Bar dataKey="NaoProcedente" stackId="a" fill="#EF4444" />
                  <Bar dataKey="Aberto" stackId="a" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* If Store Admin, show a different chart? Maybe history over time? Keeping it simple for now, maybe just hide the store comparison */}
        {user.role === Role.STORE_ADMIN && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-blue-200 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-800">Seu desempenho</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {stats.approved > stats.rejected ? "Maioria das tratativas procedentes." : "Atenção aos processos de litígio."}
                    </p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;