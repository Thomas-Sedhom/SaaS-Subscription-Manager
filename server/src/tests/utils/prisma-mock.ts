import type { PrismaClient } from '@prisma/client';

export type TestUserRole = 'USER' | 'ADMIN';
export type TestBillingCycle = 'MONTHLY' | 'YEARLY';
export type TestSubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';
export type TestPaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type TestPaymentType = 'SUBSCRIPTION_CREATE' | 'PLAN_CHANGE';

export interface TestUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: TestUserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestPlanRecord {
  id: string;
  name: string;
  price: number;
  billingCycle: TestBillingCycle;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestSubscriptionRecord {
  id: string;
  userId: string;
  planId: string;
  status: TestSubscriptionStatus;
  startDate: Date | null;
  endDate: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestPaymentMethodRecord {
  id: string;
  userId: string;
  methodType: string;
  methodDetails: string;
  isDefault: boolean;
  last4: string | null;
  brand: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestPaymentRecord {
  id: string;
  subscriptionId: string;
  paymentMethodId: string | null;
  amount: number;
  currency: string;
  status: TestPaymentStatus;
  provider: string;
  failureReason: string | null;
  type: TestPaymentType;
  targetPlanId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TestState {
  users: TestUserRecord[];
  plans: TestPlanRecord[];
  subscriptions: TestSubscriptionRecord[];
  paymentMethods: TestPaymentMethodRecord[];
  payments: TestPaymentRecord[];
}

const state: TestState = {
  users: [],
  plans: [],
  subscriptions: [],
  paymentMethods: [],
  payments: []
};

const createId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const includePlanFeatures = (plan: TestPlanRecord) => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,
  billingCycle: plan.billingCycle,
  isActive: plan.isActive,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
  planFeatures: plan.features.map((content, index) => ({
    id: `${plan.id}_feature_${index}`,
    planId: plan.id,
    featureId: `${plan.id}_feature_ref_${index}`,
    feature: {
      id: `${plan.id}_feature_ref_${index}`,
      content,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    }
  }))
});

const includeSubscriptionRelations = (subscription: TestSubscriptionRecord) => ({
  ...subscription,
  user: state.users.find((user) => user.id === subscription.userId) ?? null,
  plan: (() => {
    const plan = state.plans.find((entry) => entry.id === subscription.planId);
    return plan ? includePlanFeatures(plan) : null;
  })(),
  payments: state.payments.filter((payment) => payment.subscriptionId === subscription.id)
});

const includePaymentRelations = (payment: TestPaymentRecord) => ({
  ...payment,
  paymentMethod: state.paymentMethods.find((method) => method.id === payment.paymentMethodId) ?? null,
  subscription: (() => {
    const subscription = state.subscriptions.find((entry) => entry.id === payment.subscriptionId);
    return subscription ? includeSubscriptionRelations(subscription) : null;
  })()
});

export const resetPrismaMock = () => {
  state.users.length = 0;
  state.plans.length = 0;
  state.subscriptions.length = 0;
  state.paymentMethods.length = 0;
  state.payments.length = 0;
};

export const prismaMockState = state;

export const seedUsers = (...users: TestUserRecord[]) => {
  state.users.push(...users);
};

export const seedPlans = (...plans: TestPlanRecord[]) => {
  state.plans.push(...plans);
};

export const seedSubscriptions = (...subscriptions: TestSubscriptionRecord[]) => {
  state.subscriptions.push(...subscriptions);
};

export const seedPaymentMethods = (...paymentMethods: TestPaymentMethodRecord[]) => {
  state.paymentMethods.push(...paymentMethods);
};

export const seedPayments = (...payments: TestPaymentRecord[]) => {
  state.payments.push(...payments);
};

const prismaClientMock: any = {
  $connect: async () => undefined,
  $disconnect: async () => undefined,
  $transaction: async <T>(callback: (tx: any) => Promise<T>) => callback(prismaClientMock),
  user: {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id) return state.users.find((user) => user.id === where.id) ?? null;
      if (where.email) return state.users.find((user) => user.email === where.email) ?? null;
      return null;
    },
    findMany: async () => [...state.users].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    create: async ({ data }: { data: { name: string; email: string; passwordHash: string; role: TestUserRole } }) => {
      const now = new Date();
      const user: TestUserRecord = {
        id: createId('user'),
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        createdAt: now,
        updatedAt: now
      };
      state.users.push(user);
      return user;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Pick<TestUserRecord, 'name' | 'email' | 'passwordHash'>> }) => {
      const user = state.users.find((entry) => entry.id === where.id);
      if (!user) throw new Error('User not found');
      Object.assign(user, data, { updatedAt: new Date() });
      return user;
    },
    count: async () => state.users.length
  },
  plan: {
    findMany: async () => [...state.plans].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(includePlanFeatures),
    findUnique: async ({ where }: { where: { id?: string; name?: string } }) => {
      const plan = where.id
        ? state.plans.find((entry) => entry.id === where.id)
        : state.plans.find((entry) => entry.name === where.name);
      return plan ? includePlanFeatures(plan) : null;
    },
    create: async ({ data }: { data: { name: string; price: number; billingCycle: TestBillingCycle; isActive: boolean; planFeatures?: { create: Array<{ feature: { connectOrCreate: { where: { content: string } } } }> } } }) => {
      const now = new Date();
      const plan: TestPlanRecord = {
        id: createId('plan'),
        name: data.name,
        price: Number(data.price),
        billingCycle: data.billingCycle,
        isActive: data.isActive,
        features: data.planFeatures?.create.map((item) => item.feature.connectOrCreate.where.content) ?? [],
        createdAt: now,
        updatedAt: now
      };
      state.plans.push(plan);
      return includePlanFeatures(plan);
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<{ name: string; price: number; billingCycle: TestBillingCycle; isActive: boolean; planFeatures: { create: Array<{ feature: { connectOrCreate: { where: { content: string } } } }> } }> }) => {
      const plan = state.plans.find((entry) => entry.id === where.id);
      if (!plan) throw new Error('Plan not found');
      if (data.name !== undefined) plan.name = data.name;
      if (data.price !== undefined) plan.price = Number(data.price);
      if (data.billingCycle !== undefined) plan.billingCycle = data.billingCycle;
      if (data.isActive !== undefined) plan.isActive = data.isActive;
      if (data.planFeatures?.create) {
        plan.features = data.planFeatures.create.map((item) => item.feature.connectOrCreate.where.content);
      }
      plan.updatedAt = new Date();
      return includePlanFeatures(plan);
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const index = state.plans.findIndex((entry) => entry.id === where.id);
      if (index === -1) throw new Error('Plan not found');
      const [deletedPlan] = state.plans.splice(index, 1);
      return includePlanFeatures(deletedPlan);
    },
    count: async () => state.plans.length
  },
  planFeature: {
    deleteMany: async ({ where }: { where: { planId: string } }) => {
      const plan = state.plans.find((entry) => entry.id === where.planId);
      if (plan) {
        plan.features = [];
        plan.updatedAt = new Date();
      }
      return { count: plan ? 1 : 0 };
    }
  },
  subscription: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const subscription = state.subscriptions.find((entry) => entry.id === where.id);
      return subscription ? includeSubscriptionRelations(subscription) : null;
    },
    findMany: async ({ where }: { where?: { userId?: string } } = {}) => {
      const subscriptions = where?.userId
        ? state.subscriptions.filter((entry) => entry.userId === where.userId)
        : state.subscriptions;
      return [...subscriptions]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(includeSubscriptionRelations);
    },
    findFirst: async ({ where }: { where: { userId: string; status: { in: TestSubscriptionStatus[] } } }) => {
      const subscription = [...state.subscriptions]
        .filter((entry) => entry.userId === where.userId && where.status.in.includes(entry.status))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      return subscription ? includeSubscriptionRelations(subscription) : null;
    },
    create: async ({ data }: { data: { userId: string; planId: string; status: TestSubscriptionStatus } }) => {
      const now = new Date();
      const subscription: TestSubscriptionRecord = {
        id: createId('subscription'),
        userId: data.userId,
        planId: data.planId,
        status: data.status,
        startDate: null,
        endDate: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now
      };
      state.subscriptions.push(subscription);
      return subscription;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Omit<TestSubscriptionRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> }) => {
      const subscription = state.subscriptions.find((entry) => entry.id === where.id);
      if (!subscription) throw new Error('Subscription not found');
      Object.assign(subscription, data, { updatedAt: new Date() });
      return subscription;
    },
    count: async ({ where }: { where?: { planId?: string; status?: { in: TestSubscriptionStatus[] } } } = {}) => {
      return state.subscriptions.filter((entry) => {
        if (where?.planId && entry.planId !== where.planId) return false;
        if (where?.status?.in && !where.status.in.includes(entry.status)) return false;
        return true;
      }).length;
    }
  },
  paymentMethod: {
    findMany: async ({ where }: { where?: { userId?: string } } = {}) => {
      const paymentMethods = where?.userId
        ? state.paymentMethods.filter((entry) => entry.userId === where.userId)
        : state.paymentMethods;
      return [...paymentMethods].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    findUnique: async ({ where }: { where: { id: string } }) => state.paymentMethods.find((entry) => entry.id === where.id) ?? null,
    findFirst: async ({ where }: { where: { userId: string; isDefault: boolean; isActive: boolean } }) =>
      state.paymentMethods.find(
        (entry) =>
          entry.userId === where.userId &&
          entry.isDefault === where.isDefault &&
          entry.isActive === where.isActive
      ) ?? null,
    create: async ({ data }: { data: Omit<TestPaymentMethodRecord, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const now = new Date();
      const paymentMethod: TestPaymentMethodRecord = {
        id: createId('payment_method'),
        ...data,
        createdAt: now,
        updatedAt: now
      };
      state.paymentMethods.push(paymentMethod);
      return paymentMethod;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Pick<TestPaymentMethodRecord, 'isDefault' | 'isActive'>> }) => {
      const paymentMethod = state.paymentMethods.find((entry) => entry.id === where.id);
      if (!paymentMethod) throw new Error('Payment method not found');
      Object.assign(paymentMethod, data, { updatedAt: new Date() });
      return paymentMethod;
    },
    updateMany: async ({ where, data }: { where: { userId: string; isDefault?: boolean }; data: Partial<Pick<TestPaymentMethodRecord, 'isDefault'>> }) => {
      let count = 0;
      state.paymentMethods.forEach((entry) => {
        if (entry.userId === where.userId && (where.isDefault === undefined || entry.isDefault === where.isDefault)) {
          Object.assign(entry, data, { updatedAt: new Date() });
          count += 1;
        }
      });
      return { count };
    }
  },
  payment: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const payment = state.payments.find((entry) => entry.id === where.id);
      return payment ? includePaymentRelations(payment) : null;
    },
    findMany: async ({ where }: { where?: { subscriptionId?: string; subscription?: { userId: string } } } = {}) => {
      let payments = state.payments;
      if (where?.subscriptionId) {
        payments = payments.filter((entry) => entry.subscriptionId === where.subscriptionId);
      }
      if (where?.subscription?.userId) {
        const userId = where.subscription.userId;
        const allowedIds = state.subscriptions
          .filter((subscription) => subscription.userId === userId)
          .map((subscription) => subscription.id);
        payments = payments.filter((entry) => allowedIds.includes(entry.subscriptionId));
      }
      return [...payments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(includePaymentRelations);
    },
    create: async ({ data }: { data: Omit<TestPaymentRecord, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const now = new Date();
      const payment: TestPaymentRecord = {
        id: createId('payment'),
        ...data,
        amount: Number(data.amount),
        createdAt: now,
        updatedAt: now
      };
      state.payments.push(payment);
      return payment;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Pick<TestPaymentRecord, 'status' | 'failureReason'>> }) => {
      const payment = state.payments.find((entry) => entry.id === where.id);
      if (!payment) throw new Error('Payment not found');
      Object.assign(payment, data, { updatedAt: new Date() });
      return payment;
    },
    count: async () => state.payments.length
  }
};

export const prismaMock = prismaClientMock as unknown as PrismaClient;
