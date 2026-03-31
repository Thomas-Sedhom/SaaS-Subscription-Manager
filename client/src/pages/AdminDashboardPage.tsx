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
  description: '',
  price: '',
  billingCycle: 'MONTHLY',
  features: [''],
  isActive: true
};

const emptyAdminForm = {
  name: '',
  email: '',
  password: ''
};

const sections = [
  {
    id: 'statistics',
    label: 'Statistics',
    caption: 'Platform overview'
  },
  {
    id: 'users',
    label: 'Users',
    caption: 'Accounts and history'
  },
  {
    id: 'new-plan',
    label: 'New Plan',
    caption: 'Catalog creation'
  },
  {
    id: 'manage-plans',
    label: 'Manage Plans',
    caption: 'Catalog operations'
  },
  {
    id: 'new-admin',
    label: 'New Admin',
    caption: 'Team access'
  }
] as const;

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
      { label: 'Users', value: stats.totalUsers, detail: 'Registered accounts across the platform' },
      { label: 'Plans', value: stats.totalPlans, detail: 'Published and archived subscription plans' },
      { label: 'Subscriptions', value: stats.totalSubscriptions, detail: 'Current and historical subscription records' },
      { label: 'Payments', value: stats.totalPayments, detail: 'Mock billing events processed so far' }
    ];
  }, [stats]);

  const activePlansCount = useMemo(
    () => plans.filter((plan) => plan.isActive).length,
    [plans]
  );

  const handlePlanFormChange = (event) => {
    const { name, type, value, checked } = event.target;
    setPlanForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureChange = (index, value) => {
    setPlanForm((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) => (
        featureIndex === index ? value : feature
      ))
    }));
  };

  const handleAddFeature = () => {
    setPlanForm((current) => ({
      ...current,
      features: [...current.features, '']
    }));
  };

  const handleRemoveFeature = (index) => {
    setPlanForm((current) => {
      if (current.features.length === 1) {
        return {
          ...current,
          features: ['']
        };
      }

      return {
        ...current,
        features: current.features.filter((_, featureIndex) => featureIndex !== index)
      };
    });
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
      description: planForm.description.trim(),
      price: Number(planForm.price),
      billingCycle: planForm.billingCycle,
      features: planForm.features.map((item) => item.trim()).filter(Boolean),
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
    setActiveSection('new-plan');
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      price: String(plan.price),
      billingCycle: plan.billingCycle,
      features: plan.features?.length ? [...plan.features] : [''],
      isActive: Boolean(plan.isActive)
    });
  };

  const resetPlanForm = () => {
    setEditingPlanId('');
    setPlanForm(emptyPlanForm);
  };

  const handleDeactivatePlan = async (planId) => {
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      await plansApi.deletePlan(planId);
      setInfoMessage('Plan deactivated successfully.');
      if (editingPlanId === planId) {
        resetPlanForm();
      }
      await loadDashboard();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to deactivate that plan.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatisticsSection = () => (
    <div className="stack">
      <div className="admin-section-heading">
        <div>
          <span className="eyebrow">Operational Snapshot</span>
          <h2>Statistics</h2>
          <p>Track the full platform footprint across customers, plans, subscriptions, and mock payments.</p>
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
      <div className="admin-section-heading">
        <div>
          <span className="eyebrow">Account Review</span>
          <h2>Users</h2>
          <p>Inspect the account roster and open a complete profile with subscription history.</p>
        </div>
      </div>
      <div className="grid grid--two admin-dashboard__content-grid">
        <CardPanel title="Directory" subtitle={`${users.length} user accounts currently available to review.`}>
          <div className="stack">
            {users.map((user) => (
              <button
                key={user.id}
                className={`admin-user-row ${selectedUserId === user.id ? 'admin-user-row--active' : ''}`.trim()}
                onClick={() => void loadUserDetail(user.id)}
                type="button"
              >
                <div className="admin-user-row__identity">
                  <div className="admin-user-row__avatar">{user.name.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <strong>{user.name}</strong>
                    <p className="helper-text">{user.email}</p>
                  </div>
                </div>
                <StatusBadge value={user.role} />
              </button>
            ))}
          </div>
        </CardPanel>

        <CardPanel title="User Details" subtitle="Profile details and subscription footprint for the selected account.">
          {isUserDetailLoading ? (
            <div className="helper-text">Loading selected user...</div>
          ) : !selectedUser ? (
            <div className="helper-text">Choose a user from the list to see their details.</div>
          ) : (
            <div className="stack">
              <div className="admin-profile-card">
                <div className="admin-profile-card__header">
                  <div>
                    <h3>{selectedUser.name}</h3>
                    <p>{selectedUser.email}</p>
                  </div>
                  <StatusBadge value={selectedUser.role} />
                </div>
                <div className="admin-profile-grid">
                  <div className="admin-profile-stat">
                    <span>Joined</span>
                    <strong>{formatDate(selectedUser.createdAt)}</strong>
                  </div>
                  <div className="admin-profile-stat">
                    <span>Subscriptions</span>
                    <strong>{selectedUser.subscriptions?.length || 0}</strong>
                  </div>
                </div>
              </div>
              <div className="stack">
                <h3 className="admin-subsection-title">Subscriptions</h3>
                {selectedUser.subscriptions?.length ? (
                  selectedUser.subscriptions.map((subscription) => (
                    <article key={subscription.id} className="admin-subscription-card">
                      <div className="admin-subscription-card__header">
                        <div>
                          <strong>{subscription.plan?.name || 'Plan removed'}</strong>
                          <p className="helper-text">
                            {subscription.plan
                              ? `${formatCurrency(subscription.plan.price)} / ${subscription.plan.billingCycle.toLowerCase()}`
                              : 'Unavailable plan'}
                          </p>
                        </div>
                        <StatusBadge value={subscription.status} />
                      </div>
                      <div className="admin-profile-grid admin-profile-grid--compact">
                        <div className="admin-profile-stat">
                          <span>Started</span>
                          <strong>{formatDate(subscription.startDate)}</strong>
                        </div>
                        <div className="admin-profile-stat">
                          <span>Period End</span>
                          <strong>{formatDate(subscription.currentPeriodEnd)}</strong>
                        </div>
                      </div>
                    </article>
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

  const renderNewPlanSection = () => (
    <div className="stack">
      <div className="admin-section-heading">
        <div>
          <span className="eyebrow">Catalog Creation</span>
          <h2>{editingPlanId ? 'Edit Plan' : 'New Plan'}</h2>
          <p>Define pricing, billing cycle, availability, description, and the public feature list for a subscription plan.</p>
        </div>
      </div>
      <CardPanel
        title={editingPlanId ? 'Edit Plan' : 'Create Plan'}
        subtitle="Control pricing, billing cycle, activation state, description, and the visible feature list."
      >
        <form className="form-grid" onSubmit={handlePlanSubmit}>
          <InputField label="Plan name" name="name" value={planForm.name} onChange={handlePlanFormChange} />
          <label className="field">
            <span className="field__label">Description</span>
            <textarea
              className="field__input"
              rows={3}
              name="description"
              placeholder="Summarize what this plan is best for."
              value={planForm.description}
              onChange={handlePlanFormChange}
            />
          </label>
          <InputField label="Price" name="price" type="number" min="0" step="0.01" value={planForm.price} onChange={handlePlanFormChange} />
          <label className="field">
            <span className="field__label">Billing cycle</span>
            <select className="field__input" name="billingCycle" value={planForm.billingCycle} onChange={handlePlanFormChange}>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </label>
          <div className="field admin-feature-field">
            <div className="admin-feature-field__header">
              <span className="field__label">Features</span>
              <Button type="button" variant="ghost" onClick={handleAddFeature}>+ Add Feature</Button>
            </div>
            <div className="admin-feature-list">
              {planForm.features.map((feature, index) => (
                <div className="admin-feature-row" key={`feature-${index}`}>
                  <input
                    className="field__input admin-feature-row__input"
                    type="text"
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(event) => handleFeatureChange(index, event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
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
    </div>
  );

  const renderManagePlansSection = () => (
    <div className="stack">
      <div className="admin-section-heading">
        <div>
          <span className="eyebrow">Catalog Operations</span>
          <h2>Manage Plans</h2>
          <p>Review the full plan catalog, open an existing plan for editing, and deactivate published plans when needed.</p>
        </div>
      </div>
      <CardPanel
        className="admin-plan-catalog-panel"
        title="Plan Catalog"
        subtitle={`${activePlansCount} active plans available to customers right now.`}
      >
        <div className="stack">
          {plans.map((plan) => (
            <article className="admin-plan-catalog-card" key={plan.id}>
              <div className="admin-plan-catalog-card__header">
                <div className="admin-plan-catalog-card__identity">
                  <strong>{plan.name}</strong>
                  <p>{plan.description || 'No plan description has been added yet.'}</p>
                </div>

                <div className="admin-plan-catalog-card__header-side">
                  <StatusBadge value={plan.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  <div className="admin-plan-catalog-card__actions">
                    <Button variant="ghost" onClick={() => startEditingPlan(plan)}>Edit Plan</Button>
                    {plan.isActive ? (
                      <Button variant="danger" onClick={() => void handleDeactivatePlan(plan.id)}>Deactivate</Button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="admin-plan-catalog-card__metrics">
                <div className="admin-plan-catalog-card__metric">
                  <span>Price</span>
                  <strong>{formatCurrency(plan.price)}</strong>
                </div>
                <div className="admin-plan-catalog-card__metric">
                  <span>Billing</span>
                  <strong>{plan.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}</strong>
                </div>
                <div className="admin-plan-catalog-card__metric">
                  <span>Features</span>
                  <strong>{(plan.features || []).length}</strong>
                </div>
              </div>

              <div className="admin-plan-catalog-card__features-block">
                <div className="admin-plan-catalog-card__features-header">
                  <span>Included features</span>
                </div>
                {(plan.features || []).length ? (
                  <div className="admin-plan-catalog-card__feature-list">
                    {(plan.features || []).map((feature) => (
                      <div className="admin-plan-catalog-card__feature-item" key={`${plan.id}-${feature}`}>
                        <span className="admin-plan-catalog-card__feature-dot" aria-hidden="true" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-plan-catalog-card__empty-copy">No features listed yet.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </CardPanel>
    </div>
  );

  const renderNewAdminSection = () => (
    <div className="stack">
      <div className="admin-section-heading">
        <div>
          <span className="eyebrow">Team Access</span>
          <h2>New Admin</h2>
          <p>Create another administrator with access to metrics, users, plan management, and dashboard tools.</p>
        </div>
      </div>
      <div className="grid grid--two admin-dashboard__content-grid">
        <CardPanel title="Why add another admin?" subtitle="A second administrator helps split responsibility across support, billing, and product operations.">
          <div className="stack">
            <div className="admin-note-card">
              <strong>Shared oversight</strong>
              <p className="helper-text">Multiple admins can monitor customer subscriptions and react faster to plan or payment issues.</p>
            </div>
            <div className="admin-note-card">
              <strong>Safer operations</strong>
              <p className="helper-text">Access stays inside the dashboard flow instead of sharing one account between team members.</p>
            </div>
          </div>
        </CardPanel>
        <CardPanel title="Create Admin Account" subtitle="Only an authenticated admin can submit this form.">
          <form className="form-grid" onSubmit={handleCreateAdmin}>
            <InputField label="Name" name="name" value={adminForm.name} onChange={handleAdminFormChange} />
            <InputField label="Email" name="email" type="email" value={adminForm.email} onChange={handleAdminFormChange} />
            <InputField label="Password" name="password" type="password" value={adminForm.password} onChange={handleAdminFormChange} />
            <Button disabled={isSubmitting} type="submit">Create Admin</Button>
          </form>
        </CardPanel>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'users':
        return renderUsersSection();
      case 'new-plan':
        return renderNewPlanSection();
      case 'manage-plans':
        return renderManagePlansSection();
      case 'new-admin':
        return renderNewAdminSection();
      case 'statistics':
      default:
        return renderStatisticsSection();
    }
  };

  return (
    <div className="admin-hub stack">
      {error ? <div className="alert alert--error">{error}</div> : null}
      {infoMessage ? <div className="alert alert--info">{infoMessage}</div> : null}

      {isLoading ? (
        <CardPanel title="Loading dashboard" subtitle="Fetching stats, plans, and users from the backend." />
      ) : (
        <div className="admin-dashboard">
          <aside className="admin-dashboard__sidebar">
            <div className="admin-dashboard__sidebar-top">
              <span className="eyebrow">Workspace</span>
              <h2>Command Panel</h2>
            </div>

            <div className="stack">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`admin-dashboard__nav-button ${activeSection === section.id ? 'admin-dashboard__nav-button--active' : ''}`.trim()}
                  onClick={() => setActiveSection(section.id)}
                  type="button"
                >
                  <span className="admin-dashboard__nav-caption">{section.caption}</span>
                  <strong>{section.label}</strong>
                </button>
              ))}
            </div>

          
          </aside>

          <section className="admin-dashboard__main">
            <div className="admin-dashboard__panel">{renderActiveSection()}</div>
          </section>
        </div>
      )}
    </div>
  );
}




