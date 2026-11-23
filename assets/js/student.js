(function () {
  const C = window.KIERA2.core;
  const app = document.getElementById('app');
  const toastRoot = document.getElementById('toastRoot');
  const modalRoot = document.getElementById('modalRoot');
  let student = C.currentUser('student');

  const icons = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.5M3 12h.5M3 18h.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    location: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    box: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    logout: '<path d="M10 5H5v14h5"/><path d="M14 8l4 4-4 4"/><path d="M8 12h10"/>',
    shield: '<path d="m12 3 8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.4 2.4 4.6-5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6"/><path d="M10 11v5M14 11v5"/>',
    alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 17.5v.5"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 13h18M7.5 8C6 8 5 7 5 5.8 5 4.5 6 4 7 4c2 0 5 4 5 4M16.5 8C18 8 19 7 19 5.8 19 4.5 18 4 17 4c-2 0-5 4-5 4"/>'
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
    const raw = location.hash.replace(/^#/, '') || (student ? '/home' : '/login');
    const parts = raw.split('?');
    return { path: parts[0] || '/home', params: new URLSearchParams(parts[1] || '') };
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
    dialog.addEventListener('close', function () { setTimeout(function () { dialog.remove(); }, 80); });
    dialog.showModal();
    return dialog;
  }

  function postHref(id) {
    return '#/post/' + id;
  }

  function header(active) {
    const nav = [
      ['home', '/home', '首页'],
      ['posts', '/posts', '全部信息'],
      ['publish', '/publish', '发布'],
      ['my', '/my', '我的']
    ];
    return '<header class="site-header"><div class="header-inner"><a class="brand" href="#/home"><span class="brand-text"><strong>校园失物招领</strong><span>江苏省张家港中等专业学校</span></span></a>'
      + '<nav class="header-nav">' + nav.map(function (item) {
        return '<a class="' + (active === item[0] ? 'active' : '') + '" href="#' + item[1] + '">' + item[2] + '</a>';
      }).join('') + '</nav>'
      + '<div class="header-user">' + (student ? '<span class="user-name">' + esc(student.real_name) + '</span><a class="header-avatar" href="#/profile">' + esc(student.real_name.slice(0, 1)) + '</a>' : '<a class="header-login" href="#/login">学生登录</a>') + '</div></div></header>'
      + '<nav class="mobile-nav">' + nav.map(function (item) {
        return '<a class="' + (active === item[0] ? 'active' : '') + '" href="#' + item[1] + '">' + icon(item[0] === 'home' ? 'home' : item[0] === 'publish' ? 'plus' : item[0] === 'posts' ? 'list' : 'user') + '<span>' + item[2] + '</span></a>';
      }).join('') + '</nav>';
  }

  function shell(active, content, options) {
    options = options || {};
    app.classList.remove('login-mode');
    app.innerHTML = header(active) + '<main class="page ' + (options.narrow ? 'narrow' : '') + '">' + content + '<div class="source-foot">江苏省张家港中等专业学校 · 校园失物招领<br><a href="https://zjgzzx.zjgedu.cn/" target="_blank" rel="noopener">内容来源：学校官网</a> · <a href="admin.html">管理端</a><span class="signature">制作：张佳琦</span></div></main>';
    C.hydrateMedia(app);
    if (options.scroll !== false) window.scrollTo(0, 0);
  }

  function pageHead(title, subtitle, action) {
    return '<div class="page-head"><div><h1>' + esc(title) + '</h1><p>' + esc(subtitle) + '</p></div>' + (action || '') + '</div>';
  }

  function imageMarkup(post, cls) {
    if (post.image_key) {
      return '<img class="' + (cls || '') + '" src="' + esc(C.categoryIcon(post.category_id)) + '" data-image-key="' + esc(post.image_key) + '" alt="' + esc(post.title) + '">';
    }
    return '<img class="' + (cls || '') + ' category-art" src="' + esc(C.categoryIcon(post.category_id)) + '" alt="' + esc(C.category_name) + '">';
  }

  function typeBadge(post) {
    return '<span class="type-badge ' + (post.type === 'lost' ? 'lost' : 'found') + '">' + C.typeText(post.type) + '</span>';
  }

  function statusBadge(post) {
    if (post.status === 'returned') return '<span class="status-badge is-returned">' + icon('heart') + ' 已归还</span>';
    return '<span class="status-badge ' + C.statusClass(post.status) + '">' + C.statusText(post.status) + '</span>';
  }

  function postCard(post) {
    return '<article class="post-card"><a class="post-cover" href="' + postHref(post.id) + '">'
      + (post.image_key ? '<img src="' + esc(C.categoryIcon(post.category_id)) + '" data-image-key="' + esc(post.image_key) + '" alt="' + esc(post.title) + '">' : '<span class="cover-placeholder">' + imageMarkup(post) + '</span>')
      + '<span class="cover-badges">' + typeBadge(post) + (post.pinned ? '<span class="pin-badge">置顶</span>' : '') + '</span>'
      + (post.status === 'returned' ? '<span class="returned-badge">已归还</span>' : '')
      + '</a><div class="post-body"><div class="post-meta-top"><span class="post-category" style="--category-color:' + esc((C.categoryById(post.category_id) || {}).color || '#3f7fae') + '">' + esc(post.category_name) + '</span><span>·</span><span>' + esc(post.location) + '</span></div>'
      + '<h3><a href="' + postHref(post.id) + '">' + esc(post.title) + '</a></h3>'
      + '<p class="post-summary">' + esc(post.description) + '</p>'
      + '<div class="post-meta-bottom"><span>' + icon('user') + esc(post.publisher_name) + '</span><span>' + icon('clock') + C.relativeTime(post.created_at) + '</span></div>'
      + '</div></article>';
  }

  function loginPage() {
    document.title = '学生登录 · 校园失物招领';
    app.classList.add('login-mode');
    app.innerHTML = '<div class="login-page"><section class="login-visual"><div class="login-photo"></div><div class="login-shade"></div><div class="login-visual-copy">'
      + '<p class="login-quote">“仁心，是顺手做的一件小事。”</p><h1>让每一件失物，<br>都能找到回家的路。</h1><p>捡到东西，发一条招领；丢了东西，留一条寻物。发布后直接展示，认领时请核对物品特征。</p></div></section>'
      + '<section class="login-side"><div class="login-card"><h2>校园失物招领</h2><p class="login-lead">请使用学校发放的学生账号登录。遇到贵重物品，请同时联系学生工作处。</p>'
      + '<form class="login-form" data-form="login"><div class="field"><label for="loginUser">学号 / 账号</label><input id="loginUser" name="username" autocomplete="username" required placeholder="请输入账号"></div>'
      + '<div class="field"><label for="loginPass">密码</label><input id="loginPass" name="password" type="password" autocomplete="current-password" required placeholder="请输入密码"></div>'
      + '<button class="btn btn-primary login-submit" type="submit">登录</button>'
      + '<div class="demo-bar"><button type="button" data-demo="student">信息工程系演示</button><button type="button" data-demo="student2">机械汽车系演示</button></div>'
      + '</form><div class="login-alt">账号由学校统一开通，忘记密码请联系学生工作处</div><div class="login-foot">江苏省张家港中等专业学校 · 校园失物招领<br>请勿在平台发布身份证号码、银行卡号等敏感信息<span class="signature">制作：张佳琦</span></div></div></section></div>';
  }

  function homePage() {
    const summary = C.summary();
    const all = C.publicPosts();
    const feed = all.slice(0, 6);
    const returned = all.filter(function (p) { return p.status === 'returned'; }).slice(0, 2);
    const categories = C.categories();
    const fiveHearts = '<section class="section five-hearts"><div class="section-head"><div><h2>五心服务</h2></div></div><div class="heart-grid"><div class="heart-item"><strong>红心</strong><span>为师生办实事，让校园服务更有温度。</span></div><div class="heart-item"><strong>仁心</strong><span>暖心接力、归还留言，认真对待每一件失物。</span></div><div class="heart-item"><strong>恒心</strong><span>分类长期维护、信息持续归档，教师端可随校园变化调整分类。</span></div><div class="heart-item"><strong>匠心</strong><span>图片回退、手机适配、细节测试，把体验做扎实。</span></div><div class="heart-item"><strong>创心</strong><span>教师端分类管理支持新增、编辑和删除，让信息组织更灵活。</span></div></div></section>';
    const returnHtml = returned.length ? '<div class="return-strip"><div class="return-title"><strong>暖心接力</strong><span>已经归还 ' + summary.returned + ' 件</span></div><div class="return-items">'
      + returned.map(function (p) { return '<div class="return-item"><a href="' + postHref(p.id) + '">' + esc(p.title) + '</a><span>' + esc(p.publisher_name) + ' · ' + C.relativeTime(p.returned_at) + '</span></div>'; }).join('') + '</div></div>' : '';
    const content = '<section class="home-hero"><div class="hero-image"></div><div class="hero-shade"></div><div class="hero-content"><div class="hero-copy"><div class="hero-eyebrow">校园数字服务 · 失物招领</div><h1>让每一件失物，<br>都能找到回家的路。</h1><p>捡到东西不用纠结发在哪里，丢了东西也不用到处问。发布、认领、归还，都在这里完成。</p><div class="hero-stats"><span>可查看 ' + (summary.published + summary.returned) + ' 条</span><span>已归还 ' + summary.returned + ' 件</span><span>热心同学 ' + summary.helpers + ' 位</span></div></div><div class="hero-quote"><strong>五心服务</strong><span>把五心放进每一次发布、认领和归还。</span></div></div>'
      + '<form class="hero-search" data-form="home-search">' + icon('search') + '<input type="search" name="q" placeholder="搜物品名称或地点" aria-label="搜索失物招领"><button type="submit">搜索</button></form></section>'
      + '<div class="quick-actions"><a class="quick-card" href="#/publish?type=lost"><span class="quick-icon">' + icon('search') + '</span><span><strong>我丢了东西</strong><span>发布一条寻物信息</span></span></a><a class="quick-card" href="#/publish?type=found"><span class="quick-icon">' + icon('heart') + '</span><span><strong>我捡到东西</strong><span>留下招领信息，等失主认领</span></span></a><a class="quick-card" href="#/posts"><span class="quick-icon">' + icon('list') + '</span><span><strong>看看全部信息</strong><span>按分类和关键词查找</span></span></a></div>'
      + fiveHearts
      + returnHtml
      + '<section class="section"><div class="section-head"><div><h2>置顶与最新</h2><p>置顶信息优先，其余按发布时间排序</p></div><a href="#/posts">查看全部 ' + all.length + ' 条</a></div>'
      + (feed.length ? '<div class="card-grid">' + feed.map(postCard).join('') + '</div>' : '<div class="empty">' + icon('box') + '<h2>还没有信息</h2><p>发布第一条失物招领，让同学看到。</p></div>') + '</section>'
      + '<section class="section"><div class="section-head"><div><h2>按分类找</h2><p>证件、电子产品、钥匙、书籍等</p></div></div><div class="category-scroll">' + categories.map(function (c) {
        return '<a class="category-chip" style="--chip-color:' + esc(c.color) + '" href="#/posts?category=' + encodeURIComponent(c.id) + '"><i></i>' + esc(c.name) + '<span>' + C.categoryCount(c.id) + '</span></a>';
      }).join('') + '</div></section>';
    shell('home', content);
  }

  function postsPage(params) {
    const type = params.get('type') || '';
    const category = params.get('category') || '';
    const q = (params.get('q') || '').trim();
    let list = C.publicPosts();
    if (type) list = list.filter(function (p) { return p.type === type; });
    if (category) list = list.filter(function (p) { return p.category_id === category; });
    if (q) {
      const lower = q.toLowerCase();
      list = list.filter(function (p) {
        return (p.title + p.description + p.location + p.category_name).toLowerCase().indexOf(lower) >= 0;
      });
    }
    const tabs = [['', '全部'], ['lost', '寻物'], ['found', '招领']];
    const content = pageHead('全部信息', '共 ' + list.length + ' 条，按发布时间排序', '<a class="btn btn-primary" href="#/publish">' + icon('plus') + '发布信息</a>')
      + '<div class="filter-bar"><div class="type-tabs">' + tabs.map(function (t) {
        return '<a class="' + (type === t[0] ? 'active' : '') + '" href="#/posts' + (t[0] ? '?type=' + t[0] : '') + '">' + t[1] + '</a>';
      }).join('') + '</div><div class="category-scroll">' + C.categories().map(function (c) {
        return '<a class="category-chip ' + (category === c.id ? 'active' : '') + '" style="--chip-color:' + esc(c.color) + '" href="#/posts?category=' + encodeURIComponent(c.id) + (type ? '&type=' + type : '') + '"><i></i>' + esc(c.name) + '</a>';
      }).join('') + '</div></div>'
      + (q ? '<div class="field-hint">搜索：' + esc(q) + '　<a href="#/posts">清除</a></div>' : '')
      + (list.length ? '<div class="card-grid" style="margin-top:12px">' + list.map(postCard).join('') + '</div>' : '<div class="empty">' + icon('search') + '<h2>没有找到相关信息</h2><p>换个关键词，或查看其他分类。</p></div>');
    shell('posts', content);
  }

  function detailPage(id) {
    const post = C.postById(id);
    const isOwner = student && post && Number(post.publisher_id) === Number(student.id);
    const visible = post && (post.status === 'published' || post.status === 'returned' || isOwner);
    if (!visible) {
      shell('posts', '<div class="empty">' + icon('alert') + '<h2>信息不存在</h2><p>这条信息可能已经被删除。</p><a class="btn btn-primary" href="#/posts">返回全部信息</a></div>');
      return;
    }
    post.views = Number(post.views || 0) + 1;
    C.save();
    const related = C.publicPosts().filter(function (p) { return p.id !== post.id && p.category_id === post.category_id; }).slice(0, 3);
    const actions = [];
    if (isOwner && post.status === 'published') {
      actions.push('<button class="btn btn-primary" type="button" data-action="return-post" data-id="' + post.id + '">' + icon('heart') + '标记为已归还</button>');
    }
    if (!isOwner) {
      actions.push('<button class="btn btn-primary" type="button" data-action="copy-contact" data-contact="' + esc(post.contact) + '">' + icon('copy') + '复制联系方式</button>');
    }
    const content = '<a class="back-link" href="#/posts">' + icon('back') + '返回全部信息</a><div class="detail-layout"><div class="detail-main"><div class="detail-image">' + imageMarkup(post) + '</div><div class="detail-body"><div class="detail-badges">' + typeBadge(post) + (post.pinned ? '<span class="status-badge is-pinned">置顶</span>' : '') + statusBadge(post) + '<span class="status-badge">' + esc(post.category_name) + '</span></div>'
      + '<h1>' + esc(post.title) + '</h1>'
      + (post.status === 'returned' ? '<div class="return-note"><strong>这件物品已经回到主人身边</strong>' + esc(post.thanks || '谢谢每一位帮忙留意的同学。') + '</div>' : '')
      + (post.status === 'pending' ? '<div class="review-note"><strong>等待教师审核</strong>审核通过后，这条信息会出现在首页和全部信息里。</div>' : '')
      + (post.status === 'rejected' ? '<div class="review-note is-reject"><strong>审核未通过</strong>' + esc(post.review_note || '内容不符合发布要求，请修改后重新提交。') + '</div>' : '')
      + '<div class="detail-description">' + esc(post.description) + '</div>'
      + '<div class="detail-facts"><div class="fact"><span>地点</span><strong>' + esc(post.location) + '</strong></div><div class="fact"><span>' + (post.type === 'lost' ? '丢失时间' : '捡到时间') + '</span><strong>' + C.formatDate(post.happened_at, true) + '</strong></div><div class="fact"><span>发布时间</span><strong>' + C.formatDate(post.created_at, true) + '</strong></div><div class="fact"><span>浏览</span><strong>' + Number(post.views || 0) + ' 次</strong></div></div>'
      + '<div class="detail-actions">' + actions.join('') + '<a class="btn btn-ghost" href="#/posts">继续看看</a></div></div></div>'
      + '<aside class="detail-side"><div class="side-card"><h2>发布人</h2><div class="publisher"><span class="publisher-avatar">' + esc(post.publisher_name.slice(0, 1)) + '</span><span><strong>' + esc(post.publisher_name) + '</strong><span>' + esc(C.departmentName(post.publisher_department)) + ' · ' + esc(post.publisher_class) + '</span></span></div><div class="contact-row"><span>联系方式</span><strong>' + esc(post.contact) + '</strong></div><div class="contact-row"><span>当前状态</span><strong>' + C.statusText(post.status) + '</strong></div></div>'
      + '<div class="side-note"><strong>认领提醒</strong><br>请先核对物品特征，再联系发布人。贵重物品建议在学生工作处见证下归还，不要私下转账。</div>'
      + (related.length ? '<div class="side-card"><h2>同类信息</h2><div class="related-list">' + related.map(function (p) { return '<a href="' + postHref(p.id) + '">' + esc(p.title) + '</a>'; }).join('') + '</div></div>' : '') + '</aside></div>';
    shell('posts', content);
  }

  function publishPage(params) {
    const type = params.get('type') === 'found' ? 'found' : 'lost';
    const content = pageHead('发布信息', '提交后进入待审核，教师审核通过后公开展示', '<a class="btn" href="#/my">我的发布</a>')
      + '<div class="form-layout"><form class="form-panel" data-form="publish"><h2>填写物品信息</h2>'
      + '<div class="type-toggle"><label class="type-option"><input type="radio" name="type" value="lost"' + (type === 'lost' ? ' checked' : '') + '><span><strong>我丢了东西</strong><span>发布寻物信息</span></span></label><label class="type-option"><input type="radio" name="type" value="found"' + (type === 'found' ? ' checked' : '') + '><span><strong>我捡到东西</strong><span>发布招领信息</span></span></label></div>'
      + '<div class="field"><label for="postTitle">物品名称</label><input id="postTitle" name="title" maxlength="40" required placeholder="例如：一张校园一卡通"></div>'
      + '<div class="field-row"><div class="field"><label for="postCategory">分类</label><select id="postCategory" name="category_id" required>' + C.categories().map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('') + '</select></div>'
      + '<div class="field"><label for="postTime">' + (type === 'lost' ? '丢失时间' : '捡到时间') + '</label><input id="postTime" name="happened_at" type="datetime-local" required></div></div>'
      + '<div class="field"><label for="postLocation">地点</label><input id="postLocation" name="location" maxlength="50" required placeholder="例如：图书馆三楼靠窗座位"></div>'
      + '<div class="field"><label for="postDescription">详细描述</label><textarea id="postDescription" name="description" maxlength="400" required placeholder="写清物品特征、颜色、明显标记，方便核对。"></textarea><div class="field-hint">不要填写身份证号、银行卡号等敏感信息。</div></div>'
      + '<div class="field"><label for="postContact">联系方式</label><input id="postContact" name="contact" maxlength="60" required placeholder="例如：2025级网络班 林知夏，或认领地点"></div>'
      + '<div class="field"><label class="file-field" for="postImage"><span><strong>上传物品照片</strong><br>可选，有图会优先显示图片；没有图片时显示分类图标</span><input id="postImage" name="image" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png"></label><div class="image-preview" data-image-preview hidden><img alt="物品照片预览"></div></div>'
      + '<div class="form-actions"><a class="btn" href="#/home">取消</a><button class="btn btn-primary" type="submit">提交审核</button></div></form>'
      + '<aside class="form-aside"><h3>发布前请确认</h3><p>提交后由教师审核，通过后才会展示；请写清物品特征，方便失主或捡到的人核对。</p><p>捡到贵重物品时，建议先交到学生工作处或门卫室，再发布招领信息。</p><p>认领时请让对方描述物品细节，避免冒领；联系方式仅登录后可见。</p></aside></div>';
    shell('publish', content);
  }

  function myPage(params) {
    const filter = params.get('status') || '';
    const mine = C.postsOfUser(student.id);
    const list = filter ? mine.filter(function (p) { return p.status === filter; }) : mine;
    const counts = {
      all: mine.length,
      pending: mine.filter(function (p) { return p.status === 'pending'; }).length,
      published: mine.filter(function (p) { return p.status === 'published'; }).length,
      returned: mine.filter(function (p) { return p.status === 'returned'; }).length,
      rejected: mine.filter(function (p) { return p.status === 'rejected'; }).length
    };
    const tabs = [['', '全部'], ['pending', '待审核'], ['published', '已发布'], ['returned', '已归还'], ['rejected', '已驳回']];
    const content = '<div class="my-head"><span class="my-avatar">' + esc(student.real_name.slice(0, 1)) + '</span><div><h1>' + esc(student.real_name) + '</h1><p>' + esc(C.departmentName(student.department)) + ' · ' + esc(student.class_name) + ' · <a class="my-publish-link" href="#/publish">发布新信息</a></p></div><div class="my-stats"><div><strong>' + mine.length + '</strong><span>发布</span></div><div><strong>' + counts.returned + '</strong><span>已归还</span></div><div><strong>' + counts.published + '</strong><span>已发布</span></div></div></div>'
      + '<div class="my-toolbar"><div class="status-tabs">' + tabs.map(function (t) { return '<a class="' + (filter === t[0] ? 'active' : '') + '" href="#/my' + (t[0] ? '?status=' + t[0] : '') + '">' + t[1] + (counts[t[0] || 'all'] ? ' ' + counts[t[0] || 'all'] : '') + '</a>'; }).join('') + '</div></div>'
      + (list.length ? '<div class="my-list">' + list.map(function (p) {
        return '<article class="my-item"><a class="my-thumb" href="' + postHref(p.id) + '">' + imageMarkup(p) + '</a><div class="my-copy"><h2><a href="' + postHref(p.id) + '">' + esc(p.title) + '</a></h2><p>' + C.typeText(p.type) + ' · ' + esc(p.category_name) + ' · ' + C.relativeTime(p.created_at) + '</p><span class="status-badge ' + C.statusClass(p.status) + '">' + C.statusText(p.status) + '</span>' + (p.status === 'rejected' && p.review_note ? '<p class="review-reason">驳回原因：' + esc(p.review_note) + '</p>' : '') + '</div><div class="my-actions">' + (p.status === 'published' ? '<button class="btn btn-sm" type="button" data-action="return-post" data-id="' + p.id + '">标记归还</button>' : '') + '</div></article>';
      }).join('') + '</div>' : '<div class="empty">' + icon('box') + '<h2>这里还没有信息</h2><p>丢了东西或捡到东西，都可以发布一条。</p><a class="btn btn-primary" href="#/publish">发布信息</a></div>');
    shell('my', content);
  }

  function profilePage() {
    const mine = C.postsOfUser(student.id);
    const returned = mine.filter(function (p) { return p.status === 'returned'; }).length;
    const content = '<div class="profile-card"><div class="profile-head"><span class="my-avatar">' + esc(student.real_name.slice(0, 1)) + '</span><div><h1>' + esc(student.real_name) + '</h1><p>' + esc(C.departmentName(student.department)) + ' · ' + esc(student.class_name) + ' · @' + esc(student.username) + '</p></div></div>'
      + '<div class="profile-numbers"><div class="profile-number"><strong>' + mine.length + '</strong><span>发布信息</span></div><div class="profile-number"><strong>' + returned + '</strong><span>已归还</span></div><div class="profile-number"><strong>' + (returned * 5) + '</strong><span>热心值</span></div></div>'
      + '<div class="kindness-note"><strong>五心 · 一点点热心</strong><br>每一次认真发布和归还，都是学校数字服务的一部分。平台会记录已归还的信息，但不会公开你的联系方式。</div></div>'
      + '<div class="menu-list" style="margin-top:12px"><a class="menu-item" href="#/my">' + icon('list') + '我的发布' + icon('arrow', 'menu-arrow') + '</a><a class="menu-item" href="#/posts">' + icon('box') + '全部信息' + icon('arrow', 'menu-arrow') + '</a><a class="menu-item" href="admin.html">' + icon('shield') + '管理端入口' + icon('arrow', 'menu-arrow') + '</a><button class="menu-item" type="button" data-action="logout">' + icon('logout') + '退出登录' + icon('arrow', 'menu-arrow') + '</button></div>'
    shell('my', content);
  }

  function handleLogin(form) {
    const username = form.querySelector('[name="username"]').value.trim();
    const password = form.querySelector('[name="password"]').value;
    if (!username || !password) {
      showToast('请输入账号和密码', 'error');
      return;
    }
    const result = C.login('student', username, password);
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }
    student = result.user;
    showToast('欢迎回来，' + result.user.real_name);
    go('/home');
  }

  async function handlePublish(form) {
    const type = form.querySelector('[name="type"]:checked').value;
    const title = form.querySelector('[name="title"]').value.trim();
    const categoryId = form.querySelector('[name="category_id"]').value;
    const happenedAt = form.querySelector('[name="happened_at"]').value;
    const location = form.querySelector('[name="location"]').value.trim();
    const description = form.querySelector('[name="description"]').value.trim();
    const contact = form.querySelector('[name="contact"]').value.trim();
    const file = form.querySelector('[name="image"]').files[0];
    const errors = [];
    if (!title) errors.push('请填写物品名称');
    if (!happenedAt) errors.push('请选择时间');
    if (!location) errors.push('请填写地点');
    if (!description) errors.push('请填写物品描述');
    if (!contact) errors.push('请填写联系方式');
    if (file && file.size > 2 * 1024 * 1024) errors.push('图片不能超过 2MB');
    if (file && ['image/jpeg', 'image/png'].indexOf(file.type) < 0) errors.push('图片只支持 JPG 或 PNG');
    if (errors.length) {
      showToast(errors[0], 'error');
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      let imageKey = '';
      if (file) {
        imageKey = 'post_' + Date.now() + '_' + Math.random().toString(16).slice(2, 8);
        await C.putMedia(imageKey, file);
      }
      C.addPost({
        type: type,
        title: title,
        category_id: categoryId,
        happened_at: happenedAt.replace('T', ' ') + ':00',
        location: location,
        description: description,
        contact: contact,
        image_key: imageKey
      }, student);
      showToast('已提交审核，请等待教师审核');
      go('/my?status=pending');
    } catch (err) {
      console.warn(err);
      button.disabled = false;
      showToast('提交失败，请换一张小一点的图片再试', 'error');
    }
  }

  function markReturned(id) {
    const post = C.postById(id);
    if (!post) return;
    const dialog = openDialog('物品已归还', '<p>确认这件物品已经回到主人身边？可以写一句给对方的祝福，会显示在详情页。</p><div class="field"><label for="thanksText">归还留言（可选）</label><textarea id="thanksText" maxlength="120" placeholder="例如：已经找到主人啦，下次注意保管。"></textarea></div>',
      '<button class="btn" type="button" data-dialog-cancel>取消</button><button class="btn btn-primary" type="button" data-dialog-confirm>确认已归还</button>');
    dialog.querySelector('[data-dialog-cancel]').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('[data-dialog-confirm]').addEventListener('click', function () {
      const thanks = dialog.querySelector('#thanksText').value.trim();
      C.markReturned(id, thanks, student);
      dialog.close();
      showToast('已标记为归还，谢谢你');
      renderRoute();
    });
  }

  function renderRoute() {
    const current = route();
    student = C.currentUser('student');
    if (!student && current.path !== '/login') {
      go('/login');
      return;
    }
    if (student && current.path === '/login') {
      go('/home');
      return;
    }
    const path = current.path;
    if (path === '/login') loginPage();
    else if (path === '/home') homePage();
    else if (path === '/posts') postsPage(current.params);
    else if (/^\/post\/\d+$/.test(path)) detailPage(Number(path.split('/')[2]));
    else if (path === '/publish') publishPage(current.params);
    else if (path === '/my') myPage(current.params);
    else if (path === '/profile') profilePage();
    else go('/home');
  }

  document.addEventListener('click', function (event) {
    const logout = event.target.closest('[data-action="logout"]');
    if (logout) {
      C.clearSession('student');
      student = null;
      go('/login');
      return;
    }
    const demo = event.target.closest('[data-demo]');
    if (demo) {
      const form = demo.closest('form');
      form.querySelector('[name="username"]').value = demo.getAttribute('data-demo');
      form.querySelector('[name="password"]').value = '123456';
      return;
    }
    const returnButton = event.target.closest('[data-action="return-post"]');
    if (returnButton) {
      markReturned(Number(returnButton.getAttribute('data-id')));
      return;
    }
    const copy = event.target.closest('[data-action="copy-contact"]');
    if (copy) {
      const contact = copy.getAttribute('data-contact') || '';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(contact).then(function () { showToast('联系方式已复制'); });
      } else {
        showToast(contact);
      }
    }
  });

  document.addEventListener('change', function (event) {
    const input = event.target.closest('[name="image"]');
    if (!input) return;
    const preview = document.querySelector('[data-image-preview]');
    if (!preview) return;
    const file = input.files[0];
    if (!file) {
      preview.hidden = true;
      return;
    }
    preview.querySelector('img').src = URL.createObjectURL(file);
    preview.hidden = false;
  });

  document.addEventListener('submit', function (event) {
    const form = event.target;
    const type = form.getAttribute('data-form');
    if (!type) return;
    event.preventDefault();
    if (type === 'login') handleLogin(form);
    else if (type === 'publish') handlePublish(form);
    else if (type === 'home-search') {
      const q = form.querySelector('[name="q"]').value.trim();
      go('/posts', { q: q });
    }
  });

  C.subscribe(function (message) {
    student = C.currentUser('student');
    if (!student) {
      if (route().path !== '/login') go('/login');
      return;
    }
    if (route().path !== '/login' && route().path !== '/publish') renderRoute();
  });

  window.addEventListener('hashchange', renderRoute);
  if (!location.hash) location.hash = student ? '#/home' : '#/login';
  renderRoute();
})();
