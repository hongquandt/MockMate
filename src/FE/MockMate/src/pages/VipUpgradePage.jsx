import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';

const VipUpgradePage = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const plans = [
        // ... (Plans data remains same)
        {
            id: 1,
            name: 'Gói Tuần',
            price: '50.000 VNĐ',
            duration: '7 ngày',
            features: [
                'Interview không giới hạn',
                'Phân tích CV chi tiết',
                'Gợi ý câu hỏi thông minh'
            ],
            color: 'from-blue-500 to-cyan-400'
        },
        {
            id: 2,
            name: 'Gói Tháng',
            price: '150.000 VNĐ',
            duration: '30 ngày',
            features: [
                'Tất cả quyền lợi gói tuần',
                'Lưu lịch sử phỏng vấn',
                'Hỗ trợ ưu tiên 24/7',
                'Tiết kiệm 20%'
            ],
            color: 'from-purple-500 to-pink-500',
            popular: true
        },
        {
            id: 3,
            name: 'Gói Năm',
            price: '1.200.000 VNĐ',
            duration: '365 ngày',
            features: [
                'Quyền truy cập trọn đời',
                'Các tính năng Beta sớm',
                'Huy hiệu VIP Pro',
                'Tiết kiệm 50%'
            ],
            color: 'from-amber-400 to-orange-500'
        }
    ];

    const handlePayment = async () => {
        if (!selectedPlan) return;
        
        setLoading(true);
        try {
            const data = await paymentService.createPaymentLink(selectedPlan.id);
            if (data.checkoutUrl) {
                // Redirect to PayOS
                window.location.href = data.checkoutUrl;
            }
        } catch (error) {
            console.error(error);
            alert("Có lỗi khi tạo thanh toán: " + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            
            <div className="text-center mb-12 space-y-4">
                <span className="inline-block py-1 px-3 rounded-full bg-amber-500/10 text-amber-500 text-sm font-bold uppercase tracking-wider border border-amber-500/20">
                    Nâng cấp tài khoản
                </span>
                <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-500">
                    Trở thành VIP Member
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Mở khóa toàn bộ tiềm năng của MockMate. Phỏng vấn không giới hạn, phân tích chuyên sâu và hơn thế nữa.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
                {plans.map((plan) => (
                    <div 
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`relative rounded-3xl p-8 cursor-pointer transition-all duration-300 border-2 flex flex-col ${
                            selectedPlan?.id === plan.id 
                                ? 'border-amber-500 bg-slate-800 scale-105 shadow-2xl shadow-amber-500/20' 
                                : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'
                        } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                                PHỔ BIẾN NHẤT
                            </div>
                        )}

                        <div className={`h-2 w-20 rounded-full mb-6 bg-gradient-to-r ${plan.color}`}></div>
                        
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black text-white">{plan.price}</span>
                            <span className="text-slate-500">/ {plan.duration}</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-slate-300">
                                    <span className="material-symbols-outlined text-green-400 text-xl font-bold">check</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={handlePayment}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold transition-all ${
                                selectedPlan?.id === plan.id
                                    ? `bg-gradient-to-r ${plan.color} text-white shadow-lg`
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            {loading ? 'Đang xử lý...' : (selectedPlan?.id === plan.id ? 'Thanh toán ngay' : 'Chọn gói này')}
                        </button>
                    </div>
                ))}
            </div>

            <p className="mt-12 text-slate-500 text-sm">
                Thanh toán an toàn qua VNPay / Momo / Visa. Hủy bất kỳ lúc nào.
            </p>
        </div>
    );
};

export default VipUpgradePage;
