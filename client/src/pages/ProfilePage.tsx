import { useEffect, useState } from 'react';

import Button from '../components/Button';
import CardPanel from '../components/CardPanel';
import InputField from '../components/InputField';
import { useAuth } from '../features/authentication';
import { ProfileSummaryCard, profileApi } from '../features/user-profile';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function ProfilePage() {
  const { refreshSession } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await profileApi.getProfile();
      const nextProfile = response.data;
      setProfile(nextProfile);
      setFormValues({
        name: nextProfile?.name || '',
        email: nextProfile?.email || '',
        password: ''
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load your profile.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      const payload = {
        name: formValues.name,
        email: formValues.email,
        ...(formValues.password ? { password: formValues.password } : {})
      };

      const response = await profileApi.updateProfile(payload);
      setProfile(response.data);
      setFormValues((current) => ({ ...current, password: '' }));
      setInfoMessage('Profile updated successfully.');
      await refreshSession();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to update your profile.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Review your account information and keep your login details current.</p>
        </div>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {infoMessage ? <div className="alert alert--info">{infoMessage}</div> : null}

      <div className="grid grid--two">
        <ProfileSummaryCard profile={profile} />

        <CardPanel title="Update Profile" subtitle="Name and email changes are reflected in future authenticated requests.">
          {isLoading ? (
            <div className="helper-text">Loading profile details...</div>
          ) : (
            <form className="form-grid" onSubmit={handleSubmit}>
              <InputField label="Name" name="name" value={formValues.name} onChange={handleChange} />
              <InputField label="Email" name="email" type="email" value={formValues.email} onChange={handleChange} />
              <InputField
                label="New Password"
                name="password"
                type="password"
                placeholder="Leave blank to keep your current password"
                value={formValues.password}
                onChange={handleChange}
              />
              <Button disabled={isSubmitting} type="submit">Save Changes</Button>
            </form>
          )}
        </CardPanel>
      </div>
    </div>
  );
}
