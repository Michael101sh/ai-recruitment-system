import Anthropic from '@anthropic-ai/sdk';

import { logger } from '../utils/logger';
import type { RankingResult, GeneratedCandidateProfile } from '../types';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generates realistic candidate profiles using Claude API
 * @param count - Number of candidate profiles to generate
 * @returns Array of generated candidate profiles
 * @throws {Error} If Claude API call fails or response parsing fails
 */
export const generateCandidateProfiles = async (
  count: number
): Promise<GeneratedCandidateProfile[]> => {
  const prompt = `Generate ${count} realistic and diverse fictional software industry candidate profiles.
Each candidate MUST be clearly different in quality, experience level, and skill relevance so that
when they are later ranked for a software engineering position, the results are meaningful and spread
across the full scoring range.

Return a JSON array (no markdown, no code fences, no extra text) with this exact structure:
[
  {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@email.com",
    "phone": "+1-555-123-4567",
    "yearsOfExp": 5,
    "skills": ["TypeScript", "React", "Node.js", "PostgreSQL"]
  }
]

Rules:
- Generate exactly ${count} unique candidates — every name, email, and skill set must be different
- Use realistic English names with diverse backgrounds
- Email MUST be globally unique: use the format firstname.lastname.XXXX@email.com where XXXX is a random 4-digit number (e.g. john.smith.3847@email.com). NEVER use plain firstname.lastname@email.com
- CRITICAL — create a deliberate quality spread across all ${count} candidates:
  * Include at least one strong candidate (8+ years, highly relevant modern skills)
  * Include at least one weak/poor-fit candidate (0-1 years, or irrelevant/outdated skills)
  * Distribute the rest across the middle range
- yearsOfExp: integer between 0 and 20, deliberately varied (don't cluster around one number)
- skills: 3-8 technical skills per candidate, with deliberate variety in relevance:
  * Strong candidates: modern, in-demand skills (TypeScript, React, Node.js, AWS, Docker, etc.)
  * Weak candidates: outdated or unrelated skills (COBOL, Flash, manual testing only, etc.)
  * Middle candidates: a mix of relevant and less relevant skills
- Include a mix of frontend, backend, fullstack, DevOps, and data profiles
- No two candidates should have the same skill set
- All text must be in English

Return ONLY valid JSON. No markdown formatting, no code blocks, no additional text.`;

  logger.info(`Generating ${count} candidate profiles`);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content received from Claude API');
  }

  try {
    const profiles: GeneratedCandidateProfile[] = JSON.parse(textBlock.text);
    return profiles;
  } catch (parseError) {
    logger.error('Failed to parse Claude candidate profiles response', textBlock.text);
    throw new Error('Failed to parse candidate profiles from Claude API');
  }
};

/**
 * Generates a professional CV in English using Claude API
 * @param candidateData - The candidate's core information
 * @returns The generated CV content as a string in English
 * @throws {Error} If Claude API call fails
 */
export const generateCV = async (candidateData: {
  firstName: string;
  lastName: string;
  yearsOfExp: number;
  skills: string[];
}): Promise<{ content: string; prompt: string }> => {
  const prompt = `Create a realistic CV/resume in English for the following candidate.
Format it in a clean, structured manner with clear sections.

Candidate Information:
- Name: ${candidateData.firstName} ${candidateData.lastName}
- Years of Experience: ${candidateData.yearsOfExp}
- Skills: ${candidateData.skills.join(', ')}

IMPORTANT: The CV quality must authentically reflect the candidate's experience level and skills.
- A candidate with 0-2 years should have a short, entry-level CV with limited experience (internships, personal projects, one junior role at most).
- A candidate with 3-6 years should have a moderate CV with 2-3 roles showing progression.
- A candidate with 7+ years should have a strong, detailed CV with multiple senior roles and achievements.
- If the skills are outdated or niche, the CV should reflect that realistically (e.g., legacy companies, limited modern tech exposure).
- Do NOT make a weak candidate look strong. The CV should honestly represent the profile.

Generate the CV using this EXACT markdown structure and formatting — every CV must follow this template consistently:

# [Full Name]

## Contact Information
- 📧 [email]
- 📱 [phone number]
- 📍 [city, country]
- 🔗 [linkedin URL]

## Professional Summary
[2-3 sentence summary]

## Skills
**[Category]:** [comma-separated skills]
**[Category]:** [comma-separated skills]

## Professional Experience

### [Job Title] — [Company Name]
*[Start Date] – [End Date]*
- [Achievement/responsibility]
- [Achievement/responsibility]

(Repeat for each role)

## Education

### [Degree] — [University Name]
*[Year]*

---

CRITICAL formatting rules:
- Always use the emoji icons shown above for Contact Information (📧 📱 📍 🔗)
- Use ## for section headers, ### for job titles and degrees
- Use bullet points (- ) for lists
- Use bold (**text**) for skill categories
- Use italic (*text*) for date ranges
- Separate sections with blank lines
- All content must be in English`;

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

  return { content: textBlock.text, prompt };
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
        `- ID: ${c.id}, Name: ${c.name}, Experience: ${c.experience} years, Skills: ${c.skills.join(', ')}`
    )
    .join('\n');

  const prompt = `You are an expert HR recruiter. Evaluate and rank ALL of the following candidates for this position: "${criteria}".

Candidates:
${candidatesList}

Return a JSON array (no markdown, no code fences, no extra text) with this exact structure:
[
  {
    "id": "candidate-id-here",
    "score": 85,
    "reasoning": "Brief explanation of the score",
    "shouldInterview": true
  }
]

Rules:
- You MUST include ALL ${candidates.length} candidates in your response — do NOT skip any
- id: Copy the exact ID string from the candidate list above — do NOT modify it
- score: Integer 1-100 reflecting how well the candidate matches the position
- shouldInterview: true if score >= 50, false otherwise
- reasoning: 1-2 sentences explaining why this candidate received this score
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
    const rawText = textBlock.text.trim();

    // Normalise common Claude formatting issues before parsing
    let workingText = rawText;

    // 1) If Claude wrapped the JSON in a ```json ... ``` fenced block, extract inner content
    const fencedMatch = workingText.match(/```[\s\S]*?```/);
    if (fencedMatch) {
      const fenced = fencedMatch[0];
      workingText = fenced
        .replace(/```json/i, '')
        .replace(/```/g, '')
        .trim();
      logger.warn('Claude ranking response contained fenced code block; extracted inner JSON.');
    }

    // 2) Try direct JSON parse first
    const tryParse = (text: string): unknown | undefined => {
      try {
        return JSON.parse(text);
      } catch {
        return undefined;
      }
    };

    const directParse = tryParse(workingText);

    if (directParse !== undefined) {
      if (Array.isArray(directParse)) {
        return directParse as RankingResult[];
      }

      // Sometimes Claude returns an object wrapper like { "results": [ ... ] } or { "rankings": [ ... ] }
      if (
        typeof directParse === 'object' &&
        directParse !== null &&
        ('results' in directParse || 'rankings' in directParse || 'candidates' in directParse)
      ) {
        const container = directParse as Record<string, unknown>;
        const possibleArray =
          (container.results as unknown) ??
          (container.rankings as unknown) ??
          (container.candidates as unknown);

        if (Array.isArray(possibleArray)) {
          logger.warn(
            'Claude ranking response used an object wrapper; extracted array from known property.',
          );
          return possibleArray as RankingResult[];
        }
      }

      logger.warn(
        'Claude ranking response is valid JSON but not an array; attempting to extract array substring.',
      );
    }

    // 3) Fallback: extract the first JSON array substring from the text
    const arrayMatch = workingText.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      logger.error(
        'Claude ranking response did not contain a JSON array.',
        workingText.slice(0, 2000),
      );
      throw new Error('Claude ranking response missing JSON array');
    }

    const extractedJson = arrayMatch[0];
    const parsed = tryParse(extractedJson);

    if (!parsed || !Array.isArray(parsed)) {
      logger.error(
        'Extracted Claude ranking JSON is not an array.',
        extractedJson.slice(0, 2000),
      );
      throw new Error('Extracted Claude ranking JSON is not an array');
    }

    const rankings = parsed as RankingResult[];
    return rankings;
  } catch (parseError) {
    logger.error(
      'Failed to parse Claude ranking response; falling back to heuristic ranking.',
      textBlock.text.slice(0, 2000),
      parseError,
    );

    // Fallback: deterministic heuristic-based ranking so the API
    // still returns useful data even when Claude output is malformed.
    const heuristicRankings: RankingResult[] = candidates
      .map((candidate) => {
        // Simple heuristic: weight experience and skill count
        const baseScore = candidate.experience * 4 + candidate.skills.length * 3;
        const clampedScore = Math.max(1, Math.min(100, baseScore));

        return {
          id: candidate.id,
          score: clampedScore,
          shouldInterview: clampedScore >= 50,
          reasoning:
            'Heuristic ranking used because AI ranking response could not be parsed. Score is based on years of experience and number of skills.',
        };
      })
      .sort((a, b) => b.score - a.score);

    return heuristicRankings;
  }
};
