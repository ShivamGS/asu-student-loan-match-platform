import { CheckCircle, XCircle, FileText, Calendar, AlertCircle } from 'lucide-react';

const requirements = [
  {
    icon: CheckCircle,
    title: 'Full-Time ASU Employee',
    description: 'You must be a full-time ASU employee eligible for the 401(k) retirement plan.',
    required: true,
  },
  {
    icon: CheckCircle,
    title: 'Qualified Education Loans',
    description: 'You must have federal or private student loans taken out for your own education at an eligible institution.',
    required: true,
  },
  {
    icon: CheckCircle,
    title: 'Active Loan Payments',
    description: 'You must be actively making payments on your qualified student loans.',
    required: true,
  },
  {
    icon: CheckCircle,
    title: 'Annual Certification',
    description: 'You must submit annual documentation certifying your student loan payments through the ASU Benefits portal.',
    required: true,
  },
];

const qualifiedLoans = [
  { name: 'Federal Direct Loans', qualified: true },
  { name: 'Federal Stafford Loans', qualified: true },
  { name: 'Federal PLUS Loans (for own education)', qualified: true },
  { name: 'Private Student Loans', qualified: true },
  { name: 'Graduate/Professional School Loans', qualified: true },
  { name: 'Parent PLUS Loans', qualified: false },
  { name: 'Loans for someone else\'s education', qualified: false },
  { name: 'Personal loans or credit cards', qualified: false },
  { name: 'Home equity loans for education', qualified: false },
];

const timeline = [
  {
    month: 'January',
    event: 'Annual Certification Period Opens',
    description: 'Submit documentation of previous year\'s loan payments',
  },
  {
    month: 'February',
    event: 'Certification Deadline',
    description: 'Last day to submit certification for previous year',
  },
  {
    month: 'March-April',
    event: 'Processing Period',
    description: 'ASU HR reviews and processes certifications',
  },
  {
    month: 'May',
    event: 'Match Contributions Deposited',
    description: 'Approved matches are contributed to 401(k) accounts',
  },
];

const documents = [
  'Loan servicer statements showing payment history',
  'Bank statements showing loan payments',
  'Online payment confirmation receipts',
  'Loan account screenshots with payment records',
  'Year-end loan summary statements',
];

export default function Eligibility() {
  return (
    <div>
      <section className="bg-gradient-to-br from-asu-maroon to-asu-maroon-dark py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Eligibility Requirements
          </h1>
          <p className="text-xl text-asu-gray-100">
            Find out if you qualify for ASU's Student Loan Retirement Matching program
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-8 text-center">
            Who Can Participate?
          </h2>
          <div className="space-y-6">
            {requirements.map((req, index) => {
              const Icon = req.icon;
              return (
                <div key={index} className="flex gap-4 items-start bg-asu-gray-50 p-6 rounded-lg border-l-4 border-asu-gold">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-asu-gold rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-asu-maroon" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-asu-maroon mb-1">{req.title}</h3>
                    <p className="text-asu-gray-700">{req.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Important Note</h4>
                <p className="text-blue-800 text-sm">
                  You do not need to make 401(k) contributions to receive the student loan match. However,
                  the total combined match from both sources cannot exceed the annual program cap (typically 4% of salary).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-asu-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-4 text-center">
            Qualified Loan Types
          </h2>
          <p className="text-center text-asu-gray-600 mb-8">
            Not all education-related debt qualifies for the matching program
          </p>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-asu-gray-200">
              {qualifiedLoans.map((loan, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-asu-gray-50">
                  <span className="font-medium text-asu-gray-800">{loan.name}</span>
                  <div className="flex items-center gap-2">
                    {loan.qualified ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">Qualified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">Not Qualified</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">Loan Requirements</h4>
                <p className="text-yellow-800 text-sm">
                  To qualify, loans must have been taken out for your own education at an eligible
                  educational institution. The institution must be eligible to participate in federal
                  student aid programs under Title IV of the Higher Education Act.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-8 text-center">
            Annual Timeline
          </h2>
          <div className="relative">
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-asu-gray-200" />

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative">
                  <div className="md:flex items-center">
                    <div className="md:w-1/2 md:pr-8 md:text-right mb-4 md:mb-0">
                      <h3 className="text-xl font-bold text-asu-maroon mb-1">{item.month}</h3>
                      <p className="text-lg font-semibold text-asu-gray-700">{item.event}</p>
                    </div>

                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center w-12 h-12 bg-asu-gold rounded-full border-4 border-white shadow-md z-10">
                      <Calendar className="h-6 w-6 text-asu-maroon" />
                    </div>

                    <div className="md:w-1/2 md:pl-8">
                      <p className="text-asu-gray-600 bg-asu-gray-50 p-4 rounded-lg">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-asu-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-4 text-center">
            Required Documentation
          </h2>
          <p className="text-center text-asu-gray-600 mb-8">
            Acceptable documents for annual certification
          </p>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-asu-gold rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-asu-maroon" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-asu-maroon mb-2">
                  What You'll Need to Submit
                </h3>
                <p className="text-asu-gray-600 mb-4">
                  You must provide documentation showing the total amount of qualified student loan
                  payments you made during the previous calendar year.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-asu-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-asu-gold flex-shrink-0 mt-0.5" />
                  <span className="text-asu-gray-700">{doc}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Keep copies of all loan statements throughout the year. Most loan
                servicers provide annual summaries in January that show your total payments for the
                previous year.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-asu-maroon text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Think You Qualify?
          </h2>
          <p className="text-xl text-asu-gray-100 mb-8">
            Get started with enrollment or calculate your potential match
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/get-started"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-asu-maroon bg-asu-gold rounded-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </a>
            <a
              href="/calculator"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-asu-maroon transition-all"
            >
              Calculate Match
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
