import { JobsContainer, SearchContainer } from '../components';
import { Outlet, redirect, useLoaderData, useNavigate } from 'react-router-dom';
import customFetch from '../utils/customFetch';
import { toast } from 'react-toastify';
import { createContext, useContext } from 'react';

export const loader = async ({ request }) => {
  const params = Object.fromEntries([
    ...new URL(request.url).searchParams.entries(),
  ]);

  try {
    const data = await customFetch('/jobs', {
      params,
    });
    return { data, searchValues: { ...params } };
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};

const AllJobsContext = createContext();
const AllJobs = () => {
  const { data, searchValues } = useLoaderData();

  return (
    <AllJobsContext.Provider value={{ data, searchValues }}>
      <SearchContainer />
      <JobsContainer />
    </AllJobsContext.Provider>
  );
};

export const useAllJobsContext = () => useContext(AllJobsContext); //custom hook

export default AllJobs;
