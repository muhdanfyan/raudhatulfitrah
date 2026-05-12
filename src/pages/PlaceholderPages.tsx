import React from 'react';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <p className="text-gray-600">Halaman ini sedang dalam pengembangan.</p>
    </div>
  </div>
);

export const AkademikPage = () => <PlaceholderPage title="Akademik" />;
export const AsramaPage = () => <PlaceholderPage title="Asrama" />;
export const InventarisPage = () => <PlaceholderPage title="Inventaris" />;
export const SettingsPage = () => <PlaceholderPage title="Pengaturan" />;
export const TahfidzPage = () => <PlaceholderPage title="Tahfidz" />;
export const ReviewPage = () => <PlaceholderPage title="Review" />;
export const PembinaanPage = () => <PlaceholderPage title="Pembinaan" />;
export const SanksiPage = () => <PlaceholderPage title="Sanksi" />;
export const MasukanPage = () => <PlaceholderPage title="Masukan" />;
export const ProfilPage = () => <PlaceholderPage title="Profil" />;
