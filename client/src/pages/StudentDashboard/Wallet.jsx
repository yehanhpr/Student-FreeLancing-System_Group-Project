import {
  ArrowDownRight, ArrowUpRight, DownloadIcon,
  TrendingUp, Wallet2, Clock, CheckCircle, Briefcase
} from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

// ── timeAgo helper ─────────────────────────────────────────────────────────────
const timeAgo = (dateString) => {
  if (!dateString) return '—'
  const diff = Date.now() - new Date(dateString).getTime()
  if (diff < 0) return 'Just now'
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 7)   return `${days} day${days > 1 ? 's' : ''} ago`
  if (weeks < 5)   return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  return `${months} month${months > 1 ? 's' : ''} ago`
}

// ── Build last-N-months chart data for Recharts ────────────────────────────────
const buildChartData = (transactions, monthCount = 7) => {
  const now = new Date()
  return Array.from({ length: monthCount }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - i), 1)
    const label = d.toLocaleString('default', { month: 'short' })
    const total = transactions
      .filter(tx => {
        if (tx.type !== 'credit') return false
        const txd = new Date(tx.date)
        return txd.getFullYear() === d.getFullYear() && txd.getMonth() === d.getMonth()
      })
      .reduce((s, tx) => s + tx.amount, 0)
    return { month: label, earnings: total }
  })
}

// ── Skeleton loader ────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-800 rounded-xl ${className}`} />
)

// ── Component ─────────────────────────────────────────────────────────────────
const Wallet = () => {
  const { token } = useContext(AppContext)

  const [walletData, setWalletData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!token) return
    const fetch_ = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/student/wallet`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load wallet')
        setWalletData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [token])

  const transactions  = walletData?.transactions ?? []
  const totalEarned   = walletData?.totalEarned  ?? 0
  const thisMonth     = walletData?.thisMonth     ?? 0
  const pending       = walletData?.pending       ?? 0

  const credits = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const debits  = transactions.filter(t => t.type === 'debit').reduce((s, t)  => s + t.amount, 0)

  const chartData = buildChartData(transactions)

  const stats = [
    { label: 'Total Earned',  value: `$${totalEarned.toLocaleString()}`,  icon: TrendingUp,   positive: true,  sub: 'All time'    },
    { label: 'This Month',    value: `$${thisMonth.toLocaleString()}`,     icon: TrendingUp,   positive: true,  sub: 'Current month' },
    { label: 'Pending',       value: `$${pending.toLocaleString()}`,       icon: Clock,        positive: false, sub: 'In escrow'   },
  ]

  return (
    <div className="min-h-screen">

      {/* ── Page header ── */}
      <div className="mb-6">
        <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1">Finance</p>
        <h1 className="text-3xl font-bold text-white mb-1">My Wallet</h1>
        <p className="text-slate-500 text-sm">Manage your earnings and transactions</p>
      </div>

      {/* ── Top grid: balance card + stats ── */}
      <div className="grid grid-cols-3 gap-5 mb-6">

        {/* Balance card — spans 2 cols */}
        <div className="col-span-2 relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 p-6">
          {/* Texture overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header row */}
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div>
              <p className="text-blue-200 text-sm mb-2">Total Earned · Last 7 Months</p>
              {loading ? (
                <Skeleton className="h-12 w-40 bg-white/20" />
              ) : (
                <h2 className="text-5xl font-bold text-white tracking-tight">
                  ${totalEarned.toLocaleString()}
                  <span className="text-2xl text-blue-300">.00</span>
                </h2>
              )}
            </div>
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Wallet2 className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Recharts AreaChart */}
          <div className="relative z-10 w-full" style={{ height: 110 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ffffff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.12)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgba(191,219,254,0.8)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(191,219,254,0.6)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v === 0 ? '0' : `$${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? 'k' : ''}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.92)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    color: '#e2e8f0',
                    fontSize: 12,
                    backdropFilter: 'blur(8px)'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Earnings']}
                  cursor={{ stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#ffffff"
                  strokeWidth={2}
                  fill="url(#walletGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#fff', stroke: 'rgba(255,255,255,0.4)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Withdraw button */}
          <div className="relative z-10 mt-4">
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer">
              <DownloadIcon className="w-4 h-4" />
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Stats column */}
        <div className="col-span-1 flex flex-col gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{stat.label}</p>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.positive ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                    <Icon className={`w-3.5 h-3.5 ${stat.positive ? 'text-green-400' : 'text-yellow-400'}`} />
                  </div>
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-24 mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                )}
                <span className={`text-xs font-medium flex items-center gap-1 ${stat.positive ? 'text-green-400' : 'text-yellow-400'}`}>
                  {stat.positive ? <TrendingUp className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {stat.sub}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Transaction History ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-white">Transaction History</h3>
            <p className="text-xs text-slate-500 mt-0.5">{transactions.length} transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3" /> Credits: ${credits.toLocaleString()}
            </span>
            {debits > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> Debits: ${debits.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 animate-pulse">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-3">
              <Wallet2 className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-white font-medium text-sm mb-1">No transactions yet</p>
            <p className="text-slate-500 text-xs">Payments will appear here once a project is marked as completed by your client.</p>
          </div>
        )}

        {/* Transaction list */}
        {!loading && !error && transactions.length > 0 && (
          <div className="flex flex-col gap-2">
            {transactions.map((tx, i) => (
              <div
                key={tx._id || i}
                className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 hover:border-slate-600 hover:bg-slate-800/80 transition-all group"
              >
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
                    ${tx.type === 'credit'
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {tx.type === 'credit'
                      ? <ArrowDownRight className="w-4 h-4" />
                      : <ArrowUpRight className="w-4 h-4" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-500">{timeAgo(tx.date)}</p>
                      {tx.category && (
                        <span className="text-xs text-slate-600 bg-slate-700/50 px-1.5 py-0.5 rounded">{tx.category}</span>
                      )}
                      {tx.client && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Briefcase className="w-2.5 h-2.5" />{tx.client}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4 shrink-0">
                  <p className={`text-base font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                  <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Wallet