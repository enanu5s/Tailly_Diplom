import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Logo } from './Logo';

describe('Logo', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders brand text by default', () => {
    render(<Logo />);
    expect(screen.getByText('Tailly')).toBeInTheDocument();
  });

  it('hides text when withText is false', () => {
    render(<Logo withText={false} />);
    expect(screen.queryByText('Tailly')).not.toBeInTheDocument();
  });
});
