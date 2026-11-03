const preview = document.createElement('dialog');
preview.setAttribute('aria-label', '图片预览');
preview.style.cssText = 'border:0;padding:0;background:transparent;max-width:95vw;max-height:94vh;overflow:visible';
preview.innerHTML = '<img style="display:block;max-width:92vw;max-height:88vh;object-fit:contain"><button aria-label="关闭图片预览" style="position:absolute;top:4px;right:4px;background:#fff;color:#111;border:0;border-radius:50%;width:36px;height:36px;font-size:24px;cursor:pointer">×</button>';
document.body.append(preview);
const style = document.createElement('style');
style.textContent = 'img[data-previewable]{cursor:zoom-in} dialog::backdrop{background:rgba(0,0,0,.85)}';
document.head.append(style);
const enlarged = preview.querySelector('img');
preview.querySelector('button').onclick = () => preview.close();
preview.onclick = event => { if (event.target === preview) preview.close(); };
for (const img of document.images) {
  if (img === enlarged) continue;
  img.dataset.previewable = '';
  img.tabIndex = 0;
  const open = () => {
    enlarged.src = img.currentSrc || img.src;
    enlarged.alt = img.alt;
    preview.showModal();
  };
  img.addEventListener('click', open);
  img.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });
}
