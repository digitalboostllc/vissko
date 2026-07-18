import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Lock, RefreshCw, LogOut } from 'lucide-react'

interface AdminPageProps {
  onBack: () => void;
}

interface Order {
  id: string;
  email: string;
  customer_name: string | null;
  phone: string | null;
  shipping_address: string | null;
  status: string;
  created_at: string;
}

export const AdminPage = ({ onBack }: AdminPageProps) => {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Check session storage on mount
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_token')
    if (savedPassword) {
      setPassword(savedPassword)
      fetchOrders(savedPassword)
    }
  }, [])

  const fetchOrders = async (token: string) => {
    setIsLoading(true)
    setError('')
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4242'
      const response = await fetch(`${apiUrl}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Invalid Password')
      }

      const data = await response.json()
      setOrders(data)
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_token', token)
    } catch (err: any) {
      setError('Accès refusé. Mot de passe incorrect.')
      setIsAuthenticated(false)
      sessionStorage.removeItem('admin_token')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrders(password)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setOrders([])
    sessionStorage.removeItem('admin_token')
  }

  const exportToCSV = () => {
    if (orders.length === 0) return

    // Define CSV headers
    const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Address', 'City', 'Postal Code', 'Country', 'Status']
    
    // Format rows
    const rows = orders.map(order => {
      let addressStr = '';
      let city = '';
      let postalCode = '';
      let country = '';
      
      try {
        if (order.shipping_address) {
          const parsed = JSON.parse(order.shipping_address)
          addressStr = `${parsed.line1 || ''} ${parsed.line2 || ''}`.trim()
          city = parsed.city || ''
          postalCode = parsed.postal_code || ''
          country = parsed.country || ''
        }
      } catch (e) {
        // Fallback if parsing fails
      }

      const date = new Date(order.created_at).toLocaleDateString('fr-FR')

      return [
        order.id,
        date,
        `"${order.customer_name || ''}"`,
        order.email,
        order.phone || '',
        `"${addressStr}"`,
        `"${city}"`,
        postalCode,
        country,
        order.status
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `vissko_orders_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 max-w-md w-full"
        >
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Lock className="w-8 h-8 text-zinc-900" />
          </div>
          <h1 className="text-2xl font-black text-center mb-2">Accès Administrateur</h1>
          <p className="text-zinc-500 text-center mb-8">Veuillez entrer le mot de passe pour accéder au tableau de bord.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-black text-white font-bold py-3 px-4 rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Connexion'}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">Vissko Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-zinc-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 mb-1">Commandes</h2>
            <p className="text-zinc-500">Gérez vos commandes et exportez-les pour l'expédition.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-bold text-zinc-900">{orders.length} Commandes</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">ID</th>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Client</th>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((order) => {
                  const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })
                  
                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="p-4 font-mono text-sm font-medium text-zinc-900">
                        {order.id.replace('VSK-', '')}
                      </td>
                      <td className="p-4 text-sm text-zinc-500 whitespace-nowrap">
                        {date}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-zinc-900">{order.customer_name || 'N/A'}</div>
                        <div className="text-xs text-zinc-500 md:hidden mt-1">{order.email}</div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="text-sm text-zinc-900">{order.email}</div>
                        {order.phone && <div className="text-xs text-zinc-500 mt-1">{order.phone}</div>}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === 'confirmed' ? 'bg-amber-100 text-amber-800' :
                          order.status === 'shipped' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'refunded' ? 'bg-red-100 text-red-800' :
                          'bg-zinc-100 text-zinc-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {orders.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                      Aucune commande pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
