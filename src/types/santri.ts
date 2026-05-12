export type ProgramSantri = 'mondok' | 'reguler' | 'online' | 'afterschool';

export const PROGRAM_SANTRI_OPTIONS: { value: ProgramSantri; label: string }[] = [
    { value: 'mondok', label: 'Mondok' },
    { value: 'reguler', label: 'Reguler' },
    { value: 'online', label: 'Online' },
    { value: 'afterschool', label: 'Afterschool' },
];

export interface Santri {
    id_santri: number;
    nama_lengkap_santri: string;
    nama_panggilan_santri: string;
    status_santri: 'Daftar' | 'Mondok' | 'Alumni' | 'Mengabdi' | 'Keluar';
    program_santri?: ProgramSantri;
    angkatan_santri: number;
    angkatan_nama?: string;
    tempat_lahir_santri: string;
    tanggal_lahir_santri: string;
    alamat_lengkap_santri: string;
    asal_daerah_santri: string;
    kota_domisili_sekarang_santri: string;
    kondisi_keluarga_santri: 'Masih Lengkap' | 'Bersama Bapak' | 'Bersama Ibu' | 'Yatim Piatu';
    anak_ke_santri: number;
    jumlah_saudara_santri: number;
    punya_tanggungan_keluarga_santri?: 'Ya' | 'Tidak';
    izin_orang_tua_santri?: 'Sudah Izin' | 'Dalam Pertimbangan' | 'Belum Izin' | 'Tidak Mendapat Izin';
    konsentrasi_santri: number;
    konsentrasi_nama?: string;
    alasan_mendaftar_santri?: string;
    alasan_mendaftar?: string;
    target_santri?: string;
    target?: string;
    hafalan_quran_santri: string;
    skill_kelebihan_santri: string;
    foto_santri: string;
    musyrif: number;
    user?: number;
    punya_tanggungan?: string;
    izin_ortu?: string;
}

export interface Presensi {
    id_presensi: number;
    santri: number;
    agenda: string;
    tanggal: string;
    waktu: string;
}

export interface Tahfidz {
    id_tahfidz: number;
    tgl_tahfidz: string;
    santri: number;
    wkt_nyetor: number;
    juz_hafalan: string;
    surah: string;
    ayat: string;
    status: 'Hafalan Baru' | 'Murojaah' | 'Tasmi';
    nilai: number;
    komentar: string;
    pengontrol: number;
}

export interface Sanksi {
    id_sanksi: number;
    santri: number;
    pelanggaran: number; // ID pelanggaran
    deskripsi_sanksi: string;
    status_sanksi: string; // Enum from schema but simplified here
    created_at: string;
    updated_at: string;
}

export interface Portofolio {
    id_portofolio: number;
    santri_portofolio: number;
    nama_portofolio: string;
    image_portofolio: string;
    deskripsi: string;
    demo_link: string;
    created_at: string;
}
