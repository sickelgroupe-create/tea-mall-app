// Presentation only: never change the stored order title or SKU specification.
export function additionalProductSpec(name, spec) {
  const label = String(spec || "").trim();
  if (!label) return "";
  const title = String(name || "").trim();
  const normalizedSpec = label.replace(/\s+/g, "");
  const escapedSpec = Array.from(normalizedSpec, char => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*");
  for (const [suffix, wrapped] of [[escapedSpec, false], [`（\\s*${escapedSpec}\\s*）`, true], [`\\(\\s*${escapedSpec}\\s*\\)`, true]]) {
    const match = title.match(new RegExp(suffix + "$", "i"));
    if (!match) continue;
    const previous = title.charAt(match.index - 1);
    // 1100g is not a duplicate of 100g; do not remove a different SKU spec.
    if (wrapped || !/^[a-z0-9.]/i.test(normalizedSpec) || !/[a-z0-9.]/i.test(previous)) return "";
  }
  return label;
}

export function productLabel(name, spec) {
  return [String(name || "").trim(), additionalProductSpec(name, spec)].filter(Boolean).join(" ");
}
