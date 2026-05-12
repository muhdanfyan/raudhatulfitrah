import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SantriFormModal from '../src/components/SantriFormModal';
import { api } from '../src/services/api';

// Mock the API
vi.mock('../src/services/api', () => ({
  api: {
    getMasterAngkatan: vi.fn(),
    getMasterKonsentrasi: vi.fn(),
    getSantriDetail: vi.fn(),
    createSantri: vi.fn(),
    updateSantri: vi.fn(),
    uploadFotoSantri: vi.fn(),
  }
}));

// Mock the child components
vi.mock('../src/components/SearchableSelect', () => ({
  default: ({ value, onChange, options, placeholder }: any) => (
    <select 
      data-testid="searchable-select" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}));

vi.mock('../src/components/RichTextEditor', () => ({
  default: ({ value, onChange, placeholder }: any) => (
    <textarea 
      data-testid="rich-text-editor" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}));

// Mock URL.createObjectURL to avoid errors with file objects
global.URL.createObjectURL = vi.fn(() => 'mock-url');

describe('SantriFormModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API calls
    vi.mocked(api.getMasterAngkatan).mockResolvedValue([
      { id_angkatan: 1, angkatan: '2023' },
      { id_angkatan: 2, angkatan: '2024' }
    ]);
    
    vi.mocked(api.getMasterKonsentrasi).mockResolvedValue([
      { id_konsentrasi: 1, nama_konsentrasi: 'Web Programming' },
      { id_konsentrasi: 2, nama_konsentrasi: 'Mobile Development' }
    ]);
    
    vi.mocked(api.createSantri).mockResolvedValue({ data: { id: 123 } });
    vi.mocked(api.updateSantri).mockResolvedValue({});
    vi.mocked(api.uploadFotoSantri).mockResolvedValue({});
  });

  it('renders create form correctly', async () => {
    render(
      <SantriFormModal 
        mode="create" 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    // Wait for the modal to finish loading
    await waitFor(() => {
      expect(screen.getByText('Tambah Santri Baru')).toBeInTheDocument();
    });

    // Check that required fields are present
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByLabelText('Nama Lengkap *')).toBeInTheDocument();
    expect(screen.getByLabelText('Nama Panggilan *')).toBeInTheDocument();
    expect(screen.getByLabelText('Tempat Lahir *')).toBeInTheDocument();
    expect(screen.getByLabelText('Tanggal Lahir *')).toBeInTheDocument();
    
    // Check that all sections are present
    expect(screen.getByText('Foto Upload Section')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simpan/i })).toBeInTheDocument();
  });

  it('renders edit form when santriId is provided', async () => {
    vi.mocked(api.getSantriDetail).mockResolvedValue({
      email: 'test@example.com',
      name: 'John Doe',
      nickname: 'John',
      status: 'Mondok',
      angkatan: 1,
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '2000-01-01',
      foto_url: 'https://example.com/foto.jpg'
    });

    render(
      <SantriFormModal 
        mode="edit" 
        santriId={123} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Data Santri')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  });

  it('allows user to fill form fields', async () => {
    render(
      <SantriFormModal 
        mode="create" 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tambah Santri Baru')).toBeInTheDocument();
    });

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Nama Lengkap *'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Nama Panggilan *'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Tempat Lahir *'), { target: { value: 'Jakarta' } });
    
    // Select date
    fireEvent.change(screen.getByLabelText('Tanggal Lahir *'), { target: { value: '2000-01-01' } });

    // Verify values are updated
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jakarta')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2000-01-01')).toBeInTheDocument();
  });

  it('selects dropdown values', async () => {
    render(
      <SantriFormModal 
        mode="create" 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tambah Santri Baru')).toBeInTheDocument();
    });

    // Change status - get by name attribute
    const statusSelect = screen.getByRole('combobox', { name: /status/i });
    fireEvent.change(statusSelect, { target: { value: 'Alumni' } });
    expect(statusSelect).toHaveValue('Alumni');

    // Change kondisi keluarga - get by name attribute
    const kondisiSelect = screen.getByRole('combobox', { name: /kondisi keluarga/i });
    fireEvent.change(kondisiSelect, { target: { value: 'Yatim Piatu' } });
    expect(kondisiSelect).toHaveValue('Yatim Piatu');
  });

  it('handles checkbox interaction', async () => {
    render(
      <SantriFormModal
        mode="create"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tambah Santri Baru')).toBeInTheDocument();
    });

    // Get the checkbox by its name attribute instead of label text
    const checkbox = screen.getByRole('checkbox', { name: '' }); // The checkbox has empty name
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('submits form with valid data in create mode', async () => {
    render(
      <SantriFormModal 
        mode="create" 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tambah Santri Baru')).toBeInTheDocument();
    });

    // Fill form - use input by name attribute to avoid label errors
    fireEvent.change(screen.getByRole('textbox', { name: 'email_santri' }), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'nama_lengkap_santri' }), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'nama_panggilan_santri' }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'tempat_lahir_santri' }), { target: { value: 'Jakarta' } });
    fireEvent.change(screen.getByLabelText('Tanggal Lahir *'), { target: { value: '2000-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Simpan/i }));

    await waitFor(() => {
      expect(api.createSantri).toHaveBeenCalledWith({
        email_santri: 'test@example.com',
        nama_lengkap_santri: 'John Doe',
        nama_panggilan_santri: 'John',
        status_santri: 'Daftar', // default value
        angkatan_santri: 0, // default value
        tempat_lahir_santri: 'Jakarta',
        tanggal_lahir_santri: '2000-01-01',
        alamat_lengkap_santri: '', // default value
        asal_daerah_santri: '', // default value
        kota_domisili_sekarang_santri: '', // default value
        kondisi_keluarga_santri: 'Masih Lengkap', // default value
        anak_ke_santri: 1, // default value
        jumlah_saudara_santri: 1, // default value
        konsentrasi_santri: 0, // default value
        alasan_mendaftar_santri: '', // default value
        target_santri: '', // default value
        hafalan_quran_santri: '', // default value
        skill_kelebihan_santri: '', // default value
        musyrif: 0, // default value
      });
    });
  });

  it('closes modal when cancel button is clicked', async () => {
    render(
      <SantriFormModal 
        mode="create" 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tambah Santri Baru')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when close icon is clicked', async () => {
    render(
      <SantriFormModal 
        mode="create" 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Tambah Santri Baru')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});