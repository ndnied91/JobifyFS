import { Logo, FormRow, SubmitBtn } from '../components';
import Wrapper from '../assets/wrappers/RegisterAndLoginPage';
import { Form, redirect, Link, useNavigate } from 'react-router-dom';
import customFetch from '../utils/customFetch';
import { toast } from 'react-toastify';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    await customFetch.post('/auth/login', data);
    toast.success('Login successful');
    return redirect('/dashboard');
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};

const Login = () => {
  const navigate = useNavigate();

  const LoginDemoUser = async () => {
    const credentials = {
      email: 'test@test.com',
      password: 'secret123',
    };

    try {
      const response = await customFetch.post('/auth/login', credentials);
      toast.success('Feel free to browser the app');
      navigate('/dashboard');
    } catch (e) {
      toast.error(error?.response?.data?.msg);
    }
  };

  return (
    <Wrapper>
      <Form method="post" className="form">
        <Logo />
        <h4>Login</h4>
        <FormRow type="email" name="email" />
        <FormRow type="password" name="password" />

        <SubmitBtn />

        <button type="button" className="btn btn-block" onClick={LoginDemoUser}>
          explore the app
        </button>
        <p>
          Not a member yet?
          <Link to="/register" className="member-btn">
            Register
          </Link>
        </p>
      </Form>
    </Wrapper>
  );
};

export default Login;
