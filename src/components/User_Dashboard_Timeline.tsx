import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, CheckCircle, Sparkles, LucideIcon } from 'lucide-react';
import { getCurrentUserAsuId } from '../services/sessionHelper';

interface Milestone {
  date: string;
  year: number;
  label: string;
  iconComponent: LucideIcon;
  achieved: boolean;
  description: string;
  position: number;
}

interface TimelineProps {
  loanTenureYears?: number;
  enrollmentDate?: string;
  currentAge?: number;
  retirementAge?: number;
}

export default function User_Dashboard_Timeline({
  loanTenureYears: propLoanTenure,
  enrollmentDate: propEnrollmentDate,
  currentAge: propCurrentAge,
  retirementAge: propRetirementAge
}: TimelineProps = {}) {
  const [loading, setLoading] = useState(true);
  const [enrollmentDate, setEnrollmentDate] = useState<Date>(new Date('2022-10-01'));
  const [loanTenureYears, setLoanTenureYears] = useState<number>(14);
  const [currentAge, setCurrentAge] = useState<number>(36);
  const [retirementAge, setRetirementAge] = useState<number>(65);

  useEffect(() => {
    const fetchData = async () => {
      const asuId = getCurrentUserAsuId();

      if (!asuId) {
        console.log('⏳ [TIMELINE] No ASU ID found, using defaults');
        applyDefaults();
        setLoading(false);
        return;
      }

      try {
        console.log('📥 [TIMELINE] Fetching documents for ASU ID:', asuId);

        // Fetch user data to get enrollment/application date
        const userResponse = await fetch(
          `https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users/${asuId}`
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('📥 [TIMELINE] User data:', userData);

          // Get application date as enrollment date
          const appDate = userData.user?.loanApplication?.applicationDate;
          if (appDate) {
            setEnrollmentDate(new Date(appDate));
            console.log('✅ [TIMELINE] Enrollment date:', appDate);
          }

          // Get loan tenure from latestRecommendation
          if (userData.user?.latestRecommendation?.financialProjections?.loanPayoffProjection?.originalTenureYears) {
            const tenureMonths = userData.user.latestRecommendation.financialProjections.loanPayoffProjection.originalTenureYears;
            const tenureYears = Math.round(tenureMonths / 12);
            setLoanTenureYears(tenureYears);
            console.log('✅ [TIMELINE] Loan tenure (years):', tenureYears);
          }

          // If ages are provided via user data, use them (for future enhancement)
          // For now, we'll use defaults for age
        }

        // Fetch documents to get upload date
        const docsResponse = await fetch(
          `https://sixk0qljdk.execute-api.us-east-1.amazonaws.com/prod/admin/users/${asuId}/documents`
        );

        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          console.log('📥 [TIMELINE] Documents data:', docsData);

          // If uploadedAt exists, use it as enrollment date if earlier than application date
          if (docsData.uploadedAt) {
            const uploadDate = new Date(docsData.uploadedAt);
            if (uploadDate < enrollmentDate) {
              setEnrollmentDate(uploadDate);
              console.log('✅ [TIMELINE] Using document upload date:', docsData.uploadedAt);
            }
          }
        }

        console.log('📥 [TIMELINE] Loaded documents:', docsData.hasDocuments ? 'Yes' : 'No');
      } catch (err) {
        console.error('❌ [TIMELINE] Error fetching data:', err);
        applyDefaults();
      } finally {
        setLoading(false);
      }
    };

    // Apply props if provided, otherwise fetch from API
    if (propLoanTenure !== undefined && propEnrollmentDate && propCurrentAge && propRetirementAge) {
      console.log('📥 [TIMELINE] Using provided props');
      setLoanTenureYears(propLoanTenure);
      setEnrollmentDate(new Date(propEnrollmentDate));
      setCurrentAge(propCurrentAge);
      setRetirementAge(propRetirementAge);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [propLoanTenure, propEnrollmentDate, propCurrentAge, propRetirementAge]);

  const applyDefaults = () => {
    // Use prop values or defaults
    if (propLoanTenure) setLoanTenureYears(propLoanTenure);
    if (propEnrollmentDate) setEnrollmentDate(new Date(propEnrollmentDate));
    if (propCurrentAge) setCurrentAge(propCurrentAge);
    if (propRetirementAge) setRetirementAge(propRetirementAge);
  };

  // Calculate dates
  const currentDate = new Date();
  const actualYears = loanTenureYears / 12;
  const loanPayoffDate = new Date(enrollmentDate);
  loanPayoffDate.setFullYear(loanPayoffDate.getFullYear() + actualYears);

  // Calculate retirement date based on age
  const yearsToRetirement = retirementAge - currentAge;
  const retirementDate = new Date(currentDate);
  retirementDate.setFullYear(retirementDate.getFullYear() + yearsToRetirement);

  // Calculate total timeline
  const totalDays = (retirementDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24);

  // Calculate position for each milestone
  const enrollmentPosition = 0;
  const currentPosition = Math.min(
    100,
    Math.max(
      0,
      Math.round(((currentDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100)
    )
  );
  const loanPayoffPosition = Math.min(
    100,
    Math.max(
      0,
      Math.round(((loanPayoffDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100)
    )
  );
  const retirementPosition = 100;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const milestones: Milestone[] = [
    {
      date: formatDate(enrollmentDate),
      year: enrollmentDate.getFullYear(),
      label: 'Program Enrollment',
      iconComponent: Calendar,
      achieved: true,
      description: 'Started receiving employer match',
      position: enrollmentPosition
    },
    {
      date: formatDate(currentDate),
      year: currentDate.getFullYear(),
      label: 'Today',
      iconComponent: TrendingUp,
      achieved: true,
      description: `${Math.floor((currentDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24 * 365))} years of participation`,
      position: currentPosition
    },
    {
      date: formatDate(loanPayoffDate),
      year: loanPayoffDate.getFullYear(),
      label: 'Loan Payoff',
      iconComponent: CheckCircle,
      achieved: false,
      description: 'Student loans fully paid',
      position: loanPayoffPosition
    },
    {
      date: formatDate(retirementDate),
      year: retirementDate.getFullYear(),
      label: 'Retirement',
      iconComponent: Sparkles,
      achieved: false,
      description: `Target retirement age ${retirementAge}`,
      position: retirementPosition
    },
  ];

  // Calculate years for stats
  const yearsEnrolled = Math.floor((currentDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  const yearsToLoanPayoff = Math.max(0, Math.floor((loanPayoffDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 365)));
  const yearsToRetirementCalc = Math.max(0, Math.floor((retirementDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 365)));

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-asu-maroon mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading timeline...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Your Financial Journey</h2>
          <p className="text-sm text-gray-500">From enrollment to retirement</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-asu-maroon">{yearsEnrolled} years</p>
          <p className="text-xs text-gray-500">In Program</p>
        </div>
      </div>

      {/* Progress Bar with Icon Pointers */}
      <div className="relative mb-16 mt-8">
        {/* Background bar */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Filled progress - only up to current date */}
          <div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${currentPosition}%` }}
          />
        </div>

        {/* Milestone Pointers with Icons */}
        {milestones.map((milestone, index) => {
          const IconComponent = milestone.iconComponent;
          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2"
              style={{
                left: `${milestone.position}%`,
                top: '-10px'
              }}
            >
              {/* Pointer with icon inside */}
              <div
                className={`w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all ${
                  milestone.label === 'Today' 
                    ? 'bg-asu-maroon ring-2 ring-asu-maroon/20' 
                    : milestone.achieved 
                    ? 'bg-green-600' 
                    : 'bg-gray-400'
                }`}
              >
                <div className="text-white">
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* "You are here" label for Today */}
              {milestone.label === 'Today' && (
                <div className="absolute top-11 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-asu-maroon text-white text-xs font-semibold px-2 py-1 rounded shadow-lg">
                    You are here
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Milestones Cards */}
      <div className="grid grid-cols-4 gap-4">
        {milestones.map((milestone, index) => {
          const IconComponent = milestone.iconComponent;
          return (
            <div key={index} className="text-center">
              <div
                className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center transition-all ${
                  milestone.achieved 
                    ? 'bg-green-100 text-green-600 ring-2 ring-green-200' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <p className={`text-sm font-bold mb-1 ${
                milestone.achieved ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {milestone.label}
              </p>
              <p className="text-xs text-gray-600 mb-1">{milestone.date}</p>
              <p className="text-xs text-gray-500">{milestone.description}</p>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{yearsEnrolled}</p>
          <p className="text-xs text-gray-500">Years Enrolled</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{yearsToLoanPayoff}</p>
          <p className="text-xs text-gray-500">Years to Loan Payoff</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{yearsToRetirementCalc}</p>
          <p className="text-xs text-gray-500">Years to Retirement</p>
        </div>
      </div>
    </div>
  );
}
