import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    MapPin,
    ShoppingBag,
    DollarSign,
    // Package,
    // Shield,
    TrendingUp,
    Activity,
} from 'lucide-react';
import { FcSearch } from "react-icons/fc";
import { BiSolidStore } from "react-icons/bi";

const Home: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    // Example products for quick search
    const exampleProducts = [
        'Amul Pasteurized Butter',
        'India Gate Basmati Rice',
        'Milk Bread',
        'Heritage Curd',
        'Colgate Total Toothpaste',
        'Maggi 2-Minute Noodles',
    ];

    const features = [
        {
            icon: <Activity className="w-8 h-8" />,
            title: 'Smart Price Comparison',
            description: 'Compare prices across local stores and delivery platforms for the best deals.'
        },
        {
            icon: <MapPin className="w-8 h-8" />,
            title: 'Location-Based Store Finder',
            description: 'Find nearby grocery stores and retailers within 2km with accurate directions.'
        },
        {
            icon: <ShoppingBag className="w-8 h-8" />,
            title: 'Flexible Shopping Options',
            description: 'Choose between online payment with pickup, delivery, or pay-at-store options.'
        },
        // {
        //     icon: <DollarSign className="w-8 h-8" />,
        //     title: 'Money-Saving Analytics',
        //     description: 'Track your savings with analytics showing local vs. delivery app costs.'
        // },
        // {
        //     icon: <Package className="w-8 h-8" />,
        //     title: 'Real-Time Inventory',
        //     description: 'Check product availability at local stores before visiting with live updates.'
        // },
        // {
        //     icon: <Shield className="w-8 h-8" />,
        //     title: 'Secure Payment Integration',
        //     description: 'Safe online payments through trusted gateways or cash-on-delivery options.'
        // }
    ];

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="text-center py-12 md:py-16">
                <div className='flex items-center justify-center gap-2'>
                    <h1 className="text-4xl md:text-6xl font-bold text-brand leading-tight">
                        Welcome to JustSearch
                    </h1>
                    <div className='relative'>
                        <BiSolidStore className='w-16 h-16 text-orange-400' />
                        <FcSearch className='absolute top-0 left-0 w-12 h-12 animate-bounce-custom' />
                    </div>
                </div>

                <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                    Compare Local Store Prices with Delivery Apps and Save Money on Groceries & Daily Essentials
                </p>

                {/* Main Search Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="flex flex-col md:flex-row gap-3 md:gap-0">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search any product (e.g., Amul Butter, Maggi Noodles, Tata Salt...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2 text-lg text-gray-700 bg-white border-2 border-gray-300 rounded-xl md:rounded-l-xl md:rounded-r-none focus:border-brand focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-brand hover:bg-blue-600 text-white px-8 py-2 text-lg font-semibold rounded-xl md:rounded-l-none md:rounded-r-xl transition-all duration-300 shadow-medium hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                Compare Prices
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mb-6">
                    <p className="text-md text-gray-500 mb-4">Popular searches:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {exampleProducts.map((product, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setSearchQuery(product);
                                    navigate(`/search?q=${encodeURIComponent(product)}`);
                                }}
                                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer border border-gray-200 hover:border-brand transition-all shadow-soft hover:shadow-medium flex items-center gap-1"
                            >
                                <Search className="w-3 h-3" />
                                {product}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-6 bg-white/60 rounded-3xl backdrop-blur-sm shadow-medium">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Why Choose JustSearch for Smart Shopping?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Discover powerful features designed to help you save money and shop smarter. Compare prices, find nearby stores, and make informed decisions with our comprehensive platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-pink-50 flex flex-col items-center justify-center cursor-pointer p-6 rounded-xl shadow-medium hover:shadow-strong transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-brand to-blue-600 text-white rounded-full flex items-center justify-center mb-4 shadow-medium">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-center leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
                    How JustSearch Works - Simple 3-Step Process
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-medium">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Search Product</h3>
                        <p className="text-gray-600">Enter any product name and we'll search across local stores and delivery platforms instantly.</p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-nearby text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-medium">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Compare & Choose</h3>
                        <p className="text-gray-600">View price comparisons, store locations, and savings calculations to make the best choice.</p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-savings text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-medium">
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Save Money</h3>
                        <p className="text-gray-600">Buy from the cheapest option - whether it's pickup, delivery, or pay-at-store.</p>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-16 text-center">
                <div className="bg-gradient-to-r from-blue-300 to-blue-600 text-white p-12 rounded-3xl shadow-strong">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Start Saving Money Today!
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of smart shoppers who save money on daily essentials with JustSearch. Compare prices and shop smarter.
                    </p>
                    <button
                        onClick={() => document.querySelector('input')?.focus()}
                        className="bg-white text-brand px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-medium transform hover:-translate-y-1 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                        <Search className="w-5 h-5" />
                        Search Your First Product
                    </button>
                </div>
            </section>
        </main>
    );
};

export default Home;