import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Trash2, Loader2, Package, Search, User } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { getStudentPhotoUrl } from '../../utils/imageUtils';



// Helper to get image URL (supports both Cloudinary and local storage)
const getImageUrl = (imagePath: string | undefined, folder: string) => {
  if (!imagePath) return null;
  // Already a full URL (Cloudinary)
  if (imagePath.startsWith('http')) return imagePath;
  // Local storage
  return `${api.getBaseUrl()}/storage/${folder}/${imagePath}`;
};

interface Product {
  id: number;
  nama_produk: string;
  harga: number | string;
  stok: number;
  gambar?: string;
  aktif: number;
  kategori_id?: number;
  kategori_id_nama?: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stok: number;
}

interface Santri {
  id_santri: number;
  nama_lengkap_santri: string;
  foto_santri?: string;
  saldo?: number;
}

export default function KoperasiProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // POS State
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [santriSearch, setSantriSearch] = useState('');
  const [showSantriPicker, setShowSantriPicker] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [loadingSantri, setLoadingSantri] = useState(false);



  const fetchProducts = async () => {
    try {
      const json: any = await api.get(`/api/crud/produk?per_page=100`);
      if (json.success) {
        const activeProducts = (json.data.items || []).filter((p: Product) => p.aktif === 1);
        setProducts(activeProducts);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSantriWithSaldo = async (search = '') => {
    setLoadingSantri(true);
    try {
      let url = `/api/koperasi/dompet?per_page=200`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const json: any = await api.get(url);
      if (json.success) {
        setSantriList(json.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch santri:', err);
    } finally {
      setLoadingSantri(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (showSantriPicker) {
      const timer = setTimeout(() => {
        fetchSantriWithSaldo(santriSearch);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [santriSearch, showSantriPicker]);

  const formatRupiah = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numValue);
  };

  const addToCart = (product: Product) => {
    const price = typeof product.harga === 'string' ? parseFloat(product.harga) : product.harga;
    setCart((prev) => {
      const existing = prev[product.id];
      if (existing) {
        if (existing.quantity >= product.stok) {
          alert('Stok tidak mencukupi');
          return prev;
        }
        return {
          ...prev,
          [product.id]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      return {
        ...prev,
        [product.id]: {
          id: product.id,
          name: product.nama_produk,
          price: price,
          quantity: 1,
          stok: product.stok,
        },
      };
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => {
      const item = prev[id];
      if (!item) return prev;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      if (newQuantity > item.stok) {
        alert('Stok tidak mencukupi');
        return prev;
      }

      return {
        ...prev,
        [id]: { ...item, quantity: newQuantity },
      };
    });
  };

  const removeItem = (id: number) => {
    setCart((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSelectSantri = (santri: Santri) => {
    setSelectedSantri(santri);
    setShowSantriPicker(false);
    setSantriSearch('');
  };

  const handleSubmitOrder = async () => {
    if (!selectedSantri || Object.keys(cart).length === 0) {
      alert('Pilih santri dan tambahkan produk ke keranjang');
      return;
    }

    const santriSaldo = typeof selectedSantri.saldo === 'string' 
      ? parseFloat(selectedSantri.saldo) 
      : (selectedSantri.saldo || 0);

    if (santriSaldo < totalPrice) {
      alert(`Saldo ${selectedSantri.nama_lengkap_santri} tidak mencukupi. Saldo: ${formatRupiah(santriSaldo)}, Total: ${formatRupiah(totalPrice)}`);
      return;
    }

    if (!confirm(`Buat pesanan untuk ${selectedSantri.nama_lengkap_santri}?\nTotal: ${formatRupiah(totalPrice)}`)) {
      return;
    }

    setSubmittingOrder(true);
    try {
      const items = Object.values(cart).map(item => ({
        produk_id: item.id,
        jumlah: item.quantity,
      }));

      const json: any = await api.post('/api/koperasi/orders', {
        santri_id: selectedSantri.id_santri,
        items: items,
        catatan: 'Pembelian dari POS Koperasi',
      });

      if (json.success) {
        alert('Pesanan berhasil dibuat!');
        setCart({});
        setSelectedSantri(null);
        setIsCartOpen(false);
        fetchProducts(); // Refresh stock
      } else {
        alert(json.message || 'Gagal membuat pesanan');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat membuat pesanan');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale - Katalog Produk</h1>
          <p className="text-sm text-gray-500">{products.length} produk tersedia</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/data/produk" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
            <Package className="w-4 h-4" />
            Kelola Produk
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada produk tersedia</p>
          <Link to="/data/produk" className="text-primary hover:underline text-sm mt-2 inline-block">
            Tambah produk baru
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="h-40 bg-gray-100 relative flex items-center justify-center">
                {product.gambar ? (
                  <img
                    src={getImageUrl(product.gambar, 'produk') || ''}
                    alt={product.nama_produk}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-16 h-16 text-gray-300 flex items-center justify-center"><svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                    }}
                  />
                ) : (
                  <Package className="w-16 h-16 text-gray-300" />
                )}
                {product.stok <= 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold px-3 py-1 bg-red-600 rounded-full text-sm">
                      Stok Habis
                    </span>
                  </div>
                )}
                {product.stok > 0 && product.stok <= 5 && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                      Sisa {product.stok}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {product.nama_produk}
                </h3>
                {product.kategori_id_nama && (
                  <p className="text-xs text-gray-500 mb-2">{product.kategori_id_nama}</p>
                )}
                <p className="text-green-600 font-bold text-lg mb-2">
                  {formatRupiah(product.harga)}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  Stok: {product.stok > 0 ? product.stok : 'Habis'}
                </p>
                <div className="mt-auto">
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stok <= 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Keranjang Belanja</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.keys(cart).length === 0 ? (
                <p className="text-center text-gray-500 py-8">Keranjang Anda kosong.</p>
              ) : (
                Object.values(cart).map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{formatRupiah(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-50 text-gray-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-gray-50 text-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              {/* Santri Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Santri</label>
                {selectedSantri ? (
                  <div className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={getStudentPhotoUrl(selectedSantri.foto_santri, `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSantri.nama_lengkap_santri)}&background=e0e0e0&color=666&size=40`)}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSantri.nama_lengkap_santri)}&background=e0e0e0&color=666&size=40`; }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{selectedSantri.nama_lengkap_santri}</p>
                        <p className="text-sm text-green-600">Saldo: {formatRupiah(selectedSantri.saldo || 0)}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedSantri(null)} className="text-gray-400 hover:text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSantriPicker(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-primary"
                  >
                    <User className="w-5 h-5" />
                    Pilih Santri
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-xl font-bold text-primary">{formatRupiah(totalPrice)}</span>
              </div>
              
              {selectedSantri && totalPrice > (typeof selectedSantri.saldo === 'string' ? parseFloat(selectedSantri.saldo) : (selectedSantri.saldo || 0)) && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  Saldo tidak mencukupi!
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Tutup
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={submittingOrder || !selectedSantri || Object.keys(cart).length === 0}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                  Buat Pesanan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Santri Picker Modal */}
      {showSantriPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Pilih Santri</h2>
              <button onClick={() => { setShowSantriPicker(false); setSantriSearch(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama santri..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={santriSearch}
                  onChange={(e) => setSantriSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingSantri ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : santriList.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Tidak ada santri ditemukan</p>
              ) : (
                <div className="space-y-2">
                  {santriList.map((santri) => (
                    <button
                      key={santri.id_santri}
                      onClick={() => handleSelectSantri(santri)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 text-left"
                    >
                      <img
                        src={getStudentPhotoUrl(santri.foto_santri, `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.nama_lengkap_santri)}&background=e0e0e0&color=666&size=40`)}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(santri.nama_lengkap_santri)}&background=e0e0e0&color=666&size=40`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{santri.nama_lengkap_santri}</p>
                        <p className="text-sm text-green-600">Saldo: {formatRupiah(santri.saldo || 0)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
