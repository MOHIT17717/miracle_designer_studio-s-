'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAdminStats,
  getAdminOrders,
  getAdminProducts,
  getAdminBookings,
  getAdminOffers,
  getAdminCategories,
  updateOrderStatus,
  updateBookingStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  deleteCategory,
  createOffer,
  deleteOffer,
  logout,
  formatPrice,
  DashboardStats,
  Order,
  Product,
  MakeupBooking,
  Offer,
  Category,
} from '@/lib/api';

// ─── Tab Types ──────────────────────────────────────────
type Tab = 'overview' | 'orders' | 'products' | 'categories' | 'bookings' | 'offers';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Dashboard', icon: '📊' },
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'products', label: 'Products', icon: '👗' },
  { key: 'categories', label: 'Categories', icon: '🗂️' },
  { key: 'bookings', label: 'Bookings', icon: '💄' },
  { key: 'offers', label: 'Offers', icon: '🎉' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState(false);

  // ─── Data States ────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookings, setBookings] = useState<MakeupBooking[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Filters ────────────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  // ─── Order Modal State ──────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);


  // ─── Load Data ──────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes, bookingsRes, offersRes] = await Promise.all([
        getAdminStats().catch(() => null),
        getAdminOrders({ limit: 50 }).catch(() => ({ items: [], total: 0, page: 1, limit: 50 })),
        getAdminProducts({ limit: 100 }).catch(() => ({ items: [], total: 0, page: 1, limit: 100 })),
        getAdminCategories().catch(() => ({ items: [] })),
        getAdminBookings({ limit: 50 }).catch(() => ({ items: [], total: 0, page: 1, limit: 50 })),
        getAdminOffers().catch(() => ({ items: [] })),
      ]);

      if (!statsRes) {
        setAuthError(true);
        return;
      }

      setStats(statsRes);
      setOrders(ordersRes.items);
      setProducts(productsRes.items);
      setCategories(categoriesRes.items);
      setBookings(bookingsRes.items);
      setOffers(offersRes.items);
    } catch {
      setAuthError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ─── Redirect if not authenticated ──────────────────────
  useEffect(() => {
    if (authError) {
      router.push('/login');
    }
  }, [authError, router]);

  // ─── Order Actions ──────────────────────────────────────
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, { status: 'confirmed', paymentStatus: 'paid' });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'confirmed', paymentStatus: 'paid' } : o))
      );
      if (stats) setStats({ ...stats, pendingOrders: stats.pendingOrders - 1 });
    } catch (err: any) {
      alert(err?.message || 'Failed to update order');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to update order');
    }
  };

  // ─── Booking Actions ────────────────────────────────────
  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatus(bookingId, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to update booking');
    }
  };

  // ─── Product Actions ────────────────────────────────────
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', salePrice: '', categoryId: '', stock: '', tags: '',
  });

  const openProductForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: String(product.price),
        salePrice: product.salePrice ? String(product.salePrice) : '',
        categoryId: product.categoryId,
        stock: String(product.stock),
        tags: product.tags || '',
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', salePrice: '', categoryId: categories[0]?.id || '', stock: '', tags: '' });
    }
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    try {
      const data = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : null,
        categoryId: productForm.categoryId,
        stock: parseInt(productForm.stock) || 0,
        tags: productForm.tags,
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, data);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      } else {
        const created = await createProduct(data);
        setProducts((prev) => [created, ...prev]);
      }
      setShowProductForm(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete product');
    }
  };

  // ─── Category Actions ───────────────────────────────────
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  const handleSaveCategory = async () => {
    try {
      const created = await createCategory({ name: categoryForm.name, description: categoryForm.description });
      setCategories((prev) => [...prev, created]);
      setShowCategoryForm(false);
      setCategoryForm({ name: '', description: '' });
    } catch (err: any) {
      alert(err?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Products in this category may be affected.')) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    }
  };

  // ─── Offer Actions ──────────────────────────────────────
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState({ title: '', description: '', discount: '', festivalName: '', startDate: '', endDate: '' });

  const handleSaveOffer = async () => {
    try {
      const created = await createOffer({
        title: offerForm.title,
        description: offerForm.description,
        discount: parseFloat(offerForm.discount),
        festivalName: offerForm.festivalName,
        startDate: offerForm.startDate,
        endDate: offerForm.endDate,
      });
      setOffers((prev) => [created, ...prev]);
      setShowOfferForm(false);
      setOfferForm({ title: '', description: '', discount: '', festivalName: '', startDate: '', endDate: '' });
    } catch (err: any) {
      alert(err?.message || 'Failed to create offer');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await deleteOffer(id);
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete offer');
    }
  };

  // ─── Logout ─────────────────────────────────────────────
  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push('/login');
  };

  // ─── Filter Helpers ─────────────────────────────────────
  const filteredOrders = orders.filter((o) => {
    if (!orderFilter) return true;
    return o.status === orderFilter || o.paymentStatus === orderFilter;
  });

  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    return p.name.toLowerCase().includes(productSearch.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto" />
          <p className="text-white/40 text-sm">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (authError) return null;

  // ─── Status Badge Helper ──────────────────────────────
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      confirmed: 'text-green-400 bg-green-500/10 border-green-500/20',
      shipped: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      delivered: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
      completed: 'text-green-400 bg-green-500/10 border-green-500/20',
      paid: 'text-green-400 bg-green-500/10 border-green-500/20',
      unpaid: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${colors[status] || 'text-white/50 bg-white/5 border-white/10'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-dark border-r border-white/5 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gold-500/50 flex items-center justify-center bg-gradient-to-br from-gold-500/20 to-brand-dark">
              <span className="font-display font-bold text-gradient-gold text-lg">M</span>
            </div>
            <div>
              <p className="font-display font-bold text-cream text-sm tracking-widest">MIRACLES</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-gold-500/70">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                  : 'text-white/50 hover:text-cream hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.key === 'orders' && stats && stats.pendingOrders > 0 && (
                <span className="ml-auto bg-amber-500 text-brand-black font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {stats.pendingOrders}
                </span>
              )}
              {tab.key === 'bookings' && stats && stats.pendingBookings > 0 && (
                <span className="ml-auto bg-rose-400 text-brand-black font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {stats.pendingBookings}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Overlay ───────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-brand-black/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-cream hover:text-gold-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h1 className="font-display font-bold text-cream text-xl tracking-tight">
              {TABS.find((t) => t.key === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadDashboard} className="p-2 text-white/40 hover:text-gold-500 transition-colors" title="Refresh">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-8">

          {/* ═══ OVERVIEW TAB ═══════════════════════════════════ */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                {[
                  { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: '💰', color: 'from-gold-500/20 to-gold-500/5' },
                  { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'from-blue-500/20 to-blue-500/5' },
                  { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'from-amber-500/20 to-amber-500/5' },
                  { label: 'Total Products', value: stats.totalProducts, icon: '👗', color: 'from-rose-500/20 to-rose-500/5' },
                  { label: 'Categories', value: stats.totalCategories, icon: '🗂️', color: 'from-purple-500/20 to-purple-500/5' },
                  { label: 'Active Offers', value: stats.activeOffers, icon: '🎉', color: 'from-green-500/20 to-green-500/5' },
                  { label: 'Total Bookings', value: stats.totalBookings, icon: '💄', color: 'from-pink-500/20 to-pink-500/5' },
                  { label: 'Pending Bookings', value: stats.pendingBookings, icon: '📋', color: 'from-cyan-500/20 to-cyan-500/5' },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} border border-white/5 p-5 space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <div>
                      <p className="text-cream font-bold text-2xl">{stat.value}</p>
                      <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Pending Orders */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-cream font-semibold text-lg">Recent Pending Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-gold-500 text-xs font-semibold hover:text-gold-300 transition-colors">
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.filter((o) => o.status === 'pending').slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="space-y-1 min-w-0">
                        <p className="text-cream text-sm font-medium truncate">{order.customerName}</p>
                        <p className="text-white/30 text-xs font-mono truncate">{order.id}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-gold-500 font-semibold text-sm">{formatPrice(order.totalAmount)}</span>
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition-colors"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                  {orders.filter((o) => o.status === 'pending').length === 0 && (
                    <p className="text-white/20 text-sm text-center py-4">No pending orders</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ ORDERS TAB ════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                      orderFilter === f
                        ? 'bg-gold-500/10 text-gold-500 border-gold-500/30'
                        : 'bg-white/[0.02] text-white/40 border-white/5 hover:text-cream hover:border-white/10'
                    }`}
                  >
                    {f || 'All'}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/5">
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Customer</th>
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Items</th>
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Total</th>
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Status</th>
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Payment</th>
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Date</th>
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-cream text-sm font-medium">{order.customerName}</p>
                              <p className="text-white/30 text-xs">{order.mobile}</p>
                              <p className="text-white/20 text-[10px] font-mono mt-0.5 truncate max-w-[120px]">{order.id}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-0.5">
                              {order.items.slice(0, 2).map((item) => (
                                <p key={item.id} className="text-white/50 text-xs truncate max-w-[150px]">
                                  {item.product?.name || 'Product'} ×{item.quantity}
                                </p>
                              ))}
                              {order.items.length > 2 && (
                                <p className="text-white/30 text-[10px]">+{order.items.length - 2} more</p>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-gold-500 font-semibold text-sm">{formatPrice(order.totalAmount)}</span>
                          </td>
                          <td className="px-5 py-4">{statusBadge(order.status)}</td>
                          <td className="px-5 py-4">{statusBadge(order.paymentStatus)}</td>
                          <td className="px-5 py-4 text-white/40 text-xs">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-3 py-1.5 bg-white/5 border border-white/10 text-cream rounded-lg text-[10px] font-bold uppercase hover:bg-white/10 transition-colors"
                              >
                                View Details
                              </button>
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => handleAcceptOrder(order.id)}
                                  className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-[10px] font-bold uppercase hover:bg-green-500/20 transition-colors"
                                >
                                  Accept & Confirm
                                </button>
                              )}
                              {order.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                  className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-500/20 transition-colors"
                                >
                                  Mark Shipped
                                </button>
                              )}
                              {order.status === 'shipped' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                  className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-500/20 transition-colors"
                                >
                                  Mark Delivered
                                </button>
                              )}
                              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                  className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/20 transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-white/20 text-sm">
                            No orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Details Modal */}
              {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
                  <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-brand-dark border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between border-b border-white/10 pb-4">
                      <div>
                        <h3 className="font-display font-bold text-cream text-2xl">Order Details</h3>
                        <p className="text-white/40 text-sm font-mono mt-1">ID: {selectedOrder.id}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="p-2 text-white/50 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Customer Info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs uppercase tracking-widest text-gold-500 font-semibold mb-2">Customer</h4>
                          <p className="text-cream font-medium text-lg">{selectedOrder.customerName}</p>
                          <p className="text-white/60 text-sm">{selectedOrder.mobile}</p>
                          {selectedOrder.email && <p className="text-white/60 text-sm">{selectedOrder.email}</p>}
                        </div>
                        <div>
                          <h4 className="text-xs uppercase tracking-widest text-gold-500 font-semibold mb-2">Delivery Address</h4>
                          <p className="text-white/80 text-sm leading-relaxed">{selectedOrder.address}</p>
                          <p className="text-white/80 text-sm">{selectedOrder.city} - {selectedOrder.pincode}</p>
                        </div>
                      </div>

                      {/* Status & Payment Info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs uppercase tracking-widest text-gold-500 font-semibold mb-2">Status & Payment</h4>
                          <div className="flex gap-3 mb-2">
                            {statusBadge(selectedOrder.status)}
                            {statusBadge(selectedOrder.paymentStatus)}
                          </div>
                          <p className="text-white/40 text-xs mt-2">
                            Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        {selectedOrder.notes && (
                          <div>
                            <h4 className="text-xs uppercase tracking-widest text-gold-500 font-semibold mb-2">Order Notes</h4>
                            <p className="text-white/80 text-sm italic border-l-2 border-white/20 pl-3">{selectedOrder.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <h4 className="text-xs uppercase tracking-widest text-gold-500 font-semibold mb-4">Order Items</h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item) => {
                          const images = item.product?.images ? JSON.parse(item.product.images) : [];
                          return (
                            <div key={item.id} className="flex items-center justify-between bg-white/[0.02] p-4 rounded-xl border border-white/5">
                              <div className="flex items-center gap-4">
                                {images.length > 0 ? (
                                  <div className="w-12 h-12 rounded-lg bg-white/5 bg-cover bg-center" style={{ backgroundImage: `url(${images[0]})` }} />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-xl">👗</div>
                                )}
                                <div>
                                  <p className="text-cream text-sm font-medium">{item.product?.name || 'Unknown Product'}</p>
                                  <p className="text-white/40 text-xs mt-0.5">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="text-gold-500 font-bold text-sm">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-6 flex items-center justify-between bg-white/[0.05] p-4 rounded-xl border border-gold-500/20">
                        <span className="text-cream font-bold uppercase tracking-wider">Total Amount</span>
                        <span className="text-gold-500 font-bold text-xl">{formatPrice(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ PRODUCTS TAB ══════════════════════════════════ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="input-field max-w-xs text-sm"
                />
                <button onClick={() => openProductForm()} className="btn-gold px-6 py-2.5 text-xs rounded-xl flex-shrink-0">
                  + Add Product
                </button>
              </div>

              {/* Product Form Modal */}
              {showProductForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                  <div className="w-full max-w-lg rounded-2xl bg-brand-dark border border-white/10 p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                    <h3 className="font-display font-bold text-cream text-xl">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Product Name *</label>
                        <input className="input-field text-sm" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Banarasi Silk Saree" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Description</label>
                        <textarea className="input-field text-sm resize-none" rows={3} value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} placeholder="Product details..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Price (₹) *</label>
                          <input className="input-field text-sm" type="number" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} placeholder="12999" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Sale Price (₹)</label>
                          <input className="input-field text-sm" type="number" value={productForm.salePrice} onChange={(e) => setProductForm((p) => ({ ...p, salePrice: e.target.value }))} placeholder="9999" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Category *</label>
                          <select className="input-field text-sm" value={productForm.categoryId} onChange={(e) => setProductForm((p) => ({ ...p, categoryId: e.target.value }))}>
                            <option value="">Select</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Stock</label>
                          <input className="input-field text-sm" type="number" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))} placeholder="10" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSaveProduct} className="btn-gold flex-1 py-3 rounded-xl text-sm font-bold uppercase">
                        {editingProduct ? 'Update' : 'Create'}
                      </button>
                      <button onClick={() => setShowProductForm(false)} className="btn-outline flex-1 py-3 rounded-xl text-sm font-bold uppercase">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((prod) => (
                  <div key={prod.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3 hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-cream font-semibold text-sm truncate">{prod.name}</p>
                        <p className="text-white/30 text-xs">{prod.category?.name || '—'}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {prod.isNew && (
                          <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-bold rounded-full uppercase">New</span>
                        )}
                        {!prod.isActive && (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-bold rounded-full uppercase">Inactive</span>
                        )}
                      </div>
                    </div>
                    <p className="text-white/30 text-xs line-clamp-2 leading-relaxed">{prod.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gold-500 font-bold text-sm">{formatPrice(prod.salePrice || prod.price)}</span>
                        {prod.salePrice && <span className="text-white/20 line-through text-xs ml-2">{formatPrice(prod.price)}</span>}
                      </div>
                      <span className="text-white/25 text-xs">Stock: {prod.stock}</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => openProductForm(prod)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-cream rounded-lg text-xs font-semibold hover:bg-white/10 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="px-3 py-2 bg-red-500/5 border border-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/10 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-12 text-white/20 text-sm">No products found</div>
                )}
              </div>
            </div>
          )}

          {/* ═══ CATEGORIES TAB ════════════════════════════════ */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={() => setShowCategoryForm(true)} className="btn-gold px-6 py-2.5 text-xs rounded-xl">
                  + Add Category
                </button>
              </div>

              {showCategoryForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                  <div className="w-full max-w-md rounded-2xl bg-brand-dark border border-white/10 p-8 space-y-5">
                    <h3 className="font-display font-bold text-cream text-xl">Add New Category</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Name *</label>
                        <input className="input-field text-sm" value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Bridal Wear" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Description</label>
                        <textarea className="input-field text-sm resize-none" rows={2} value={categoryForm.description} onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSaveCategory} className="btn-gold flex-1 py-3 rounded-xl text-sm font-bold uppercase">Create</button>
                      <button onClick={() => setShowCategoryForm(false)} className="btn-outline flex-1 py-3 rounded-xl text-sm font-bold uppercase">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-cream font-semibold text-sm">{cat.name}</p>
                      <span className="text-white/30 text-xs">{cat._count?.products || 0} items</span>
                    </div>
                    <p className="text-white/30 text-xs line-clamp-2">{cat.description || 'No description'}</p>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="px-3 py-1.5 bg-red-500/5 border border-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/10 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ BOOKINGS TAB ══════════════════════════════════ */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/5">
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Customer</th>
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Service</th>
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Date & Time</th>
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Status</th>
                        <th className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4">
                            <p className="text-cream text-sm font-medium">{booking.customerName}</p>
                            <p className="text-white/30 text-xs">{booking.mobile}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                              {booking.serviceType}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-white/50 text-xs">
                            <p>{new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <p className="text-white/30">{booking.time}</p>
                          </td>
                          <td className="px-5 py-4">{statusBadge(booking.status)}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2 flex-wrap">
                              {booking.status === 'pending' && (
                                <button onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-[10px] font-bold uppercase hover:bg-green-500/20 transition-colors">
                                  Confirm
                                </button>
                              )}
                              {booking.status === 'confirmed' && (
                                <button onClick={() => handleUpdateBookingStatus(booking.id, 'completed')} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-500/20 transition-colors">
                                  Complete
                                </button>
                              )}
                              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <button onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/20 transition-colors">
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-white/20 text-sm">No bookings found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ OFFERS TAB ════════════════════════════════════ */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={() => setShowOfferForm(true)} className="btn-gold px-6 py-2.5 text-xs rounded-xl">
                  + Create Offer
                </button>
              </div>

              {showOfferForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                  <div className="w-full max-w-lg rounded-2xl bg-brand-dark border border-white/10 p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                    <h3 className="font-display font-bold text-cream text-xl">Create New Offer</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Title *</label>
                        <input className="input-field text-sm" value={offerForm.title} onChange={(e) => setOfferForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Diwali Festival Sale" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Description</label>
                        <textarea className="input-field text-sm resize-none" rows={2} value={offerForm.description} onChange={(e) => setOfferForm((p) => ({ ...p, description: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Discount % *</label>
                          <input className="input-field text-sm" type="number" value={offerForm.discount} onChange={(e) => setOfferForm((p) => ({ ...p, discount: e.target.value }))} placeholder="20" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Festival Name</label>
                          <input className="input-field text-sm" value={offerForm.festivalName} onChange={(e) => setOfferForm((p) => ({ ...p, festivalName: e.target.value }))} placeholder="Diwali" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">Start Date *</label>
                          <input className="input-field text-sm" type="date" value={offerForm.startDate} onChange={(e) => setOfferForm((p) => ({ ...p, startDate: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold">End Date *</label>
                          <input className="input-field text-sm" type="date" value={offerForm.endDate} onChange={(e) => setOfferForm((p) => ({ ...p, endDate: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSaveOffer} className="btn-gold flex-1 py-3 rounded-xl text-sm font-bold uppercase">Create</button>
                      <button onClick={() => setShowOfferForm(false)} className="btn-outline flex-1 py-3 rounded-xl text-sm font-bold uppercase">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Offers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4 hover:border-gold-500/15 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-cream font-semibold text-base">{offer.title}</p>
                        {offer.festivalName && (
                          <span className="px-2 py-0.5 bg-gold-500/10 text-gold-500 text-[9px] font-bold rounded-full uppercase">{offer.festivalName}</span>
                        )}
                      </div>
                      <span className="text-gradient-gold font-bold text-2xl flex-shrink-0">{offer.discount}%</span>
                    </div>
                    {offer.description && <p className="text-white/30 text-xs line-clamp-2">{offer.description}</p>}
                    <div className="flex items-center justify-between text-xs text-white/30">
                      <span>
                        {new Date(offer.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(offer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={offer.isActive ? 'text-green-400' : 'text-white/20'}>{offer.isActive ? '● Active' : '○ Inactive'}</span>
                    </div>
                    <button onClick={() => handleDeleteOffer(offer.id)} className="px-3 py-1.5 bg-red-500/5 border border-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/10 transition-colors">
                      🗑️ Delete
                    </button>
                  </div>
                ))}
                {offers.length === 0 && (
                  <div className="col-span-full text-center py-12 text-white/20 text-sm">No offers found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
