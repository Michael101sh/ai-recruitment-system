import Anthropic from '@anthropic-ai/sdk';

import { logger } from '../utils/logger';
import type { RankingResult } from '../types';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generates a professional CV using Claude API based on candidate data
 * @param candidateData - Object containing candidate information
 * @returns The generated CV content as a string
 * @throws {Error} If Claude API call fails
 */
export const generateCV = async (candidateData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  yearsOfExp: number;
  summary?: string;
  skills: string[];
}): Promise<string> => {
  const prompt = `Create a professional CV/resume for the following candidate. 
Format it in a clean, structured manner with clear sections.

Candidate Information:
- Name: ${candidateData.firstName} ${candidateData.lastName}
- Email: ${candidateData.email}
${candidateData.phone ? `- Phone: ${candidateData.phone}` : ''}
- Years of Experience: ${candidateData.yearsOfExp}
${candidateData.summary ? `- Professional Summary: ${candidateData.summary}` : ''}
- Skills: ${candidateData.skills.join(', ')}

Please generate a complete, professional CV with the following sections:
1. Contact Information
2. Professional Summary
3. Skills (categorized if possible)
4. Professional Experience (generate realistic entries based on the skills and years of experience)
5. Education (generate appropriate entries based on the profile)

Make it detailed, professional, and ready for job applications.`;

  logger.info(`Generating CV for ${candidateData.firstName} ${candidateData.lastName}`);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content received from Claude API');
  }

  return textBlock.text;
};

/**
 * Ranks candidates against a job description using Claude API
 * @param candidates - Array of candidate data to rank
 * @param jobDescription - The job description to rank candidates against
 * @returns Array of ranking results with scores and reasoning
 * @throws {Error} If Claude API call fails or response parsing fails
 */
export const rankCandidates = async (
  candidates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    yearsOfExp: number;
    summary: string | null;
    skills: string[];
  }>,
  jobDescription: string
): Promise<RankingResult[]> => {
  const candidatesList = candidates
    .map(
      (c) =>
        `- ID: ${c.id}, Name: ${c.firstName} ${c.lastName}, Experience: ${c.yearsOfExp} years, Skills: ${c.skills.join(', ')}${c.summary ? `, Summary: ${c.summary}` : ''}`
    )
    .join('\n');

  const prompt = `You are an expert HR recruiter. Evaluate and rank the following candidates for this job position.

Job Description:
${jobDescription}

Candidates:
${candidatesList}

For each candidate, provide a JSON array with the following structure:
[
  {
    "candidateId": "uuid",
    "score": 0-100,
    "priority": "HIGH" | "MEDIUM" | "LOW" | "NOT_ELIGIBLE",
    "reasoning": "Brief explanation of the score",
    "isEligible": true/false
  }
]

Rules:
- Score 80-100: HIGH priority (strong match)
- Score 50-79: MEDIUM priority (partial match)
- Score 20-49: LOW priority (weak match)
- Score 0-19: NOT_ELIGIBLE (not suitable)
- isEligible should be false for NOT_ELIGIBLE candidates

Return ONLY the JSON array, no additional text.`;

  logger.info(`Ranking ${candidates.length} candidates`);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content received from Claude API');
  }

  const rankings: RankingResult[] = JSON.parse(textBlock.text);
  return rankings;
};
