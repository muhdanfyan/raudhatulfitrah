import { useState } from 'react';
import { Users, Shield, LayoutGrid, Menu, Lock } from 'lucide-react';
import UserPage from './UserPage';
import RolesTab from '../components/manajemen/RolesTab';
import WidgetMappingTab from '../components/manajemen/WidgetMappingTab';
import MenuStructureTab from '../components/manajemen/MenuStructureTab';
import FeatureAccessTab from '../components/manajemen/FeatureAccessTab';

type TabType = 'users' | 'roles' | 'widgets' | 'menus' | 'features';

const TABS: { id: TabType; label: string; icon: any }[] = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'widgets', label: 'Widgets', icon: LayoutGrid },
  { id: 'menus', label: 'Menu', icon: Menu },
  { id: 'features', label: 'Fitur', icon: Lock },
];

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('users');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserPage />;
      case 'roles':
        return <RolesTab />;
      case 'widgets':
        return <WidgetMappingTab />;
      case 'menus':
        return <MenuStructureTab />;
      case 'features':
        return <FeatureAccessTab />;
      default:
        return <UserPage />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
