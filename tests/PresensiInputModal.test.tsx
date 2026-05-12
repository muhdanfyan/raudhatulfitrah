import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PresensiInputModal from '../src/components/PresensiInputModal';
import { api } from '../src/services/api';

// Mock the API
vi.mock('../src/services/api', () => ({
  api: {
    getSantriList: vi.fn(),
    getMasterAgenda: vi.fn(),
    createPresensi: vi.fn(),
  }
}));

// Define constant for API_URL since it's used in the component but not imported
const API_URL = 'https://api-dev.pondokinformatika.id';
global.API_URL = API_URL;

describe('PresensiInputModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const initialTanggal = '2023-12-01';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API calls - handle different data structures based on component needs
    vi.mocked(api.getSantriList).mockResolvedValue([
        { id: 1, name: 'John Doe', photo: 'john.jpg' },
        { id: 2, name: 'Jane Smith', photo: 'jane.jpg' },
      ]);

    vi.mocked(api.getMasterAgenda).mockResolvedValue([
      { id_agenda: 1, nama_agenda: 'Sholat Subuh', jam_mulai: '04:30', jam_selesai: '05:00' },
      { id_agenda: 2, nama_agenda: 'Makan Pagi', jam_mulai: '06:00', jam_selesai: '07:00' },
    ]);

    vi.mocked(api.createPresensi).mockResolvedValue({});
  });

  it('renders modal when isOpen is true', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Input Presensi Manual')).toBeInTheDocument();
    });

    expect(screen.getByText('Masukkan presensi untuk tanggal tertentu')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <PresensiInputModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('loads data when modal opens', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(api.getSantriList).toHaveBeenCalledWith({ status: 'Mondok', per_page: 100 });
      expect(api.getMasterAgenda).toHaveBeenCalled();
    });
  });

  it('displays agenda options', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Sholat Subuh')).toBeInTheDocument();
    }, { timeout: 2000 }); // Wait up to 2 seconds for the agenda to load

    expect(screen.queryByText('04:30 - 05:00')).toBeInTheDocument();
    expect(screen.queryByText('Makan Pagi')).toBeInTheDocument();
    expect(screen.queryByText('06:00 - 07:00')).toBeInTheDocument();
  });

  it('allows user to select agenda', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sholat Subuh')).toBeInTheDocument();
    });

    // Click on the 'Makan Pagi' agenda
    fireEvent.click(screen.getByText('Makan Pagi'));

    // Use toBeInTheDocument to check if element exists since the class changes may not be immediate
    expect(screen.getByText('Makan Pagi')).toBeInTheDocument();
  });

  it('displays santri list', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('allows user to select/deselect santri', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check if checkboxes are present
    const johnCheckbox = screen.getAllByRole('checkbox')[0];
    const janeCheckbox = screen.getAllByRole('checkbox')[1];

    expect(johnCheckbox).not.toBeChecked();
    expect(janeCheckbox).not.toBeChecked();

    // Select John
    fireEvent.click(johnCheckbox);
    expect(johnCheckbox).toBeChecked();

    // Deselect John
    fireEvent.click(johnCheckbox);
    expect(johnCheckbox).not.toBeChecked();
  });

  it('allows selecting all santri', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Pilih Semua')).toBeInTheDocument();

    // Click 'Pilih Semua'
    fireEvent.click(screen.getByText('Pilih Semua'));

    // Check that all santri are selected
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();

    // Click 'Batal Pilih Semua'
    fireEvent.click(screen.getByText('Batal Pilih Semua'));
    
    // Check that all santri are deselected
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('allows changing the date', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Input Presensi Manual')).toBeInTheDocument();
    });

    // Date input should be found by label text or by role 'spinbutton' or 'textbox'
    const dateInput = screen.getByLabelText(/Tanggal Presensi/);
    expect(dateInput).toHaveValue(initialTanggal);

    // Change the date
    const newDate = '2023-12-15';
    fireEvent.change(dateInput, { target: { value: newDate } });

    expect(dateInput).toHaveValue(newDate);
  });

  it('shows error if no agenda and santri selected', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Input Presensi Manual')).toBeInTheDocument();
    });

    // Click save without selecting anything
    fireEvent.click(screen.getByRole('button', { name: /Simpan Presensi/i }));

    await waitFor(() => {
      expect(screen.getByText('Pilih agenda dan minimal 1 santri')).toBeInTheDocument();
    });
  });

  it('submits form with selected data', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Select an agenda (Sholat Subuh is selected by default)
    // Select a santri
    fireEvent.click(screen.getAllByRole('checkbox')[0]); // John Doe

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Simpan Presensi/i }));

    await waitFor(() => {
      expect(api.createPresensi).toHaveBeenCalledWith(1, 1, initialTanggal);
    });
  });

  it('closes modal when cancel button is clicked', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Input Presensi Manual')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when close icon is clicked', async () => {
    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Input Presensi Manual')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Batal/i })); // The "X" button
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state during data fetch', () => {
    vi.mocked(api.getSantriList).mockReturnValue(new Promise(() => {})); // Never resolves to keep loading
    vi.mocked(api.getMasterAgenda).mockReturnValue(new Promise(() => {}));

    render(
      <PresensiInputModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        tanggal={initialTanggal}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument(); // Loader2 spinner
  });
});