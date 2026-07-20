const input = document.querySelector('[data-catalog-search]');
const rows = [...document.querySelectorAll('[data-dataset]')];
const count = document.querySelector('[data-results-count]');

if (input && count) {
  const update = () => {
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;

    for (const row of rows) {
      const matches = !query || row.dataset.search.includes(query);
      row.hidden = !matches;
      if (matches) visible += 1;
    }

    count.textContent = `${visible} of ${rows.length} datasets`;
  };

  input.addEventListener('input', update);
  update();
}
