import React, { useEffect, useState } from 'react';
import { Package, Users, Building, TrendingUp, Heart } from 'lucide-react';
import { api } from '../../services/api';
import { Analytics } from '../../types';

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Donation, donor and beneficiary impact overview</p>
      </div>

      {loading && (
        <div className="text-sm text-gray-600">Loading analytics...</div>
      )}

      {analytics && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Donations</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.totalDonations}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Donors</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.activeDonors}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Beneficiaries</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.beneficiariesServed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Food Saved</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.foodSaved}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Impact Score</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.impactScore}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Impact by Metric</h2>
              <div className="text-sm text-gray-500">Top indicators</div>
            </div>

            {(() => {
              const values = [
                { key: 'donations', label: 'Donations', value: analytics.totalDonations, color: 'bg-emerald-600', border: 'border-emerald-700' },
                { key: 'donors', label: 'Donors', value: analytics.activeDonors, color: 'bg-blue-600', border: 'border-blue-700' },
                { key: 'beneficiaries', label: 'Beneficiaries', value: analytics.beneficiariesServed, color: 'bg-purple-600', border: 'border-purple-700' },
                { key: 'food', label: 'Food Saved', value: analytics.foodSaved, color: 'bg-red-600', border: 'border-red-700' },
              ];
              const maxValue = Math.max(...values.map((v) => Number(v.value) || 0), 1);

              // Tailwind `h-52` = 13rem = ~208px. Using pixels avoids `%` height issues in flex layouts.
              const maxBarHeightPx = 208;

              return (
                <div>
                  <div className="h-52 flex items-end gap-4">
                    {values.map((v) => {
                      const raw = Number(v.value) || 0;
                      const barHeightPx = Math.max(10, Math.round((raw / maxValue) * maxBarHeightPx));

                      return (
                        <div key={v.key} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                          <div
                            className={`w-full rounded-lg ${v.color} border ${v.border}`}
                            style={{ height: `${barHeightPx}px` }}
                            title={`${v.label}: ${v.value}`}
                          />
                          <div className="text-xs text-gray-600 truncate">{v.label}</div>
                          <div className="text-sm font-medium text-gray-900">{v.value}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Colored indicators are scaled relative to the largest value.
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Donut chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Overall Impact Score</h2>
              <div className="text-sm text-gray-500">{analytics.impactScore}%</div>
            </div>

            {(() => {
              const size = 180;
              const stroke = 14;
              const radius = (size - stroke) / 2;
              const circumference = 2 * Math.PI * radius;
              const score = Math.max(0, Math.min(100, analytics.impactScore));
              const offset = circumference - (score / 100) * circumference;

              return (
                <div className="flex flex-col items-center">
                  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="rgb(229 231 235)"
                      strokeWidth={stroke}
                      fill="none"
                    />
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="rgb(245 158 11)"
                      strokeWidth={stroke}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                  </svg>
                  <div className="mt-[-145px] text-center">
                    <div className="text-4xl font-bold text-gray-900">{score}%</div>
                    <div className="text-sm text-gray-600">Impact score</div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Calculated from donations, active donors and beneficiaries.
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

