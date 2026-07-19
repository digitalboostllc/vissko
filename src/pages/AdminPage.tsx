import { useState, useEffect } from 'react'
import { Download, Lock, RefreshCw, LogOut, Package, Euro, TrendingUp, Activity, BarChart3 } from 'lucide-react'
import { Logo } from '@/components/Logo'



interface Order {
  id: string;
  email: string;
  customer_name: string | null;
  phone: string | null;
  shipping_address: string | null;
  status: string;
  stripe_pi_id: string | null;
  utm_source: string | null;
  amount?: number;
  created_at: string;
}

export const AdminPage = () => {
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
  
  const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'analytics'>('orders')
  const [settings, setSettings] = useState({ 
    FB_PIXEL_ID: '', 
    FB_ACCESS_TOKEN: '', 
    GTM_ID: '',
    ALIEXPRESS_APP_KEY: '',
    ALIEXPRESS_APP_SECRET: '',
    ALIEXPRESS_ACCESS_TOKEN: '',
    ALIEXPRESS_PRODUCT_ID: '',
    ALIEXPRESS_SKU_ID: '',
    ADMIN_PASSWORD: '',
    FB_AD_ACCOUNT_ID: '',
    UNIT_COGS: '25'
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const [fbInsights, setFbInsights] = useState<any[]>([])
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'analytics' && isAuthenticated) {
      fetchAnalytics()
    }
  }, [activeTab, isAuthenticated])

  const fetchAnalytics = async () => {
    setIsAnalyticsLoading(true)
    try {
      const token = sessionStorage.getItem('admin_token')
      const res = await fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setFbInsights(data.fbInsights || [])
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err)
    } finally {
      setIsAnalyticsLoading(false)
    }
  }

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
        GTM_ID: settingsData.GTM_ID || '',
        ALIEXPRESS_APP_KEY: settingsData.ALIEXPRESS_APP_KEY || '',
        ALIEXPRESS_APP_SECRET: settingsData.ALIEXPRESS_APP_SECRET || '',
        ALIEXPRESS_ACCESS_TOKEN: settingsData.ALIEXPRESS_ACCESS_TOKEN || '',
        ALIEXPRESS_PRODUCT_ID: settingsData.ALIEXPRESS_PRODUCT_ID || '',
        ALIEXPRESS_SKU_ID: settingsData.ALIEXPRESS_SKU_ID || '',
        ADMIN_PASSWORD: settingsData.ADMIN_PASSWORD || '',
        FB_AD_ACCOUNT_ID: settingsData.FB_AD_ACCOUNT_ID || '',
        UNIT_COGS: settingsData.UNIT_COGS || '25'
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
        <div className="bg-white p-6 rounded border border-zinc-200 max-w-md w-full flex flex-col gap-6">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-zinc-900" />
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Accès Administrateur</h1>
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
              className="w-full bg-black text-white font-medium py-3 px-4 rounded hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center"
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
    if (order.status !== 'refunded') {
      return acc + (order.amount || 89);
    }
    return acc;
  }, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter(o => o.created_at.startsWith(today)).length;

  const totalAdSpend = fbInsights.reduce((acc, campaign) => acc + parseFloat(campaign.spend || '0'), 0);
  const totalCogs = orders.filter(o => o.status !== 'refunded').length * parseFloat(settings.UNIT_COGS || '25');
  const stripeFees = orders.filter(o => o.status !== 'refunded').length * 0.25 + (totalRevenue * 0.015);
  const netProfit = totalRevenue - totalCogs - totalAdSpend - stripeFees;
  const roas = totalAdSpend > 0 ? (totalRevenue / totalAdSpend).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Logo className="h-5 w-auto text-zinc-900" />
                <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest border-l border-zinc-200 pl-2">Admin</span>
              </div>
              <nav className="hidden sm:flex items-center gap-4 border-l border-zinc-200 pl-6">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`text-sm font-medium transition-colors ${activeTab === 'orders' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Commandes
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`text-sm font-medium transition-colors ${activeTab === 'settings' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Paramètres
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Analytiques
                </button>
              </nav>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-emerald-700 transition-colors"
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
          <div className="w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-1">Paramètres de l'Application</h2>
              <p className="text-sm text-zinc-500">Gérez vos intégrations et clés d'API dans un espace sécurisé.</p>
            </div>
            
            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Marketing & Tracking Bento */}
              <div className="bg-white p-6 rounded border border-zinc-200 flex flex-col gap-6">
                <div>
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-6">Marketing & Tracking</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">Facebook Pixel ID</label>
                      <input
                        type="text"
                        value={settings.FB_PIXEL_ID}
                        onChange={(e) => setSettings({...settings, FB_PIXEL_ID: e.target.value})}
                        className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                        placeholder="e.g. 1387799923415060"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">Meta CAPI Token</label>
                      <input
                        type="password"
                        value={settings.FB_ACCESS_TOKEN}
                        onChange={(e) => setSettings({...settings, FB_ACCESS_TOKEN: e.target.value})}
                        className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                        placeholder="EAAL..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">Google Analytics (GA4) ID</label>
                      <input
                        type="text"
                        value={settings.GTM_ID}
                        onChange={(e) => setSettings({...settings, GTM_ID: e.target.value})}
                        className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                        placeholder="e.g. G-RHM7G3ZCPG"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">Facebook Ad Account ID</label>
                      <input
                        type="text"
                        value={settings.FB_AD_ACCOUNT_ID}
                        onChange={(e) => setSettings({...settings, FB_AD_ACCOUNT_ID: e.target.value})}
                        className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                        placeholder="e.g. act_123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">Cost of Goods Sold (COGS) in EUR</label>
                      <input
                        type="text"
                        value={settings.UNIT_COGS}
                        onChange={(e) => setSettings({...settings, UNIT_COGS: e.target.value})}
                        className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                        placeholder="e.g. 25.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AliExpress Bento */}
              <div className="bg-white p-6 rounded border border-zinc-200 flex flex-col gap-6">
                <div>
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-6">AliExpress Dropshipping API</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">App Key</label>
                        <input
                          type="text"
                          value={settings.ALIEXPRESS_APP_KEY}
                          onChange={(e) => setSettings({...settings, ALIEXPRESS_APP_KEY: e.target.value})}
                          className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                          placeholder="App Key"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">App Secret</label>
                        <input
                          type="password"
                          value={settings.ALIEXPRESS_APP_SECRET}
                          onChange={(e) => setSettings({...settings, ALIEXPRESS_APP_SECRET: e.target.value})}
                          className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                          placeholder="App Secret"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">Access Token</label>
                      <input
                        type="password"
                        value={settings.ALIEXPRESS_ACCESS_TOKEN}
                        onChange={(e) => setSettings({...settings, ALIEXPRESS_ACCESS_TOKEN: e.target.value})}
                        className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                        placeholder="Paste your 30-day AliExpress Access Token here"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">Product ID</label>
                        <input
                          type="text"
                          value={settings.ALIEXPRESS_PRODUCT_ID}
                          onChange={(e) => setSettings({...settings, ALIEXPRESS_PRODUCT_ID: e.target.value})}
                          className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                          placeholder="e.g. 100500..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">SKU ID (Optional)</label>
                        <input
                          type="text"
                          value={settings.ALIEXPRESS_SKU_ID}
                          onChange={(e) => setSettings({...settings, ALIEXPRESS_SKU_ID: e.target.value})}
                          className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                          placeholder="e.g. 14:193;380..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Bento */}
              <div className="bg-white p-6 rounded border border-zinc-200 flex flex-col gap-6 lg:col-span-2 max-w-xl">
                <div>
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-6">Accès & Sécurité</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-900 uppercase tracking-widest mb-1.5">Mot de Passe Admin</label>
                      <input
                        type="password"
                        value={settings.ADMIN_PASSWORD}
                        onChange={(e) => setSettings({...settings, ADMIN_PASSWORD: e.target.value})}
                        className="w-full px-4 py-2 border border-zinc-200 rounded focus:outline-none focus:border-black font-mono text-sm transition-colors"
                        placeholder="Nouveau mot de passe"
                      />
                      <p className="text-xs text-zinc-500 mt-2">Ce mot de passe protège l'accès à ce tableau de bord. Si vous le modifiez, vous devrez vous reconnecter.</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Save Button spanning full width */}
              <div className="lg:col-span-2 flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="bg-black text-white text-[11px] uppercase tracking-widest font-medium py-3.5 px-8 rounded hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSavingSettings ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSavingSettings ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900 mb-1">Tableau de bord</h2>
                <p className="text-sm text-zinc-500">Vue d'ensemble et gestion des expéditions.</p>
              </div>
              <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-3 rounded border border-zinc-200 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-zinc-900">{orders.length} Commandes</span>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          <div className="bg-white p-6 rounded border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase">Revenu Total</h3>
              <Euro className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="text-3xl font-semibold text-zinc-900">{totalRevenue.toLocaleString('fr-FR')} €</div>
          </div>
          <div className="bg-white p-6 rounded border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase">Commandes (Aujourd'hui)</h3>
              <Package className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="text-3xl font-semibold text-zinc-900">{ordersToday}</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-zinc-100">
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">ID</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Date</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Client</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest hidden md:table-cell">Contact</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Statut</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {orders.map((order) => {
                  const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })
                  
                  return (
                    <tr key={order.id} className="hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-3 font-mono text-sm font-medium text-zinc-900">
                        {order.id.replace('VSK-', '')}
                        {order.utm_source && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 uppercase tracking-wider">
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
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[13px] font-medium text-zinc-900">Confirmé</span>
                          </div>
                        )}
                        {order.status === 'shipped' && (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-[13px] font-medium text-zinc-900">Expédié</span>
                          </div>
                        )}
                        {order.status === 'refunded' && (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
                            <span className="text-[13px] font-medium text-zinc-500">Remboursé</span>
                          </div>
                        )}
                        {order.status === 'disputed' && (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></div>
                            <span className="text-[13px] font-medium text-rose-600">Litige (Disputed)</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {order.status === 'confirmed' && (
                          <div className="flex justify-end gap-2">
                            {order.stripe_pi_id && (
                              <button
                                onClick={() => setRefundModal({ isOpen: true, orderId: order.id, piId: order.stripe_pi_id })}
                                className="inline-flex items-center px-3 py-1.5 bg-white text-zinc-900 text-[11px] uppercase tracking-widest font-medium rounded border border-zinc-200 hover:bg-zinc-50 transition-colors"
                              >
                                Rembourser
                              </button>
                            )}
                            <button
                              onClick={() => setShippingModal({ isOpen: true, orderId: order.id, email: order.email })}
                              className="inline-flex items-center px-3 py-1.5 bg-black text-white text-[11px] uppercase tracking-widest font-medium rounded hover:bg-zinc-800 transition-colors"
                            >
                              <Package className="w-3.5 h-3.5 mr-1.5" />
                              Expédier
                            </button>
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

        {activeTab === 'analytics' && (
          <div className="w-full flex flex-col gap-6">
            <div className="mb-2">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-1">Financial Analytics</h2>
              <p className="text-sm text-zinc-500">Real-time P&L matched with Facebook Ad spend.</p>
            </div>

            {isAnalyticsLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <Euro className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
                    </div>
                    <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} €</div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                    <div className="flex items-center gap-2 text-rose-500 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Ad Spend</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-600">-{totalAdSpend.toFixed(2)} €</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                    <div className="flex items-center gap-2 text-rose-500 mb-2">
                      <Package className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">COGS</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-600">-{totalCogs.toFixed(2)} €</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                    <div className="flex items-center gap-2 text-rose-500 mb-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Stripe Fees</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-600">-{stripeFees.toFixed(2)} €</div>
                  </div>

                  <div className="bg-zinc-900 text-white p-5 rounded-2xl border border-zinc-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <BarChart3 className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 mb-2 relative z-10">
                      <Euro className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Net Profit</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 relative z-10">{netProfit.toFixed(2)} €</div>
                  </div>
                </div>

                <div className="bg-white rounded border border-zinc-200 mt-4 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900">Facebook Campaigns</h3>
                    <span className="text-sm font-medium text-zinc-500">Overall ROAS: <span className="text-emerald-600">{roas}x</span></span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-zinc-50/50">
                          <th className="px-6 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-200">Campaign Name</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-200 text-right">Spend</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-200 text-right">CPC</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-200 text-right">CPM</th>
                          <th className="px-6 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-200 text-right">Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fbInsights.map((campaign, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0">
                            <td className="px-6 py-4 text-sm font-medium text-zinc-900">{campaign.campaign_name}</td>
                            <td className="px-6 py-4 text-sm text-zinc-500 text-right">{parseFloat(campaign.spend).toFixed(2)} €</td>
                            <td className="px-6 py-4 text-sm text-zinc-500 text-right">{parseFloat(campaign.cpc || '0').toFixed(2)} €</td>
                            <td className="px-6 py-4 text-sm text-zinc-500 text-right">{parseFloat(campaign.cpm || '0').toFixed(2)} €</td>
                            <td className="px-6 py-4 text-sm text-zinc-500 text-right">{campaign.actions?.find((a: any) => a.action_type === 'link_click')?.value || campaign.outbound_clicks?.[0]?.value || 0}</td>
                          </tr>
                        ))}
                        {fbInsights.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                              Aucune donnée de campagne trouvée. Vérifiez vos identifiants FB.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Shipping Modal */}
      {shippingModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded border border-zinc-200 p-6 max-w-md w-full flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Expédier la commande {shippingModal.orderId}</h3>
              <p className="text-sm text-zinc-500">
                Cela marquera la commande comme expédiée et enverra un email automatique au client.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-900">Lien de suivi (Optionnel)</label>
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
                className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleShipping}
                disabled={isShipping}
                className="bg-emerald-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center"
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
              <h3 className="text-xl font-semibold text-red-600 mb-2">Rembourser la commande</h3>
              <p className="text-sm text-zinc-500">
                Êtes-vous sûr de vouloir rembourser la commande {refundModal.orderId} ? Cette action est irréversible et l'argent sera renvoyé sur le compte du client.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRefundModal({ isOpen: false, orderId: null, piId: null })}
                className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRefund}
                disabled={isRefunding}
                className="bg-red-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
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
