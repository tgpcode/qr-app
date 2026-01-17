import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner = () => {
     return (
          <div className="fixed inset-0 flex items-center justify-center bg-white/95 z-50">
               <div className="flex flex-col items-center gap-4 scale-150">
                    <Spin size="large" />
                    <span className="text-sm font-medium text-slate-500 mt-2 font-sans">Đang tải chốt đơn...</span>
               </div>
          </div>
     );
};

export default LoadingSpinner;
