(function () {
  const C = window.KIERA2.core;
  const app = document.getElementById('adminApp');
  const toastRoot = document.getElementById('toastRoot');
  const modalRoot = document.getElementById('modalRoot');
  let teacher = C.currentUser('teacher');

  const icons = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    posts: '<path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    category: '<path d="M3 7h7v7H3zM14 7h7v7h-7zM3 17h7v4H3zM14 17h7v4h-7z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3-5.4 6.5-5.4s5.9 1.9 6.5 5.4"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M17.5 15c2.4.5 3.8 2.2 4.2 5"/>',
    logs: '<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>',
    alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 17.5v.5"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6"/><path d="M10 11v5M14 11v5"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    logout: '<path d="M10 5H5v14h5"/><path d="M14 8l4 4-4 4"/><path d="M8 12h10"/>',
    pin: '<path d="M12 17v5"/><path d="M8 3h8l-2 6 4 4H6l4-4-2-6Z"/>',
    unpin: '<path d="M12 17v5"/><path d="M8 3h8l-2 6 4 4H6l4-4-2-6Z"/><path d="m4 4 16 16"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>'
  };

  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (icons[name] || '') + '</svg>';
  }

  function esc(value) {
    return C.escapeHtml(value);
  }

  function go(path, params) {
    const query = params ? new URLSearchParams(Object.keys(params).filter(function (k) { return params[k] !== '' && params[k] != null; }).map(function (k) { return [k, params[k]]; })).toString() : '';
    location.hash = '#' + path + (query ? '?' + query : '');
  }

  function route() {
    const raw = location.hash.replace(/^#/, '') || (teacher ? '/dashboard' : '/login');
    const parts = raw.split('?');
    return { path: parts[0] || '/dashboard', params: new URLSearchParams(parts[1] || '') };
  }

  function showToast(message, type) {
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'info');
    el.innerHTML = icon(type === 'error' ? 'alert' : type === 'warning' ? 'alert' : 'check') + '<span>' + esc(message) + '</span>';
    toastRoot.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 220);
    }, 3400);
  }

  function openDialog(title, body, footer) {
    const dialog = document.createElement('dialog');
    dialog.className = 'app-dialog';
    dialog.innerHTML = '<div class="dialog-head"><h2>' + esc(title) + '</h2><button class="dialog-close" type="button">' + icon('close') + '</button></div>'
      + '<div class="dialog-body">' + body + '</div>'
      + (footer ? '<div class="dialog-foot">' + footer + '</div>' : '');
    modalRoot.appendChild(dialog);
    dialog.querySelector('.dialog-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () { setTimeout(function () { dialog.remove(); }, 90); });
    dialog.showModal();
    return dialog;
  }

  function confirmAction(title, message, button, onConfirm) {
    const dialog = openDialog(title, '<p>' + esc(message) + '</p>', '<button class="btn" type="button" data-cancel>取消</button><button class="btn btn-danger" type="button" data-confirm>' + esc(button || '确认') + '</button>');
    dialog.querySelector('[data-cancel]').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('[data-confirm]').addEventListener('click', function () {
      dialog.close();
      onConfirm();
    });
  }

  function postImage(post, cls) {
    if (post.image_key) {
      return '<img class="' + (cls || '') + '" src="' + esc(C.categoryIcon(post.category_id)) + '" data-image-key="' + esc(post.image_key) + '" alt="' + esc(post.title) + '">';
    }
    return '<img class="category-art ' + (cls || '') + '" src="' + esc(C.categoryIcon(post.category_id)) + '" alt="' + esc(post.category_name) + '">';
  }

  function typeMark(post) {
    return '<span class="type-mark ' + (post.type === 'lost' ? 'lost' : 'found') + '">' + C.typeText(post.type) + '</span>';
  }

  function statusMark(post) {
    return '<span class="status ' + C.statusClass(post.status) + '">' + C.statusText(post.status) + '</span>';
  }

  function pinMark(post) {
    return post.pinned ? '<span class="status is-pinned">置顶</span>' : '';
  }

  function loginPage() {
    document.title = '管理端登录 · 校园失物招领';
    app.innerHTML = '<div class="login-page"><section class="login-visual"><div class="login-photo"></div><div class="login-shade"></div><div class="login-copy"><h1>把每一条信息，<br>认真看到最后。</h1><p>管理学生发布的寻物与招领信息，维护分类和学生账号，让真正需要帮助的人尽快看到。</p></div></section>'
      + '<section class="login-side"><div class="login-card"><h2>管理端登录</h2><p class="lead">学生工作处与系部教师使用，账号由学校统一分配。</p>'
      + '<form class="login-form" data-form="login"><div class="field"><label for="adminUser">教师账号</label><input id="adminUser" name="username" autocomplete="username" required placeholder="请输入教师账号"></div>'
      + '<div class="field"><label for="adminPass">密码</label><input id="adminPass" name="password" type="password" autocomplete="current-password" required placeholder="请输入密码"></div>'
      + '<button class="btn btn-primary btn-block" type="submit">登录</button>'
      + '<div class="demo-bar"><button type="button" data-demo="teacher">学生工作处演示</button><button type="button" data-demo="teacher2">信息工程系演示</button></div>'
      + '</form><div class="login-foot"><a href="index.html">返回学生端</a><button type="button" data-action="reset-demo">重置演示数据</button><span>仅限教师使用</span></div><div class="login-sign">制作：张佳琦</div></div></section></div>';
  }

  function sidebar(active) {
    const nav = [
      ['dashboard', '/dashboard', '工作台', 'dashboard'],
      ['review', '/review', '待审核', 'check'],
      ['posts', '/posts', '信息管理', 'posts'],
      ['categories', '/categories', '分类管理', 'category'],
      ['users', '/users', '学生账号', 'users'],
      ['logs', '/logs', '操作记录', 'logs']
    ];
    const pendingCount = C.state.posts.filter(function (p) { return p.status === 'pending'; }).length;
    return '<aside class="sidebar"><div class="sidebar-brand"><span><strong>失物招领</strong><span>管理端</span></span><a class="sidebar-student" href="index.html" target="_blank">学生端</a></div><nav class="side-nav"><p class="side-label">信息与管理</p>'
      + nav.map(function (item) {
        return '<a class="side-link ' + (active === item[0] ? 'active' : '') + '" href="#' + item[1] + '">' + icon(item[3]) + '<span>' + item[2] + '</span>' + (item[0] === 'review' && pendingCount ? '<b class="side-count">' + pendingCount + '</b>' : '') + '</a>';
      }).join('') + '</nav><div class="sidebar-foot"><div class="side-user"><span class="side-avatar">' + esc(teacher.real_name.slice(0, 1)) + '</span><span><strong>' + esc(teacher.real_name) + '</strong><span>' + esc(teacher.class_name) + '</span></span></div><div class="side-links"><a href="index.html">学生端</a><button type="button" data-action="reset-demo">重置数据</button><button type="button" data-action="logout">退出登录</button></div></div></aside>';
  }

  function topbar() {
    return '<header class="admin-topbar"><div class="admin-title"><h1>校园失物招领</h1><p>管理端</p></div><div class="admin-actions"><span class="admin-date">' + C.formatDate(C.nowString()) + '</span><a class="btn" href="index.html" target="_blank">' + icon('eye') + '查看学生端</a></div></header>';
  }

  function shell(active, content) {
    app.innerHTML = '<div class="admin-shell">' + sidebar(active) + '<div class="admin-main">' + topbar() + '<main class="content">' + content + '<footer class="admin-footer">江苏省张家港中等专业学校 · 校园失物招领管理端 · 制作：张佳琦</footer></main></div></div>';
    C.hydrateMedia(app);
    window.scrollTo(0, 0);
  }

  function intro(title, subtitle, actions) {
    return '<div class="page-intro"><div><h2>' + esc(title) + '</h2><p>' + esc(subtitle) + '</p></div>' + (actions ? '<div class="intro-actions">' + actions + '</div>' : '') + '</div>';
  }

  function dashboardPage() {
    const s = C.summary();
    const latest = C.state.posts.filter(function (p) { return p.status === 'published' || p.status === 'returned'; }).sort(function (a, b) { return C.parseDate(b.created_at) - C.parseDate(a.created_at); }).slice(0, 4);
    const returned = C.state.posts.filter(function (p) { return p.status === 'returned'; }).slice(0, 3);
    const maxCount = Math.max.apply(null, C.categories().map(function (c) {
      return C.state.posts.filter(function (p) { return p.category_id === c.id; }).length;
    }).concat(1));
    const stats = '<div class="stats-grid"><div class="stat-card"><div class="stat-label">信息总数</div><p class="stat-value">' + s.total + '</p><div class="stat-foot">寻物与招领合计</div></div><div class="stat-card"><div class="stat-label">已发布</div><p class="stat-value">' + s.published + '</p><div class="stat-foot">学生端展示中</div></div><div class="stat-card"><div class="stat-label">已归还</div><p class="stat-value">' + s.returned + '</p><div class="stat-foot">' + s.helpers + ' 位热心同学</div></div><div class="stat-card"><div class="stat-label">置顶</div><p class="stat-value">' + s.pinned + '</p><div class="stat-foot">优先展示</div></div></div>';
    const latestPanel = '<section class="panel"><div class="panel-head"><h3>最新发布</h3><a href="#/posts">全部信息</a></div><div class="panel-body no-pad"><div class="latest-list">'
      + (latest.length ? latest.map(function (p) {
        return '<div class="latest-row"><span class="latest-thumb">' + postImage(p) + '</span><span class="latest-copy"><strong>' + (p.pinned ? '【置顶】' : '') + esc(p.title) + '</strong><span>' + C.typeText(p.type) + ' · ' + esc(p.publisher_name) + ' · ' + C.relativeTime(p.created_at) + '</span></span><span class="latest-actions">' + (p.status === 'published' ? '<button class="btn btn-sm ' + (p.pinned ? '' : 'btn-primary') + '" type="button" data-pin="' + p.id + '">' + (p.pinned ? '取消置顶' : '置顶') + '</button>' : '') + '<a class="btn btn-sm" href="index.html#/post/' + p.id + '" target="_blank">查看</a></span></div>';
      }).join('') : '<div class="empty">' + icon('posts') + '<h3>还没有信息</h3><p>学生发布后会显示在这里。</p></div>') + '</div></div></section>';
    const categoryPanel = '<section class="panel"><div class="panel-head"><h3>分类分布</h3><a href="#/categories">分类管理</a></div><div class="panel-body"><div class="category-bars">'
      + C.categories().map(function (c) {
        const count = C.state.posts.filter(function (p) { return p.category_id === c.id; }).length;
        return '<div class="category-bar"><span class="category-name">' + esc(c.name) + '</span><span class="bar-track"><i class="bar-fill" style="width:' + Math.max(6, Math.round(count / maxCount * 100)) + '%;--bar-color:' + esc(c.color) + '"></i></span><span class="bar-count">' + count + '</span></div>';
      }).join('') + '</div></div></section>';
    const returnPanel = '<section class="panel"><div class="panel-head"><h3>最近归还</h3><a href="#/posts?status=returned">查看</a></div><div class="panel-body no-pad">'
      + (returned.length ? returned.map(function (p) { return '<div class="recent-return"><strong>' + esc(p.title) + '</strong><span>' + esc(p.publisher_name) + ' · ' + C.relativeTime(p.returned_at) + '</span></div>'; }).join('') : '<div class="empty">' + icon('heart') + '<h3>还没有归还记录</h3><p>学生标记归还后会显示在这里。</p></div>') + '</div></section>';
    const tips = '<section class="panel"><div class="panel-head"><h3>管理提示</h3><span class="table-sub">审核、置顶与删除</span></div><div class="panel-body"><div class="check-list"><div class="check-item"><b class="check-index">1</b><span><strong>先审核再展示</strong><span>学生提交的信息进入待审核，核对内容和联系方式后再通过或驳回。</span></span></div><div class="check-item"><b class="check-index">2</b><span><strong>置顶留给重要信息</strong><span>证件、贵重物品可以置顶，首页会优先展示，处理完记得取消。</span></span></div><div class="check-item"><b class="check-index">3</b><span><strong>删除要谨慎</strong><span>只有重复、广告或明显不实的信息才删除，删除后学生端同步消失。</span></span></div><div class="check-item"><b class="check-index">4</b><span><strong>归还由学生标记</strong><span>物品归还后，发布人可以在“我的发布”里标记，管理端只做查看。</span></span></div></div></div></section>';
    const pending = C.state.posts.filter(function (p) { return p.status === 'pending'; });
    const pendingBanner = '<a class="review-banner" href="#/review"><strong>待审核 ' + pending.length + ' 条</strong><span>学生提交的信息先审核，再公开展示</span><span class="review-banner-go">去处理</span></a>';
    const content = intro('工作台', '审核学生提交的信息，维护分类与账号', '<a class="btn btn-primary" href="#/review">' + icon('posts') + '待审核队列</a>')
      + pendingBanner
      + stats + '<div class="dashboard-grid"><div style="display:flex;flex-direction:column;gap:14px">' + latestPanel + tips + '</div><div style="display:flex;flex-direction:column;gap:14px">' + categoryPanel + returnPanel + '</div></div>'
      + '<div class="kindness-quote"><strong>五心 · 让数字服务更顺畅</strong><br>审核一条信息、置顶一条关键信息，可能就能让失主少找一整天。管理端负责审核、置顶和删除，明显不合适的内容要及时处理。</div>';
    shell('dashboard', content);
  }

  function postsPage(params, isReview) {
    const q = (params.get('q') || '').trim().toLowerCase();
    const type = params.get('type') || '';
    const status = params.get('status') || '';
    const category = params.get('category') || '';
    let list = C.state.posts.slice().sort(function (a, b) {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      return C.parseDate(b.created_at) - C.parseDate(a.created_at);
    });
    if (q) list = list.filter(function (p) { return (p.title + p.description + p.location + p.publisher_name).toLowerCase().indexOf(q) >= 0; });
    if (type) list = list.filter(function (p) { return p.type === type; });
    if (status) list = list.filter(function (p) { return p.status === status; });
    if (category) list = list.filter(function (p) { return p.category_id === category; });
    const rows = list.map(function (p) {
      const actions = [];
      if (p.status === 'published' || p.status === 'returned') {
        actions.push('<a class="btn btn-sm" href="index.html#/post/' + p.id + '" target="_blank">查看</a>');
      } else {
        actions.push('<button class="btn btn-sm" type="button" data-preview="' + p.id + '">预览</button>');
      }
      if (p.status === 'pending') {
        actions.push('<button class="btn btn-sm btn-primary" type="button" data-approve="' + p.id + '">通过</button>');
        actions.push('<button class="btn btn-sm" type="button" data-reject="' + p.id + '">驳回</button>');
      }
      if (p.status === 'published') {
        actions.push('<button class="btn btn-sm ' + (p.pinned ? '' : 'btn-primary') + '" type="button" data-pin="' + p.id + '">' + (p.pinned ? '取消置顶' : '置顶') + '</button>');
      }
      actions.push('<button class="btn btn-sm btn-danger" type="button" data-delete="' + p.id + '">删除</button>');
      return '<tr><td>' + typeMark(p) + '</td><td>' + (p.status === 'published' || p.status === 'returned' ? '<a class="table-title" href="index.html#/post/' + p.id + '" target="_blank">' + (p.pinned ? '【置顶】' : '') + esc(p.title) + '</a>' : '<span class="table-title">' + (p.pinned ? '【置顶】' : '') + esc(p.title) + '</span>') + '<span class="table-sub">' + esc(p.location) + ' · ' + esc(p.publisher_name) + '</span></td><td>' + esc(p.category_name) + '</td><td>' + statusMark(p) + '</td><td>' + C.formatDate(p.created_at) + '</td><td><div class="table-actions">' + actions.join('') + '</div></td></tr>';
    }).join('');
    const content = intro(isReview ? '待审核队列' : '信息管理', isReview ? '学生提交的信息先审核，通过后公开展示；驳回时填写原因' : '审核学生提交的信息，通过后展示；已发布信息可置顶或删除', isReview ? '<a class="btn" href="#/posts">全部信息</a>' : '<a class="btn" href="#/categories">分类管理</a>')
      + '<form class="filter-bar" data-form="filter"><div class="mini-field"><label>关键词</label><input name="q" value="' + esc(q) + '" placeholder="标题、地点或姓名"></div><div class="mini-field"><label>类型</label><select name="type"><option value="">全部</option><option value="lost"' + (type === 'lost' ? ' selected' : '') + '>寻物</option><option value="found"' + (type === 'found' ? ' selected' : '') + '>招领</option></select></div><div class="mini-field"><label>状态</label><select name="status"><option value="">全部</option><option value="pending"' + (status === 'pending' ? ' selected' : '') + '>待审核</option><option value="published"' + (status === 'published' ? ' selected' : '') + '>已发布</option><option value="returned"' + (status === 'returned' ? ' selected' : '') + '>已归还</option><option value="rejected"' + (status === 'rejected' ? ' selected' : '') + '>已驳回</option></select></div><div class="mini-field"><label>分类</label><select name="category"><option value="">全部</option>' + C.categories().map(function (c) { return '<option value="' + esc(c.id) + '"' + (category === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select></div><div class="filter-actions"><button class="btn btn-primary" type="submit">' + icon('search') + '筛选</button><a class="btn" href="#/posts">重置</a></div></form>'
      + '<section class="panel"><div class="panel-head"><h3>共 ' + list.length + ' 条信息</h3><span class="table-sub">置顶优先，其余按发布时间倒序</span></div><div class="panel-body no-pad table-wrap"><table class="data-table"><thead><tr><th>类型</th><th>物品</th><th>分类</th><th>状态</th><th>发布时间</th><th>操作</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6"><div class="empty">' + icon('search') + '<h3>没有符合条件的信息</h3><p>调整筛选后再试。</p></div></td></tr>') + '</tbody></table></div></section>';
    shell(isReview ? 'review' : 'posts', content);
  }

  function categoriesPage() {
    const cards = C.categories().map(function (c) {
      const all = C.state.posts.filter(function (p) { return p.category_id === c.id; }).length;
      const pinned = C.state.posts.filter(function (p) { return p.category_id === c.id && p.pinned; }).length;
      return '<article class="category-card"><div class="category-card-top"><span class="category-icon"><img src="' + esc(c.icon) + '" alt=""></span><span><strong>' + esc(c.name) + '</strong><small><i class="category-dot" style="display:inline-block;width:6px;height:6px;margin-right:4px;background:' + esc(c.color) + '"></i>学生端筛选分类</small></span></div><div class="category-stats"><span>已发布 <strong>' + C.categoryCount(c.id) + '</strong></span><span>全部 <strong>' + all + '</strong></span>' + (pinned ? '<span>置顶 <strong>' + pinned + '</strong></span>' : '') + '</div><div class="category-card-actions"><button class="btn btn-sm" type="button" data-edit-category="' + esc(c.id) + '">编辑</button><button class="btn btn-sm btn-danger" type="button" data-delete-category="' + esc(c.id) + '">删除</button></div></article>';
    }).join('');
    const notes = '<section class="panel" style="margin-top:14px"><div class="panel-head"><h3>分类维护说明</h3><span class="table-sub">改动会立即生效</span></div><div class="panel-body"><div class="check-list"><div class="check-item"><b class="check-index">1</b><span><strong>名称尽量短</strong><span>学生端筛选栏空间有限，建议不超过 8 个字，例如“证件卡类”“电子产品”。</span></span></div><div class="check-item"><b class="check-index">2</b><span><strong>删除前先清空</strong><span>分类下还有信息时不能删除，可以先把信息改到其他分类。</span></span></div><div class="check-item"><b class="check-index">3</b><span><strong>颜色只做辅助</strong><span>颜色用于学生端的小圆点标记，整体仍然保持蓝白配色。</span></span></div></div></div></section>';
    const content = intro('分类管理', '分类会显示在学生端筛选栏，删除前请确认没有信息使用', '<button class="btn btn-primary" type="button" data-add-category>' + icon('plus') + '新增分类</button>')
      + '<div class="category-grid">' + cards + '</div>' + notes;
    shell('categories', content);
  }

  function usersPage() {
    const students = C.state.users.filter(function (u) { return u.role === 'student'; });
    const rows = students.map(function (u) {
      const count = C.state.posts.filter(function (p) { return p.publisher_id === u.id; }).length;
      return '<tr><td><span class="side-avatar" style="display:inline-flex;margin-right:6px;vertical-align:middle">' + esc(u.real_name.slice(0, 1)) + '</span><span style="color:#324e63;font-weight:600">' + esc(u.real_name) + '</span><span class="table-sub">' + esc(u.username) + '</span></td><td>' + esc(C.departmentName(u.department)) + '</td><td>' + esc(u.class_name) + '</td><td>' + count + '</td><td><span class="status ' + (Number(u.status) === 1 ? 'is-published' : 'is-disabled') + '">' + (Number(u.status) === 1 ? '正常' : '已停用') + '</span></td><td><button class="btn btn-sm ' + (Number(u.status) === 1 ? 'btn-danger' : '') + '" type="button" data-toggle-user="' + u.id + '">' + (Number(u.status) === 1 ? '停用' : '恢复') + '</button></td></tr>';
    }).join('');
    const content = intro('学生账号', '停用后该学生无法登录，已发布的信息仍然保留', '<a class="btn" href="#/logs">操作记录</a>')
      + '<section class="panel"><div class="panel-head"><h3>共 ' + students.length + ' 个学生账号</h3><span class="table-sub">账号由学校统一分配</span></div><div class="panel-body no-pad table-wrap"><table class="data-table"><thead><tr><th>学生</th><th>系部</th><th>班级</th><th>发布</th><th>状态</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
    shell('users', content);
  }

  function logsPage() {
    const logs = C.state.logs.slice().sort(function (a, b) { return C.parseDate(b.created_at) - C.parseDate(a.created_at); });
    const actionText = { submit: '提交审核', approve: '审核通过', reject: '审核驳回', pin: '置顶', unpin: '取消置顶', return: '归还', delete: '删除' };
    const actionClass = { submit: 'is-pending', approve: 'is-published', reject: 'is-rejected', pin: 'is-pinned', unpin: 'is-unpin', return: 'is-returned', delete: 'is-disabled' };
    const rows = logs.map(function (l) {
      return '<tr><td><span class="table-title">' + esc(l.post_title) + '</span><span class="table-sub">信息编号 ' + l.post_id + '</span></td><td>' + esc(l.operator) + '</td><td><span class="status ' + (actionClass[l.action] || 'is-published') + '">' + (actionText[l.action] || l.action) + '</span></td><td>' + esc(l.reason || '') + '</td><td>' + C.formatDate(l.created_at, true) + '</td></tr>';
    }).join('');
    const content = intro('操作记录', '提交、审核、置顶、归还和删除都会留痕', '')
      + '<section class="panel"><div class="panel-head"><h3>共 ' + logs.length + ' 条记录</h3></div><div class="panel-body no-pad table-wrap"><table class="data-table"><thead><tr><th>信息</th><th>操作人</th><th>动作</th><th>说明</th><th>时间</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5"><div class="empty">' + icon('logs') + '<h3>暂无操作记录</h3></div></td></tr>') + '</tbody></table></div></section>';
    shell('logs', content);
  }

  function handleLogin(form) {
    const result = C.login('teacher', form.querySelector('[name="username"]').value.trim(), form.querySelector('[name="password"]').value);
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }
    teacher = result.user;
    showToast('欢迎回来，' + result.user.real_name);
    go('/dashboard');
  }

  function addCategoryDialog() {
    const dialog = openDialog('新增分类', '<div class="field"><label>分类名称</label><input id="newCategoryName" maxlength="12" placeholder="例如：体育用品"></div><div class="field"><label>颜色</label><input id="newCategoryColor" type="color" value="#3f7fae"></div>',
      '<button class="btn" type="button" data-cancel>取消</button><button class="btn btn-primary" type="button" data-save>保存</button>');
    dialog.querySelector('[data-cancel]').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('[data-save]').addEventListener('click', function () {
      const result = C.addCategory({ name: dialog.querySelector('#newCategoryName').value, color: dialog.querySelector('#newCategoryColor').value });
      if (!result.ok) {
        showToast(result.message, 'error');
        return;
      }
      dialog.close();
      showToast('分类已添加');
      renderRoute();
    });
  }

  function editCategoryDialog(id) {
    const category = C.categoryById(id);
    if (!category) return;
    const dialog = openDialog('编辑分类', '<div class="field"><label>分类名称</label><input id="editCategoryName" maxlength="12" value="' + esc(category.name) + '"></div><div class="field"><label>颜色</label><input id="editCategoryColor" type="color" value="' + esc(category.color) + '"></div>',
      '<button class="btn" type="button" data-cancel>取消</button><button class="btn btn-primary" type="button" data-save>保存</button>');
    dialog.querySelector('[data-cancel]').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('[data-save]').addEventListener('click', function () {
      const result = C.updateCategory(id, { name: dialog.querySelector('#editCategoryName').value, color: dialog.querySelector('#editCategoryColor').value });
      if (!result.ok) {
        showToast(result.message, 'error');
        return;
      }
      dialog.close();
      showToast('分类已更新');
      renderRoute();
    });
  }

  function previewPost(id) {
    const post = C.postById(id);
    if (!post) return;
    const dialog = openDialog('审核 / 预览', '<div class="review-preview">' + postImage(post, 'review-image') + '<div class="review-preview-info"><span class="status is-' + (post.status === 'pending' ? 'pending' : post.status === 'rejected' ? 'rejected' : 'published') + '">' + C.statusText(post.status) + '</span><h3>' + esc(post.title) + '</h3><p>' + C.typeText(post.type) + ' · ' + esc(post.category_name) + ' · ' + esc(post.location) + '</p><p class="review-description">' + esc(post.description) + '</p><dl><dt>发布人</dt><dd>' + esc(post.publisher_name) + ' · ' + esc(C.departmentName(post.publisher_department)) + ' · ' + esc(post.publisher_class) + '</dd><dt>联系方式</dt><dd>' + esc(post.contact) + '</dd><dt>发布时间</dt><dd>' + C.formatDate(post.created_at, true) + '</dd>' + (post.review_note ? '<dt>审核说明</dt><dd>' + esc(post.review_note) + '</dd>' : '') + '</dl></div></div>',
      '<button class="btn" type="button" data-cancel>关闭</button>' + (post.status === 'pending' ? '<button class="btn btn-primary" type="button" data-preview-approve="' + post.id + '">通过</button><button class="btn btn-danger" type="button" data-preview-reject="' + post.id + '">驳回</button>' : ''));
    dialog.querySelector('[data-cancel]').addEventListener('click', function () { dialog.close(); });
    C.hydrateMedia(dialog);
    const approve = dialog.querySelector('[data-preview-approve]');
    if (approve) approve.addEventListener('click', function () { dialog.close(); approvePost(Number(approve.getAttribute('data-preview-approve'))); });
    const reject = dialog.querySelector('[data-preview-reject]');
    if (reject) reject.addEventListener('click', function () { dialog.close(); rejectPostDialog(Number(reject.getAttribute('data-preview-reject'))); });
  }

  function approvePost(id) {
    const post = C.approvePost(id, teacher);
    if (!post) { showToast('这条信息不在待审核状态', 'error'); return; }
    showToast('审核通过，信息已公开展示');
    renderRoute();
  }

  function rejectPostDialog(id) {
    const post = C.postById(id);
    if (!post || post.status !== 'pending') { showToast('这条信息不在待审核状态', 'error'); return; }
    const dialog = openDialog('驳回信息', '<p>驳回《' + esc(post.title) + '》，请填写原因，学生端会看到。</p><div class="field"><label for="rejectReason">驳回原因</label><textarea id="rejectReason" maxlength="120" placeholder="例如：描述过于笼统，无法核对物品特征。"></textarea></div>',
      '<button class="btn" type="button" data-cancel>取消</button><button class="btn btn-danger" type="button" data-confirm-reject>确认驳回</button>');
    dialog.querySelector('[data-cancel]').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('[data-confirm-reject]').addEventListener('click', function () {
      const reason = dialog.querySelector('#rejectReason').value.trim();
      if (!reason) { showToast('请填写驳回原因', 'error'); return; }
      C.rejectPost(id, reason, teacher);
      dialog.close();
      showToast('已驳回，学生端会显示原因');
      renderRoute();
    });
  }

  function deletePost(id) {
    const post = C.postById(id);
    confirmAction('删除信息', '确定删除《' + (post ? post.title : '这条信息') + '》吗？删除后学生端也会消失。', '确认删除', function () {
      C.deletePost(id, teacher);
      showToast('信息已删除');
      renderRoute();
    });
  }

  function resetDemo() {
    confirmAction('重置演示数据', '将清除当前浏览器里的信息、分类、账号状态和上传图片，恢复到初始演示数据。确定继续吗？', '确认重置', function () {
      C.reset();
      teacher = null;
      location.hash = '#/login';
      setTimeout(function () { location.reload(); }, 450);
    });
  }

  function renderRoute() {
    const current = route();
    teacher = C.currentUser('teacher');
    if (!teacher && current.path !== '/login') {
      go('/login');
      return;
    }
    if (teacher && current.path === '/login') {
      go('/dashboard');
      return;
    }
    const path = current.path;
    if (path === '/login') loginPage();
    else if (path === '/dashboard') dashboardPage();
    else if (path === '/review') postsPage(new URLSearchParams('status=pending'), true);
    else if (path === '/posts') postsPage(current.params);
    else if (path === '/categories') categoriesPage();
    else if (path === '/users') usersPage();
    else if (path === '/logs') logsPage();
    else go('/dashboard');
  }

  document.addEventListener('click', function (event) {
    const logout = event.target.closest('[data-action="logout"]');
    if (logout) {
      C.clearSession('teacher');
      teacher = null;
      go('/login');
      return;
    }
    const reset = event.target.closest('[data-action="reset-demo"]');
    if (reset) {
      resetDemo();
      return;
    }
    const demo = event.target.closest('[data-demo]');
    if (demo) {
      const form = demo.closest('form');
      form.querySelector('[name="username"]').value = demo.getAttribute('data-demo');
      form.querySelector('[name="password"]').value = '123456';
      return;
    }
    const addCategory = event.target.closest('[data-add-category]');
    if (addCategory) { addCategoryDialog(); return; }
    const editCategory = event.target.closest('[data-edit-category]');
    if (editCategory) { editCategoryDialog(editCategory.getAttribute('data-edit-category')); return; }
    const deleteCategory = event.target.closest('[data-delete-category]');
    if (deleteCategory) {
      const id = deleteCategory.getAttribute('data-delete-category');
      const category = C.categoryById(id);
      confirmAction('删除分类', '确定删除“' + (category ? category.name : '') + '”吗？分类下已有信息时不能删除。', '确认删除', function () {
        const result = C.deleteCategory(id);
        if (!result.ok) { showToast(result.message, 'error'); return; }
        showToast('分类已删除');
        renderRoute();
      });
      return;
    }
    const preview = event.target.closest('[data-preview]');
    if (preview) { previewPost(Number(preview.getAttribute('data-preview'))); return; }
    const approve = event.target.closest('[data-approve]');
    if (approve) { approvePost(Number(approve.getAttribute('data-approve'))); return; }
    const reject = event.target.closest('[data-reject]');
    if (reject) { rejectPostDialog(Number(reject.getAttribute('data-reject'))); return; }
    const pin = event.target.closest('[data-pin]');
    if (pin) {
      const post = C.togglePin(Number(pin.getAttribute('data-pin')), teacher);
      if (post) showToast(post.pinned ? '已置顶' : '已取消置顶');
      renderRoute();
      return;
    }
    const del = event.target.closest('[data-delete]');
    if (del) { deletePost(Number(del.getAttribute('data-delete'))); return; }
    const toggle = event.target.closest('[data-toggle-user]');
    if (toggle) {
      C.toggleUserStatus(Number(toggle.getAttribute('data-toggle-user')));
      showToast('账号状态已更新');
      renderRoute();
    }
  });

  document.addEventListener('submit', function (event) {
    const form = event.target;
    const type = form.getAttribute('data-form');
    if (!type) return;
    event.preventDefault();
    if (type === 'login') handleLogin(form);
    else if (type === 'filter') {
      const data = new FormData(form);
      go('/posts', {
        q: String(data.get('q') || '').trim(),
        type: String(data.get('type') || ''),
        status: String(data.get('status') || ''),
        category: String(data.get('category') || '')
      });
    }
  });

  C.subscribe(function (message) {
    teacher = C.currentUser('teacher');
    if (!teacher) {
      if (route().path !== '/login') go('/login');
      return;
    }
    if (message.type === 'state' && route().path !== '/login') renderRoute();
  });

  window.addEventListener('hashchange', renderRoute);
  if (!location.hash) location.hash = teacher ? '#/dashboard' : '#/login';
  renderRoute();
})();
