import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "./logger";

const prisma = new PrismaClient();

type QueryOptions = {
  include?: any;
  select?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
};

export class SafeQuery {
  /**
   * Execute a safe SELECT query with parameterized inputs
   */
  static async findMany<T = any>(
    model: keyof PrismaClient,
    where: any = {},
    options: QueryOptions = {},
  ): Promise<T[]> {
    try {
      this.sanitizeWhereClause(where);
      const result = await (prisma[model as string] as any).findMany({
        where,
        ...options,
      });
      return result;
    } catch (error) {
      logger.error(`Error in SafeQuery.findMany for ${String(model)}:`, error);
      throw this.handleDatabaseError(error);
    }
  }

  /**
   * Execute a safe SELECT query to find a single record
   */
  static async findUnique<T = any>(
    model: keyof PrismaClient,
    where: any,
    options: Omit<QueryOptions, "skip" | "take"> = {},
  ): Promise<T | null> {
    try {
      this.sanitizeWhereClause(where);
      const result = await (prisma as any)[model].findUnique({
        where,
        ...options,
      });
      return result;
    } catch (error) {
      logger.error(
        `Error in SafeQuery.findUnique for ${String(model)}:`,
        error,
      );
      throw this.handleDatabaseError(error);
    }
  }

  /**
   * Execute a safe INSERT query
   */
  static async create<T = any>(
    model: keyof PrismaClient,
    data: any,
  ): Promise<T> {
    try {
      this.sanitizeData(data);
      const result = await (prisma as any)[model].create({ data });
      return result;
    } catch (error) {
      logger.error(`Error in SafeQuery.create for ${String(model)}:`, error);
      throw this.handleDatabaseError(error);
    }
  }

  /**
   * Execute a safe UPDATE query
   */
  static async update<T = any>(
    model: keyof PrismaClient,
    where: any,
    data: any,
  ): Promise<T> {
    try {
      this.sanitizeWhereClause(where);
      this.sanitizeData(data);
      const result = await (prisma as any)[model].update({
        where,
        data,
      });
      return result;
    } catch (error) {
      logger.error(`Error in SafeQuery.update for ${String(model)}:`, error);
      throw this.handleDatabaseError(error);
    }
  }

  /**
   * Execute a safe DELETE query
   */
  static async delete<T = any>(
    model: keyof PrismaClient,
    where: any,
  ): Promise<T> {
    try {
      this.sanitizeWhereClause(where);
      const result = await (prisma as any)[model].delete({ where });
      return result;
    } catch (error) {
      logger.error(`Error in SafeQuery.delete for ${String(model)}:`, error);
      throw this.handleDatabaseError(error);
    }
  }

  /**
   * Execute a raw SQL query with parameterized inputs
   */
  static async raw<T = any>(query: string, values: any[] = []): Promise<T[]> {
    try {
      // Validate the query doesn't contain potential SQL injection patterns
      this.validateRawQuery(query);

      // Use Prisma's $queryRaw with parameterized inputs
      const result = await prisma.$queryRawUnsafe<T[]>(query, ...values);
      return result;
    } catch (error) {
      logger.error("Error in SafeQuery.raw:", error);
      throw this.handleDatabaseError(error);
    }
  }

  /**
   * Sanitize WHERE clause to prevent SQL injection
   */
  private static sanitizeWhereClause(where: any): void {
    if (!where) {
      return;
    }

    // Check for potential SQL injection in where clause
    const whereString = JSON.stringify(where).toLowerCase();
    if (this.detectSqlInjection(whereString)) {
      throw new Error("Potential SQL injection detected in WHERE clause");
    }
  }

  /**
   * Sanitize data before insert/update
   */
  private static sanitizeData(data: any): void {
    if (!data) {
      return;
    }

    // Check for potential SQL injection in data
    const dataString = JSON.stringify(data).toLowerCase();
    if (this.detectSqlInjection(dataString)) {
      throw new Error("Potential SQL injection detected in data");
    }
  }

  /**
   * Validate raw SQL query for potential injection
   */
  private static validateRawQuery(query: string): void {
    // Check for common SQL injection patterns
    const injectionPatterns = [
      /\b(?:drop\s+table|delete\s+from|truncate\s+table|insert\s+into|update\s+\w+\s+set|delete\s+from)\b/i,
      /\b(?:union\s+select|select\s+\*\s+from|select\s+\w+\s+from\s+\w+\s+where\s+\d+\s*=\s*\d+)/i,
      /\b(?:exec\s*\(|execute\s+immediate|sp_executesql)/i,
      /--|\/\*|\*\/|;\s*$/, // Comments and statement terminators
      /\b(?:xp_|sp_|sys\.|information_schema\.|pg_)/i, // Dangerous procedures/tables
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(query)) {
        throw new Error(`Potential SQL injection detected in query: ${query}`);
      }
    }
  }

  /**
   * Detect potential SQL injection in a string
   */
  private static detectSqlInjection(input: string): boolean {
    const sqlInjectionPatterns = [
      /(['";]+|\\{2,}|\/\*[\s\S]*?\*\/|--[^\r\n]*|#.*$)/i,
      /\b(?:select|insert|update|delete|drop|truncate|union|exec|execute|call|declare|create|alter|grant|revoke)\b/i,
      /\b(?:from|where|group by|having|order by|limit|offset|into|values|set)\b/i,
      /\b(?:and|or|not|in|between|like|is|null|exists|all|any|some)\b/i,
      /[;'"`]+\s*\w+\s*[=<>!]+/i,
      /\b(?:0x[0-9a-f]+|char\(|concat\()/i,
    ];

    return sqlInjectionPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Handle database errors consistently
   */
  private static handleDatabaseError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      switch (error.code) {
        case "P2002":
          return new Error("Unique constraint violation");
        case "P2025":
          return new Error("Record not found");
        case "P2016":
          return new Error("Inconsistent query result");
        default:
          return new Error(`Database error: ${error.message}`);
      }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      return new Error("Validation error: " + error.message);
    } else if (error instanceof Error) {
      return error;
    } else {
      return new Error("An unknown database error occurred");
    }
  }

  /**
   * Create a transaction
   */
  static async transaction<T>(
    callback: (
      tx: Omit<
        PrismaClient,
        "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
      >,
    ) => Promise<T>,
  ): Promise<T> {
    return await prisma.$transaction(callback);
  }
}

// Export a singleton instance
export const db = new SafeQuery();

// Export Prisma client for complex queries
export { prisma };
