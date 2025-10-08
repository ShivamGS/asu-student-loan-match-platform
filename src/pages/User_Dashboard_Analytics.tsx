import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function User_Dashboard_Analytics() {
  // ✅ CORRECTED: Retirement projection data with realistic "Without Match" scenario
  // "Without Match" = $0 because employee has 96.52% DTI and cannot save
  // This demonstrates the TRUE VALUE of the SECURE 2.0 match program
  const retirementComparisonData = [
    { year: 2025, withMatch: 0, withoutMatch: 0 },
    { year: 2026, withMatch: 260, withoutMatch: 0 },
    { year: 2027, withMatch: 537, withoutMatch: 0 },
    { year: 2028, withMatch: 834, withoutMatch: 0 },
    { year: 2030, withMatch: 1492, withoutMatch: 0 },
    { year: 2035, withMatch: 3585, withoutMatch: 0 },
    { year: 2040, withMatch: 5956, withoutMatch: 0 },
    { year: 2045, withMatch: 10008, withoutMatch: 0 },
    { year: 2050, withMatch: 15405, withoutMatch: 0 },
    { year: 2055, withMatch: 21507, withoutMatch: 0 },
  ];

  // Contribution breakdown for 2025 YTD (through October)
  // Student loan match program: $0 employee direct contributions
  // Employer match: $22.67/month × 10 months = $227
  const contributionBreakdown = [
    { name: 'Employee Contributions', value: 0, color: '#3B82F6' },
    { name: 'Employer Match', value: 227, color: '#10B981' },
    { name: 'Investment Returns', value: 0, color: '#8B5CF6' },
  ];

  // Monthly contribution data for 2025 (January through October)
  // Reflects SECURE 2.0 student loan retirement match structure
  const monthlyContributions = [
    { month: 'Jan', employee: 0, employer: 22.67 },
    { month: 'Feb', employee: 0, employer: 22.67 },
    { month: 'Mar', employee: 0, employer: 22.67 },
    { month: 'Apr', employee: 0, employer: 22.67 },
    { month: 'May', employee: 0, employer: 22.67 },
    { month: 'Jun', employee: 0, employer: 22.67 },
    { month: 'Jul', employee: 0, employer: 22.67 },
    { month: 'Aug', employee: 0, employer: 22.67 },
    { month: 'Sep', employee: 0, employer: 22.67 },
    { month: 'Oct', employee: 0, employer: 22.67 },
  ];

  const totalValue = contributionBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Visualize your retirement savings growth and contribution patterns
        </p>
      </div>

      {/* Retirement Growth Comparison Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Retirement Account Growth Projection</h2>
        <p className="text-sm text-gray-600 mb-6">
          Compare projected 401(k) balance with and without employer match program
        </p>

        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={retirementComparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              formatter={(value) => `$${Number(value).toLocaleString()}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {/* WITH MATCH LINE - Green solid line */}
            <Line
              type="monotone"
              dataKey="withMatch"
              stroke="#10B981"
              strokeWidth={3}
              name="With Employer Match"
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            {/* WITHOUT MATCH LINE - Red dashed line (stays at $0) */}
            <Line
              type="monotone"
              dataKey="withoutMatch"
              stroke="#EF4444"
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Without Match"
              dot={{ fill: '#EF4444', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Key Insights - ✅ UPDATED to show correct comparison */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-800 mb-1">With Match (2055)</p>
            <p className="text-2xl font-bold text-green-900">$21.5K</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-800 mb-1">Without Match (2055)</p>
            <p className="text-2xl font-bold text-red-900">$0</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">Program Benefit</p>
            <p className="text-2xl font-bold text-blue-900">+$21.5K</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contribution Breakdown Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">2025 Contribution Breakdown</h2>
          <p className="text-sm text-gray-600 mb-6">Total: ${totalValue.toLocaleString()} (YTD through October)</p>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contributionBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {contributionBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend - Shows all information clearly */}
          <div className="mt-4 space-y-2">
            {contributionBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Contributions Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Contributions (2025)</h2>
          <p className="text-sm text-gray-600 mb-6">Employer match contributions by month</p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyContributions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="employee" fill="#3B82F6" name="Employee" />
              <Bar dataKey="employer" fill="#10B981" name="Employer Match" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table - ✅ UPDATED with correct values */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Program Impact Comparison</h2>
        <p className="text-sm text-gray-600 mb-6">Estimated retirement savings with vs without program participation</p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Scenario</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Annual Contribution</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Years to Retirement</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Projected Balance</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">
                  <div className="font-medium">With Program</div>
                  <div className="text-xs text-gray-500">Employer Match (50%)</div>
                </td>
                <td className="text-right py-3 px-4 text-gray-900">$272</td>
                <td className="text-right py-3 px-4 text-gray-900">30</td>
                <td className="text-right py-3 px-4 font-semibold text-green-600">$21,507</td>
                <td className="text-right py-3 px-4 font-semibold text-green-600">+$21,507</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">
                  <div className="font-medium">Without Program</div>
                  <div className="text-xs text-gray-500">No Savings (96.52% DTI)</div>
                </td>
                <td className="text-right py-3 px-4 text-gray-900">$0</td>
                <td className="text-right py-3 px-4 text-gray-900">0</td>
                <td className="text-right py-3 px-4 text-gray-600">$0</td>
                <td className="text-right py-3 px-4 text-gray-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Program Benefit:</strong> By participating in the Student Loan Retirement Match program,
            you're projected to accumulate <strong>$21,507</strong> in retirement savings over 30 years.
            Without this program, the high debt-to-income ratio of 96.52% makes retirement savings impossible.
          </p>
        </div>
      </div>
    </div>
  );
}
