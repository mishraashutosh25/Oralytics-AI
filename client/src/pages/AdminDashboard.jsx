import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ServerURL } from '../App';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Activity, DollarSign, TrendingUp, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${ServerURL}/api/admin/stats`, { withCredentials: true });
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-slate-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-slate-300">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-32 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-slate-300 flex flex-col font-sans selection:bg-indigo-500/30">
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mb-10'>
          <h1 className='text-3xl md:text-5xl font-black text-white mb-3 tracking-tight'>Platform Admin</h1>
          <p className='text-slate-400 text-sm'>Real-time tracking of users, revenue, and active AI sessions.</p>
        </motion.div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-lg hover:border-indigo-500/20 transition-all">
            <div className="flex justify-between items-center mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Total Users</p>
            <h3 className="text-4xl font-black text-white">{stats?.totalUsers || 0}</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-lg hover:border-cyan-500/20 transition-all">
            <div className="flex justify-between items-center mb-6">
              <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Total Mock Sessions</p>
            <h3 className="text-4xl font-black text-white">{stats?.totalSessions || 0}</h3>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-lg hover:border-emerald-500/20 transition-all">
            <div className="flex justify-between items-center mb-6">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">INR</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Gross Revenue</p>
            <h3 className="text-4xl font-black text-white">₹{stats?.totalRevenueINR || 0}</h3>
          </motion.div>

        </div>

        {/* Detailed Logs Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">Recent Signups</h3>
            <ul className="space-y-4">
              {stats?.recentUsers?.map(user => (
                <li key={user._id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="font-bold text-slate-200">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-400 font-bold">{user.credits} Credits</p>
                    <p className="text-[10px] text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
            {(!stats?.recentUsers || stats.recentUsers.length === 0) && <p className="text-slate-500 text-sm">No new users</p>}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">Recent Payments</h3>
            <ul className="space-y-4">
              {stats?.recentPayments?.map(txn => (
                <li key={txn._id} className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <div>
                    <p className="font-bold text-slate-200">{txn.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-emerald-400 font-bold">₹{txn.amount/100}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-300">+{txn.credits} Credits</p>
                    <p className="text-[10px] text-slate-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
            {(!stats?.recentPayments || stats.recentPayments.length === 0) && <p className="text-slate-500 text-sm">No recent transactions</p>}
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
