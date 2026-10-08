/* ==================== State ==================== */
const state = {
  subjectsIndex: [],
  cache: {},           // key -> subject data
  currentSubject: null,
  currentMode: null,   // 'quiz' | 'study'
  quiz: { order: [], i: 0, score: 0, answers: [], answered: false },
  study: { order: [], i: 0 },
};

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

/* ==================== Progress (localStorage) ==================== */
const PROG_KEY = 'prepdesk_progress_v1';
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROG_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveProgress(p) { localStorage.setItem(PROG_KEY, JSON.stringify(p)); }
function markAttempt(subjectKey, qid, correct) {
  const p = loadProgress();
  p[subjectKey] = p[subjectKey] || {};
  p[subjectKey][qid] = { correct, ts: Date.now() };
  saveProgress(p);
}
function subjectProgressPct(key, total) {
  const p = loadProgress();
  const done = p[key] ? Object.keys(p[key]).length : 0;
  return total ? Math.min(100, Math.round((done / total) * 100)) : 0;
}
function overallStats() {
  const p = loadProgress();
  let attempted = 0, correct = 0;
  Object.values(p).forEach(subj => {
    Object.values(subj).forEach(a => { attempted++; if (a.correct) correct++; });
  });
  return { attempted, correct };
}

/* ==================== Theme ==================== */
function initTheme() {
  const saved = localStorage.getItem('prepdesk_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('prepdesk_theme', next);
}

/* ==================== Data loading ==================== */
async function loadIndex() {
  const res = await fetch('data/index.json');
  state.subjectsIndex = await res.json();
}
async function loadSubject(key) {
  if (state.cache[key]) return state.cache[key];
  const res = await fetch(`data/${key}.json`);
  const data = await res.json();
  state.cache[key] = data;
  return data;
}

/* ==================== Markdown-lite renderer ==================== */
function renderInline(text) {
  let t = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}
function renderExplainBody(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  let html = '';
  let buffer = [];
  let bufferType = null; // 'ul' | 'ol'

  function flush() {
    if (!buffer.length) return;
    const tag = bufferType === 'ol' ? 'ol' : 'ul';
    html += `<${tag}>` + buffer.map(l => `<li>${renderInline(l)}</li>`).join('') + `</${tag}>`;
    buffer = []; bufferType = null;
  }

  for (const line of lines) {
    if (line.startsWith('- ')) {
      if (bufferType && bufferType !== 'ul') flush();
      bufferType = 'ul';
      buffer.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      if (bufferType && bufferType !== 'ol') flush();
      bufferType = 'ol';
      buffer.push(line.replace(/^\d+\.\s/, ''));
    } else {
      flush();
      html += `<p style="margin:0 0 6px">${renderInline(line)}</p>`;
    }
  }
  flush();
  return html;
}
function renderSections(sections) {
  return sections.map(s => `
    <div class="explain-section">
      <div class="explain-label ${s.label.toLowerCase()}">${s.label}</div>
      <div class="explain-body">${renderExplainBody(s.content)}</div>
    </div>
  `).join('');
}

/* ==================== Router ==================== */
function show(viewId) {
  $$('.view').forEach(v => v.classList.remove('active'));
  $(`#${viewId}`).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

async function goHome() {
  renderHome();
  show('view-home');
  location.hash = '';
}

async function goSubject(key) {
  state.currentSubject = await loadSubject(key);
  renderSubjectDetail();
  show('view-subject');
  location.hash = `subject/${key}`;
}

async function goQuiz(key, resume = false) {
  state.currentSubject = state.currentSubject && state.currentSubject.key === key ? state.currentSubject : await loadSubject(key);
  startQuiz();
  show('view-quiz');
  location.hash = `quiz/${key}`;
}

async function goStudy(key) {
  state.currentSubject = state.currentSubject && state.currentSubject.key === key ? state.currentSubject : await loadSubject(key);
  startStudy();
  show('view-study');
  location.hash = `study/${key}`;
}

window.addEventListener('hashchange', handleHash);
async function handleHash() {
  const hash = location.hash.replace('#', '');
  if (!hash) { renderHome(); show('view-home'); return; }
  const [route, key] = hash.split('/');
  if (route === 'subject' && key) return goSubject(key);
  if (route === 'quiz' && key) return goQuiz(key);
  if (route === 'study' && key) return goStudy(key);
  renderHome(); show('view-home');
}

/* ==================== Home ==================== */
function renderHome() {
  const grid = $('#subject-grid');
  const { attempted, correct } = overallStats();
  const totalQ = state.subjectsIndex.reduce((a, s) => a + s.count, 0);
  $('#hero-stat').innerHTML = `<b>${totalQ}</b> questions &middot; <b>${state.subjectsIndex.length}</b> subjects &middot; <b>${attempted}</b> attempted`;
  const miniEl = $('#hero-stat-mini');
  if (miniEl) miniEl.innerHTML = `<b>${correct}</b>/${attempted || 0} correct`;

  // OMR strip decoration
  const omr = $('#omr-strip');
  omr.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const b = document.createElement('div');
    b.className = 'omr-bubble' + (Math.random() < (attempted ? Math.min(0.9, attempted / totalQ + 0.15) : 0.12) ? ' filled' : '');
    omr.appendChild(b);
  }

  grid.innerHTML = state.subjectsIndex.map(s => {
    const pct = subjectProgressPct(s.key, s.count);
    return `
    <div class="subject-card" style="--card-color:${s.color}" onclick="goSubject('${s.key}')">
      <div class="tab-index">SUBJECT · ${s.count} Qs</div>
      <h3>${s.title}</h3>
      <div class="meta"><span>${pct}% attempted</span><span class="count">${s.count}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%; --card-color:${s.color}"></div></div>
    </div>`;
  }).join('');
}

/* ==================== Subject detail (mode select) ==================== */
function renderSubjectDetail() {
  const s = state.currentSubject;
  $('#subject-detail').innerHTML = `
    <div class="back-link" onclick="goHome()">&larr; All subjects</div>
    <div class="subject-hero">
      <div class="swatch" style="background:${s.color}"></div>
      <div>
        <h2>${s.title}</h2>
        <p>${s.count} questions &middot; theory, worked steps &amp; explained answers</p>
      </div>
    </div>
    <div class="mode-grid">
      <div class="mode-card" onclick="goQuiz('${s.key}')">
        <div class="mode-icon">&#9673;</div>
        <h3>Quiz Mode</h3>
        <p>Answer multiple-choice questions, get instant feedback, and see the full explanation after each one.</p>
      </div>
      <div class="mode-card" onclick="goStudy('${s.key}')">
        <div class="mode-icon">&#9636;</div>
        <h3>Study Mode</h3>
        <p>Flip through questions like flashcards &mdash; reveal the theory, step-by-step working, and answer at your own pace.</p>
      </div>
    </div>
  `;
}

/* ==================== Quiz Mode ==================== */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  const s = state.currentSubject;
  state.quiz = {
    order: shuffle(s.questions.map((_, i) => i)),
    i: 0, score: 0, answers: [], answered: false
  };
  renderQuiz();
}

function currentQuizQuestion() {
  const s = state.currentSubject;
  const idx = state.quiz.order[state.quiz.i];
  return s.questions[idx];
}

function renderQuiz() {
  const s = state.currentSubject;
  const total = state.quiz.order.length;
  const q = currentQuizQuestion();

  $('#quiz-title').textContent = s.title;
  $('#quiz-progress-fill').style.width = `${(state.quiz.i / total) * 100}%`;
  $('#quiz-score').innerHTML = `Score: <b>${state.quiz.score}</b> / ${state.quiz.i}`;
  $('#quiz-count').textContent = `Question ${state.quiz.i + 1} of ${total}`;

  $('#q-text').textContent = q.question;
  $('#options').innerHTML = q.options.map((opt, i) => `
    <div class="option" data-opt="${i}" onclick="selectOption(${i})">
      <div class="bubble">${String.fromCharCode(65 + i)}</div>
      <div>${renderInline(opt)}</div>
    </div>
  `).join('');

  $('#explain-panel').classList.remove('show');
  $('#explain-panel').innerHTML = '';
  $('#quiz-next').disabled = true;
  $('#quiz-next').textContent = state.quiz.i === total - 1 ? 'Finish →' : 'Next question →';
  state.quiz.answered = false;
}

function selectOption(i) {
  if (state.quiz.answered) return;
  const s = state.currentSubject;
  const q = currentQuizQuestion();
  const correctIdx = q.options.indexOf(q.answer);
  const opts = $$('.option');
  const isCorrect = i === correctIdx;

  opts.forEach((el, idx) => {
    el.classList.add('disabled');
    if (idx === correctIdx) el.classList.add('correct');
    if (idx === i && idx !== correctIdx) el.classList.add('incorrect');
    if (idx === i) el.classList.add('selected');
  });

  if (isCorrect) state.quiz.score++;
  state.quiz.answered = true;
  state.quiz.answers.push({ q, correct: isCorrect, chosen: q.options[i] });
  markAttempt(s.key, q.id, isCorrect);
  updateHeaderStat();

  $('#quiz-score').innerHTML = `Score: <b>${state.quiz.score}</b> / ${state.quiz.i + 1}`;
  const panel = $('#explain-panel');
  panel.innerHTML = renderSections(q.sections);
  panel.classList.add('show');
  $('#quiz-next').disabled = false;
}

function nextQuizQuestion() {
  const total = state.quiz.order.length;
  if (state.quiz.i < total - 1) {
    state.quiz.i++;
    renderQuiz();
  } else {
    renderResults();
    show('view-results');
  }
}

function renderResults() {
  const total = state.quiz.order.length;
  const pct = Math.round((state.quiz.score / total) * 100);
  $('#results-score').textContent = `${state.quiz.score}/${total}`;
  $('#results-pct').textContent = `${pct}% correct`;

  const wrong = state.quiz.answers.filter(a => !a.correct);
  const reviewEl = $('#review-list');
  if (wrong.length === 0) {
    reviewEl.innerHTML = `<p style="text-align:center;color:var(--graphite)">Perfect run — no questions to review. 🎯</p>`;
  } else {
    reviewEl.innerHTML = `<div class="section-label" style="margin-top:8px">Review (${wrong.length} missed)</div>` +
      wrong.map(a => `
        <div class="review-item">
          <div class="rq">${renderInline(a.q.question)}</div>
          <div class="ra wrong">Your answer: ${renderInline(a.chosen)}</div>
          <div class="ra right">Correct: ${renderInline(a.q.answer)}</div>
        </div>
      `).join('');
  }
}

/* ==================== Study Mode ==================== */
function startStudy() {
  const s = state.currentSubject;
  state.study = { order: s.questions.map((_, i) => i), i: 0 };
  renderStudy();
}
function currentStudyQuestion() {
  const s = state.currentSubject;
  return s.questions[state.study.order[state.study.i]];
}
function renderStudy() {
  const s = state.currentSubject;
  const q = currentStudyQuestion();
  const total = state.study.order.length;

  $('#study-title').textContent = s.title;
  $('#study-meta').textContent = `Card ${state.study.i + 1} of ${total}`;

  const card = $('#flashcard');
  card.classList.remove('revealed');
  $('#fc-question').textContent = q.question;
  $('#fc-answer-area').innerHTML = renderSections(q.sections);

  $('#study-prev').disabled = state.study.i === 0;
  $('#study-next').textContent = state.study.i === total - 1 ? 'Restart deck ↺' : 'Next card →';
}
function flipCard() {
  $('#flashcard').classList.toggle('revealed');
}
function studyNext() {
  const total = state.study.order.length;
  if (state.study.i < total - 1) { state.study.i++; }
  else { state.study.i = 0; state.study.order = shuffle(state.study.order); }
  renderStudy();
}
function studyPrev() {
  if (state.study.i > 0) { state.study.i--; renderStudy(); }
}

/* ==================== Search ==================== */
let searchIndex = null;
async function buildSearchIndex() {
  if (searchIndex) return searchIndex;
  searchIndex = [];
  for (const meta of state.subjectsIndex) {
    const data = await loadSubject(meta.key);
    data.questions.forEach(q => {
      searchIndex.push({ subject: data.title, subjectKey: data.key, question: q.question, answer: q.answer, id: q.id });
    });
  }
  return searchIndex;
}
async function handleSearchInput(e) {
  const term = e.target.value.trim().toLowerCase();
  const resultsEl = $('#search-results');
  if (term.length < 2) { resultsEl.classList.remove('show'); return; }
  const idx = await buildSearchIndex();
  const matches = idx.filter(item =>
    item.question.toLowerCase().includes(term) || item.answer.toLowerCase().includes(term)
  ).slice(0, 12);

  if (matches.length === 0) {
    resultsEl.innerHTML = `<div class="search-result-item" style="color:var(--graphite)">No matches found.</div>`;
  } else {
    resultsEl.innerHTML = matches.map(m => `
      <div class="search-result-item" onclick="goSubject('${m.subjectKey}')">
        <span class="tag">${m.subject}</span>${escapeHtml(m.question).slice(0, 110)}${m.question.length > 110 ? '…' : ''}
      </div>
    `).join('');
  }
  resultsEl.classList.add('show');
}
function escapeHtml(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ==================== Header stat (updates on every view) ==================== */
function updateHeaderStat() {
  const { attempted, correct } = overallStats();
  const el = $('#hero-stat-mini');
  if (el) el.innerHTML = `<b>${correct}</b>/${attempted} correct`;
}

/* ==================== Init ==================== */
async function init() {
  initTheme();
  await loadIndex();
  updateHeaderStat();
  await handleHash();

  $('#theme-toggle').addEventListener('click', toggleTheme);
  $('#search-input').addEventListener('input', handleSearchInput);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) $('#search-results').classList.remove('show');
  });
  $('#quiz-next').addEventListener('click', nextQuizQuestion);
  $('#flashcard').addEventListener('click', flipCard);
  $('#study-next').addEventListener('click', studyNext);
  $('#study-prev').addEventListener('click', studyPrev);
  $('#retry-quiz').addEventListener('click', () => goQuiz(state.currentSubject.key));
  $('#back-home-results').addEventListener('click', goHome);
}

document.addEventListener('DOMContentLoaded', init);
