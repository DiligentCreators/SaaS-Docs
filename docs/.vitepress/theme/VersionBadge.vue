<template>
  <div class="version-badge" aria-label="Latest stable version v1.0">
    <span class="version-badge__label">Latest Stable</span>
    <span class="version-badge__version">v1.0</span>
  </div>
</template>

<style scoped>
.version-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--vp-c-brand-soft);
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  font-size: 0.8rem;
  line-height: 1.4;
}

.version-badge__label {
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.version-badge__version {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}
</style>
