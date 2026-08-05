import type { SubscriptionDto } from '../../types/dto/SubscriptionDto';
import type {
  SubscriptionStatus,
  SubscriptionStatusType,
  SubscriptionSourceType,
} from '../../types/domain/Subscription';
import { MappingError } from './MappingError';

const DTO_NAME = 'SubscriptionDto';

const VALID_STATUSES: ReadonlySet<string> = new Set(['active', 'inactive']);
const VALID_SOURCES: ReadonlySet<string> = new Set(['entitlement', 'legacy_membership']);

function assertSubscriptionStatus(value: string): SubscriptionStatusType {
  if (!VALID_STATUSES.has(value)) {
    throw new MappingError(
      'status',
      `Invalid subscription status: "${value}". Expected "active" or "inactive".`,
      DTO_NAME,
    );
  }
  return value as SubscriptionStatusType;
}

function assertSubscriptionSource(value: string | null): SubscriptionSourceType | null {
  if (value === null) {
    return null;
  }
  if (!VALID_SOURCES.has(value)) {
    throw new MappingError(
      'source',
      `Invalid subscription source: "${value}". Expected "entitlement" or "legacy_membership".`,
      DTO_NAME,
    );
  }
  return value as SubscriptionSourceType;
}

/**
 * Pure mapper: converts a SubscriptionDto (snake_case transport) into
 * a SubscriptionStatus domain model (camelCase).
 *
 * Validates the status enum and source union type explicitly.
 * Nullable fields (source, plan fields, provider, valid_until) are preserved.
 */
export const SubscriptionMapper = {
  fromDto(dto: SubscriptionDto): SubscriptionStatus {
    if (dto === null || dto === undefined) {
      throw new MappingError('root', 'SubscriptionDto is null or undefined', DTO_NAME);
    }

    if (typeof dto.has_subscription !== 'boolean') {
      throw new MappingError(
        'has_subscription',
        `Expected boolean, got ${typeof dto.has_subscription}`,
        DTO_NAME,
      );
    }

    if (typeof dto.status !== 'string') {
      throw new MappingError(
        'status',
        `Expected string, got ${typeof dto.status}`,
        DTO_NAME,
      );
    }

    const status = assertSubscriptionStatus(dto.status);

    // source: nullable, validate if present
    if (dto.source !== null && dto.source !== undefined && typeof dto.source !== 'string') {
      throw new MappingError(
        'source',
        `Expected string or null, got ${typeof dto.source}`,
        DTO_NAME,
      );
    }
    const source = assertSubscriptionSource(dto.source ?? null);

    // plan: required object (nullable inner fields)
    if (dto.plan === null || dto.plan === undefined || typeof dto.plan !== 'object') {
      throw new MappingError(
        'plan',
        `Expected object, got ${typeof dto.plan}`,
        DTO_NAME,
      );
    }

    const planCode = dto.plan.code !== undefined ? dto.plan.code : null;
    const planName = dto.plan.name !== undefined ? dto.plan.name : null;

    // provider: nullable string
    if (dto.provider !== null && dto.provider !== undefined && typeof dto.provider !== 'string') {
      throw new MappingError(
        'provider',
        `Expected string or null, got ${typeof dto.provider}`,
        DTO_NAME,
      );
    }

    // valid_until: nullable string (ISO-8601)
    if (
      dto.valid_until !== null &&
      dto.valid_until !== undefined &&
      typeof dto.valid_until !== 'string'
    ) {
      throw new MappingError(
        'valid_until',
        `Expected ISO-8601 string or null, got ${typeof dto.valid_until}`,
        DTO_NAME,
      );
    }

    return {
      hasSubscription: dto.has_subscription,
      status,
      source,
      plan: {
        code: planCode,
        name: planName,
      },
      provider: dto.provider ?? null,
      validUntil: dto.valid_until ?? null,
    };
  },
};
