import { ArrowRight, FileCheck, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import FAQAccordion from '../components/FAQAccordion';

const processSteps = [
  {
    icon: Wallet,
    title: 'You Make Student Loan Payments',
    description: 'Continue making regular monthly payments toward your qualified federal or private education loans. These payments must be toward loans you took out for your own education.',
  },
  {
    icon: FileCheck,
    title: 'Certify Your Payments Annually',
    description: 'Once per year, submit documentation showing your student loan payments through the ASU Benefits portal. You can submit statements from your loan servicer or bank records.',
  },
  {
    icon: DollarSign,
    title: 'ASU Contributes to Your 401(k)',
    description: 'ASU matches your certified payments by contributing directly to your 401(k) retirement account. The match is calculated based on eligible payments up to program limits.',
  },
  {
    icon: TrendingUp,
    title: 'Your Retirement Savings Grow',
    description: 'Your matched contributions are invested in your chosen 401(k) funds, growing tax-deferred through compound returns. The sooner you start, the more your savings can grow.',
  },
];

const comparisonData = {
  withoutMatch: [
    { year: 1, balance: 0 },
    { year: 2, balance: 0 },
    { year: 3, balance: 0 },
    { year: 4, balance: 0 },
    { year: 5, balance: 0 },
  ],
  withMatch: [
    { year: 1, match: 3000, balance: 3210 },
    { year: 2, match: 3000, balance: 6646 },
    { year: 3, match: 3000, balance: 10321 },
    { year: 4, match: 3000, balance: 14254 },
    { year: 5, match: 3000, balance: 18462 },
  ],
};

const faqs = [
  {
    question: 'Who is eligible for the Student Loan Retirement Matching program?',
    answer: 'All full-time ASU employees who are making payments on qualified education loans are eligible. You must have taken out the loans for your own education, and the loans must meet federal guidelines for qualified education expenses.',
  },
  {
    question: 'What types of student loans qualify?',
    answer: 'Both federal and private student loans qualify, as long as they were used to pay for qualified education expenses at an eligible educational institution. This includes undergraduate, graduate, and professional degree programs. Parent PLUS loans and loans for someone else\'s education do not qualify.',
  },
  {
    question: 'How much will ASU match?',
    answer: 'ASU matches your certified student loan payments at the same rate as traditional 401(k) contributions, up to 6% of your eligible compensation. The total match (student loan + traditional 401(k)) cannot exceed the annual cap, typically 4% of your salary.',
  },
  {
    question: 'How do I certify my student loan payments?',
    answer: 'Once per year during the certification period, you\'ll submit documentation through the ASU Benefits portal. Acceptable documents include loan servicer statements, payment confirmations, or bank records showing your loan payments. The certification period is typically in January of each year.',
  },
  {
    question: 'Can I participate if I\'m already contributing to my 401(k)?',
    answer: 'Yes! The student loan match is in addition to any match you receive from your own 401(k) contributions. However, your total combined match (from both sources) cannot exceed the program cap. This means you can maximize your benefits by utilizing both programs up to the limit.',
  },
  {
    question: 'When do the matched contributions appear in my 401(k)?',
    answer: 'After your annual certification is approved, ASU will make the matching contribution to your 401(k) account. This typically occurs within 30-60 days of certification approval. The match is based on your total certified payments for the previous calendar year.',
  },
  {
    question: 'What if I pay off my student loans during the year?',
    answer: 'You can still certify all payments you made during the calendar year, even if you paid off the loan completely. ASU will match all eligible payments you made before the loan was paid off, up to the program limits.',
  },
  {
    question: 'Are there any tax implications?',
    answer: 'The ASU match is treated like any other employer 401(k) contribution. The match is not taxed when contributed, and your account grows tax-deferred. You\'ll pay ordinary income tax when you withdraw funds in retirement. Consult with a tax professional for advice specific to your situation.',
  },
];

export default function HowItWorks() {
  return (
    <div>
      <section className="bg-gradient-to-br from-asu-maroon to-asu-maroon-dark py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            How It Works
          </h1>
          <p className="text-xl text-asu-gray-100">
            Understanding ASU's Student Loan Retirement Matching is simple. Follow these four steps
            to start building your retirement while paying down your student loans.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-12 text-center">
            The Process
          </h2>
          <div className="space-y-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-16 h-16 bg-asu-gold rounded-full">
                      <Icon className="h-8 w-8 text-asu-maroon" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-asu-maroon bg-asu-gray-100 px-3 py-1 rounded-full">
                        Step {index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-asu-maroon">{step.title}</h3>
                    </div>
                    <p className="text-asu-gray-700">{step.description}</p>
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="h-6 w-6 text-asu-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-asu-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-4 text-center">
            5-Year Comparison
          </h2>
          <p className="text-center text-asu-gray-600 mb-12 max-w-2xl mx-auto">
            See the difference ASU's matching can make. This example assumes $500/month in student
            loan payments with a 6% match rate and 7% annual investment return.
          </p>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-asu-maroon text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Year</th>
                    <th className="px-6 py-4 text-right font-semibold">Without Match</th>
                    <th className="px-6 py-4 text-right font-semibold">ASU Annual Match</th>
                    <th className="px-6 py-4 text-right font-semibold">With Match Balance</th>
                    <th className="px-6 py-4 text-right font-semibold">Benefit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-asu-gray-200">
                  {comparisonData.withMatch.map((row, index) => {
                    const withoutMatch = comparisonData.withoutMatch[index];
                    return (
                      <tr key={row.year} className="hover:bg-asu-gray-50">
                        <td className="px-6 py-4 font-medium text-asu-maroon">{row.year}</td>
                        <td className="px-6 py-4 text-right text-asu-gray-600">
                          ${withoutMatch.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-asu-gold">
                          ${row.match.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-asu-maroon">
                          ${row.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">
                          +${row.balance.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-asu-gray-50 px-6 py-4 border-t-2 border-asu-gold">
              <p className="text-sm text-asu-gray-600 text-center">
                After 5 years, you could have <span className="font-bold text-asu-maroon">$18,462</span> in
                additional retirement savings through ASU's matching program.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-4 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-asu-gray-600 mb-8">
            Get answers to common questions about the program
          </p>
          <FAQAccordion faqs={faqs} />
        </div>
      </section>
    </div>
  );
}
