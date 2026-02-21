const statusEl = document.getElementById('status');
const gridEl = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const reloadBtn = document.getElementById('reloadBtn');
const cardTemplate = document.getElementById('cardTemplate');

const WIKI_BASE = 'https://blueypedia.fandom.com';

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

async function getCharacterEntries() {
  const entries = [];
  let cmcontinue = '';

  do {
    const params = new URLSearchParams({
      action: 'query',
      list: 'categorymembers',
      cmtitle: 'Category:Characters',
      cmlimit: '500',
      format: 'json',
      origin: '*',
    });

    if (cmcontinue) params.set('cmcontinue', cmcontinue);

    const data = await fetchJson(`${WIKI_BASE}/api.php?${params.toString()}`);
    const members = data?.query?.categorymembers || [];

    for (const m of members) {
      if (m?.title && m?.pageid && !m.title.includes('Category:') && !m.title.includes('Template:')) {
        entries.push({ id: m.pageid, title: m.title });
      }
    }

    cmcontinue = data?.continue?.cmcontinue || '';
  } while (cmcontinue);

  const map = new Map();
  for (const e of entries) map.set(e.id, e);
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
}

async function getCharacterDetails(entries) {
  const batchSize = 50;
  const details = [];

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const ids = batch.map((x) => x.id).join(',');

    const params = new URLSearchParams({
      ids,
      abstract: '500',
      width: '700',
      height: '700',
    });

    const data = await fetchJson(`${WIKI_BASE}/api/v1/Articles/Details?${params.toString()}`);
    const items = Object.values(data?.items || {});

    for (const item of items) {
      if (!item?.id || item?.ns !== 0) continue;
      details.push({
        name: item.title,
        intro: (item.abstract || '暂无简介。').replace(/\s+/g, ' ').trim(),
        image: item.thumbnail || 'https://via.placeholder.com/800x600?text=No+Image',
        url: item.full_url || `${WIKI_BASE}${item.url || ''}`,
      });
    }

    setStatus(`已加载 ${Math.min(i + batch.length, entries.length)} / ${entries.length} 人物...`);
  }

  return details.sort((a, b) => a.name.localeCompare(b.name));
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
    setStatus('正在获取人物列表...');
    const entries = await getCharacterEntries();
    setStatus(`找到 ${entries.length} 个条目，正在获取详情...`);

    allCharacters = await getCharacterDetails(entries);
    renderCards(allCharacters);
    setStatus(`加载完成：共 ${allCharacters.length} 位人物`);
  } catch (err) {
    console.error(err);
    setStatus('加载失败：可能是来源站点限制了浏览器请求，请稍后重试。');
  }
}

searchInput.addEventListener('input', applySearch);
reloadBtn.addEventListener('click', loadAll);

loadAll();
