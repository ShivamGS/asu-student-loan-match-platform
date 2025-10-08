import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Filter, Search, Download } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  type: 'contribution' | 'match' | 'loan_payment' | 'withdrawal';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  balance: number;
}

export default function User_Dashboard_Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock transaction data
  const transactions: Transaction[] = [
    {
      id: 'TXN-001',
      date: '2025-10-01',
      type: 'contribution',
      description: 'Employee 401(k) Contribution',
      amount: 520,
      status: 'completed',
      balance: 52000
    },
    {
      id: 'TXN-002',
      date: '2025-10-01',
      type: 'match',
      description: 'Employer Match - Student Loan Program',
      amount: 200,
      status: 'completed',
      balance: 52200
    },
    {
      id: 'TXN-003',
      date: '2025-09-15',
      type: 'loan_payment',
      description: 'Student Loan Payment Verified',
      amount: 450,
      status: 'completed',
      balance: 52000
    },
    {
      id: 'TXN-004',
      date: '2025-09-01',
      type: 'contribution',
      description: 'Employee 401(k) Contribution',
      amount: 520,
      status: 'completed',
      balance: 51550
    },
    {
      id: 'TXN-005',
      date: '2025-09-01',
      type: 'match',
      description: 'Employer Match - Student Loan Program',
      amount: 200,
      status: 'completed',
      balance: 51750
    },
    {
      id: 'TXN-006',
      date: '2025-08-15',
      type: 'loan_payment',
      description: 'Student Loan Payment Verified',
      amount: 450,
      status: 'completed',
      balance: 51550
    },
    {
      id: 'TXN-007',
      date: '2025-08-01',
      type: 'contribution',
      description: 'Employee 401(k) Contribution',
      amount: 520,
      status: 'completed',
      balance: 51100
    },
    {
      id: 'TXN-008',
      date: '2025-08-01',
      type: 'match',
      description: 'Employer Match - Student Loan Program',
      amount: 200,
      status: 'completed',
      balance: 51300
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'text-blue-600 bg-blue-50';
      case 'match':
        return 'text-green-600 bg-green-50';
      case 'loan_payment':
        return 'text-purple-600 bg-purple-50';
      case 'withdrawal':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'failed':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h1>
        <p className="text-gray-600">
          View all your 401(k) contributions, employer matches, and loan payment records
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Contributions (2025)</p>
          <p className="text-2xl font-bold text-blue-600">$5,200</p>
          <p className="text-xs text-gray-500 mt-1">Employee deposits</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Match (2025)</p>
          <p className="text-2xl font-bold text-green-600">$2,000</p>
          <p className="text-xs text-gray-500 mt-1">Employer match</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Loan Payments Verified</p>
          <p className="text-2xl font-bold text-purple-600">$4,050</p>
          <p className="text-xs text-gray-500 mt-1">9 payments this year</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900">$52,200</p>
          <p className="text-xs text-gray-500 mt-1">Total 401(k) value</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-asu-maroon focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="contribution">Contributions</option>
                <option value="match">Employer Match</option>
                <option value="loan_payment">Loan Payments</option>
              </select>
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon-dark transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Transaction ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Description</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-gray-600">
                    {transaction.id}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'contribution' || transaction.type === 'match' ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                      {transaction.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-right">
                    {transaction.type === 'contribution' || transaction.type === 'match' ? (
                      <span className="text-green-600">+{formatCurrency(transaction.amount)}</span>
                    ) : (
                      <span className="text-red-600">-{formatCurrency(transaction.amount)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(transaction.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No results message */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
