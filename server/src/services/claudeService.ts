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
 * Generates a professional CV in Hebrew using Claude API
 * @param candidateData - The candidate's core information
 * @returns The generated CV content as a string in Hebrew
 * @throws {Error} If Claude API call fails
 */
export const generateCV = async (candidateData: {
  firstName: string;
  lastName: string;
  yearsOfExp: number;
  skills: string[];
}): Promise<string> => {
  const prompt = `צור קורות חיים מקצועיים בעברית עבור המועמד הבא.
עצב אותם בצורה נקייה ומובנית עם חלקים ברורים.

פרטי המועמד:
- שם: ${candidateData.firstName} ${candidateData.lastName}
- שנות ניסיון: ${candidateData.yearsOfExp}
- כישורים: ${candidateData.skills.join(', ')}

אנא צור קורות חיים מלאים ומקצועיים הכוללים:
1. פרטים אישיים
2. תקציר מקצועי
3. כישורים (מסווגים לפי קטגוריה)
4. ניסיון תעסוקתי (צור רשומות מציאותיות בהתבסס על הכישורים ושנות הניסיון)
5. השכלה (צור רשומות מתאימות בהתבסס על הפרופיל)

הקורות חיים צריכים להיות מפורטים, מקצועיים ומוכנים לשליחה למשרות.`;

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
 * Ranks candidates for a position using Claude API
 * @param candidates - Array of candidate data to evaluate
 * @param criteria - The position or criteria to rank against
 * @returns Array of ranking results with scores and reasoning
 * @throws {Error} If Claude API call fails or response parsing fails
 */
export const rankCandidates = async (
  candidates: Array<{
    id: string;
    name: string;
    experience: number;
    skills: string[];
  }>,
  criteria: string
): Promise<RankingResult[]> => {
  const candidatesList = candidates
    .map(
      (c) =>
        `- Name: ${c.name}, Experience: ${c.experience} years, Skills: ${c.skills.join(', ')}`
    )
    .join('\n');

  const prompt = `You are an expert HR recruiter. Evaluate and rank the following candidates for this position: "${criteria}".

Candidates:
${candidatesList}

Return a JSON array (no markdown, no code fences, no extra text) with this exact structure:
[
  {
    "name": "Candidate Full Name",
    "score": 85,
    "reasoning": "Brief explanation of the score",
    "shouldInterview": true
  }
]

Rules:
- score: Integer 1-100 reflecting how well the candidate matches the position
- shouldInterview: true if score >= 50, false otherwise
- reasoning: Explain why this candidate received this score
- Order by score descending

Return ONLY valid JSON. No markdown formatting, no code blocks, no additional text.`;

  logger.info(`Ranking ${candidates.length} candidates for: ${criteria}`);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content received from Claude API');
  }

  try {
    const rankings: RankingResult[] = JSON.parse(textBlock.text);
    return rankings;
  } catch (parseError) {
    logger.error('Failed to parse Claude ranking response', textBlock.text);
    throw new Error('Failed to parse ranking results from Claude API');
  }
};
