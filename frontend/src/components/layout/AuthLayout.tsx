import React from 'react';
import { Outlet } from 'react-router-dom';
import BubblesBackground from '../BubblesBackground';

const AuthLayout: React.FC = () => {
  return (
    <>
      <BubblesBackground />
      <Outlet />
    </>
  );
};

export default AuthLayout;
