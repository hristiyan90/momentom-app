export function makeExplainabilityId() { 
  return 'xpl_' + Math.random().toString(36).slice(2, 10); 
}

export function traceInfo(explainability_id: string, event: string, fields: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.info(JSON.stringify({ explainability_id, event, ...fields }));
}
