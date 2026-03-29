import { useEffect, useMemo, useState } from 'react';

import Button from '../components/Button';
import CardPanel from '../components/CardPanel';
import InputField from '../components/InputField';
import StatusBadge from '../components/StatusBadge';
import { AdminSummaryCard, adminApi } from '../features/admin';
import { plansApi } from '../features/plans';
import { profileApi } from '../features/user-profile';
import { formatCurrency, formatDate } from '../utils/formatters';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

const emptyPlanForm = {
  name: '',
  price: '',
  billingCycle: 'MONTHLY',
  features: '',
  isActive: true
};

const emptyAdminForm = {
  name: '',
  email: '',
  password: ''
};

const sections = [
  { id: 'statistics', label: 'Statistics' },
  { id: 'users', label: 'Users' },
  { id: 'plans', label: 'Plans' },
  { id: 'new-admin', label: 'New Admin' }
];

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState('statistics');
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [editingPlanId, setEditingPlanId] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserDetailLoading, setIsUserDetailLoading] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [statsResponse, plansResponse, usersResponse] = await Promise.all([
        adminApi.getDashboardStats(),
        plansApi.getPlans(),
        profileApi.getUsers()
      ]);

      const nextUsers = usersResponse.data || [];
      setStats(statsResponse.data);
      setPlans(plansResponse.data || []);
      setUsers(nextUsers);

      if (selectedUserId) {
        const detailedUserResponse = await profileApi.getUserById(selectedUserId);
        setSelectedUser(detailedUserResponse.data);
      } else if (nextUsers[0]?.id) {
        setSelectedUserId(nextUsers[0].id);
        const detailedUserResponse = await profileApi.getUserById(nextUsers[0].id);
        setSelectedUser(detailedUserResponse.data);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load the admin dashboard.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const loadUserDetail = async (userId) => {
    setSelectedUserId(userId);
    setIsUserDetailLoading(true);
    setError('');

    try {
      const response = await profileApi.getUserById(userId);
      setSelectedUser(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load that user.'));
    } finally {
      setIsUserDetailLoading(false);
    }
  };

  const statCards = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      { label: 'Users', value: stats.totalUsers, detail: 'Total registered accounts' },
      { label: 'Plans', value: stats.totalPlans, detail: 'Catalog entries available to users' },
      { label: 'Subscriptions', value: stats.totalSubscriptions, detail: 'Current and historical subscription records' },
      { label: 'Payments', value: stats.totalPayments, detail: 'Mock payment records processed so far' }
    ];
  }, [stats]);

  const handlePlanFormChange = (event) => {
    const { name, type, value, checked } = event.target;
    setPlanForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdminFormChange = (event) => {
    const { name, value } = event.target;
    setAdminForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handlePlanSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    const payload = {
      name: planForm.name,
      price: Number(planForm.price),
      billingCycle: planForm.billingCycle,
      features: planForm.features.split(',').map((item) => item.trim()).filter(Boolean),
      isActive: planForm.isActive
    };

    try {
      if (editingPlanId) {
        await plansApi.updatePlan(editingPlanId, payload);
        setInfoMessage('Plan updated successfully.');
      } else {
        await plansApi.createPlan(payload);
        setInfoMessage('Plan created successfully.');
      }

      setPlanForm(emptyPlanForm);
      setEditingPlanId('');
      await loadDashboard();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to save that plan.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      await adminApi.createAdmin(adminForm);
      setAdminForm(emptyAdminForm);
      setInfoMessage('New admin account created successfully.');
      await loadDashboard();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to create that admin account.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingPlan = (plan) => {
    setActiveSection('plans');
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      price: String(plan.price),
      billingCycle: plan.billingCycle,
      features: (plan.features || []).join(', '),
      isActive: Boolean(plan.isActive)
    });
  };

  const resetPlanForm = () => {
    setEditingPlanId('');
    setPlanForm(emptyPlanForm);
  };

  const handleDeletePlan = async (planId) => {
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      await plansApi.deletePlan(planId);
      setInfoMessage('Plan deleted successfully.');
      if (editingPlanId === planId) {
        resetPlanForm();
      }
      await loadDashboard();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to delete that plan.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatisticsSection = () => (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2>Statistics</h2>
          <p>Track core platform activity across accounts, plans, subscriptions, and payments.</p>
        </div>
      </div>
      <div className="grid grid--three">
        {statCards.map((item) => (
          <AdminSummaryCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
        ))}
      </div>
    </div>
  );

  const renderUsersSection = () => (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2>Users</h2>
          <p>Browse all accounts and open a full user record with subscription history.</p>
        </div>
      </div>
      <div className="grid grid--two admin-dashboard__content-grid">
        <CardPanel title="All Users" subtitle="Select a user to inspect their account information and subscriptions.">
          <div className="stack">
            {users.map((user) => (
              <button
                key={user.id}
                className={`admin-user-row ${selectedUserId === user.id ? 'admin-user-row--active' : ''}`.trim()}
                onClick={() => void loadUserDetail(user.id)}
                type="button"
              >
                <div>
                  <strong>{user.name}</strong>
                  <p className="helper-text">{user.email}</p>
                </div>
                <StatusBadge value={user.role} />
              </button>
            ))}
          </div>
        </CardPanel>

        <CardPanel title="User Details" subtitle="Account profile and related subscriptions for the selected user.">
          {isUserDetailLoading ? (
            <div className="helper-text">Loading selected user...</div>
          ) : !selectedUser ? (
            <div className="helper-text">Choose a user from the list to see their details.</div>
          ) : (
            <div className="stack">
              <div className="summary-block">
                <h3>{selectedUser.name}</h3>
                <p>{selectedUser.email}</p>
                <div className="stack" style={{ marginTop: '1rem' }}>
                  <div className="list-row"><span>Role</span><strong>{selectedUser.role}</strong></div>
                  <div className="list-row"><span>User ID</span><strong>{selectedUser.id}</strong></div>
                  <div className="list-row"><span>Joined</span><strong>{formatDate(selectedUser.createdAt)}</strong></div>
                </div>
              </div>
              <div className="stack">
                <h3 style={{ margin: 0 }}>Subscriptions</h3>
                {selectedUser.subscriptions?.length ? (
                  selectedUser.subscriptions.map((subscription) => (
                    <div key={subscription.id} className="summary-block">
                      <div className="list-row" style={{ paddingTop: 0 }}>
                        <div>
                          <strong>{subscription.plan?.name || 'Plan removed'}</strong>
                          <p className="helper-text">
                            {subscription.plan ? `${formatCurrency(subscription.plan.price)} / ${subscription.plan.billingCycle.toLowerCase()}` : 'Unavailable plan'}
                          </p>
                        </div>
                        <StatusBadge value={subscription.status} />
                      </div>
                      <p className="meta-text">Started: {formatDate(subscription.startDate)}</p>
                      <p className="meta-text">Current Period End: {formatDate(subscription.currentPeriodEnd)}</p>
                    </div>
                  ))
                ) : (
                  <div className="helper-text">This user does not have any subscriptions yet.</div>
                )}
              </div>
            </div>
          )}
        </CardPanel>
      </div>
    </div>
  );

  const renderPlansSection = () => (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2>Plans</h2>
          <p>Create, update, activate, or remove pricing plans from the shared catalog.</p>
        </div>
      </div>
      <div className="grid grid--two admin-dashboard__content-grid">
        <CardPanel title={editingPlanId ? 'Edit Plan' : 'Create Plan'} subtitle="Manage pricing, billing cycle, activation, and the plan feature list.">
          <form className="form-grid" onSubmit={handlePlanSubmit}>
            <InputField label="Plan name" name="name" value={planForm.name} onChange={handlePlanFormChange} />
            <InputField label="Price" name="price" type="number" min="0" step="0.01" value={planForm.price} onChange={handlePlanFormChange} />
            <label className="field">
              <span className="field__label">Billing cycle</span>
              <select className="field__input" name="billingCycle" value={planForm.billingCycle} onChange={handlePlanFormChange}>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>
            <label className="field">
              <span className="field__label">Features</span>
              <textarea
                className="field__input"
                rows={4}
                name="features"
                placeholder="Priority support, Team analytics, Unlimited exports"
                value={planForm.features}
                onChange={handlePlanFormChange}
              />
            </label>
            <label className="field admin-inline-field">
              <input type="checkbox" name="isActive" checked={planForm.isActive} onChange={handlePlanFormChange} />
              <span className="field__label">Plan is active</span>
            </label>
            <div className="admin-action-row">
              <Button disabled={isSubmitting} type="submit">{editingPlanId ? 'Update Plan' : 'Create Plan'}</Button>
              {editingPlanId ? (
                <Button type="button" variant="ghost" onClick={resetPlanForm}>Clear Edit</Button>
              ) : null}
            </div>
          </form>
        </CardPanel>

        <CardPanel title="Existing Plans" subtitle="Review the current catalog and choose a plan to edit or remove.">
          <div className="stack">
            {plans.map((plan) => (
              <div className="list-row" key={plan.id}>
                <div>
                  <strong>{plan.name}</strong>
                  <p className="helper-text">{formatCurrency(plan.price)} / {plan.billingCycle.toLowerCase()}</p>
                  <p className="meta-text">{(plan.features || []).join(' • ')}</p>
                </div>
                <div className="admin-action-row">
                  <StatusBadge value={plan.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  <Button variant="ghost" onClick={() => startEditingPlan(plan)}>Edit</Button>
                  <Button variant="danger" onClick={() => void handleDeletePlan(plan.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardPanel>
      </div>
    </div>
  );

  const renderNewAdminSection = () => (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2>New Admin</h2>
          <p>Allow an existing admin to register another admin account for the dashboard.</p>
        </div>
      </div>
      <CardPanel title="Create Admin Account" subtitle="Only an authenticated admin can submit this form.">
        <form className="form-grid" onSubmit={handleCreateAdmin}>
          <InputField label="Name" name="name" value={adminForm.name} onChange={handleAdminFormChange} />
          <InputField label="Email" name="email" type="email" value={adminForm.email} onChange={handleAdminFormChange} />
          <InputField label="Password" name="password" type="password" value={adminForm.password} onChange={handleAdminFormChange} />
          <Button disabled={isSubmitting} type="submit">Create Admin</Button>
        </form>
      </CardPanel>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'users':
        return renderUsersSection();
      case 'plans':
        return renderPlansSection();
      case 'new-admin':
        return renderNewAdminSection();
      case 'statistics':
      default:
        return renderStatisticsSection();
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Navigate between statistics, users, plans, and admin management from one control center.</p>
        </div>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {infoMessage ? <div className="alert alert--info">{infoMessage}</div> : null}

      {isLoading ? (
        <CardPanel title="Loading dashboard" subtitle="Fetching stats, plans, and users from the backend." />
      ) : (
        <div className="admin-dashboard">
          <aside className="admin-dashboard__sidebar">
            <span className="eyebrow">Admin Control</span>
            <div className="stack">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`admin-dashboard__nav-button ${activeSection === section.id ? 'admin-dashboard__nav-button--active' : ''}`.trim()}
                  onClick={() => setActiveSection(section.id)}
                  type="button"
                >
                  {section.label}
                </button>
              ))}
            </div>
          </aside>

          <section className="admin-dashboard__main">{renderActiveSection()}</section>
        </div>
      )}
    </div>
  );
}
