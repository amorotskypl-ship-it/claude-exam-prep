// ===== Main Application =====
const app = {
  currentPage: 'dashboard',
  state: {},

  init() {
    this.loadState();
    this.initTheme();
    this.initLang();
    this.bindNav();
    this.bindMenuToggle();
    this.render('dashboard');
    this.updateCountdown();
  },

  // ===== State Management =====
  loadState() {
    const saved = localStorage.getItem('claudeExamPrep');
    this.state = saved ? JSON.parse(saved) : {
      studiedTasks: [],
      quizHistory: [],
      flashcardRatings: {},
      studyPlan: {},
      examDate: null
    };
  },

  saveState() {
    localStorage.setItem('claudeExamPrep', JSON.stringify(this.state));
  },

  // ===== Theme =====
  initTheme() {
    const saved = localStorage.getItem('claudeExamTheme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    document.getElementById('themeToggle').addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('claudeExamTheme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('claudeExamTheme', 'light');
      }
    });
  },

  // ===== Language =====
  initLang() {
    this.updateLangUI();
    document.getElementById('langSwitcher').addEventListener('click', () => {
      const newLang = I18N.currentLang === 'en' ? 'ru' : 'en';
      I18N.setLang(newLang);
      this.updateLangUI();

        // Re-map active quiz questions to new language
        if (this.quizState.questions.length > 0) {
          const newQuestions = I18N.getQuestions();
          const qMap = {};
          newQuestions.forEach(q => { qMap[q.id] = q; });
          this.quizState.questions = this.quizState.questions.map(q => qMap[q.id] || q);
        }

        // Re-map active flashcards to new language
        if (this.flashcardState.cards.length > 0) {
          const newFlashcards = I18N.getFlashcards();
          const fcMap = {};
          newFlashcards.forEach(f => { fcMap[f.id] = f; });
          this.flashcardState.cards = this.flashcardState.cards.map(f => fcMap[f.id] || f);
        }

        // Capture UI state before re-render
        const scrollY = window.scrollY;
        const openDomains = [...document.querySelectorAll('.domain-header.open')].map(el => el.dataset.domain);
        const openDetails = [...document.querySelectorAll('.detail-section:not(.hidden)')].map(el => el.id.replace('detail-', ''));
        const openScenarios = [...document.querySelectorAll('.scenario-header.open')].map(el => el.dataset.scenario);
        const openResources = [...document.querySelectorAll('.resource-stage-header.open')].map(el => el.dataset.resourceStage);

        this.render(this.currentPage);
        this.updateCountdown();

        // Restore UI state after re-render
        openDomains.forEach(id => {
          const h = document.querySelector(`.domain-header[data-domain="${id}"]`);
          const b = document.querySelector(`[data-domain-body="${id}"]`);
          if (h) h.classList.add('open');
          if (b) b.classList.add('open');
        });
        openDetails.forEach(id => {
          const detail = document.getElementById('detail-' + id);
          const btn = document.querySelector(`[data-detail-id="${id}"]`);
          if (detail) detail.classList.remove('hidden');
          if (btn) btn.textContent = I18N.t('hideDetail');
        });
        openScenarios.forEach(id => {
          const h = document.querySelector(`.scenario-header[data-scenario="${id}"]`);
          const b = document.querySelector(`[data-scenario-body="${id}"]`);
          if (h) h.classList.add('open');
          if (b) b.classList.add('open');
        });
        openResources.forEach(id => {
          const h = document.querySelector(`.resource-stage-header[data-resource-stage="${id}"]`);
          const b = document.querySelector(`[data-resource-body="${id}"]`);
          if (h) h.classList.add('open');
          if (b) b.classList.add('open');
        });

        // Refresh study sub-nav if on study page
        if (this.currentPage === 'study') {
          this.updateStudySubNav(true);
        }

        window.scrollTo(0, scrollY);
    });
  },

  updateLangUI() {
    // Toggle track position: add ru-active class when Russian is selected
    const switcher = document.getElementById('langSwitcher');
    if (switcher) {
      switcher.classList.toggle('ru-active', I18N.currentLang === 'ru');
    }
    // Update sidebar nav labels
    const navMap = {
      dashboard: 'navDashboard',
      study: 'navStudy',
      quiz: 'navQuiz',
      flashcards: 'navFlashcards',
      reference: 'navReference',
      strategy: 'navStrategy'
    };
    document.querySelectorAll('.nav-link').forEach(link => {
      const page = link.dataset.page;
      if (page && navMap[page]) {
        const icon = link.querySelector('.nav-icon');
        const chevron = link.querySelector('.nav-chevron');
        const iconHTML = icon ? icon.outerHTML + ' ' : '';
        const chevronHTML = chevron ? ' ' + chevron.outerHTML : '';
        link.innerHTML = iconHTML + I18N.t(navMap[page]) + chevronHTML;
      }
    });
    // Update sidebar header
    const sidebarHeader = document.querySelector('.sidebar-header');
    if (sidebarHeader) {
      const h1 = sidebarHeader.querySelector('h1');
      const sub = sidebarHeader.querySelector('.subtitle');
      if (h1) h1.textContent = I18N.t('sidebarTitle');
      if (sub) sub.textContent = I18N.t('sidebarSubtitle');
    }
    // Update countdown label
    const countdownLabel = document.querySelector('.countdown-label');
    if (countdownLabel) countdownLabel.textContent = I18N.t('countdownLabel');
    // Update reset button
    const resetBtn = document.querySelector('.sidebar-footer .btn');
    if (resetBtn) resetBtn.textContent = I18N.t('resetProgress');
  },

  resetProgress() {
    if (confirm(I18N.t('resetConfirm'))) {
      localStorage.removeItem('claudeExamPrep');
      this.state = { studiedTasks: [], quizHistory: [], flashcardRatings: {}, studyPlan: {}, examDate: null };
      this.render(this.currentPage);
    }
  },

  // ===== Navigation =====
  bindNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        this.currentPage = page;
        this.render(page);
        // Show/hide study sub-nav
        this.updateStudySubNav(page === 'study');
        // Close mobile menu
        document.getElementById('sidebar').classList.remove('open');
      });
    });
  },

  // Build and manage the study guide sub-navigation
  updateStudySubNav(show) {
    const container = document.getElementById('studySubNav');
    const parentLi = document.querySelector('.nav-item-study');
    if (!container || !parentLi) return;

    if (!show) {
      parentLi.classList.remove('expanded');
      container.innerHTML = '';
      return;
    }

    const studyData = I18N.getStudyData();
    container.innerHTML = studyData.map(domain => `
      <li>
        <a class="nav-sub-link" data-domain-nav="${domain.id}">
          <span class="nav-sub-badge">D${domain.domain}</span>
          <span>${domain.title}</span>
        </a>
      </li>
    `).join('');

    parentLi.classList.add('expanded');

    // Bind sub-link clicks — scroll to domain and expand it
    container.querySelectorAll('.nav-sub-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const domainId = link.dataset.domainNav;
        // Highlight this sub-link
        container.querySelectorAll('.nav-sub-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        // Find the domain header and body in main content
        const header = document.querySelector(`.domain-header[data-domain="${domainId}"]`);
        const body = document.querySelector(`[data-domain-body="${domainId}"]`);
        if (header && body) {
          // Expand if not already
          if (!header.classList.contains('open')) {
            header.classList.add('open');
            body.classList.add('open');
          }
          // Scroll into view
          header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  },

  bindMenuToggle() {
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  },

  updateCountdown() {
    const days = this.state.examDate
      ? Math.max(0, Math.ceil((new Date(this.state.examDate) - new Date()) / 86400000))
      : 7;
    document.getElementById('daysLeft').textContent = days;
  },

  // ===== Render Router =====
  render(page) {
    const content = document.getElementById('content');
    switch (page) {
      case 'dashboard': content.innerHTML = this.renderDashboard(); this.bindDashboard(); break;
      case 'study': content.innerHTML = this.renderStudy(); this.bindStudy(); break;
      case 'quiz':
        if (this.quizState.questions.length > 0) {
          this.renderQuizQuestion();
        } else {
          content.innerHTML = this.renderQuizSetup(); this.bindQuizSetup();
        }
        break;
      case 'flashcards':
        if (this.flashcardState.cards.length > 0) {
          content.innerHTML = this.renderFlashcards(); this.bindFlashcards(true);
        } else {
          content.innerHTML = this.renderFlashcards(); this.bindFlashcards(false);
        }
        break;
      case 'reference': content.innerHTML = this.renderReference(); break;
      case 'strategy': content.innerHTML = this.renderStrategy(); this.bindStrategy(); break;
    }
    window.scrollTo(0, 0);
  },

  // ===== DASHBOARD =====
  renderDashboard() {
    const studyData = I18N.getStudyData();
    const questions = I18N.getQuestions();
    const flashcards = I18N.getFlashcards();
    const totalTasks = studyData.reduce((sum, d) => sum + d.tasks.length, 0);
    const studiedCount = this.state.studiedTasks.length;
    const studyPct = totalTasks > 0 ? Math.round((studiedCount / totalTasks) * 100) : 0;

    const totalQuestions = questions.length;
    const answered = this.state.quizHistory.length;
    const correct = this.state.quizHistory.filter(h => h.correct).length;
    const quizPct = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    const totalCards = flashcards.length;
    const ratedCards = Object.keys(this.state.flashcardRatings).length;
    const easyCards = Object.values(this.state.flashcardRatings).filter(r => r === 'easy').length;

    const domainScores = this.getDomainScores();

    return `
      <h2 class="page-title">${I18N.t('dashTitle')}</h2>
      <p class="page-subtitle">${I18N.t('dashSubtitle')}</p>

      <div class="grid grid-4">
        <div class="card stat-card">
          <span class="stat-number stat-accent">${studyPct}%</span>
          <span class="stat-label">${I18N.t('studyProgress')}</span>
          <div class="progress-bar"><div class="progress-fill accent" style="width:${studyPct}%"></div></div>
        </div>
        <div class="card stat-card">
          <span class="stat-number stat-green">${quizPct}%</span>
          <span class="stat-label">${I18N.t('quizAccuracy')} (${answered} ${I18N.t('answered')})</span>
          <div class="progress-bar"><div class="progress-fill green" style="width:${quizPct}%"></div></div>
        </div>
        <div class="card stat-card">
          <span class="stat-number stat-yellow">${ratedCards}/${totalCards}</span>
          <span class="stat-label">${I18N.t('flashcardsReviewed')}</span>
          <div class="progress-bar"><div class="progress-fill yellow" style="width:${totalCards > 0 ? (ratedCards/totalCards)*100 : 0}%"></div></div>
        </div>
        <div class="card stat-card">
          <span class="stat-number stat-blue">${studiedCount}/${totalTasks}</span>
          <span class="stat-label">${I18N.t('topicsStudied')}</span>
          <div class="progress-bar"><div class="progress-fill blue" style="width:${studyPct}%"></div></div>
        </div>
      </div>

      <div class="grid grid-2 mt-16">
        <div class="card">
          <div class="card-header">
            <span class="card-title">${I18N.t('domainReadiness')}</span>
            <span class="text-sm text-muted">${I18N.t('domainReadinessSub')}</span>
          </div>
          ${studyData.map(d => {
            const ds = domainScores[d.domain] || { correct: 0, total: 0 };
            const pct = ds.total > 0 ? Math.round((ds.correct / ds.total) * 100) : 0;
            const color = pct >= 80 ? 'green' : pct >= 50 ? 'yellow' : 'accent';
            return `
              <div class="domain-progress-item">
                <span class="domain-weight">${d.weight}%</span>
                <span class="domain-name">D${d.domain}: ${d.title}</span>
                <span class="domain-score">${pct}%</span>
                <div class="progress-bar" style="width:100px"><div class="progress-fill ${color}" style="width:${pct}%"></div></div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">${I18N.t('studyPlanTitle')}</span>
          </div>
          <div class="study-plan-meta">
            <a href="https://claudecertificationguide.com/diagnostic" target="_blank" rel="noopener noreferrer" class="study-plan-diagnostic">${I18N.t('diagnosticLink')}</a>
            <span class="text-muted text-sm">&mdash; ${I18N.t('diagnosticNote')}</span>
          </div>
          ${this.renderStudyPlanChecklist()}
          <div class="study-plan-meta mt-8">
            <span class="text-muted text-sm">${I18N.t('studyResourcesNote')}<a href="#" class="link-accent" data-nav="strategy">${I18N.t('studyResourcesLink')}</a>${I18N.t('studyResourcesIn')}</span>
          </div>
        </div>
      </div>
    `;
  },

  renderStudyPlanChecklist() {
    const dayKeys = ['day1','day2','day3','day4','day5','day6','day7'];
    const plan = dayKeys.map((key, i) => ({
      day: `${I18N.currentLang === 'ru' ? 'День' : 'Day'} ${i + 1}`,
      text: I18N.t(key),
      key
    }));

    return plan.map(p => {
      const done = this.state.studyPlan[p.key] || false;
      return `
        <div class="checklist-item ${done ? 'done' : ''}" data-plan-key="${p.key}">
          <div class="checklist-check">${done ? '&#10003;' : ''}</div>
          <div>
            <div class="checklist-text">${p.text}</div>
            <div class="checklist-day">${p.day}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  bindDashboard() {
    document.querySelectorAll('.checklist-item').forEach(item => {
      item.addEventListener('click', () => {
        const key = item.dataset.planKey;
        this.state.studyPlan[key] = !this.state.studyPlan[key];
        this.saveState();
        item.classList.toggle('done');
        const check = item.querySelector('.checklist-check');
        check.innerHTML = this.state.studyPlan[key] ? '&#10003;' : '';
      });
    });
    // Inline nav links
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.nav;
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const targetNav = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (targetNav) targetNav.classList.add('active');
        this.currentPage = page;
        this.render(page);
      });
    });
  },

  getDomainScores() {
    const scores = {};
    const questions = I18N.getQuestions();
    this.state.quizHistory.forEach(h => {
      const q = questions.find(q => q.id === h.questionId);
      if (q) {
        if (!scores[q.domain]) scores[q.domain] = { correct: 0, total: 0 };
        scores[q.domain].total++;
        if (h.correct) scores[q.domain].correct++;
      }
    });
    return scores;
  },

  // ===== STUDY GUIDE =====
  renderStudy() {
    const studyData = I18N.getStudyData();
    return `
      <h2 class="page-title">${I18N.t('studyTitle')}</h2>
      <p class="page-subtitle">${I18N.t('studySubtitle')}</p>
      ${studyData.map(domain => `
        <div class="domain-section">
          <div class="domain-header" data-domain="${domain.id}">
            <span class="domain-badge">${domain.domain}</span>
            <div class="domain-header-text">
              <div class="domain-header-title">${domain.title}</div>
              <div class="domain-header-weight">${domain.weight}% ${I18N.t('ofExam')} &middot; ${domain.tasks.length} ${I18N.t('taskStatements')}</div>
            </div>
            <span class="domain-toggle">&#9660;</span>
          </div>
          <div class="domain-body" data-domain-body="${domain.id}">
            ${domain.tasks.map(task => {
              const studied = this.state.studiedTasks.includes(task.id);
              return `
                <div class="task-block">
                  <div class="task-title">${task.title}</div>
                  <div class="section-label">${I18N.t('knowledgeOf')}</div>
                  <ul class="knowledge-list">
                    ${task.knowledge.map(k => `<li>${k}</li>`).join('')}
                  </ul>
                  <div class="section-label">${I18N.t('skillsIn')}</div>
                  <ul class="skill-list">
                    ${task.skills.map(s => `<li>${s}</li>`).join('')}
                  </ul>
                  ${task.keyPoint ? `<div class="key-point"><strong>${I18N.t('keyTakeaway')}</strong> ${task.keyPoint}</div>` : ''}
                  ${task.details ? `
                    <button class="detail-toggle" data-detail-id="${task.id}">${I18N.t('showDetail')}</button>
                    <div class="detail-section hidden" id="detail-${task.id}">${task.details}</div>
                  ` : ''}
                  <button class="mark-studied ${studied ? 'done' : ''}" data-task-id="${task.id}">
                    ${studied ? '&#10003; ' + I18N.t('studied') : I18N.t('markStudied')}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    `;
  },

  bindStudy() {
    document.querySelectorAll('.domain-header').forEach(header => {
      header.addEventListener('click', () => {
        const domainId = header.dataset.domain;
        const body = document.querySelector(`[data-domain-body="${domainId}"]`);
        header.classList.toggle('open');
        body.classList.toggle('open');
      });
    });

    document.querySelectorAll('.detail-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const detailId = btn.dataset.detailId;
        const detail = document.getElementById('detail-' + detailId);
        if (detail) {
          detail.classList.toggle('hidden');
          btn.textContent = detail.classList.contains('hidden') ? I18N.t('showDetail') : I18N.t('hideDetail');
        }
      });
    });

    document.querySelectorAll('.mark-studied').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        const idx = this.state.studiedTasks.indexOf(taskId);
        if (idx >= 0) {
          this.state.studiedTasks.splice(idx, 1);
          btn.classList.remove('done');
          btn.innerHTML = I18N.t('markStudied');
        } else {
          this.state.studiedTasks.push(taskId);
          btn.classList.add('done');
          btn.innerHTML = '&#10003; ' + I18N.t('studied');
        }
        this.saveState();
      });
    });
  },

  // ===== QUIZ =====
  quizState: { questions: [], current: 0, answers: {}, submitted: {} },

  renderQuizSetup() {
    const questions = I18N.getQuestions();
    const studyData = I18N.getStudyData();
    const lastScore = this.getLastQuizScore();
    return `
      <h2 class="page-title">${I18N.t('quizTitle')}</h2>
      <p class="page-subtitle">${I18N.t('quizSubtitle')}</p>
      <div class="card quiz-setup">
        <h3>${I18N.t('selectMode')}</h3>
        <p class="text-muted mt-8">${I18N.t('selectModeSub')}</p>
        <div class="quiz-options mt-16">
          <div class="quiz-option" data-quiz-domain="all">${I18N.t('allDomains')} (${questions.length})</div>
          ${studyData.map(d => {
            const count = questions.filter(q => q.domain === d.domain).length;
            return `<div class="quiz-option" data-quiz-domain="${d.domain}">D${d.domain}: ${d.title.split(' ')[0]} (${count})</div>`;
          }).join('')}
        </div>
        <p class="text-muted text-sm mt-16">${I18N.t('selectCount')}</p>
        <div class="quiz-options mt-8">
          <div class="quiz-option selected" data-quiz-count="10">10 ${I18N.t('questions')}</div>
          <div class="quiz-option" data-quiz-count="20">20 ${I18N.t('questions')}</div>
          <div class="quiz-option" data-quiz-count="all">${I18N.t('all')}</div>
        </div>
        <button class="btn mt-24" id="startQuiz">${I18N.t('startQuiz')}</button>
        ${lastScore !== null ? `<p class="text-muted text-sm mt-16">${I18N.t('lastScore')}: ${lastScore}%</p>` : ''}
      </div>
    `;
  },

  bindQuizSetup() {
    let selectedDomain = 'all';
    let selectedCount = 10;

    document.querySelectorAll('[data-quiz-domain]').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('[data-quiz-domain]').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedDomain = opt.dataset.quizDomain;
      });
    });

    document.querySelectorAll('[data-quiz-count]').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('[data-quiz-count]').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedCount = opt.dataset.quizCount;
      });
    });

    document.getElementById('startQuiz').addEventListener('click', () => {
      const questions = I18N.getQuestions();
      let pool = selectedDomain === 'all'
        ? [...questions]
        : questions.filter(q => q.domain === parseInt(selectedDomain));

      // Shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const count = selectedCount === 'all' ? pool.length : Math.min(parseInt(selectedCount), pool.length);
      this.quizState = { questions: pool.slice(0, count), current: 0, answers: {}, submitted: {} };
      this.renderQuizQuestion();
    });
  },

  renderQuizQuestion() {
    const content = document.getElementById('content');
    const { questions, current, answers, submitted } = this.quizState;

    if (current >= questions.length) {
      content.innerHTML = this.renderQuizResults();
      return;
    }

    const q = questions[current];
    const selected = answers[q.id];
    const isSubmitted = submitted[q.id];

    content.innerHTML = `
      <h2 class="page-title">${I18N.t('quizTitle')}</h2>
      <div class="quiz-progress">
        <span class="quiz-progress-text">${current + 1} / ${questions.length}</span>
        <div class="progress-bar" style="flex:1"><div class="progress-fill accent" style="width:${((current + 1) / questions.length) * 100}%"></div></div>
      </div>
      <div class="quiz-question-card">
        <div class="quiz-scenario"><strong>${I18N.t('scenario')}</strong> ${q.scenario}</div>
        <div class="quiz-question-text">${q.question}</div>
        <div class="quiz-answers">
          ${q.answers.map(a => {
            let cls = '';
            if (isSubmitted) {
              cls = 'disabled';
              if (a.letter === q.correct) cls += ' correct';
              else if (a.letter === selected) cls += ' incorrect';
            } else if (a.letter === selected) {
              cls = 'selected';
            }
            return `
              <div class="quiz-answer ${cls}" data-answer="${a.letter}">
                <span class="answer-letter">${a.letter}</span>
                <span>${a.text}</span>
              </div>
            `;
          }).join('')}
        </div>
        ${isSubmitted ? `
          <div class="quiz-explanation">
            <strong>${selected === q.correct ? I18N.t('correct') : I18N.t('incorrect')}</strong> ${q.explanation}
          </div>
        ` : ''}
        <div class="quiz-nav">
          ${current > 0 ? `<button class="btn btn-outline" id="quizPrev">${I18N.t('previous')}</button>` : '<div></div>'}
          ${!isSubmitted
            ? `<button class="btn" id="quizSubmit" ${!selected ? 'disabled style="opacity:0.5"' : ''}>${I18N.t('checkAnswer')}</button>`
            : `<button class="btn" id="quizNext">${current < questions.length - 1 ? I18N.t('nextQuestion') : I18N.t('seeResults')}</button>`
          }
        </div>
      </div>
    `;

    // Bind answer selection
    if (!isSubmitted) {
      document.querySelectorAll('.quiz-answer').forEach(el => {
        el.addEventListener('click', () => {
          this.quizState.answers[q.id] = el.dataset.answer;
          this.renderQuizQuestion();
        });
      });
    }

    // Bind submit
    const submitBtn = document.getElementById('quizSubmit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (!this.quizState.answers[q.id]) return;
        this.quizState.submitted[q.id] = true;
        // Record in history
        const isCorrect = this.quizState.answers[q.id] === q.correct;
        // Remove previous answer for this question if exists
        this.state.quizHistory = this.state.quizHistory.filter(h => h.questionId !== q.id);
        this.state.quizHistory.push({ questionId: q.id, correct: isCorrect, date: new Date().toISOString() });
        this.saveState();
        this.renderQuizQuestion();
      });
    }

    // Bind navigation
    const prevBtn = document.getElementById('quizPrev');
    if (prevBtn) prevBtn.addEventListener('click', () => { this.quizState.current--; this.renderQuizQuestion(); });

    const nextBtn = document.getElementById('quizNext');
    if (nextBtn) nextBtn.addEventListener('click', () => { this.quizState.current++; this.renderQuizQuestion(); });
  },

  renderQuizResults() {
    const { questions, answers } = this.quizState;
    const studyData = I18N.getStudyData();
    let correct = 0;
    const domainResults = {};

    questions.forEach(q => {
      if (!domainResults[q.domain]) domainResults[q.domain] = { correct: 0, total: 0 };
      domainResults[q.domain].total++;
      if (answers[q.id] === q.correct) {
        correct++;
        domainResults[q.domain].correct++;
      }
    });

    const pct = Math.round((correct / questions.length) * 100);
    const passed = pct >= 72;

    return `
      <h2 class="page-title">${I18N.t('quizResults')}</h2>
      <div class="card quiz-results">
        <h3>${passed ? I18N.t('passed') : I18N.t('keepStudying')}</h3>
        <div class="results-score ${passed ? 'results-pass' : 'results-fail'}">${pct}%</div>
        <p class="text-muted">${correct} / ${questions.length} ${I18N.t('ofCorrect')}</p>
        <div class="results-breakdown">
          <h3>${I18N.t('breakdownByDomain')}</h3>
          ${Object.entries(domainResults).map(([d, r]) => {
            const dpct = Math.round((r.correct / r.total) * 100);
            const domain = studyData.find(s => s.domain === parseInt(d));
            return `
              <div class="result-domain-row">
                <span>D${d}: ${domain ? domain.title : 'Unknown'}</span>
                <span style="color: ${dpct >= 72 ? 'var(--green)' : 'var(--red)'}">${r.correct}/${r.total} (${dpct}%)</span>
              </div>
            `;
          }).join('')}
        </div>
        <button class="btn mt-24" onclick="app.render('quiz')">${I18N.t('tryAgain')}</button>
        <button class="btn btn-outline mt-24" onclick="app.render('study')" style="margin-left:10px">${I18N.t('reviewStudyGuide')}</button>
      </div>
    `;
  },

  getLastQuizScore() {
    if (this.state.quizHistory.length === 0) return null;
    const recent = this.state.quizHistory.slice(-10);
    const correct = recent.filter(h => h.correct).length;
    return Math.round((correct / recent.length) * 100);
  },

  // ===== FLASHCARDS =====
  flashcardState: { cards: [], current: 0, flipped: false, domain: 'all' },

  renderFlashcards() {
    const flashcards = I18N.getFlashcards();
    const studyData = I18N.getStudyData();
    const ratedCount = Object.keys(this.state.flashcardRatings).length;
    const easyCount = Object.values(this.state.flashcardRatings).filter(r => r === 'easy').length;
    const hardCount = Object.values(this.state.flashcardRatings).filter(r => r === 'hard').length;

    return `
      <h2 class="page-title">${I18N.t('flashTitle')}</h2>
      <p class="page-subtitle">${I18N.t('flashSubtitle')}</p>

      <div class="flashcard-controls">
        <button class="quiz-option selected" data-fc-domain="all">${I18N.t('all')} (${flashcards.length})</button>
        ${studyData.map(d => {
          const count = flashcards.filter(f => f.domain === d.domain).length;
          return `<button class="quiz-option" data-fc-domain="${d.domain}">D${d.domain} (${count})</button>`;
        }).join('')}
        <button class="quiz-option" data-fc-domain="hard">${I18N.t('hardOnly')} (${hardCount})</button>
      </div>

      <div class="text-center text-sm text-muted mb-16">
        ${ratedCount} ${I18N.t('reviewed')} &middot; ${easyCount} ${I18N.t('easy')} &middot; ${hardCount} ${I18N.t('needReview')}
      </div>

      <div class="flashcard-container" id="flashcardContainer">
        <!-- Rendered by JS -->
      </div>
    `;
  },

  bindFlashcards(preserveState) {
    if (preserveState && this.flashcardState.cards.length > 0) {
      // Highlight the active domain filter button
      const activeBtn = document.querySelector(`[data-fc-domain="${this.flashcardState.domain}"]`);
      if (activeBtn) {
        document.querySelectorAll('[data-fc-domain]').forEach(b => b.classList.remove('selected'));
        activeBtn.classList.add('selected');
      }
      this.renderCurrentFlashcard();
    } else {
      this.flashcardState.domain = 'all';
      this.loadFlashcardDeck('all');
    }

    document.querySelectorAll('[data-fc-domain]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-fc-domain]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.loadFlashcardDeck(btn.dataset.fcDomain);
      });
    });
  },

  loadFlashcardDeck(domain) {
    const flashcards = I18N.getFlashcards();
    let cards;
    if (domain === 'all') {
      cards = [...flashcards];
    } else if (domain === 'hard') {
      cards = flashcards.filter(f => this.state.flashcardRatings[f.id] === 'hard');
    } else {
      cards = flashcards.filter(f => f.domain === parseInt(domain));
    }

    // Prioritize unrated and hard cards
    cards.sort((a, b) => {
      const ra = this.state.flashcardRatings[a.id] || 'unrated';
      const rb = this.state.flashcardRatings[b.id] || 'unrated';
      const order = { hard: 0, unrated: 1, medium: 2, easy: 3 };
      return (order[ra] || 1) - (order[rb] || 1);
    });

    this.flashcardState = { cards, current: 0, flipped: false, domain };
    this.renderCurrentFlashcard();
  },

  renderCurrentFlashcard() {
    const container = document.getElementById('flashcardContainer');
    const { cards, current, flipped } = this.flashcardState;

    if (cards.length === 0) {
      container.innerHTML = `<div class="card text-center" style="padding:40px"><p class="text-muted">${I18N.t('noCards')}</p></div>`;
      return;
    }

    const card = cards[current];
    const domain = I18N.getStudyData().find(d => d.domain === card.domain);
    const rating = this.state.flashcardRatings[card.id];

    container.innerHTML = `
      <div class="flashcard ${flipped ? 'flipped' : ''}" id="flashcard">
        <div class="flashcard-face flashcard-front">
          <span class="flashcard-domain-tag">D${card.domain}</span>
          <div class="flashcard-label">${I18N.t('fcQuestion')}</div>
          <div class="flashcard-text">${card.front}</div>
        </div>
        <div class="flashcard-face flashcard-back">
          <span class="flashcard-domain-tag">D${card.domain}</span>
          <div class="flashcard-label">${I18N.t('fcAnswer')}</div>
          <div class="flashcard-text">${card.back}</div>
        </div>
      </div>

      ${flipped ? `
        <div class="flashcard-rating">
          <button class="rating-btn easy" data-rating="easy">${I18N.t('fcEasy')}</button>
          <button class="rating-btn medium" data-rating="medium">${I18N.t('fcMedium')}</button>
          <button class="rating-btn hard" data-rating="hard">${I18N.t('fcHard')}</button>
        </div>
      ` : `<p class="text-center text-sm text-muted mt-16">${I18N.t('fcFlipHint')}</p>`}

      <div class="flashcard-nav">
        <button class="btn btn-outline btn-sm" id="fcPrev" ${current === 0 ? 'disabled style="opacity:0.3"' : ''}>${I18N.t('fcPrev')}</button>
        <span class="flashcard-counter">${current + 1} / ${cards.length}</span>
        <button class="btn btn-outline btn-sm" id="fcNext" ${current >= cards.length - 1 ? 'disabled style="opacity:0.3"' : ''}>${I18N.t('fcNext')}</button>
      </div>
    `;

    // Bind flip
    document.getElementById('flashcard').addEventListener('click', () => {
      this.flashcardState.flipped = !this.flashcardState.flipped;
      this.renderCurrentFlashcard();
    });

    // Bind ratings
    document.querySelectorAll('.rating-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.state.flashcardRatings[card.id] = btn.dataset.rating;
        this.saveState();
        // Auto advance
        if (this.flashcardState.current < cards.length - 1) {
          this.flashcardState.current++;
          this.flashcardState.flipped = false;
          this.renderCurrentFlashcard();
        } else {
          this.flashcardState.flipped = false;
          this.renderCurrentFlashcard();
        }
      });
    });

    // Bind nav
    document.getElementById('fcPrev').addEventListener('click', () => {
      if (this.flashcardState.current > 0) {
        this.flashcardState.current--;
        this.flashcardState.flipped = false;
        this.renderCurrentFlashcard();
      }
    });
    document.getElementById('fcNext').addEventListener('click', () => {
      if (this.flashcardState.current < cards.length - 1) {
        this.flashcardState.current++;
        this.flashcardState.flipped = false;
        this.renderCurrentFlashcard();
      }
    });
  },

  // ===== QUICK REFERENCE =====
  renderReference() {
    const R = I18N.getReferenceData();
    return `
      <h2 class="page-title">${I18N.t('refTitle')}</h2>
      <p class="page-subtitle">${I18N.t('refSubtitle')}</p>

      <div class="ref-section">
        <h3>${I18N.t('refDecisionFramework')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refWhenYouSee')}</th><th>${I18N.t('refAnswerUsually')}</th></tr></thead>
          <tbody>
            ${R.decisionFramework.map(r => `<tr><td>${r.situation}</td><td>${r.answer}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refFileLocations')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refWhat')}</th><th>${I18N.t('refWhere')}</th></tr></thead>
          <tbody>
            ${R.fileLocations.map(r => `<tr><td>${r.what}</td><td><code>${r.where}</code></td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refApiValues')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refSetting')}</th><th>${I18N.t('refValues')}</th></tr></thead>
          <tbody>
            ${R.apiValues.map(r => `<tr><td><code>${r.setting}</code></td><td>${r.values}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refSkillFrontmatter')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refOption')}</th><th>${I18N.t('refDescription')}</th></tr></thead>
          <tbody>
            ${R.skillFrontmatter.map(r => `<tr><td><code>${r.option}</code></td><td>${r.desc}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refHookTypes')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refHook')}</th><th>${I18N.t('refPurpose')}</th></tr></thead>
          <tbody>
            ${R.hookTypes.map(r => `<tr><td><code>${r.hook}</code></td><td>${r.purpose}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refErrorCategories')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refCategory')}</th><th>${I18N.t('refDescription')}</th><th>${I18N.t('refRetryable')}</th></tr></thead>
          <tbody>
            ${R.errorCategories.map(r => `<tr><td>${r.category}</td><td>${r.desc}</td><td>${r.retryable}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refScenarios')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('scenarios')}</th><th>${I18N.t('refPrimaryDomains')}</th><th>${I18N.t('refDescription')}</th></tr></thead>
          <tbody>
            ${R.scenarios.map(r => `<tr><td><strong>${r.name}</strong></td><td>${r.domains}</td><td>${r.desc}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <hr style="border-color: var(--border); margin: 2rem 0;">
      <h2 class="page-title" style="font-size:1.3rem;">${I18N.t('refAdvancedInsights')}</h2>
      <p class="page-subtitle">${I18N.t('refAdvancedSub')}</p>

      <div class="ref-section">
        <h3>${I18N.t('refContextBudget')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refLayer')}</th><th>${I18N.t('refTokens')}</th><th>${I18N.t('refType')}</th><th>${I18N.t('refNote')}</th></tr></thead>
          <tbody>
            ${R.contextBudget.map(r => `<tr><td>${r.layer}</td><td><code>${r.tokens}</code></td><td>${r.type}</td><td>${r.note}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refContextLayering')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refLayer')}</th><th>${I18N.t('refMechanism')}</th><th>${I18N.t('refContent')}</th></tr></thead>
          <tbody>
            ${R.contextLayering.map(r => `<tr><td><strong>${r.layer}</strong></td><td><code>${r.mechanism}</code></td><td>${r.content}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refCommands')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refCommand')}</th><th>${I18N.t('refPurpose')}</th></tr></thead>
          <tbody>
            ${R.claudeCodeCommands.map(r => `<tr><td><code>${r.command}</code></td><td>${r.purpose}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refSkillTypes')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refType')}</th><th>${I18N.t('refExample')}</th><th>${I18N.t('refPurpose')}</th><th>${I18N.t('refNotes')}</th></tr></thead>
          <tbody>
            ${R.skillTypes.map(r => `<tr><td><strong>${r.type}</strong></td><td><code>${r.example}</code></td><td>${r.purpose}</td><td>${r.notes}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refHookPoints')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refHook')}</th><th>${I18N.t('refTiming')}</th><th>${I18N.t('refUseCases')}</th></tr></thead>
          <tbody>
            ${R.hookPoints.map(r => `<tr><td><code>${r.hook}</code></td><td>${r.timing}</td><td>${r.use}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refSixLayer')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refLayer')}</th><th>${I18N.t('refRole')}</th><th>${I18N.t('refComponents')}</th></tr></thead>
          <tbody>
            ${R.sixLayerModel.map(r => `<tr><td><strong>${r.layer}</strong></td><td>${r.role}</td><td>${r.components}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refAntiPatterns')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refAntiPattern')}</th><th>${I18N.t('refSymptom')}</th><th>${I18N.t('refFix')}</th></tr></thead>
          <tbody>
            ${R.practicalAntiPatterns.map(r => `<tr><td><strong>${r.antiPattern}</strong></td><td>${r.symptom}</td><td>${r.fix}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refHandoff')}</h3>
        <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 1.2rem; margin-top: 0.5rem;">
          <p style="margin-bottom: 0.8rem;">${R.handoffPattern.description}</p>
          <div style="background: var(--bg); padding: 0.8rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; color: var(--accent);">
            ${R.handoffPattern.template}
          </div>
        </div>
      </div>

      <hr style="border-color: var(--border); margin: 2rem 0;">
      <h2 class="page-title" style="font-size:1.3rem;">${I18N.t('refRecentApi')}</h2>
      <p class="page-subtitle">${I18N.t('refRecentApiSub')}</p>

      <div class="ref-section">
        <h3>${I18N.t('refNewApiFeatures')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refFeature')}</th><th>${I18N.t('refApi')}</th><th>${I18N.t('refDescription')}</th><th>${I18N.t('refDomain')}</th></tr></thead>
          <tbody>
            ${R.recentApiFeatures.map(r => `<tr><td><strong>${r.feature}</strong></td><td><code>${r.api}</code></td><td>${r.desc}</td><td><span class="tag tag-d${r.domain.replace('D','')}">${r.domain}</span></td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refStopReasons')}</h3>
        <table class="ref-table">
          <thead><tr><th>stop_reason</th><th>${I18N.t('refMeaning')}</th><th>${I18N.t('refAction')}</th></tr></thead>
          <tbody>
            ${R.stopReasons.map(r => `<tr><td><code>${r.reason}</code></td><td>${r.meaning}</td><td>${r.action}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <hr style="border-color: var(--border); margin: 2rem 0;">
      <h2 class="page-title" style="font-size:1.3rem;">${I18N.t('refArchEnterprise')}</h2>
      <p class="page-subtitle">${I18N.t('refArchEnterpriseSub')}</p>

      <div class="ref-section">
        <h3>${I18N.t('refMcpPrimitives')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refPrimitive')}</th><th>${I18N.t('refPurpose')}</th><th>${I18N.t('refExamples')}</th><th>${I18N.t('refTransport')}</th></tr></thead>
          <tbody>
            ${R.mcpPrimitives.map(r => `<tr><td><strong>${r.primitive}</strong></td><td>${r.purpose}</td><td>${r.examples}</td><td>${r.transport}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refSdkMessages')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refMessageType')}</th><th>${I18N.t('refSubtype')}</th><th>${I18N.t('refWhen')}</th><th>${I18N.t('refPurpose')}</th></tr></thead>
          <tbody>
            ${R.sdkMessageTypes.map(r => `<tr><td><strong>${r.type}</strong></td><td><code>${r.subtype}</code></td><td>${r.when}</td><td>${r.purpose}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refSettingsHierarchy')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refLevel')}</th><th>${I18N.t('refSource')}</th><th>${I18N.t('refScope')}</th><th>${I18N.t('refOverridable')}</th><th>${I18N.t('refPath')}</th></tr></thead>
          <tbody>
            ${R.managedSettingsHierarchy.map(r => `<tr><td><strong>${r.level}</strong></td><td><code>${r.source}</code></td><td>${r.scope}</td><td>${r.overridable}</td><td style="font-size:0.8rem;">${r.path}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refEnterpriseLockdown')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refSetting')}</th><th>${I18N.t('refType')}</th><th>${I18N.t('refEffect')}</th></tr></thead>
          <tbody>
            ${R.enterpriseLockdownSettings.map(r => `<tr><td><code>${r.setting}</code></td><td>${r.type}</td><td>${r.effect}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refMonorepo')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refSetting')}</th><th>${I18N.t('refPurpose')}</th><th>${I18N.t('refDetails')}</th></tr></thead>
          <tbody>
            ${R.monorepoOptimization.map(r => `<tr><td><code>${r.setting}</code></td><td>${r.purpose}</td><td>${r.details}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refSubscriptionTiers')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refTier')}</th><th>${I18N.t('refMultiplier')}</th><th>${I18N.t('refDailyCost')}</th><th>${I18N.t('refNotes')}</th></tr></thead>
          <tbody>
            ${R.subscriptionTiers.map(r => `<tr><td><strong>${r.tier}</strong></td><td>${r.multiplier}</td><td>${r.dailyCost}</td><td>${r.notes}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refAgentPatterns')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refPattern')}</th><th>${I18N.t('refDescription')}</th><th>${I18N.t('refBestFor')}</th></tr></thead>
          <tbody>
            ${R.agentPatterns.map(r => `<tr><td><strong>${r.pattern}</strong></td><td>${r.description}</td><td>${r.bestFor}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="ref-section">
        <h3>${I18N.t('refContextEditing')}</h3>
        <table class="ref-table">
          <thead><tr><th>${I18N.t('refParam')}</th><th>${I18N.t('refDescription')}</th><th>${I18N.t('refDefault')}</th></tr></thead>
          <tbody>
            ${R.contextEditing.map(r => `<tr><td><strong>${r.param}</strong></td><td>${r.description}</td><td>${r.configKeys || r.defaultValue || ''}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== EXAM STRATEGY =====
  renderStrategy() {
    const S = I18N.getStrategyData();
    return `
      <h2 class="page-title">${I18N.t('stratTitle')}</h2>
      <p class="page-subtitle">${I18N.t('stratSubtitle')}</p>

      <!-- Exam Briefing -->
      <div class="card strategy-briefing">
        <div class="card-header">
          <span class="card-title">${I18N.t('examBriefing')}</span>
        </div>
        <div class="briefing-critical grid grid-2 mt-8">
          <div class="briefing-critical-item"><span class="text-muted text-sm">${I18N.t('attempts')}</span><br>${S.examBriefing.attempts}</div>
          <div class="briefing-critical-item"><span class="text-muted text-sm">${I18N.t('practiceTarget')}</span><br>${S.examBriefing.practiceTarget}</div>
        </div>
        <div class="grid grid-3 mt-12">
          <div><span class="text-muted text-sm">${I18N.t('level')}</span><br>${S.examBriefing.level}</div>
          <div><span class="text-muted text-sm">${I18N.t('format')}</span><br>${S.examBriefing.format}</div>
          <div><span class="text-muted text-sm">${I18N.t('duration')}</span><br>${S.examBriefing.duration}</div>
          <div><span class="text-muted text-sm">${I18N.t('passingScore')}</span><br>${S.examBriefing.passing}</div>
          <div><span class="text-muted text-sm">${I18N.t('scenarios')}</span><br>${S.examBriefing.scenarios}</div>
          <div><span class="text-muted text-sm">${I18N.t('cost')}</span><br>${S.examBriefing.cost}</div>
          <div><span class="text-muted text-sm">${I18N.t('validity')}</span><br>${S.examBriefing.validity}</div>
        </div>
        <div class="briefing-prereqs mt-12">
          <span class="text-muted text-sm">${I18N.t('prerequisites')}</span><br>${S.examBriefing.prerequisites}
        </div>
        <div class="exam-tip mt-16">
          <strong>${I18N.t('keyStrategy')}</strong> ${S.examBriefing.keyStrategy}
        </div>
        <div class="strategy-tips mt-16">
          <div class="section-label">${I18N.t('examTips')}</div>
          <ul>
            ${S.examBriefing.tips.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Scenario Deep Dives -->
      <h3 class="strategy-section-title mt-24">${I18N.t('scenarioDeepDives')}</h3>
      <p class="text-muted text-sm mb-16">${I18N.t('scenarioDeepDivesSub')}</p>

      ${S.scenarios.map(s => `
        <div class="strategy-scenario">
          <div class="scenario-header" data-scenario="${s.id}">
            <span class="scenario-id-badge">${s.id}</span>
            <div class="scenario-header-text">
              <div class="scenario-header-title">${s.name}</div>
              <div class="scenario-header-domains">
                ${s.primaryDomains.map(d => `<span class="tag tag-d${d}">D${d}</span>`).join(' ')}
                <span class="text-muted text-sm" style="margin-left:8px">${s.taskStatements.length} ${I18N.t('taskStatements')}</span>
              </div>
            </div>
            <span class="domain-toggle">&#9660;</span>
          </div>
          <div class="scenario-body" data-scenario-body="${s.id}">
            <p class="scenario-description">${s.description}</p>

            <div class="section-label mt-16">${I18N.t('keyPatterns')}</div>
            <ul class="strategy-patterns-list">
              ${s.keyPatterns.map(p => `<li class="pattern-item">${p}</li>`).join('')}
            </ul>

            <div class="section-label mt-16">${I18N.t('traps')}</div>
            <ul class="strategy-traps-list">
              ${s.traps.map(t => `<li class="trap-item">${t}</li>`).join('')}
            </ul>

            <div class="section-label mt-16">${I18N.t('walkthrough')}</div>
            <div class="scenario-walkthrough">${s.walkthrough}</div>

            <div class="section-label mt-16">${I18N.t('taskStatementsCovered')}</div>
            <div class="scenario-tasks-list">
              ${s.taskStatements.map(t => `<span class="scenario-task-tag" data-task-id="${t}" title="Click to view details">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      `).join('')}

      <!-- Anti-Pattern Drills -->
      <h3 class="strategy-section-title mt-24">${I18N.t('antiPatternDrills')}</h3>
      <p class="text-muted text-sm mb-16">${I18N.t('antiPatternDrillsSub').replace('anti-patterns', S.antiPatterns.length + ' ' + I18N.t('antiPatternDrills').toLowerCase().split(' ')[0])}</p>

      <div class="strategy-ap-grid">
        ${S.antiPatterns.map(ap => `
          <div class="strategy-ap-card" data-ap="${ap.id}">
            <div class="strategy-ap-header">
              <span class="tag tag-d${ap.domain.replace('D','')}">${ap.domain}</span>
              <span class="strategy-ap-id">${ap.id.toUpperCase()}</span>
            </div>
            <div class="strategy-ap-pattern">${ap.pattern}</div>
            <div class="strategy-ap-details hidden" data-ap-body="${ap.id}">
              <div class="strategy-ap-section">
                <div class="section-label">${I18N.t('whyWrong')}</div>
                <p>${ap.why}</p>
              </div>
              <div class="strategy-ap-section">
                <div class="section-label">${I18N.t('correctApproach')}</div>
                <p>${ap.correct}</p>
              </div>
              <div class="exam-tip">
                <strong>${I18N.t('examTip')}</strong> ${ap.examTip}
              </div>
            </div>
            <button class="strategy-ap-toggle" data-ap-toggle="${ap.id}">${I18N.t('showDetails')}</button>
          </div>
        `).join('')}
      </div>

      <!-- Decision Trees -->
      <h3 class="strategy-section-title mt-24">${I18N.t('decisionTrees')}</h3>
      <p class="text-muted text-sm mb-16">${I18N.t('decisionTreesSub')}</p>

      ${S.decisionTrees.map((dt, i) => `
        <div class="strategy-dt-card">
          <div class="strategy-dt-title">${dt.title}</div>
          <div class="strategy-dt-question">${dt.question}</div>
          <div class="strategy-dt-branches">
            ${dt.branches.map(b => {
              const isNever = b.condition.startsWith('NEVER') || b.condition.startsWith('NOT') || b.condition.startsWith('\u041D\u0418\u041A\u041E\u0413\u0414\u0410') || b.condition.startsWith('\u041D\u0415');
              return `
                <div class="strategy-dt-branch ${isNever ? 'branch-never' : 'branch-yes'}">
                  <div class="branch-condition">${b.condition}</div>
                  <div class="branch-answer">${b.answer}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}

      <!-- New Concepts -->
      <h3 class="strategy-section-title mt-24">${I18N.t('newApiConcepts')}</h3>
      <p class="text-muted text-sm mb-16">${I18N.t('newApiConceptsSub')}</p>

      <div class="strategy-concepts-grid">
        ${S.newConcepts.map(c => `
          <div class="strategy-concept-card">
            <div class="strategy-concept-header">
              <span class="strategy-concept-name">${c.name}</span>
              <span class="tag tag-d${c.domain.replace('D','')}">${c.domain}</span>
            </div>
            <div class="strategy-concept-body">${c.description}</div>
            <div class="strategy-concept-relevance">
              <strong>${I18N.t('examRelevance')}</strong> ${c.examRelevance}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Scenario x Domain Matrix -->
      <h3 class="strategy-section-title mt-24">${I18N.t('scenarioDomainMatrix')}</h3>
      <p class="text-muted text-sm mb-16">${I18N.t('scenarioDomainMatrixSub')}</p>

      <div class="card">
        <table class="ref-table strategy-matrix">
          <thead>
            <tr>${S.scenarioDomainMatrix.headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${S.scenarioDomainMatrix.rows.map(r => `
              <tr>
                <td><strong>${r.scenario}</strong></td>
                ${r.cells.map(c => `<td class="${c === 'Primary' ? 'matrix-primary' : c === 'Secondary' ? 'matrix-secondary' : ''}">${c}</td>`).join('')}
              </tr>
            `).join('')}
           </tbody>
          </table>
        </div>
      </div>

      <!-- Study Resources -->
      <h3 class="strategy-section-title mt-24">${I18N.t('studyResources')}</h3>
      <p class="text-muted text-sm mb-16">${I18N.t('studyResourcesSub')}</p>

      ${S.studyResources.map(stage => `
        <div class="resource-stage">
          <div class="resource-stage-header" data-resource-stage="${stage.stage}">
            <span class="resource-stage-title">${stage.stage}</span>
            <span class="resource-stage-count">${stage.items.length} ${stage.items.length > 1 ? I18N.t('resources') : I18N.t('resource')}</span>
            <span class="domain-toggle">&#9660;</span>
          </div>
          <div class="resource-stage-body" data-resource-body="${stage.stage}">
            ${stage.items.map(item => `
              <div class="resource-item">
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="resource-link">${item.name}</a>
                <span class="resource-note">${item.note}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}

      <!-- Task Statement Modal -->
      <div class="task-modal-overlay" id="taskModal">
        <div class="task-modal">
          <div class="task-modal-header">
            <div>
              <div class="task-modal-title" id="taskModalTitle"></div>
              <div class="task-modal-key-point" id="taskModalKeyPoint"></div>
            </div>
            <button class="task-modal-close" id="taskModalClose">&times;</button>
          </div>
          <div class="task-modal-body" id="taskModalBody"></div>
        </div>
      </div>
    `;
  },

  bindStrategy() {
    // Scenario expand/collapse
    document.querySelectorAll('.scenario-header').forEach(header => {
      header.addEventListener('click', () => {
        const scenarioId = header.dataset.scenario;
        const body = document.querySelector(`[data-scenario-body="${scenarioId}"]`);
        header.classList.toggle('open');
        body.classList.toggle('open');
      });
    });

    // Anti-pattern detail toggles
    document.querySelectorAll('.strategy-ap-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const apId = btn.dataset.apToggle;
        const details = document.querySelector(`[data-ap-body="${apId}"]`);
        if (details) {
          details.classList.toggle('hidden');
          btn.textContent = details.classList.contains('hidden') ? I18N.t('showDetails') : I18N.t('hideDetails');
        }
      });
    });

    // Resource stage expand/collapse
    document.querySelectorAll('.resource-stage-header').forEach(header => {
      header.addEventListener('click', () => {
        const stageId = header.dataset.resourceStage;
        const body = document.querySelector(`[data-resource-body="${stageId}"]`);
        header.classList.toggle('open');
        body.classList.toggle('open');
      });
    });

    // Task statement modal
    const overlay = document.getElementById('taskModal');
    const titleEl = document.getElementById('taskModalTitle');
    const keyPointEl = document.getElementById('taskModalKeyPoint');
    const bodyEl = document.getElementById('taskModalBody');
    const closeBtn = document.getElementById('taskModalClose');

    const findTask = (taskId) => {
      for (const domain of I18N.getStudyData()) {
        for (const task of domain.tasks) {
          if (task.id === taskId) return { task, domain };
        }
      }
      return null;
    };

    const openModal = (taskId) => {
      const result = findTask(taskId);
      if (!result) return;
      const { task, domain } = result;

      titleEl.textContent = task.title;
      keyPointEl.textContent = task.keyPoint || '';

      let html = '';
      // Knowledge & Skills summary
      if (task.knowledge || task.skills) {
        html += '<div class="task-modal-meta">';
        if (task.knowledge) {
          html += '<div class="task-modal-meta-col"><h5>' + I18N.t('knowledgeOf') + '</h5><ul>';
          task.knowledge.forEach(k => { html += '<li>' + k + '</li>'; });
          html += '</ul></div>';
        }
        if (task.skills) {
          html += '<div class="task-modal-meta-col"><h5>' + I18N.t('skillsIn') + '</h5><ul>';
          task.skills.forEach(s => { html += '<li>' + s + '</li>'; });
          html += '</ul></div>';
        }
        html += '</div>';
      }
      // Detailed content
      if (task.details) {
        html += task.details;
      }

      bodyEl.innerHTML = html;
      bodyEl.scrollTop = 0;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('.scenario-task-tag[data-task-id]').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(tag.dataset.taskId);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => app.init());
