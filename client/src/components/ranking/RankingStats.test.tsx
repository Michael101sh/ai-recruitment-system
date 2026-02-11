import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { RankingStats } from './RankingStats';

describe('RankingStats', () => {
  it('renders nothing when totalCandidates is 0', () => {
    const { container } = render(
      <RankingStats
        criteria="Senior Engineer"
        rankedAt={null}
        totalCandidates={0}
        totalApproved={0}
        totalRejected={0}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders criteria', () => {
    render(
      <RankingStats
        criteria="Senior Full-Stack Engineer"
        rankedAt={null}
        totalCandidates={10}
        totalApproved={6}
        totalRejected={4}
      />
    );

    expect(screen.getByText(/senior full-stack engineer/i)).toBeInTheDocument();
  });

  it('renders total candidates count', () => {
    render(
      <RankingStats
        criteria="Engineer"
        rankedAt={null}
        totalCandidates={15}
        totalApproved={10}
        totalRejected={5}
      />
    );

    expect(screen.getByText(/15 ranked/i)).toBeInTheDocument();
  });

  it('renders approved and rejected counts', () => {
    render(
      <RankingStats
        criteria="Engineer"
        rankedAt={null}
        totalCandidates={12}
        totalApproved={7}
        totalRejected={5}
      />
    );

    expect(screen.getByText(/7 interview/i)).toBeInTheDocument();
    expect(screen.getByText(/5 rejected/i)).toBeInTheDocument();
  });

  it('shows totalInSystem when provided', () => {
    render(
      <RankingStats
        criteria="Engineer"
        rankedAt={null}
        totalCandidates={8}
        totalInSystem={20}
        totalApproved={5}
        totalRejected={3}
      />
    );

    expect(screen.getByText(/from 20/i)).toBeInTheDocument();
  });

  it('formats rankedAt date when provided', () => {
    const date = new Date('2026-02-11T10:30:00Z');
    render(
      <RankingStats
        criteria="Engineer"
        rankedAt={date.toISOString()}
        totalCandidates={10}
        totalApproved={6}
        totalRejected={4}
      />
    );

    expect(screen.getByText(/feb 11/i)).toBeInTheDocument();
  });
});
