const statusEl = document.getElementById('status');
const gridEl = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const reloadBtn = document.getElementById('reloadBtn');
const cardTemplate = document.getElementById('cardTemplate');

let allCharacters = [];

function setStatus(text) {
  statusEl.textContent = text;
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`请求失败：${res.status}`);
  return res.json();
}

function proxiedImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/800x600?text=No+Image';
  const cleaned = url.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(cleaned)}&w=900&output=webp`;
}

function renderCards(characters) {
  gridEl.innerHTML = '';

  if (!characters.length) {
    const empty = document.createElement('p');
    empty.textContent = '没有找到符合条件的人物。';
    gridEl.appendChild(empty);
    return;
  }

  const frag = document.createDocumentFragment();

  for (const c of characters) {
    const node = cardTemplate.content.cloneNode(true);
    const img = node.querySelector('.avatar');
    const name = node.querySelector('.name');
    const intro = node.querySelector('.intro');
    const source = node.querySelector('.source');

    img.src = proxiedImageUrl(c.image);
    img.alt = `${c.name} 图片`;
    name.textContent = c.name;
    intro.textContent = c.intro.slice(0, 180);
    source.href = c.url;
    source.textContent = '查看原文';

    frag.appendChild(node);
  }

  gridEl.appendChild(frag);
}

function applySearch() {
  const q = normalizeText(searchInput.value);
  if (!q) {
    renderCards(allCharacters);
    setStatus(`共 ${allCharacters.length} 位人物`);
    return;
  }

  const filtered = allCharacters.filter((c) => {
    return normalizeText(c.name).includes(q) || normalizeText(c.intro).includes(q);
  });

  renderCards(filtered);
  setStatus(`搜索结果：${filtered.length} / ${allCharacters.length}`);
}

async function loadAll() {
  try {
    setStatus('正在加载人物数据...');
    allCharacters = await fetchJson('./characters.json');
    renderCards(allCharacters);
    setStatus(`加载完成：共 ${allCharacters.length} 位人物`);
  } catch (err) {
    console.error(err);
    setStatus('加载失败：本地数据文件读取失败，请稍后重试。');
  }
}

searchInput.addEventListener('input', applySearch);
reloadBtn.addEventListener('click', loadAll);

loadAll();
