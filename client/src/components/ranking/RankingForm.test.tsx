import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { RankingForm } from './RankingForm';

describe('RankingForm', () => {
  const defaultProps = {
    criteria: '',
    onCriteriaChange: vi.fn(),
    onRankAll: vi.fn(),
    isRanking: false,
  };

  it('renders criteria input', () => {
    render(<RankingForm {...defaultProps} />);
    expect(screen.getByPlaceholderText(/criteria/i)).toBeInTheDocument();
  });

  it('renders rank all button', () => {
    render(<RankingForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /rank all/i })).toBeInTheDocument();
  });

  it('calls onCriteriaChange when typing in input', async () => {
    const user = userEvent.setup();
    const onCriteriaChange = vi.fn();

    render(<RankingForm {...defaultProps} onCriteriaChange={onCriteriaChange} />);

    const input = screen.getByPlaceholderText(/criteria/i);
    await user.type(input, 'Senior Engineer');

    expect(onCriteriaChange).toHaveBeenCalledWith('S');
  });

  it('calls onRankAll when button is clicked', async () => {
    const user = userEvent.setup();
    const onRankAll = vi.fn();

    render(<RankingForm {...defaultProps} onRankAll={onRankAll} />);

    const button = screen.getByRole('button', { name: /rank all/i });
    await user.click(button);

    expect(onRankAll).toHaveBeenCalledOnce();
  });

  it('disables button when isRanking is true', () => {
    render(<RankingForm {...defaultProps} isRanking={true} />);

    const button = screen.getByRole('button', { name: /rank all candidates/i });
    expect(button).toBeDisabled();
  });

  it('shows loading state when isRanking is true', () => {
    render(<RankingForm {...defaultProps} isRanking={true} />);
    expect(screen.getByText(/ranking/i)).toBeInTheDocument();
  });

  it('shows normal state when isRanking is false', () => {
    render(<RankingForm {...defaultProps} isRanking={false} />);
    expect(screen.getByText(/rank all/i)).toBeInTheDocument();
  });
});
