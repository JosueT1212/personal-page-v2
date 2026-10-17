const dlg = document.getElementById('lightbox') as HTMLDialogElement | null;
if (dlg) {
  const photos = [...document.querySelectorAll<HTMLButtonElement>('.ph')];
  const img = dlg.querySelector('img')!;
  const cap = dlg.querySelector('.lb-cap')!;
  let opener: HTMLButtonElement | null = null;
  let idx = 0;
  const show = (i: number) => {
    idx = (i + photos.length) % photos.length;
    const d = photos[idx].dataset;
    img.src = d.full!;
    img.alt = d.alt ?? '';
    cap.textContent = d.cap ?? '';
  };
  photos.forEach((b, i) =>
    b.addEventListener('click', () => {
      opener = b;
      show(i);
      dlg.showModal();
    }),
  );
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
  });
  dlg.querySelector('.lb-close')!.addEventListener('click', () => dlg.close());
  // click on backdrop (the dialog itself) closes
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => opener?.focus());
}
