import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { CandidateFilters } from './CandidateFilters';

describe('CandidateFilters', () => {
  const defaultProps = {
    search: '',
    onSearchChange: vi.fn(),
    sortBy: 'score-desc' as const,
    onSortChange: vi.fn(),
    totalCandidates: 10,
    filteredCount: 10,
  };

  it('renders search input', () => {
    render(<CandidateFilters {...defaultProps} />);
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
  });

  it('renders sort dropdown', () => {
    render(<CandidateFilters {...defaultProps} />);
    expect(screen.getByLabelText(/sort candidates/i)).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search input', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(<CandidateFilters {...defaultProps} onSearchChange={onSearchChange} />);

    const input = screen.getByPlaceholderText(/search by name/i);
    await user.type(input, 'Alice');

    // userEvent.type calls onChange for each character
    expect(onSearchChange).toHaveBeenCalledWith('A');
    expect(onSearchChange).toHaveBeenCalledWith('l');
    expect(onSearchChange).toHaveBeenCalledWith('i');
    expect(onSearchChange).toHaveBeenCalledTimes(5);
  });

  it('shows clear button when search has value', () => {
    render(<CandidateFilters {...defaultProps} search="test" />);
    expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument();
  });

  it('does not show clear button when search is empty', () => {
    render(<CandidateFilters {...defaultProps} search="" />);
    expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(<CandidateFilters {...defaultProps} search="test" onSearchChange={onSearchChange} />);

    const clearButton = screen.getByLabelText(/clear search/i);
    await user.click(clearButton);

    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('calls onSortChange when sort option is selected', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    render(<CandidateFilters {...defaultProps} onSortChange={onSortChange} />);

    const select = screen.getByLabelText(/sort candidates/i);
    await user.selectOptions(select, 'name-asc');

    expect(onSortChange).toHaveBeenCalledWith('name-asc');
  });

  it('shows filtered count when search is active', () => {
    render(<CandidateFilters {...defaultProps} search="alice" filteredCount={3} totalCandidates={10} />);
    expect(screen.getByText(/showing 3 of 10 candidates/i)).toBeInTheDocument();
  });

  it('does not show filtered count when search is empty', () => {
    render(<CandidateFilters {...defaultProps} search="" />);
    expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
  });
});
