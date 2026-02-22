import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnimatedPage from '../AnimatedPage';

const AuthLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary-600/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-primary-600/[0.03] rounded-full blur-3xl" />
      </div>
      <div className="relative z-10">
        <AnimatedPage key={location.pathname}>
          <Outlet />
        </AnimatedPage>
      </div>
    </div>
  );
};

export default AuthLayout;
