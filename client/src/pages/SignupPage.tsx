import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthForm from '../features/authentication/components/AuthForm';
import { useAuth } from '../features/authentication';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [values, setValues] = useState({
    name: '',
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
      await signup(values);
      navigate('/plans');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to create your account right now.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="stack">
      <AuthForm
        title="Create your account"
        subtitle="User signup is self-service. Admin creation stays in the dashboard flow."
        fields={[
          { name: 'name', label: 'Full name', placeholder: 'Alex Johnson' },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'alex@example.com' },
          { name: 'password', label: 'Password', type: 'password', placeholder: 'Choose a strong password' }
        ]}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Account"
        error={error}
        isLoading={isLoading}
      />
      <p className="helper-text">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
