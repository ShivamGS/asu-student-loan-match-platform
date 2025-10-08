import { CheckSquare, Download, Mail, Phone, ExternalLink, FileText, Users, Calendar, LucideIcon } from 'lucide-react';

const enrollmentSteps = [
  {
    number: 1,
    title: 'Review Eligibility',
    description: 'Confirm you meet all eligibility requirements including full-time employment status and qualified education loans.',
    action: 'Review requirements',
    link: '/eligibility',
  },
  {
    number: 2,
    title: 'Calculate Your Match',
    description: 'Use our calculator to estimate your potential matching contributions and understand the program benefits.',
    action: 'Use calculator',
    link: '/calculator',
  },
  {
    number: 3,
    title: 'Gather Documentation',
    description: 'Collect loan statements, payment records, and proof of loan ownership for the certification process.',
    action: 'See required documents',
    link: '/eligibility',
  },
  {
    number: 4,
    title: 'Complete Enrollment Form',
    description: 'Fill out the program enrollment form through the ASU Benefits portal to indicate your intent to participate.',
    action: 'Visit Benefits Portal',
    link: 'https://cfo.asu.edu/hr-benefits',
    external: true,
  },
  {
    number: 5,
    title: 'Submit Annual Certification',
    description: 'During the certification period (typically January), submit documentation of your previous year\'s loan payments.',
    action: 'Mark your calendar',
    link: null,
  },
  {
    number: 6,
    title: 'Receive Your Match',
    description: 'After certification approval, ASU will contribute matching funds to your 401(k) account (typically by May).',
    action: null,
    link: null,
  },
];

interface ContactDetail {
  icon: LucideIcon;
  text: string;
  link?: string;
}

interface Contact {
  icon: LucideIcon;
  title: string;
  details: ContactDetail[];
  hours: string;
}

const contacts: Contact[] = [
  {
    icon: Users,
    title: 'ASU HR Benefits Office',
    details: [
      { icon: Phone, text: '480-965-3365' },
      { icon: Mail, text: 'benefits@asu.edu' },
    ],
    hours: 'Monday - Friday, 8:00 AM - 5:00 PM MST',
  },
  {
    icon: FileText,
    title: 'Benefits Portal',
    details: [
      { icon: ExternalLink, text: 'Visit ASU Benefits Portal', link: 'https://cfo.asu.edu/hr-benefits' },
    ],
    hours: 'Online access available 24/7',
  },
];

const checklistItems = [
  'Verify full-time employment status',
  'Confirm loan types are qualified education loans',
  'Gather loan servicer statements from previous year',
  'Collect payment confirmation records',
  'Review loan documentation for completeness',
  'Calculate estimated annual match amount',
  'Mark certification deadline on calendar',
  'Save ASU Benefits contact information',
];

const importantDates = [
  { month: 'January 1-15', event: 'Certification period opens', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { month: 'January 31', event: 'Certification deadline', color: 'bg-red-100 text-red-800 border-red-300' },
  { month: 'March-April', event: 'Processing period', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { month: 'May', event: 'Match contributions deposited', color: 'bg-green-100 text-green-800 border-green-300' },
];

export default function GetStarted() {
  return (
    <div>
      <section className="bg-gradient-to-br from-asu-maroon to-asu-maroon-dark py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Get Started
          </h1>
          <p className="text-xl text-asu-gray-100">
            Follow these steps to enroll in ASU's Student Loan Retirement Matching program
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-8 text-center">
            Enrollment Process
          </h2>
          <div className="space-y-6">
            {enrollmentSteps.map((step) => (
              <div key={step.number} className="bg-asu-gray-50 rounded-lg p-6 border-l-4 border-asu-gold hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-asu-maroon text-white rounded-full flex items-center justify-center font-bold text-xl">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-asu-maroon mb-2">{step.title}</h3>
                    <p className="text-asu-gray-700 mb-3">{step.description}</p>
                    {step.action && (
                      <a
                        href={step.link || '#'}
                        target={step.external ? '_blank' : undefined}
                        rel={step.external ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center text-asu-maroon hover:text-asu-maroon-dark font-semibold"
                      >
                        {step.action}
                        {step.external && <ExternalLink className="ml-1 h-4 w-4" />}
                        {!step.external && step.link && <span className="ml-1">→</span>}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-asu-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-8 text-center">
            Important Dates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importantDates.map((date, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${date.color}`}>
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <p className="font-bold">{date.month}</p>
                    <p className="text-sm">{date.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-8 text-center">
            Pre-Enrollment Checklist
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-asu-gray-200">
            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <label key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-asu-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 text-asu-maroon border-asu-gray-300 rounded focus:ring-asu-maroon"
                  />
                  <span className="text-asu-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-6 py-3 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon-dark transition-colors font-semibold"
            >
              <Download className="mr-2 h-5 w-5" />
              Print Checklist
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-asu-gray-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-asu-maroon mb-8 text-center">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-asu-gold rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-asu-maroon" />
                    </div>
                    <h3 className="text-xl font-bold text-asu-maroon">{contact.title}</h3>
                  </div>
                  <div className="space-y-3 mb-4">
                    {contact.details.map((detail, idx) => {
                      const DetailIcon = detail.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <DetailIcon className="h-5 w-5 text-asu-gray-500" />
                          {detail.link ? (
                            <a
                              href={detail.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-asu-maroon hover:text-asu-maroon-dark hover:underline"
                            >
                              {detail.text}
                            </a>
                          ) : (
                            <span className="text-asu-gray-700">{detail.text}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-asu-gray-500 italic">{contact.hours}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-asu-maroon to-asu-maroon-dark rounded-lg p-8 text-white text-center">
            <CheckSquare className="h-12 w-12 text-asu-gold mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">
              Questions About Enrollment?
            </h2>
            <p className="text-lg text-asu-gray-100 mb-6">
              The ASU Benefits team is here to help you through every step of the enrollment process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:benefits@asu.edu"
                className="inline-flex items-center justify-center px-6 py-3 bg-asu-gold text-asu-maroon rounded-lg hover:bg-yellow-400 transition-all font-semibold"
              >
                <Mail className="mr-2 h-5 w-5" />
                Email Benefits Team
              </a>
              <a
                href="tel:480-965-3365"
                className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-asu-maroon transition-all font-semibold"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call 480-965-3365
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
