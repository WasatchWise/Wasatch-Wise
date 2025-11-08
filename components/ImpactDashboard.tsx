import React, { useState, useEffect } from 'react';
import { HelpListAPI } from '../services/supabaseService';

interface ImpactStats {
  totalRequests: number;
  totalDelivered: number;
  activeHelpers: number;
  citiesServed: number;
}

export const ImpactDashboard: React.FC = () => {
  const [stats, setStats] = useState<ImpactStats>({
    totalRequests: 0,
    totalDelivered: 0,
    activeHelpers: 0,
    citiesServed: 1
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [requestsRes, tasksRes] = await Promise.all([
          HelpListAPI.getAvailableRequests(),
          HelpListAPI.getMyTasks('00000000-0000-0000-0000-000000000001')
        ]);

        const allRequests = [...(requestsRes.data || []), ...(tasksRes.data || [])];
        const delivered = tasksRes.data?.filter(t => t.status === 'delivered').length || 0;
        const cities = new Set(allRequests.map(r => r.city).filter(Boolean));

        setStats({
          totalRequests: allRequests.length,
          totalDelivered: delivered,
          activeHelpers: delivered > 0 ? 1 : 0, // Simplified for MVP
          citiesServed: cities.size
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  const StatCard: React.FC<{ label: string; value: number; icon: string; color: string }> = ({ label, value, icon, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-transform duration-300 animate-fade-in`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
        <span className={`text-3xl md:text-4xl font-bold font-display`}>
          {value}
        </span>
      </div>
      <p className="text-sm md:text-base font-medium opacity-90">{label}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secure-slate font-display mb-2">Community Impact</h2>
        <p className="text-gray-600">Real neighbors helping real neighbors</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Requests"
          value={stats.totalRequests}
          icon="📋"
          color="from-dignity-purple to-purple-700"
        />
        <StatCard
          label="Delivered"
          value={stats.totalDelivered}
          icon="✅"
          color="from-sanctuary-green to-green-700"
        />
        <StatCard
          label="Active Helpers"
          value={stats.activeHelpers}
          icon="💚"
          color="from-trust-teal to-teal-700"
        />
        <StatCard
          label="Cities Served"
          value={stats.citiesServed}
          icon="🌍"
          color="from-shield-blue to-blue-700"
        />
      </div>

      {stats.totalDelivered > 0 && (
        <div className="bg-sanctuary-green/10 rounded-lg p-4 border-l-4 border-sanctuary-green animate-slide-in">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-sanctuary-green">{stats.totalDelivered} families</span> have received help through The Help List.
            {stats.totalDelivered === 1 ? " You're witnessing the start of something beautiful." : " Together, we're building a culture of care."}
          </p>
        </div>
      )}

      {stats.totalRequests === 0 && (
        <div className="bg-dignity-purple/10 rounded-lg p-4 border-l-4 border-dignity-purple">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-dignity-purple">Be the first!</span> Submit a request or offer to help, and you'll see the impact grow in real-time.
          </p>
        </div>
      )}
    </div>
  );
};
