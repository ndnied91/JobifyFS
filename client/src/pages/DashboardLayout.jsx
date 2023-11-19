import { Outlet, redirect, useLoaderData, useNavigate } from 'react-router-dom';
import customFetch from '../utils/customFetch';
import { Navbar, BigSidebar, SmallSidebar } from '../components';
import Wrapper from '../assets/wrappers/Dashboard';
import { useState, createContext, useContext } from 'react';

import { checkDefaultTheme } from '../App';

export const loader = async () => {
  try {
    const { data } = await customFetch.get('/users/current-user');

    return data;
  } catch (error) {
    return redirect('/');
  }
};

const DashboardContext = createContext();
const DashboardLayout = () => {
  const { user } = useLoaderData();
  const navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(checkDefaultTheme());

  const toggleDarkTheme = () => {
    const newDarkTheme = !isDarkTheme;
    setIsDarkTheme(newDarkTheme);
    document.body.classList.toggle('dark-theme', newDarkTheme);
    localStorage.setItem('darkTheme', newDarkTheme);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const logoutUser = async () => {
    console.log('user is logging out...');
    await customFetch.post('/auth/logout');
    navigate('/');
  };

  // const logoutUser = async () => {
  //   navigate('/');
  //   await customFetch.get('/auth/logout');
  //   toast.success('Logging out...');
  // };

  return (
    <DashboardContext.Provider //ensure we have context for each of these components
      value={{
        user,
        showSidebar,
        isDarkTheme,
        toggleDarkTheme,
        toggleSidebar,
        logoutUser,
      }}
    >
      <Wrapper>
        <main className="dashboard">
          <SmallSidebar />
          <BigSidebar />
          <div>
            <Navbar />
            <div className="dashboard-page">
              <Outlet context={{ user }} /> {/* 123 */}
            </div>
          </div>
        </main>
      </Wrapper>
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => useContext(DashboardContext); //custom hook

export default DashboardLayout;
