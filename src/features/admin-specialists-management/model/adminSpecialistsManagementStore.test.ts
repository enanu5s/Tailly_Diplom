import { afterEach, describe, expect, it } from 'vitest';

import { adminSpecialistsManagementStore } from './adminSpecialistsManagementStore';

function fillRequiredForm(email: string): void {
  adminSpecialistsManagementStore.setFormField('applicationId', 'application-1');
  adminSpecialistsManagementStore.setFormField('email', email);
  adminSpecialistsManagementStore.setFormField('firstName', 'Иван');
  adminSpecialistsManagementStore.setFormField('lastName', 'Петров');
  adminSpecialistsManagementStore.setFormField('city', 'Москва');
  adminSpecialistsManagementStore.setFormField('about', 'Опытный специалист');
  adminSpecialistsManagementStore.setFormField('consent', true);
}

describe('adminSpecialistsManagementStore', () => {
  afterEach(() => {
    adminSpecialistsManagementStore.closeModal();
  });

  it('does not allow specialist account creation with invalid email', () => {
    fillRequiredForm('not-an-email');

    expect(adminSpecialistsManagementStore.canSubmit).toBe(false);
  });

  it('allows specialist account creation with a valid email and required fields', () => {
    fillRequiredForm('specialist@example.com');

    expect(adminSpecialistsManagementStore.canSubmit).toBe(true);
  });
});
