import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-asu-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-6 text-left flex justify-between items-center hover:bg-asu-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-asu-maroon pr-8">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-asu-maroon flex-shrink-0 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-asu-gray-700">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

interface FAQAccordionProps {
  faqs: FAQItemProps[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
}
