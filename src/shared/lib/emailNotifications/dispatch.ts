import type { OrderStatus, ServiceOrder } from '@/features/orders/model/types';
import type { Order as ShopOrder } from '@/features/shop/model/types';
import type { SpecialistApplicationStatus } from '@/features/specialist-applications/model/types';

import { getSupportEmail } from './config';
import { sendMockMail } from './mockMailer';
import { resolveClientEmailByUserId, resolveSpecialistEmailBySlug } from './recipients';
import {
  formatServiceOrderWhen,
  getServiceOrderStartInstant,
} from './serviceOrderSchedule';

function serviceOrderStatusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending_confirmation: 'ожидает подтверждения',
    confirmed: 'подтверждён',
    active: 'выполняется',
    completed: 'завершён',
    canceled: 'отменён',
  };
  return map[status] ?? status;
}

function shopOrderStatusLabel(status: ShopOrder['status']): string {
  const map: Record<ShopOrder['status'], string> = {
    created: 'оформлен, ожидает оплаты',
    paid: 'оплачен',
    processing: 'в обработке',
    delivering: 'доставляется',
    'ready-for-pickup': 'готов к выдаче',
    completed: 'завершён',
    cancelled: 'отменён',
  };
  return map[status] ?? status;
}

function applicationStatusLabel(status: SpecialistApplicationStatus): string {
  const map: Record<SpecialistApplicationStatus, string> = {
    pending_review: 'на рассмотрении',
    interview_assigned: 'назначено собеседование',
    approved: 'одобрена',
    rejected: 'отклонена',
  };
  return map[status] ?? status;
}

export function notifyServiceOrderCreated(order: ServiceOrder): void {
  const when = formatServiceOrderWhen(order);
  const clientEmail = resolveClientEmailByUserId(order.clientId);
  const specialistEmail = resolveSpecialistEmailBySlug(order.specialistSlug);

  if (clientEmail) {
    sendMockMail({
      kind: 'service_order_created_client',
      to: clientEmail,
      subject: `Tailly: заказ на услугу «${order.serviceTitle}» оформлен`,
      body: [
        `Здравствуйте, ${order.clientName}!`,
        '',
        `Ваш заказ № ${order.id} на услугу «${order.serviceTitle}» у специалиста ${order.sitterName} принят.`,
        `Дата и время: ${when}.`,
        `Питомец: ${order.petName}.`,
        `Статус: ${serviceOrderStatusLabel(order.status)}.`,
        '',
        'С уважением, команда Tailly.',
      ].join('\n'),
    });
  }

  if (specialistEmail) {
    sendMockMail({
      kind: 'service_order_created_specialist',
      to: specialistEmail,
      subject: `Tailly: новая бронь — «${order.serviceTitle}»`,
      body: [
        `Здравствуйте, ${order.sitterName}!`,
        '',
        `Новый заказ № ${order.id} от клиента ${order.clientName}.`,
        `Услуга: «${order.serviceTitle}».`,
        `Дата и время: ${when}.`,
        `Питомец: ${order.petName}.`,
        '',
        'Откройте кабинет специалиста, чтобы подтвердить или отклонить заявку.',
        '',
        'С уважением, команда Tailly.',
      ].join('\n'),
    });
  }
}

export function notifyServiceOrderStatusChanged(
  order: ServiceOrder,
  previousStatus: OrderStatus,
): void {
  const when = formatServiceOrderWhen(order);
  const clientEmail = resolveClientEmailByUserId(order.clientId);
  const specialistEmail = resolveSpecialistEmailBySlug(order.specialistSlug);

  const lines = [
    `Заказ № ${order.id}: «${order.serviceTitle}».`,
    `Было: ${serviceOrderStatusLabel(previousStatus)}.`,
    `Сейчас: ${serviceOrderStatusLabel(order.status)}.`,
    `Дата и время услуги: ${when}.`,
  ];

  if (clientEmail) {
    sendMockMail({
      kind: 'service_order_status_client',
      to: clientEmail,
      subject: `Tailly: обновлён статус заказа «${order.serviceTitle}»`,
      body: ['Здравствуйте!', '', ...lines, '', 'С уважением, команда Tailly.'].join(
        '\n',
      ),
    });
  }

  if (specialistEmail) {
    sendMockMail({
      kind: 'service_order_status_specialist',
      to: specialistEmail,
      subject: `Tailly: статус заказа № ${order.id} изменён`,
      body: ['Здравствуйте!', '', ...lines, '', 'С уважением, команда Tailly.'].join(
        '\n',
      ),
    });
  }
}

export function notifyClientServiceReminder(
  order: ServiceOrder,
  variant: '24h' | '12h',
): void {
  const clientEmail = resolveClientEmailByUserId(order.clientId);
  if (!clientEmail) {
    return;
  }

  const when = formatServiceOrderWhen(order);
  const windowLabel =
    variant === '24h' ? 'завтра (за сутки до начала)' : 'примерно через 12 часов';

  sendMockMail({
    kind: variant === '24h' ? 'service_reminder_24h' : 'service_reminder_12h',
    to: clientEmail,
    subject: `Tailly: напоминание об услуге «${order.serviceTitle}»`,
    body: [
      `Здравствуйте, ${order.clientName}!`,
      '',
      `Напоминаем: услуга «${order.serviceTitle}» у ${order.sitterName} ${windowLabel}.`,
      `Дата и время: ${when}.`,
      `Питомец: ${order.petName}.`,
      `Заказ № ${order.id}.`,
      '',
      'С уважением, команда Tailly.',
    ].join('\n'),
  });
}

export function notifySpecialistTomorrowOrdersDigest(params: {
  specialistSlug: string;
  specialistName: string;
  orders: ServiceOrder[];
}): void {
  const email = resolveSpecialistEmailBySlug(params.specialistSlug);
  if (!email || params.orders.length === 0) {
    return;
  }

  const lines = params.orders.map((o, i) => {
    const when = formatServiceOrderWhen(o);
    return `${i + 1}. № ${o.id} — ${o.clientName}, «${o.serviceTitle}», ${when} (${serviceOrderStatusLabel(o.status)})`;
  });

  sendMockMail({
    kind: 'specialist_digest_tomorrow',
    to: email,
    subject: 'Tailly: ваши заказы услуг на завтра',
    body: [
      `Здравствуйте, ${params.specialistName}!`,
      '',
      'Заказы на завтра:',
      '',
      ...lines,
      '',
      'С уважением, команда Tailly.',
    ].join('\n'),
  });
}

export function notifyShopOrderEvent(params: {
  order: ShopOrder;
  event: 'created' | 'paid' | 'cancelled';
}): void {
  const email = params.order.recipientEmail?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return;
  }

  const name = params.order.recipientName?.trim() || 'клиент';
  const items = params.order.items
    .map((line) => `• ${line.product.title} × ${line.quantity} — ${line.lineTotal} ₽`)
    .join('\n');

  if (params.event === 'created') {
    sendMockMail({
      kind: 'shop_order_created',
      to: email,
      subject: `Tailly: заказ в магазине № ${params.order.id} оформлен`,
      body: [
        `Здравствуйте, ${name}!`,
        '',
        `Спасибо за заказ № ${params.order.id}.`,
        `Сумма: ${params.order.totalPrice} ₽.`,
        `Способ доставки: ${params.order.deliveryMethod}.`,
        '',
        'Состав заказа:',
        items,
        '',
        'Дальнейшие изменения статуса мы также пришлём на эту почту.',
        '',
        'С уважением, команда Tailly.',
      ].join('\n'),
    });
    return;
  }

  if (params.event === 'paid') {
    sendMockMail({
      kind: 'shop_order_paid',
      to: email,
      subject: `Tailly: заказ № ${params.order.id} оплачен`,
      body: [
        `Здравствуйте, ${name}!`,
        '',
        `Заказ № ${params.order.id} успешно оплачен.`,
        `Текущий статус: ${shopOrderStatusLabel(params.order.status)}.`,
        '',
        'Состав заказа:',
        items,
        '',
        'С уважением, команда Tailly.',
      ].join('\n'),
    });
    return;
  }

  sendMockMail({
    kind: 'shop_order_cancelled',
    to: email,
    subject: `Tailly: заказ № ${params.order.id} отменён`,
    body: [
      `Здравствуйте, ${name}!`,
      '',
      `Заказ № ${params.order.id} отменён.`,
      `Статус: ${shopOrderStatusLabel(params.order.status)}.`,
      '',
      `По вопросам обратитесь в поддержку: ${getSupportEmail()}.`,
      '',
      'С уважением, команда Tailly.',
    ].join('\n'),
  });
}

export function notifyModerationApplicationStatus(params: {
  email: string;
  fullName: string;
  applicationId: string;
  status: SpecialistApplicationStatus;
  reviewComment?: string | null;
  interviewDate?: string | null;
}): void {
  const to = params.email.trim().toLowerCase();
  if (!to.includes('@')) {
    return;
  }

  const statusRu = applicationStatusLabel(params.status);
  const extra: string[] = [];

  if (params.interviewDate) {
    extra.push(`Дата собеседования: ${params.interviewDate}.`);
  }
  if (params.reviewComment?.trim()) {
    extra.push(`Комментарий модератора: ${params.reviewComment.trim()}`);
  }

  sendMockMail({
    kind: 'specialist_application_status',
    to,
    subject: `Tailly: анкета специалиста — статус «${statusRu}»`,
    body: [
      `Здравствуйте, ${params.fullName}!`,
      '',
      `Статус вашей заявки (ID ${params.applicationId}): ${statusRu}.`,
      ...extra,
      '',
      `Подробности — в личном кабинете или по почте поддержки: ${getSupportEmail()}.`,
      '',
      'С уважением, команда Tailly.',
    ].join('\n'),
  });
}

export function notifySpecialistServicesChanged(params: {
  specialistEmail: string;
  specialistName: string;
  lines: string[];
}): void {
  const to = params.specialistEmail.trim().toLowerCase();
  if (!to.includes('@') || params.lines.length === 0) {
    return;
  }

  sendMockMail({
    kind: 'specialist_services_changed',
    to,
    subject: 'Tailly: изменения в ваших услугах',
    body: [
      `Здравствуйте, ${params.specialistName}!`,
      '',
      'Зафиксированы изменения по услугам:',
      '',
      ...params.lines.map((l) => `• ${l}`),
      '',
      'С уважением, команда Tailly.',
    ].join('\n'),
  });
}

export function notifyAccountBlocked(params: {
  email: string;
  userName: string;
  reason: string;
  blockedUntilLabel: string;
}): void {
  const support = getSupportEmail();
  sendMockMail({
    kind: 'account_blocked',
    to: params.email,
    subject: 'Tailly: аккаунт временно заблокирован',
    body: [
      `Здравствуйте, ${params.userName}!`,
      '',
      'Ваш аккаунт заблокирован.',
      `Причина: ${params.reason}`,
      `Срок: ${params.blockedUntilLabel}`,
      '',
      `За подробной информацией обратитесь в техническую поддержку: ${support}.`,
      '',
      'С уважением, команда Tailly.',
    ].join('\n'),
  });
}

export function notifyNewAdminPasswordFromSuperAdmin(params: {
  adminEmail: string;
  adminName: string;
  temporaryPassword: string;
}): void {
  sendMockMail({
    kind: 'admin_temp_password',
    to: params.adminEmail,
    subject: 'Tailly: доступ администратора',
    body: [
      `Здравствуйте, ${params.adminName}!`,
      '',
      'Главный администратор создал для вас учётную запись в панели Tailly.',
      `Временный пароль: ${params.temporaryPassword}`,
      '',
      'При первом входе смените пароль в настройках безопасности.',
      '',
      'С уважением, команда Tailly.',
    ].join('\n'),
  });
}

const REMINDER_KEY_24 = 'tailly_reminder_sent_24h';
const REMINDER_KEY_12 = 'tailly_reminder_sent_12h';
const DIGEST_KEY = 'tailly_specialist_digest_tomorrow';

function reminderSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const arr = Array.isArray(parsed) ? parsed : [];
    return new Set(arr.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

function reminderAdd(key: string, orderId: string): void {
  const set = reminderSet(key);
  set.add(orderId);
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

/** Напоминания клиенту (за сутки / за ~12 ч) и дайджест специалисту на завтра. */
function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function runScheduledServiceOrderEmails(orders: ServiceOrder[]): void {
  const now = Date.now();

  for (const order of orders) {
    if (order.status !== 'confirmed' && order.status !== 'pending_confirmation') {
      continue;
    }

    const start = getServiceOrderStartInstant(order);
    if (!start || Number.isNaN(start.getTime())) {
      continue;
    }

    const startMs = start.getTime();
    if (startMs <= now) {
      continue;
    }

    const msLeft = startMs - now;
    const dayMs = 24 * 60 * 60 * 1000;
    const halfDayMs = 12 * 60 * 60 * 1000;

    const sent24 = reminderSet(REMINDER_KEY_24);
    const sent12 = reminderSet(REMINDER_KEY_12);

    if (!sent24.has(order.id) && msLeft <= dayMs && msLeft > halfDayMs) {
      notifyClientServiceReminder(order, '24h');
      reminderAdd(REMINDER_KEY_24, order.id);
    } else if (!sent12.has(order.id) && msLeft <= halfDayMs && msLeft > 15 * 60 * 1000) {
      notifyClientServiceReminder(order, '12h');
      reminderAdd(REMINDER_KEY_12, order.id);
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = localDateKey(tomorrow);

  const bySlug = new Map<string, ServiceOrder[]>();
  for (const order of orders) {
    if (order.status !== 'confirmed' && order.status !== 'pending_confirmation') {
      continue;
    }
    const dateKey = order.dateFrom.slice(0, 10);
    if (dateKey !== tomorrowKey) {
      continue;
    }
    const list = bySlug.get(order.specialistSlug) ?? [];
    list.push(order);
    bySlug.set(order.specialistSlug, list);
  }

  for (const [slug, list] of bySlug) {
    const digestKey = `${DIGEST_KEY}_${slug}_${tomorrowKey}`;
    if (localStorage.getItem(digestKey) === '1') {
      continue;
    }
    const name = list[0]?.sitterName ?? 'специалист';
    notifySpecialistTomorrowOrdersDigest({
      specialistSlug: slug,
      specialistName: name,
      orders: list,
    });
    try {
      localStorage.setItem(digestKey, '1');
    } catch {
      /* ignore */
    }
  }
}
