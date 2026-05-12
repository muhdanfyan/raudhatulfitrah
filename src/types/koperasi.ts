export interface Product {
    id: number;
    nama_produk: string;
    harga: number;
    stok: number;
    gambar?: string;
    deskripsi_produk?: string;
}

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: number;
    nama_santri: string;
    total_harga: number;
    tanggal_order: string;
    status_order: 'diproses' | 'selesai' | 'dibatalkan';
    catatan?: string;
}

export interface OrderItem {
    id: number;
    nama_produk: string;
    harga_saat_order: number;
    jumlah: number;
    subtotal: number;
}

export interface SantriWallet {
    id_santri: number;
    nama_lengkap_santri: string;
    foto_santri?: string;
    saldo: number;
}

export interface KoperasiStats {
    total_pendapatan: number;
    pesanan_diproses: number;
    produk_stok_menipis: number;
}
