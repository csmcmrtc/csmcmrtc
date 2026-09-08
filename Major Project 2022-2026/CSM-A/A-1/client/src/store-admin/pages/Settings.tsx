import { useState, useEffect } from 'react';
import {
    Save,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    Upload,
    ChevronRight,
    Bell,
    Lock,
    Store,
    CreditCard,
    Truck,
    Globe,
    LogOut,
    Mail,
    Phone,
    MapPin,
    FileText,
    HelpCircle,
    ExternalLink,
    ToggleRight,
    ToggleLeft,
    Zap,
    Database,
    Loader2
} from 'lucide-react';
import storeService from '../../services/storeService';

interface StoreSettings {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    city: string;
    state: string;
    pincode: string;
    description: string;
    logo?: string;
    banner?: string;
    taxId: string;
    businessType: string;
    operatingHours: {
        monday: { open: string; close: string; closed: boolean };
        tuesday: { open: string; close: string; closed: boolean };
        wednesday: { open: string; close: string; closed: boolean };
        thursday: { open: string; close: string; closed: boolean };
        friday: { open: string; close: string; closed: boolean };
        saturday: { open: string; close: string; closed: boolean };
        sunday: { open: string; close: string; closed: boolean };
    };
}

interface NotificationSettings {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    orderNotifications: boolean;
    reviewNotifications: boolean;
    promotionalEmails: boolean;
    weeklyReport: boolean;
    dailyReport: boolean;
}

interface PaymentSettings {
    upiEnabled: boolean;
    cardEnabled: boolean;
    netbankingEnabled: boolean;
    walletEnabled: boolean;
    codEnabled: boolean;
    autoSettlement: boolean;
    settlementFrequency: 'daily' | 'weekly' | 'monthly';
}

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'payment' | 'shipping' | 'security' | 'api' | 'about'>('general');
    const [showSaveNotification, setShowSaveNotification] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [_isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [_currentStoreId, setCurrentStoreId] = useState<string | null>(null);

    const [storeSettings, setStoreSettings] = useState<StoreSettings>({
        storeName: '',
        storeEmail: '',
        storePhone: '',
        storeAddress: '',
        city: '',
        state: '',
        pincode: '',
        description: '',
        taxId: '',
        businessType: 'Retail',
        operatingHours: {
            monday: { open: '09:00', close: '21:00', closed: false },
            tuesday: { open: '09:00', close: '21:00', closed: false },
            wednesday: { open: '09:00', close: '21:00', closed: false },
            thursday: { open: '09:00', close: '21:00', closed: false },
            friday: { open: '09:00', close: '21:00', closed: false },
            saturday: { open: '09:00', close: '21:00', closed: false },
            sunday: { open: '10:00', close: '19:00', closed: false }
        }
    });

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        orderNotifications: true,
        reviewNotifications: true,
        promotionalEmails: false,
        weeklyReport: true,
        dailyReport: false
    });

    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        upiEnabled: true,
        cardEnabled: true,
        netbankingEnabled: true,
        walletEnabled: true,
        codEnabled: true,
        autoSettlement: true,
        settlementFrequency: 'daily'
    });

    // Fetch store settings on mount
    useEffect(() => {
        fetchStoreSettings();
    }, []);

    const fetchStoreSettings = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await storeService.getMyStore();

            if (response.success && response.data.store) {
                const store = response.data.store;
                setCurrentStoreId(store.id);
                
                // Map API response to local state with proper type handling
                const defaultHours = {
                    monday: { open: '09:00', close: '21:00', closed: false },
                    tuesday: { open: '09:00', close: '21:00', closed: false },
                    wednesday: { open: '09:00', close: '21:00', closed: false },
                    thursday: { open: '09:00', close: '21:00', closed: false },
                    friday: { open: '09:00', close: '21:00', closed: false },
                    saturday: { open: '09:00', close: '21:00', closed: false },
                    sunday: { open: '10:00', close: '19:00', closed: false }
                };

                // Parse opening_hours if it's a simple key-value format
                let parsedHours = defaultHours;
                if (store.opening_hours && typeof store.opening_hours === 'object') {
                    // Check if it's already in the correct format
                    if (store.opening_hours.monday && typeof store.opening_hours.monday === 'object') {
                        parsedHours = store.opening_hours as unknown as typeof defaultHours;
                    }
                }

                setStoreSettings({
                    storeName: store.name || '',
                    storeEmail: store.email || '',
                    storePhone: store.phone || '',
                    storeAddress: store.address || '',
                    city: '', // Parse from address if needed
                    state: '',
                    pincode: '',
                    description: store.description || '',
                    logo: store.logo_url,
                    banner: store.cover_image_url,
                    taxId: '',
                    businessType: store.type || 'Retail',
                    operatingHours: parsedHours
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load store settings');
        } finally {
            setLoading(false);
        }
    };

    const handleStoreSetting = (key: keyof StoreSettings, value: any) => {
        setStoreSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleOperatingHours = (day: string, field: string, value: string | boolean) => {
        setStoreSettings(prev => ({
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                [day]: {
                    ...prev.operatingHours[day as keyof typeof prev.operatingHours],
                    [field]: value
                }
            }
        }));
    };

    const handleNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
        setNotificationSettings(prev => ({ ...prev, [key]: value }));
    };

    const handlePaymentSetting = (key: keyof PaymentSettings, value: any) => {
        setPaymentSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            
            // Map local state to API format
            const storeType = storeSettings.businessType.toLowerCase() as 'grocery' | 'pharmacy' | 'electronics' | 'fashion' | 'restaurant' | 'other';
            const updateData = {
                name: storeSettings.storeName,
                email: storeSettings.storeEmail,
                phone: storeSettings.storePhone,
                address: storeSettings.storeAddress,
                description: storeSettings.description,
                type: storeType
            };

            await storeService.updateMyStore(updateData);

            setShowSaveNotification(true);
            setTimeout(() => setShowSaveNotification(false), 3000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // Loading state
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mt-8">
                    <Store className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to load settings</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchStoreSettings}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your store configuration and preferences</p>
            </div>

            {/* Save Notification */}
            {showSaveNotification && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-green-900">Settings saved successfully</p>
                        <p className="text-sm text-green-700">Your changes have been applied</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'general'
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Store className="h-5 w-5" />
                                Store Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'notifications'
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Bell className="h-5 w-5" />
                                Notifications
                            </button>
                            <button
                                onClick={() => setActiveTab('payment')}
                                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'payment'
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <CreditCard className="h-5 w-5" />
                                Payments
                            </button>
                            <button
                                onClick={() => setActiveTab('shipping')}
                                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'shipping'
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Truck className="h-5 w-5" />
                                Shipping
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'security'
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Lock className="h-5 w-5" />
                                Security
                            </button>
                            <button
                                onClick={() => setActiveTab('api')}
                                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'api'
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Zap className="h-5 w-5" />
                                API & Integrations
                            </button>
                            <button
                                onClick={() => setActiveTab('about')}
                                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'about'
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <HelpCircle className="h-5 w-5" />
                                About
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            {/* Store Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                        <input
                                            type="text"
                                            value={storeSettings.storeName}
                                            onChange={(e) => handleStoreSetting('storeName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <input
                                                    type="email"
                                                    value={storeSettings.storeEmail}
                                                    onChange={(e) => handleStoreSetting('storeEmail', e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <input
                                                    type="tel"
                                                    value={storeSettings.storePhone}
                                                    onChange={(e) => handleStoreSetting('storePhone', e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={storeSettings.description}
                                            onChange={(e) => handleStoreSetting('description', e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            placeholder="Describe your store..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <input
                                                type="text"
                                                value={storeSettings.storeAddress}
                                                onChange={(e) => handleStoreSetting('storeAddress', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                value={storeSettings.city}
                                                onChange={(e) => handleStoreSetting('city', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <input
                                                type="text"
                                                value={storeSettings.state}
                                                onChange={(e) => handleStoreSetting('state', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                            <input
                                                type="text"
                                                value={storeSettings.pincode}
                                                onChange={(e) => handleStoreSetting('pincode', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                                            <input
                                                type="text"
                                                value={storeSettings.taxId}
                                                onChange={(e) => handleStoreSetting('taxId', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                                            <select
                                                value={storeSettings.businessType}
                                                onChange={(e) => handleStoreSetting('businessType', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                            >
                                                <option value="Retail">Retail</option>
                                                <option value="Wholesale">Wholesale</option>
                                                <option value="Service">Service</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Operating Hours */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h2>
                                <div className="space-y-3">
                                    {days.map(day => (
                                        <div key={day} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-4 flex-1">
                                                <span className="text-sm font-medium text-gray-700 w-20 capitalize">{day}</span>

                                                {!storeSettings.operatingHours[day as keyof typeof storeSettings.operatingHours].closed ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={storeSettings.operatingHours[day as keyof typeof storeSettings.operatingHours].open}
                                                            onChange={(e) => handleOperatingHours(day, 'open', e.target.value)}
                                                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <span className="text-gray-500">to</span>
                                                        <input
                                                            type="time"
                                                            value={storeSettings.operatingHours[day as keyof typeof storeSettings.operatingHours].close}
                                                            onChange={(e) => handleOperatingHours(day, 'close', e.target.value)}
                                                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Closed</span>
                                                )}
                                            </div>

                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={storeSettings.operatingHours[day as keyof typeof storeSettings.operatingHours].closed}
                                                    onChange={(e) => handleOperatingHours(day, 'closed', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-600">Closed</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Logo & Banner */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Media</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600">Click to upload logo</p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                            <input type="file" className="hidden" accept="image/*" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Banner</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600">Click to upload banner</p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                                            <input type="file" className="hidden" accept="image/*" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                                <div className="space-y-4">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Channels</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="flex items-center gap-2">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                                                </span>
                                                <button
                                                    onClick={() => handleNotificationSetting('emailNotifications', !notificationSettings.emailNotifications)}
                                                    className="cursor-pointer"
                                                >
                                                    {notificationSettings.emailNotifications ? (
                                                        <ToggleRight className="h-6 w-6 text-blue-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-6 w-6 text-gray-300" />
                                                    )}
                                                </button>
                                            </label>

                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="flex items-center gap-2">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                                                </span>
                                                <button
                                                    onClick={() => handleNotificationSetting('smsNotifications', !notificationSettings.smsNotifications)}
                                                    className="cursor-pointer"
                                                >
                                                    {notificationSettings.smsNotifications ? (
                                                        <ToggleRight className="h-6 w-6 text-blue-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-6 w-6 text-gray-300" />
                                                    )}
                                                </button>
                                            </label>

                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="flex items-center gap-2">
                                                    <Bell className="h-5 w-5 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                                                </span>
                                                <button
                                                    onClick={() => handleNotificationSetting('pushNotifications', !notificationSettings.pushNotifications)}
                                                    className="cursor-pointer"
                                                >
                                                    {notificationSettings.pushNotifications ? (
                                                        <ToggleRight className="h-6 w-6 text-blue-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-6 w-6 text-gray-300" />
                                                    )}
                                                </button>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Event Notifications</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="flex items-center gap-2">
                                                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">New Orders</span>
                                                </span>
                                                <button
                                                    onClick={() => handleNotificationSetting('orderNotifications', !notificationSettings.orderNotifications)}
                                                    className="cursor-pointer"
                                                >
                                                    {notificationSettings.orderNotifications ? (
                                                        <ToggleRight className="h-6 w-6 text-blue-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-6 w-6 text-gray-300" />
                                                    )}
                                                </button>
                                            </label>

                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="flex items-center gap-2">
                                                    <MessageSquare className="h-5 w-5 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">Review Notifications</span>
                                                </span>
                                                <button
                                                    onClick={() => handleNotificationSetting('reviewNotifications', !notificationSettings.reviewNotifications)}
                                                    className="cursor-pointer"
                                                >
                                                    {notificationSettings.reviewNotifications ? (
                                                        <ToggleRight className="h-6 w-6 text-blue-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-6 w-6 text-gray-300" />
                                                    )}
                                                </button>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Reports</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="text-sm font-medium text-gray-700">Weekly Report</span>
                                                <button
                                                    onClick={() => handleNotificationSetting('weeklyReport', !notificationSettings.weeklyReport)}
                                                    className="cursor-pointer"
                                                >
                                                    {notificationSettings.weeklyReport ? (
                                                        <ToggleRight className="h-6 w-6 text-blue-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-6 w-6 text-gray-300" />
                                                    )}
                                                </button>
                                            </label>

                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="text-sm font-medium text-gray-700">Daily Report</span>
                                                <button
                                                    onClick={() => handleNotificationSetting('dailyReport', !notificationSettings.dailyReport)}
                                                    className="cursor-pointer"
                                                >
                                                    {notificationSettings.dailyReport ? (
                                                        <ToggleRight className="h-6 w-6 text-blue-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-6 w-6 text-gray-300" />
                                                    )}
                                                </button>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Settings */}
                    {activeTab === 'payment' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <span className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.upiEnabled}
                                                onChange={(e) => handlePaymentSetting('upiEnabled', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 cursor-pointer"
                                            />
                                            <span>
                                                <p className="text-sm font-medium text-gray-900">UPI Payments</p>
                                                <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                                            </span>
                                        </span>
                                        {paymentSettings.upiEnabled && <CheckCircle className="h-5 w-5 text-green-600" />}
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <span className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.cardEnabled}
                                                onChange={(e) => handlePaymentSetting('cardEnabled', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 cursor-pointer"
                                            />
                                            <span>
                                                <p className="text-sm font-medium text-gray-900">Credit/Debit Cards</p>
                                                <p className="text-xs text-gray-500">Visa, Mastercard, American Express</p>
                                            </span>
                                        </span>
                                        {paymentSettings.cardEnabled && <CheckCircle className="h-5 w-5 text-green-600" />}
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <span className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.netbankingEnabled}
                                                onChange={(e) => handlePaymentSetting('netbankingEnabled', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 cursor-pointer"
                                            />
                                            <span>
                                                <p className="text-sm font-medium text-gray-900">Net Banking</p>
                                                <p className="text-xs text-gray-500">All major banks supported</p>
                                            </span>
                                        </span>
                                        {paymentSettings.netbankingEnabled && <CheckCircle className="h-5 w-5 text-green-600" />}
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <span className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.walletEnabled}
                                                onChange={(e) => handlePaymentSetting('walletEnabled', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 cursor-pointer"
                                            />
                                            <span>
                                                <p className="text-sm font-medium text-gray-900">Digital Wallets</p>
                                                <p className="text-xs text-gray-500">Paytm, Amazon Pay, Apple Pay</p>
                                            </span>
                                        </span>
                                        {paymentSettings.walletEnabled && <CheckCircle className="h-5 w-5 text-green-600" />}
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <span className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={paymentSettings.codEnabled}
                                                onChange={(e) => handlePaymentSetting('codEnabled', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 cursor-pointer"
                                            />
                                            <span>
                                                <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
                                                <p className="text-xs text-gray-500">Pay at delivery option</p>
                                            </span>
                                        </span>
                                        {paymentSettings.codEnabled && <CheckCircle className="h-5 w-5 text-green-600" />}
                                    </label>
                                </div>
                            </div>

                            {/* Settlement Settings */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Settlement Settings</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer">
                                            <span className="text-sm font-medium text-gray-700">Auto Settlement</span>
                                            <button
                                                onClick={() => handlePaymentSetting('autoSettlement', !paymentSettings.autoSettlement)}
                                                className="cursor-pointer"
                                            >
                                                {paymentSettings.autoSettlement ? (
                                                    <ToggleRight className="h-6 w-6 text-blue-600" />
                                                ) : (
                                                    <ToggleLeft className="h-6 w-6 text-gray-300" />
                                                )}
                                            </button>
                                        </label>
                                    </div>

                                    {paymentSettings.autoSettlement && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Settlement Frequency</label>
                                            <select
                                                value={paymentSettings.settlementFrequency}
                                                onChange={(e) => handlePaymentSetting('settlementFrequency', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Settings */}
                    {activeTab === 'shipping' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Settings</h2>
                            <div className="space-y-4">
                                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-medium mb-1">Coming Soon</p>
                                        <p>Shipping settings and carrier integrations will be available soon.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter current password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h2>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Enable 2FA</p>
                                            <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                                            Enable
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h2>
                                <div className="space-y-3">
                                    <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Chrome on Windows</p>
                                            <p className="text-sm text-gray-600">Last active: Just now</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Current</span>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Mobile Safari</p>
                                            <p className="text-sm text-gray-600">Last active: 2 hours ago</p>
                                        </div>
                                        <button className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer">Logout</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* API & Integrations */}
                    {activeTab === 'api' && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">API Keys & Integrations</h2>
                            <div className="space-y-4">
                                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-medium mb-1">Developer API</p>
                                        <p>Manage your API keys and integrations with third-party services.</p>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-gray-900">API Key</p>
                                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer">Copy</button>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded font-mono text-xs text-gray-700 break-all">
                                        sk_live_4eC39HqLyjWDarht...
                                    </div>
                                </div>

                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                                    Generate New Key
                                </button>
                            </div>
                        </div>
                    )}

                    {/* About */}
                    {activeTab === 'about' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">About JustSearch Store Admin</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Version</p>
                                        <p className="text-sm text-gray-600">1.0.0</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Last Updated</p>
                                        <p className="text-sm text-gray-600">January 10, 2024</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Resources</h3>
                                        <div className="space-y-2">
                                            <a href="#" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer text-sm">
                                                <FileText className="h-4 w-4" />
                                                Documentation
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                            <a href="#" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer text-sm">
                                                <HelpCircle className="h-4 w-4" />
                                                Help & Support
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                            <a href="#" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer text-sm">
                                                <Globe className="h-4 w-4" />
                                                Website
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h2>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Database className="h-5 w-5 text-red-600" />
                                            <span className="text-sm font-medium text-red-900">Delete All Data</span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-red-600" />
                                    </button>

                                    <button className="w-full flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <LogOut className="h-5 w-5 text-red-600" />
                                            <span className="text-sm font-medium text-red-900">Close Store</span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Button (Fixed at bottom) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:static lg:mt-6 lg:bg-transparent lg:border-0 lg:shadow-none">
                <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
                    <button className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-medium">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Spacing for fixed button */}
            <div className="h-20 lg:h-0" />
        </div>
    );
};

// Import missing icons
const ShoppingBag = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4m8 0a2 2 0 01-2 2H8a2 2 0 01-2-2m8 0v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5m0 0H4a2 2 0 00-2 2v3a2 2 0 002 2h16a2 2 0 002-2v-3a2 2 0 00-2-2h-3.5m-2.5-1a3 3 0 00-3 3v6a3 3 0 003 3h6a3 3 0 003-3v-6a3 3 0 00-3-3h-6z" />
    </svg>
);

const MessageSquare = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

export default SettingsPage;