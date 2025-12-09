// Type definitions for database query handling
export interface DatabaseQueryResult {
  success: boolean;
  data?: unknown[];
  rowCount?: number;
  error?: string;
  statusCode?: number;
  table?: string;
  operation?: string;
}

export interface FormattedQueryResult {
  isQueryResult: boolean;
  operation?: string;
  table?: string;
  rowCount: number;
  displayData: string;
  success: boolean;
}

// Regex pattern to detect database query objects in AI output
const DATABASE_QUERY_PATTERN = /\/api\/db\/query/;

// Extract fetch calls to /api/db/query from code
export function extractDatabaseQueries(code: string): Array<{
  fullMatch: string;
  queryBody: Record<string, unknown>;
}> {
  const queries: Array<{
    fullMatch: string;
    queryBody: Record<string, unknown>;
  }> = [];

  // Multiple patterns to match fetch calls to /api/db/query
  // Handles various formatting styles
  const patterns = [
    // Pattern 1: Complete fetch with JSON.stringify
    /fetch\(['"]\/api\/db\/query['"]\s*,\s*\{[^}]*method:\s*['"]POST['"][^}]*body:\s*JSON\.stringify\((\{[\s\S]*?\})\)[^}]*\}\s*\)/g,
    // Pattern 2: await fetch pattern
    /await\s+fetch\(['"]\/api\/db\/query['"]\s*,\s*\{[^}]*method:\s*['"]POST['"][^}]*body:\s*JSON\.stringify\((\{[\s\S]*?\})\)[^}]*\}\s*\)/g,
    // Pattern 3: Simple pattern with just the JSON body
    /\/api\/db\/query[\s\S]*?JSON\.stringify\((\{[\s\S]*?\})\)/,
  ];

  for (const pattern of patterns) {
    let match;
    // Reset lastIndex for global patterns
    if (pattern.global) {
      pattern.lastIndex = 0;
    }
    
    while ((match = pattern.exec(code)) !== null) {
      try {
        const bodyStr = match[1];
        // Try to clean up the matched string (remove trailing content)
        let cleanedBody = bodyStr;
        
        // Find the last balanced closing brace
        let braceCount = 0;
        let lastBalancedIndex = -1;
        for (let i = 0; i < cleanedBody.length; i++) {
          if (cleanedBody[i] === '{') braceCount++;
          if (cleanedBody[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              lastBalancedIndex = i;
              break;
            }
          }
        }
        
        if (lastBalancedIndex > 0) {
          cleanedBody = cleanedBody.substring(0, lastBalancedIndex + 1);
        }
        
        // Parse the JSON object
        const queryBody = JSON.parse(cleanedBody);
        queries.push({
          fullMatch: match[0],
          queryBody,
        });
      } catch {
        // If parsing fails, try to extract operation field
        try {
          const operationMatch = /operation\s*:\s*['"](\w+)['"]/i.exec(match[1]);
          if (operationMatch) {
            queries.push({
              fullMatch: match[0],
              queryBody: {
                operation: operationMatch[1],
              },
            });
          }
        } catch {
          // Silently skip queries that can't be parsed
        }
      }
    }
  }

  // Remove duplicates based on fullMatch
  const uniqueQueries = queries.reduce((acc, query) => {
    if (!acc.some(q => q.fullMatch === query.fullMatch)) {
      acc.push(query);
    }
    return acc;
  }, [] as typeof queries);

  return uniqueQueries;
}

/**
 * Execute database query via /api/db/query endpoint from the main app
 * This is called from the Inngest function to execute queries detected in AI output
 */
export async function executeDatabaseQuery(
  queryBody: Record<string, unknown>,
  appUrl: string
): Promise<DatabaseQueryResult> {
  try {
    const response = await fetch(`${appUrl}/api/db/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryBody),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Database query failed",
        statusCode: response.status,
        operation: (queryBody.operation as string) || "unknown",
        table: (queryBody.table as string) || "unknown",
      };
    }

    return {
      success: true,
      data: result.data,
      rowCount: result.rowCount || 0,
      operation: (queryBody.operation as string) || "unknown",
      table: (queryBody.table as string) || "unknown",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute database query: ${error instanceof Error ? error.message : String(error)}`,
      operation: (queryBody.operation as string) || "unknown",
      table: (queryBody.table as string) || "unknown",
    };
  }
}

/**
 * Format database query result for display in chat
 */
export function formatQueryResult(result: DatabaseQueryResult): string {
  if (!result.success) {
    return `❌ ${result.operation?.toUpperCase() || "Query"} failed: ${result.error || "Unknown error"}`;
  }

  const operation = result.operation?.toUpperCase() || "QUERY";
  const rowCount = result.rowCount || 0;

  if (result.operation === "select") {
    if (!result.data || result.data.length === 0) {
      return `✅ ${operation}: No records found in ${result.table}`;
    }

    // Format select results as a simple table
    const headers = Object.keys(result.data[0] as Record<string, unknown>);
    let table = `✅ ${operation}: Retrieved ${rowCount} record${rowCount !== 1 ? "s" : ""} from ${result.table}\n\n`;

    // Create table header
    table += `| ${headers.join(" | ")} |\n`;
    table += `|${headers.map(() => " --- ").join("|")}|\n`;

    // Add data rows
    for (const row of result.data) {
      const values = headers.map((h) => {
        const val = (row as Record<string, unknown>)[h];
        if (val === null) return "null";
        if (typeof val === "string") return val.substring(0, 30);
        if (typeof val === "object") return JSON.stringify(val).substring(0, 30);
        return String(val);
      });
      table += `| ${values.join(" | ")} |\n`;
    }

    return table;
  }

  if (result.operation === "insert") {
    return `✅ ${operation}: Successfully inserted ${rowCount} record${rowCount !== 1 ? "s" : ""} into ${result.table}`;
  }

  if (result.operation === "update") {
    return `✅ ${operation}: Successfully updated ${rowCount} record${rowCount !== 1 ? "s" : ""} in ${result.table}`;
  }

  if (result.operation === "delete") {
    return `✅ ${operation}: Successfully deleted ${rowCount} record${rowCount !== 1 ? "s" : ""} from ${result.table}`;
  }

  return `✅ ${operation}: Completed successfully (${rowCount} rows affected)`;
}

/**
 * Check if code contains database queries
 */
export function hasDatabaseQueries(code: string): boolean {
  return DATABASE_QUERY_PATTERN.test(code);
}
