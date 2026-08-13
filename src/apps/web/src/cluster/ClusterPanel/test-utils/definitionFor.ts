/** Reads the `dd` that follows the `dt` with this label, so a spec asserts on the pairing. */
export const definitionFor = (container: HTMLElement, label: string) =>
  [...container.querySelectorAll("dt")].find(
    (term) => term.textContent === label,
  )?.nextElementSibling?.textContent;
