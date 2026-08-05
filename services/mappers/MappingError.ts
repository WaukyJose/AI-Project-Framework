/**
 * Structured error thrown when a transport DTO fails validation
 * during mapping. Carries the offending field and DTO name for
 * precise debugging.
 */
export class MappingError extends Error {
  public readonly name = 'MappingError';

  constructor(
    public readonly field: string,
    message: string,
    public readonly dtoName: string,
  ) {
    super(`[${dtoName}] ${field}: ${message}`);
  }
}
