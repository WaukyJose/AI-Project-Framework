function safeSerialize(payload: Record<string, unknown>) {
  return JSON.stringify(payload, (_, value) => {
    if (typeof value === 'string' && value.length > 256) {
      return `${value.slice(0, 256)}…`;
    }

    return value;
  });
}

function log(level: 'error' | 'info' | 'warn', event: string, payload: Record<string, unknown>) {
  if (!__DEV__) {
    return;
  }

  const message = safeSerialize({
    event,
    level,
    timestamp: new Date().toISOString(),
    ...payload,
  });

  if (level === 'error') {
    console.error(message);
    return;
  }

  if (level === 'warn') {
    console.warn(message);
    return;
  }

  console.info(message);
}

export const logger = {
  error: (event: string, payload: Record<string, unknown>) => log('error', event, payload),
  info: (event: string, payload: Record<string, unknown>) => log('info', event, payload),
  warn: (event: string, payload: Record<string, unknown>) => log('warn', event, payload),
};
