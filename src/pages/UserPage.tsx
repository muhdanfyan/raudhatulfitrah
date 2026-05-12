import { useState, useEffect, useRef } from 'react';
import { API_URL, getHeaders } from '../services/api';
import { Search, UserPlus, Mail, Loader2, Pencil, Trash2, X, Save, Link2, ChevronDown, Check, User, ArrowUpDown, ArrowUp, ArrowDown, Shield, Users, LayoutGrid, Menu as MenuIcon, KeyRound, Plus } from 'lucide-react';
import WidgetGridEditor, { WidgetGridEditorRef } from '../components/WidgetGridEditor';
import MenuTreeEditor from '../components/MenuTreeEditor';
import FeatureAccessEditor from '../components/FeatureAccessEditor';

type TabType = 'users' | 'roles' | 'widgets' | 'menus' | 'features';




interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  santri: number;
  santri_nama?: string;
  active: number;
  last_login: number | null;
  roles?: string[];
  role_display?: string;
}

interface SantriOption {
  id_santri: number;
  nama_lengkap_santri: string;
}

interface GroupOption {
  id: number;
  name: string;
  description: string;
  users_count?: number;
}

interface RoleData {
  id: number;
  name: string;
  description: string;
  users_count: number;
}

type SortField = 'first_name' | 'email' | 'role_display' | 'santri_nama' | 'active' | 'last_login';
type SortOrder = 'asc' | 'desc';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  members: 'bg-primary/10 text-primary-dark',
  pengontrol: 'bg-purple-100 text-purple-800',
  mentor: 'bg-indigo-100 text-indigo-800',
  ppdb: 'bg-yellow-100 text-yellow-800',
  ortu: 'bg-pink-100 text-pink-800',
  pembinaan: 'bg-green-100 text-green-800',
  asrama: 'bg-orange-100 text-orange-800',
  akademik: 'bg-cyan-100 text-cyan-800',
  koperasi: 'bg-teal-100 text-teal-800',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  members: 'Santri',
  pengontrol: 'Musyrif',
  mentor: 'Mentor',
  ppdb: 'PPDB',
  ortu: 'Orang Tua',
  pembinaan: 'Pembinaan',
  asrama: 'Asrama',
  akademik: 'Akademik',
  koperasi: 'Koperasi',
};
// Searchable Select Component
interface SelectOption {
  value: number | string;
  label: string;
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  disabled = false,
  showAvatar = false,
}: {
  options: SelectOption[];
  value: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  showAvatar?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-expanded={isOpen}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-2.5
          bg-white border rounded-xl transition-all duration-200
          ${isOpen ? 'border-primary ring-2 ring-blue-100 shadow-sm' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showAvatar && selectedOption && selectedOption.value !== 0 && (
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {selectedOption.label.charAt(0).toUpperCase()}
            </div>
          )}
          {selectedOption ? (
            <span className={`text-sm truncate ${selectedOption.value === 0 ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedOption && selectedOption.value !== 0 && !disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(0); }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
            {options.length > 10 && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <span className="font-medium text-primary">{filteredOptions.length}</span> dari {options.length} data
              </div>
            )}
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <User className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                <div className="text-sm text-gray-500">Tidak ditemukan</div>
                {searchTerm && <div className="text-xs text-gray-400 mt-1">Coba kata kunci lain</div>}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => { onChange(option.value); setIsOpen(false); setSearchTerm(''); }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150
                    ${option.value === value ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-gray-50 border-l-2 border-transparent'}
                    ${index < filteredOptions.length - 1 ? 'border-b border-gray-50' : ''}
                  `}
                >
                  {showAvatar && option.value !== 0 ? (
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {option.label.charAt(0).toUpperCase()}
                    </div>
                  ) : option.value === 0 ? (
                    <div className="flex-shrink-0 w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                      <X className="w-4 h-4 text-gray-400" />
                    </div>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${option.value === 0 ? 'text-gray-400 italic' : 'text-gray-900 font-medium'}`}>
                      {option.label}
                    </div>
                  </div>
                  {option.value === value && <Check className="flex-shrink-0 w-5 h-5 text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function MultiSearchableSelect({
  options,
  values,
  onChange,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  disabled = false,
  roleColors = {},
  roleLabels = {},
}: {
  options: SelectOption[];
  values: (number | string)[];
  onChange: (values: (number | string)[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  roleColors?: Record<string, string>;
  roleLabels?: Record<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter(opt => values.includes(opt.value));
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const toggleOption = (value: number | string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const removeValue = (e: React.MouseEvent, value: number | string) => {
    e.stopPropagation();
    onChange(values.filter(v => v !== value));
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full flex flex-wrap items-center gap-2 px-3 py-2
          bg-white border rounded-xl transition-all duration-200 min-h-[46px]
          ${isOpen ? 'border-primary ring-2 ring-blue-100 shadow-sm' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'cursor-pointer'}
        `}
      >
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selectedOptions.map((opt) => {
              const colorClass = roleColors[opt.label] || 'bg-gray-100 text-gray-700';
              return (
                <span
                  key={opt.value}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm animate-in fade-in zoom-in duration-200 ${colorClass}`}
                >
                  {roleLabels[opt.label] || opt.label}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => removeValue(e, opt.value)}
                      className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-gray-400 text-sm px-1">{placeholder}</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {values.length > 0 && !disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange([]); }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                Tidak ditemukan
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = values.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-left transition-all
                      ${isSelected ? 'bg-primary/5 text-primary-dark font-medium' : 'hover:bg-gray-50 text-gray-700'}
                      ${index < filteredOptions.length - 1 ? 'border-b border-gray-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm">{roleLabels[option.label] || option.label}</span>
                    </div>
                    {isSelected && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Terpilih</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Sortable Header Component
function SortableHeader({
  label,
  field,
  currentSort,
  currentOrder,
  onSort,
}: {
  label: string;
  field: SortField;
  currentSort: SortField | null;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentSort === field;
  
  return (
    <button
      onClick={() => onSort(field)}
      className={`
        flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider
        transition-colors duration-150 hover:text-primary
        ${isActive ? 'text-primary' : 'text-gray-500'}
      `}
    >
      {label}
      <span className="flex flex-col">
        {isActive ? (
          currentOrder === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
        )}
      </span>
    </button>
  );
}

export default function UserPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('users');

  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [santriOptions, setSantriOptions] = useState<SantriOption[]>([]);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    santri: 0,
    active: 1,
  });
  const [saving, setSaving] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  // Delete state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Roles tab state
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [roleFormData, setRoleFormData] = useState({ name: '', description: '', dashboard_api: '' });
  const [savingRole, setSavingRole] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);
  const [deletingRole, setDeletingRole] = useState(false);

  // Widget editor ref
  const widgetEditorRef = useRef<WidgetGridEditorRef>(null);



  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/crud/users?page=${currentPage}&per_page=50`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      
      const response = await fetch(url, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.items);
        setTotalPages(data.data.last_page);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...users];
    
    // Filter by role
    if (roleFilter !== 'all') {
      result = result.filter(u => u.roles?.includes(roleFilter));
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(u => 
        statusFilter === 'active' ? u.active === 1 : u.active === 0
      );
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        let aVal: any = a[sortField as keyof UserData];
        let bVal: any = b[sortField as keyof UserData];

        // Handle null/undefined
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';

        // String comparison
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal as string).toLowerCase();
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredUsers(result);
  }, [users, roleFilter, statusFilter, sortField, sortOrder]);

  const fetchSantriOptions = async () => {
    try {
      const response = await fetch(`${API_URL}/crud/users/config`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success && data.data.relations?.santri) {
        setSantriOptions(data.data.relations.santri);
      }
    } catch (error) {
      console.error('Failed to fetch santri options:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/crud/groups?per_page=50`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setGroupOptions(data.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchSantriOptions();
    fetchGroups();
  }, []);

  // Fetch roles when tab changes to 'roles'
  useEffect(() => {
    if (activeTab === 'roles') {
      fetchRoles();
    }
  }, [activeTab]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await fetch(`${API_URL}/roles`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchUserRoles = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/roles`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSelectedRoleIds(data.data.roles.map((r: any) => r.id));
      }
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
    }
  };

  const handleCreateRole = () => {
    setRoleModalMode('create');
    setSelectedRole(null);
    setRoleFormData({ name: '', description: '', dashboard_api: '' });
    setShowRoleModal(true);
  };

  const handleEditRole = (role: RoleData) => {
    setRoleModalMode('edit');
    setSelectedRole(role);
    setRoleFormData({ 
      name: role.name, 
      description: role.description || '', 
      dashboard_api: (role as any).dashboard_api || '' 
    });
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    setSavingRole(true);
    try {
      const url = roleModalMode === 'create' 
        ? `${API_URL}/roles`
        : `${API_URL}/roles/${selectedRole?.id}`;
      
      const response = await fetch(url, {
        method: roleModalMode === 'create' ? 'POST' : 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(roleFormData),
      });
      const data = await response.json();
      if (data.success) {
        setShowRoleModal(false);
        fetchRoles();
      } else {
        alert(data.message || 'Gagal menyimpan role');
      }
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan role');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;
    setDeletingRole(true);
    try {
      const response = await fetch(`${API_URL}/roles/${deleteRoleId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setDeleteRoleId(null);
        fetchRoles();
      } else {
        alert(data.message || 'Gagal menghapus role');
      }
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus role');
    } finally {
      setDeletingRole(false);
    }
  };

  const handleSaveUserRoles = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/roles`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ role_ids: selectedRoleIds }),
      });
      const data = await response.json();
      if (!data.success) {
        alert(data.message || 'Gagal menyimpan roles');
      }
    } catch (error: any) {
      console.error('Failed to save user roles:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setSelectedRoleIds([]);
    setFormData({ email: '', first_name: '', last_name: '', phone: '', santri: 0, active: 1 });
    setShowModal(true);
  };

  const handleEdit = (user: UserData) => {
    setModalMode('edit');
    setSelectedUser(user);
    setSelectedRoleIds([]);
    fetchUserRoles(user.id);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name || '',
      phone: user.phone || '',
      santri: user.santri || 0,
      active: user.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = modalMode === 'create' 
        ? `${API_URL}/crud/users`
        : `${API_URL}/crud/users/${selectedUser?.id}`;
      
      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        const savedUserId = modalMode === 'create' ? data.data.id : selectedUser?.id;
        if (savedUserId) {
          await handleSaveUserRoles(savedUserId);
        }
        setShowModal(false);
        fetchUsers();
      } else {
        alert(data.message || 'Gagal menyimpan data');
      }
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/crud/users/${deleteId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setDeleteId(null);
        fetchUsers();
      } else {
        alert(data.message || 'Gagal menghapus data');
      }
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const colorClass = ROLE_COLORS[role] || 'bg-gray-100 text-gray-800';
    const label = ROLE_LABELS[role] || role;
    return (
      <span key={role} className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}>
        {label}
      </span>
    );
  };

  // Convert santri options for SearchableSelect
  const santriSelectOptions: SelectOption[] = [
    { value: 0, label: '-- Tidak Terhubung --' },
    ...santriOptions.map(s => ({ value: s.id_santri, label: s.nama_lengkap_santri }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User & Role</h1>
          <p className="text-gray-600">
            {activeTab === 'users' 
              ? `Total: ${total} user | Ditampilkan: ${filteredUsers.length}`
              : `Total: ${roles.length} role`
            }
          </p>
        </div>
        {activeTab === 'users' && (
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
          >
            <UserPlus className="w-5 h-5" />
            <span>Tambah User</span>
          </button>
        )}
        {activeTab === 'roles' && (
          <button 
            onClick={handleCreateRole}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md font-bold text-sm"
          >
            <Shield className="w-5 h-5" />
            <span>Tambah Role</span>
          </button>
        )}
        {activeTab === 'widgets' && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => widgetEditorRef.current?.setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all font-bold text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Widget</span>
            </button>
            <button 
              onClick={() => widgetEditorRef.current?.handleSave()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-sm hover:shadow-md font-bold text-sm"
            >
              <Save className="w-5 h-5" />
              <span>Simpan Layout</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'roles'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Shield className="w-4 h-4" />
          Roles
        </button>
        <button
          onClick={() => setActiveTab('widgets')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'widgets'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Widgets
        </button>
        <button
          onClick={() => setActiveTab('menus')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'menus'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <MenuIcon className="w-4 h-4" />
          Menu
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'features'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Fitur
        </button>
      </div>

      {activeTab === 'users' && (
        <>


      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari email atau nama..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-primary w-full transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px] transition-all"
            >
              <option value="all">Semua Level</option>
              {groupOptions.map((g) => (
                <option key={g.id} value={g.name}>
                  {ROLE_LABELS[g.name] || g.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            {(roleFilter !== 'all' || statusFilter !== 'all' || sortField) && (
              <button
                onClick={() => { setRoleFilter('all'); setStatusFilter('all'); setSortField(null); }}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <User className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <div className="text-gray-500">Tidak ada data user</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-b from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <SortableHeader label="User" field="first_name" currentSort={sortField} currentOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-left">
                    <SortableHeader label="Level" field="role_display" currentSort={sortField} currentOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-left">
                    <SortableHeader label="Santri Terhubung" field="santri_nama" currentSort={sortField} currentOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-left">
                    <SortableHeader label="Status" field="active" currentSort={sortField} currentOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-left">
                    <SortableHeader label="Login Terakhir" field="last_login" currentSort={sortField} currentOrder={sortOrder} onSort={handleSort} />
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/5/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                          {user.first_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => getRoleBadge(role))
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.santri_nama ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                            <Link2 className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-900">{user.santri_nama}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Tidak terhubung</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active === 1 ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(user)} 
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteId(user.id)} 
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Tambah User' : 'Edit User'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary transition-all"
                    placeholder="contoh@email.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Depan *</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Belakang</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. HP</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-primary transition-all"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hubungkan ke Santri</label>
                  <SearchableSelect
                    options={santriSelectOptions}
                    value={formData.santri}
                    onChange={(val) => setFormData({ ...formData, santri: Number(val) })}
                    placeholder="Pilih santri..."
                    searchPlaceholder="Cari nama santri..."
                    showAvatar={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level / Role</label>
                  <MultiSearchableSelect
                    options={groupOptions.map(g => ({ value: g.id, label: g.name }))}
                    values={selectedRoleIds}
                    onChange={(vals) => setSelectedRoleIds(vals as number[])}
                    placeholder="Pilih level/role..."
                    roleColors={ROLE_COLORS}
                    roleLabels={ROLE_LABELS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.active === 1 ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === 1}
                        onChange={() => setFormData({ ...formData, active: 1 })}
                        className="sr-only"
                      />
                      <div className={`w-3 h-3 rounded-full ${formData.active === 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="font-medium">Aktif</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.active === 0 ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === 0}
                        onChange={() => setFormData({ ...formData, active: 0 })}
                        className="sr-only"
                      />
                      <div className={`w-3 h-3 rounded-full ${formData.active === 0 ? 'bg-red-500' : 'bg-gray-300'}`} />
                      <span className="font-medium">Nonaktif</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm transition-all"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
            <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Konfirmasi Hapus</h3>
              <p className="text-gray-600 text-center mb-6">Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {activeTab === 'roles' && (
        /* Roles Tab Content */
        <div className="space-y-6">
          {/* Roles Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {rolesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-16">
                <Shield className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <div className="text-gray-500">Tidak ada role</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-b from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah User</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {roles.map((role) => (
                      <tr key={role.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ROLE_COLORS[role.name] || 'bg-gray-100 text-gray-600'}`}>
                              <Shield className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{role.name}</div>
                              <div className="text-xs text-gray-500">{ROLE_LABELS[role.name] || role.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{role.description || '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            <Users className="w-3.5 h-3.5" />
                            {role.users_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleEditRole(role)} 
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" 
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setDeleteRoleId(role.id)} 
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" 
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Role Modal */}
          {showRoleModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRoleModal(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
                  <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {roleModalMode === 'create' ? 'Tambah Role' : 'Edit Role'}
                    </h3>
                    <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Role *</label>
                      <input
                        type="text"
                        value={roleFormData.name}
                        onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="nama_role"
                        disabled={roleModalMode === 'edit'}
                      />
                      {roleModalMode === 'edit' && (
                        <p className="text-xs text-gray-500 mt-1">Nama role tidak dapat diubah</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                      <textarea
                        value={roleFormData.description}
                        onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Deskripsi role..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard API Endpoint</label>
                      <input
                        type="text"
                        value={roleFormData.dashboard_api}
                        onChange={(e) => setRoleFormData({ ...roleFormData, dashboard_api: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="/api/dashboard/example"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 italic">Contoh: /api/dashboard/akademik, /api/dashboard/musyrif</p>
                    </div>
                  </div>
                  <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                    <button
                      onClick={() => setShowRoleModal(false)}
                      className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveRole}
                      disabled={savingRole}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm transition-all"
                    >
                      {savingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Save className="w-4 h-4" />
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Role Confirmation */}
          {deleteRoleId && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteRoleId(null)} />
                <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Konfirmasi Hapus Role</h3>
                  <p className="text-gray-600 text-center mb-6">Apakah Anda yakin ingin menghapus role ini?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteRoleId(null)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleDeleteRole}
                      disabled={deletingRole}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                      {deletingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'widgets' && <WidgetGridEditor ref={widgetEditorRef} hideHeader={true} />}
      {activeTab === 'menus' && <MenuTreeEditor />}
      {activeTab === 'features' && <FeatureAccessEditor />}
    </div>
  );
}

