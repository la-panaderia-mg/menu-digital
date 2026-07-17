const EMOJI_CATEGORIA = {
  'cafetería': '☕',
  'panificados': '🥐',
  'sandwiches': '🥪',
  'desayunos': '🍳',
  'bebidas': '🥤'
};

function getEmoji(nombre) {
  return EMOJI_CATEGORIA[nombre.toLowerCase()] || '🍞';
}

async function initMenu() {
  const nav = document.getElementById('catNav');
  const main = document.getElementById('menu');
  const igHandle = document.getElementById('igHandle');

  let data;
  try {
    const res = await fetch('menu.json', { cache: 'no-store' });
    data = await res.json();
  } catch (err) {
    main.innerHTML = '<p style="text-align:center;padding:40px 16px;">No pudimos cargar el menú. Probá recargar la página 🥐</p>';
    console.error('Error cargando menu.json:', err);
    return;
  }

  document.title = `${data.restaurante} · Menú`;
  if (igHandle) igHandle.textContent = data.instagram || '';

  data.categorias.forEach((cat, i) => {
    const slug = slugify(cat.nombre);

    // botón de navegación
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (i === 0 ? ' active' : '');
    btn.textContent = `${getEmoji(cat.nombre)} ${cat.nombre}`;
    btn.dataset.target = slug;
    btn.addEventListener('click', () => {
      document.getElementById(slug).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    nav.appendChild(btn);

    // sección de categoría
    const section = document.createElement('section');
    section.className = 'categoria';
    section.id = slug;

    section.innerHTML = `
      <div class="categoria-header">
        <span class="categoria-emoji" aria-hidden="true">${getEmoji(cat.nombre)}</span>
        <h2>${cat.nombre}</h2>
        <div class="categoria-linea"></div>
      </div>
      <div class="item-list">
        ${cat.items.map(renderItem).join('')}
      </div>
    `;
    main.appendChild(section);
  });

  setupScrollSpy();
}

function renderItem(item) {
  const precioTexto = item.precio && String(item.precio).trim() !== ''
    ? `$${item.precio}`
    : 'Consultar';
  const descripcion = item.descripcion
    ? `<div class="item-descripcion">${item.descripcion}</div>`
    : '';
  return `
    <div class="item">
      <span class="item-nombre">${item.nombre}</span>
      <span class="item-leader"></span>
      <span class="item-precio">${precioTexto}</span>
      ${descripcion}
    </div>
  `;
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

function setupScrollSpy() {
  const sections = document.querySelectorAll('.categoria');
  const buttons = document.querySelectorAll('.cat-btn');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        buttons.forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.cat-btn[data-target="${entry.target.id}"]`);
        if (activeBtn) {
          activeBtn.classList.add('active');
          activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    });
  }, { rootMargin: '-100px 0px -70% 0px', threshold: 0 });

  sections.forEach(sec => observer.observe(sec));
}

initMenu();