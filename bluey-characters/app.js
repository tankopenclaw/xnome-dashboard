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

async function getCharacterTitles() {
  const titles = [];
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
      if (m?.title && !m.title.includes('Category:') && !m.title.includes('Template:')) {
        titles.push(m.title);
      }
    }

    cmcontinue = data?.continue?.cmcontinue || '';
  } while (cmcontinue);

  return [...new Set(titles)].sort((a, b) => a.localeCompare(b));
}

async function getCharacterDetails(titles) {
  const batchSize = 20;
  const details = [];

  for (let i = 0; i < titles.length; i += batchSize) {
    const batch = titles.slice(i, i + batchSize);
    const params = new URLSearchParams({
      action: 'query',
      prop: 'extracts|pageimages|info',
      exintro: '1',
      explaintext: '1',
      inprop: 'url',
      piprop: 'thumbnail',
      pithumbsize: '500',
      titles: batch.join('|'),
      format: 'json',
      origin: '*',
    });

    const data = await fetchJson(`${WIKI_BASE}/api.php?${params.toString()}`);
    const pages = Object.values(data?.query?.pages || {});

    for (const page of pages) {
      if (page.missing) continue;
      details.push({
        name: page.title,
        intro: (page.extract || '暂无简介。').replace(/\s+/g, ' ').trim(),
        image: page.thumbnail?.source || 'https://via.placeholder.com/800x600?text=No+Image',
        url: page.fullurl || `${WIKI_BASE}/wiki/${encodeURIComponent(page.title)}`,
      });
    }

    setStatus(`已加载 ${Math.min(i + batch.length, titles.length)} / ${titles.length} 人物...`);
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
    const titles = await getCharacterTitles();
    setStatus(`找到 ${titles.length} 个条目，正在获取详情...`);

    allCharacters = await getCharacterDetails(titles);
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
