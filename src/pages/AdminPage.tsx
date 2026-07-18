import { useState, useEffect } from 'react'
import { ArrowLeft, Download, Lock, RefreshCw, LogOut, Package, Euro, TrendingUp } from 'lucide-react'
import { Logo } from '@/components/Logo'

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
  stripe_pi_id: string | null;
  utm_source: string | null;
  created_at: string;
}

export const AdminPage = ({ onBack }: AdminPageProps) => {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [shippingModal, setShippingModal] = useState<{ isOpen: boolean; orderId: string | null; email: string | null }>({ isOpen: false, orderId: null, email: null })
  const [refundModal, setRefundModal] = useState<{ isOpen: boolean; orderId: string | null; piId: string | null }>({ isOpen: false, orderId: null, piId: null })
  const [trackingUrl, setTrackingUrl] = useState('')
  const [isShipping, setIsShipping] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)
  
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders')
  const [settings, setSettings] = useState({ FB_PIXEL_ID: '', FB_ACCESS_TOKEN: '', GTM_ID: '' })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Check session storage on mount
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_token')
    if (savedPassword) {
      setPassword(savedPassword)
      fetchOrders(savedPassword)
    } else {
      setIsInitializing(false)
    }
  }, [])

  const fetchOrders = async (token: string) => {
    setIsLoading(true)
    setError('')
    try {
      const [ordersRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/admin/settings`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!ordersRes.ok) {
        if (ordersRes.status === 401) throw new Error('Accès refusé. Mot de passe incorrect.')
        else throw new Error(`Erreur serveur (${ordersRes.status}).`)
      }

      const ordersData = await ordersRes.json()
      const settingsData = await settingsRes.json()
      
      setOrders(ordersData)
      setSettings({
        FB_PIXEL_ID: settingsData.FB_PIXEL_ID || '',
        FB_ACCESS_TOKEN: settingsData.FB_ACCESS_TOKEN || '',
        GTM_ID: settingsData.GTM_ID || ''
      })
      
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_token', token)
    } catch (err: any) {
      setError(err.message || 'Impossible de se connecter au serveur.')
      setIsAuthenticated(false)
      sessionStorage.removeItem('admin_token')
    } finally {
      setIsLoading(false)
      setIsInitializing(false)
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

  const handleShipping = async () => {
    if (!shippingModal.orderId) return
    
    setIsShipping(true)
    try {
      const response = await fetch(`/api/admin/orders/${shippingModal.orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'shipped',
          tracking_url: trackingUrl,
          email: shippingModal.email
        })
      })

      if (response.ok) {
        setOrders(orders.map(o => 
          o.id === shippingModal.orderId ? { ...o, status: 'shipped' } : o
        ))
        setShippingModal({ isOpen: false, orderId: null, email: null })
        setTrackingUrl('')
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (err) {
      alert('Erreur réseau')
    } finally {
      setIsShipping(false)
    }
  }

  const handleRefund = async () => {
    if (!refundModal.orderId || !refundModal.piId) return
    
    setIsRefunding(true)
    try {
      const response = await fetch(`/api/admin/orders/${refundModal.orderId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          stripe_pi_id: refundModal.piId
        })
      })

      if (response.ok) {
        setOrders(orders.map(o => 
          o.id === refundModal.orderId ? { ...o, status: 'refunded' } : o
        ))
        setRefundModal({ isOpen: false, orderId: null, piId: null })
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors du remboursement')
      }
    } catch (err) {
      alert('Erreur réseau')
    } finally {
      setIsRefunding(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })
      if (response.ok) {
        alert('Paramètres sauvegardés avec succès !')
      } else {
        alert('Erreur lors de la sauvegarde.')
      }
    } catch (err) {
      alert('Erreur réseau.')
    } finally {
      setIsSavingSettings(false)
    }
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

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-zinc-300 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="bg-white p-6 rounded border border-zinc-200 max-w-md w-full flex flex-col gap-6">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-zinc-900" />
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2">Accès Administrateur</h1>
            <p className="text-sm text-zinc-500">Veuillez entrer le mot de passe pour accéder au tableau de bord.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-black transition-colors"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-black text-white font-bold py-3 px-4 rounded hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Connexion'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Calculate metrics
  const totalRevenue = orders.reduce((acc, order) => {
    // Only count completed purchases towards revenue (assuming all 'confirmed' or 'shipped' are paid)
    if (order.status !== 'refunded') {
      return acc + 89; // Hardcoded 89€ for now, ideally fetch from DB
    }
    return acc;
  }, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter(o => o.created_at.startsWith(today)).length;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors rounded hover:bg-zinc-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Logo className="h-5 w-auto text-zinc-900" />
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-l border-zinc-200 pl-2">Admin</span>
              </div>
              <nav className="hidden sm:flex items-center gap-4 border-l border-zinc-200 pl-6">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`text-sm font-bold transition-colors ${activeTab === 'orders' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Commandes
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`text-sm font-bold transition-colors ${activeTab === 'settings' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Paramètres
                </button>
              </nav>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-zinc-500 hover:text-red-600 transition-colors rounded hover:bg-red-50"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 flex flex-col gap-6">
        {activeTab === 'settings' ? (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-zinc-900 mb-1">Paramètres de Tracking</h2>
            <p className="text-sm text-zinc-500 mb-8">Configurez vos pixels et clés d'API sans toucher au code.</p>
            
            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded border border-zinc-200 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-1">Facebook Pixel ID</label>
                <input
                  type="text"
                  value={settings.FB_PIXEL_ID}
                  onChange={(e) => setSettings({...settings, FB_PIXEL_ID: e.target.value})}
                  className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm"
                  placeholder="e.g. 1387799923415060"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-1">Facebook Conversions API Token</label>
                <input
                  type="password"
                  value={settings.FB_ACCESS_TOKEN}
                  onChange={(e) => setSettings({...settings, FB_ACCESS_TOKEN: e.target.value})}
                  className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm"
                  placeholder="EAAL..."
                />
              </div>
              <hr className="border-zinc-100" />
              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-1">Google Analytics (GA4) ID</label>
                <input
                  type="text"
                  value={settings.GTM_ID}
                  onChange={(e) => setSettings({...settings, GTM_ID: e.target.value})}
                  className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm"
                  placeholder="e.g. G-RHM7G3ZCPG"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="bg-black text-white font-bold py-3 px-4 rounded hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center mt-2"
              >
                {isSavingSettings ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Sauvegarder'}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-1">Tableau de bord</h2>
                <p className="text-sm text-zinc-500">Vue d'ensemble et gestion des expéditions.</p>
              </div>
              <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-3 rounded border border-zinc-200 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-bold text-zinc-900">{orders.length} Commandes</span>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <div className="bg-white p-6 rounded border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase">Revenu Total</h3>
              <Euro className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="text-3xl font-black text-zinc-900">{totalRevenue.toLocaleString('fr-FR')} €</div>
          </div>
          <div className="bg-white p-6 rounded border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase">Commandes (Aujourd'hui)</h3>
              <Package className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="text-3xl font-black text-zinc-900">{ordersToday}</div>
          </div>
          <div className="bg-white p-6 rounded border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase">Taux de Conversion</h3>
              <TrendingUp className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="text-3xl font-black text-zinc-900">3.4%</div>
            <p className="text-xs text-zinc-400 mt-1">Estimé</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase hidden md:table-cell">Contact</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {orders.map((order) => {
                  const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })
                  
                  return (
                    <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm font-medium text-zinc-900">
                        {order.id.replace('VSK-', '')}
                        {order.utm_source && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
                            {order.utm_source}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">
                        {date}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-zinc-900">{order.customer_name || 'N/A'}</div>
                        <div className="text-xs text-zinc-500 md:hidden mt-1">{order.email}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-sm text-zinc-900">{order.email}</div>
                        {order.phone && <div className="text-xs text-zinc-500 mt-1">{order.phone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {order.status === 'confirmed' && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                            Confirmé
                          </span>
                        )}
                        {order.status === 'shipped' && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Expédié
                          </span>
                        )}
                        {order.status === 'refunded' && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            Remboursé
                          </span>
                        )}
                        {order.status === 'disputed' && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-rose-600 text-white shadow-sm animate-pulse">
                            Litige (Disputed)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {order.status === 'confirmed' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShippingModal({ isOpen: true, orderId: order.id, email: order.email })}
                              className="inline-flex items-center px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded hover:bg-zinc-800 transition-colors"
                            >
                              <Package className="w-3.5 h-3.5 mr-1.5" />
                              Expédier
                            </button>
                            {order.stripe_pi_id && (
                              <button
                                onClick={() => setRefundModal({ isOpen: true, orderId: order.id, piId: order.stripe_pi_id })}
                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded border border-red-200 hover:bg-red-100 transition-colors"
                              >
                                Rembourser
                              </button>
                            )}
                          </div>
                        )}
                        {(order.status === 'shipped' || order.status === 'refunded' || order.status === 'disputed') && (
                          <span className="text-zinc-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {orders.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                      Aucune commande pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Shipping Modal */}
      {shippingModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded border border-zinc-200 p-6 max-w-md w-full flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Expédier la commande {shippingModal.orderId}</h3>
              <p className="text-sm text-zinc-500">
                Cela marquera la commande comme expédiée et enverra un email automatique au client.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-zinc-900">Lien de suivi (Optionnel)</label>
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://track.laposte.fr/..."
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-black transition-colors text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShippingModal({ isOpen: false, orderId: null, email: null })}
                className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleShipping}
                disabled={isShipping}
                className="bg-emerald-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isShipping ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmer l'expédition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded border border-zinc-200 p-6 max-w-md w-full flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold text-red-600 mb-2">Rembourser la commande</h3>
              <p className="text-sm text-zinc-500">
                Êtes-vous sûr de vouloir rembourser la commande {refundModal.orderId} ? Cette action est irréversible et l'argent sera renvoyé sur le compte du client.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRefundModal({ isOpen: false, orderId: null, piId: null })}
                className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRefund}
                disabled={isRefunding}
                className="bg-red-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isRefunding ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmer le remboursement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
