import { FormRow, FormRowSelect, SubmitBtn } from '../components';
import Wrapper from '../assets/wrappers/DashboardFormPage';
import { useOutletContext } from 'react-router-dom';
import { JOB_STATUS, JOB_TYPE } from '../../../utils/constants';
import { Form, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import customFetch from '../utils/customFetch';
import { FaRedo } from 'react-icons/fa';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const response = await customFetch.post('/jobs', data);
    toast.success('Job Created!');
    return redirect('all-jobs');
  } catch (error) {
    toast.error(error?.response?.data?.msg || 'error creating a job!');
    return error;
  }
};

const AddJob = () => {
  const { user } = useOutletContext(); //coming from the outlet from DashboardLayout

  return (
    <Wrapper>
      <Form method="post" className="form">
        <h4 className="form-title">add job</h4>
        <div className="form-center">
          <FormRow type="text" name="position" defaultValue={'Tester'} />
          <FormRow type="text" name="company" defaultValue={'HBO'} />
          <FormRow
            type="text"
            labelText="job location"
            name="jobLocation"
            defaultValue={user.location}
          />

          <FormRowSelect
            labelText="job status"
            name="jobStatus"
            defaultValue={JOB_STATUS.PENDING}
            list={Object.values(JOB_STATUS)}
          />
          <FormRowSelect
            name="jobType"
            labelText="job type"
            defaultValue={JOB_TYPE.FULL_TIME}
            list={Object.values(JOB_TYPE)}
          />
          <SubmitBtn formBtn />
        </div>
      </Form>
    </Wrapper>
  );
};

export default AddJob;
