/**
 * Utility to detect when the AI response indicates the user needs a database connection
 */

const DATABASE_KEYWORDS = [
  'database',
  'supabase',
  'postgresql',
  'data persistence',
  'data storage',
  'store data',
  'save data',
  'database connection',
  'connect database',
  'create table',
  'schema',
  'sql',
  'query data',
];

const CONTEXT_PHRASES = [
  'you need',
  'you should',
  'you will need',
  'requires a database',
  'requires database',
  'need a database',
  'connect to a database',
  'set up a database',
  'configure database',
];

/**
 * Detects if the message content indicates the user needs a database connection
 * @param content - The AI response message content
 * @returns true if database connection is needed
 */
export function detectDatabaseNeed(content: string): boolean {
  const lowerContent = content.toLowerCase();

  // Check for direct database keywords
  const hasDbKeyword = DATABASE_KEYWORDS.some((keyword) =>
    lowerContent.includes(keyword)
  );

  if (!hasDbKeyword) {
    return false;
  }

  // Check for context phrases that suggest the user should take action
  const hasContextPhrase = CONTEXT_PHRASES.some((phrase) =>
    lowerContent.includes(phrase)
  );

  // If we found keywords and appropriate context, suggest database connection
  return hasDbKeyword && hasContextPhrase;
}

/**
 * Detects if the message is about creating or setting up a backend/API
 * which would benefit from a database
 */
export function detectBackendSetupNeed(content: string): boolean {
  const lowerContent = content.toLowerCase();

  const backendKeywords = [
    'api',
    'backend',
    'server',
    'endpoint',
    'route handler',
    'user authentication',
    'user profile',
    'user data',
  ];

  return backendKeywords.some((keyword) => lowerContent.includes(keyword));
}

/**
 * Combined detection: checks if database connection should be suggested
 * @param content - The AI response message content
 * @returns true if Supabase action card should be shown
 */
export function shouldShowSupabaseCard(content: string): boolean {
  return detectDatabaseNeed(content) || detectBackendSetupNeed(content);
}
