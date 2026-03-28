import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthForm from '../features/authentication/components/AuthForm';
import { useAuth } from '../features/authentication';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(values);
      navigate('/plans');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to log in with those credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="stack">
      <AuthForm
        title="Log in"
        subtitle="Continue into your subscription workspace."
        fields={[
          { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
          { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' }
        ]}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Log In"
        error={error}
        isLoading={isLoading}
      />
      <p className="helper-text">
        New here? <Link to="/signup">Create your account</Link>
      </p>
    </div>
  );
}
