import { useEffect, useMemo, useState } from 'react';

import Button from '../components/Button';
import CardPanel from '../components/CardPanel';
import InputField from '../components/InputField';
import StatusBadge from '../components/StatusBadge';
import { AdminSummaryCard, adminApi } from '../features/admin';
import { plansApi } from '../features/plans';
import { profileApi } from '../features/user-profile';
import { formatCurrency } from '../utils/formatters';

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [editingPlanId, setEditingPlanId] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [statsResponse, plansResponse, usersResponse] = await Promise.all([
        adminApi.getDashboardStats(),
        plansApi.getPlans(),
        profileApi.getUsers()
      ]);

      setStats(statsResponse.data);
      setPlans(plansResponse.data || []);
      setUsers(usersResponse.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load the admin dashboard.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

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

  const startEditingPlan = (plan) => {
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

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Monitor top-line activity and manage the subscription catalog from one place.</p>
        </div>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {infoMessage ? <div className="alert alert--info">{infoMessage}</div> : null}

      {isLoading ? (
        <CardPanel title="Loading dashboard" subtitle="Fetching stats, plans, and users from the backend." />
      ) : (
        <>
          <div className="grid grid--three">
            {statCards.map((item) => (
              <AdminSummaryCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
            ))}
          </div>

          <div className="grid grid--two">
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
                <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <input type="checkbox" name="isActive" checked={planForm.isActive} onChange={handlePlanFormChange} />
                  <span className="field__label">Plan is active</span>
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Button disabled={isSubmitting} type="submit">{editingPlanId ? 'Update Plan' : 'Create Plan'}</Button>
                  {editingPlanId ? (
                    <Button type="button" variant="ghost" onClick={resetPlanForm}>Clear Edit</Button>
                  ) : null}
                </div>
              </form>
            </CardPanel>

            <CardPanel title="Registered Users" subtitle="Admin-only view powered by the users module.">
              <div className="stack">
                {users.map((user) => (
                  <div className="list-row" key={user.id}>
                    <div>
                      <strong>{user.name}</strong>
                      <p className="helper-text">{user.email}</p>
                    </div>
                    <StatusBadge value={user.role} />
                  </div>
                ))}
              </div>
            </CardPanel>
          </div>

          <CardPanel title="Plan Catalog" subtitle="Review, edit, or delete plans already available to authenticated users.">
            <div className="stack">
              {plans.map((plan) => (
                <div className="list-row" key={plan.id}>
                  <div>
                    <strong>{plan.name}</strong>
                    <p className="helper-text">{formatCurrency(plan.price)} / {plan.billingCycle.toLowerCase()}</p>
                    <p className="meta-text">{(plan.features || []).join(' • ')}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <StatusBadge value={plan.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    <Button variant="ghost" onClick={() => startEditingPlan(plan)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDeletePlan(plan.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardPanel>
        </>
      )}
    </div>
  );
}
