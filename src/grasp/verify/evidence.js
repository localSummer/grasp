export function buildEvidence(base = {}) {
  return {
    hint_id: base.hint_id ?? null,
    action: base.action ?? null,
    url: base.url ?? null,
    page_title: base.page_title ?? null,
    dom_revision: base.dom_revision ?? null,
    active_hint: base.active_hint ?? null,
    summary_excerpt: base.summary_excerpt ?? null,
    page_role: base.page_role ?? null,
    grasp_confidence: base.grasp_confidence ?? null,
    reacquired: base.reacquired ?? null,
    details: base.details ?? null,
  };
}

export async function capturePageEvidence(page, state, overrides = {}) {
  let title = null;
  let summaryExcerpt = null;
  try {
    title = await page.title();
  } catch {}

  try {
    summaryExcerpt = await page.evaluate(() =>
      document.body?.innerText?.replace(/\s+/g, ' ').trim().slice(0, 240) ?? ''
    );
  } catch {}

  return buildEvidence({
    url: page?.url?.() ?? null,
    page_title: title,
    dom_revision: state?.pageState?.domRevision ?? null,
    page_role: state?.pageState?.currentRole ?? null,
    grasp_confidence: state?.pageState?.graspConfidence ?? null,
    reacquired: state?.pageState?.reacquired ?? null,
    ...overrides,
    summary_excerpt: overrides.summary_excerpt ?? summaryExcerpt,
  });
}
