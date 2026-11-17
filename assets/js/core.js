(function () {
  const DATA_KEY = 'kiera2_lostfound_data_20261117';
  const STUDENT_KEY = 'kiera2_student_session_20261117';
  const TEACHER_KEY = 'kiera2_teacher_session_20261117';
  const CHANNEL_NAME = 'kiera2_lostfound_updates';
  const MEDIA_DB = 'kiera2_media_20261117';
  const VERSION = window.KIERA2_SEED && window.KIERA2_SEED.version;

  let state = loadState();
  let channel = null;
  let listeners = [];
  let dbPromise = null;
  let memoryFiles = new Map();
  let urlCache = new Map();

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = function (event) {
      const message = event.data || {};
      state = loadState();
      listeners.forEach(function (fn) {
        try { fn(message); } catch (err) { console.warn(err); }
      });
    };
  } catch (err) {
    channel = null;
  }

  function clone(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function normalize(data) {
    data.users = Array.isArray(data.users) ? data.users : [];
    data.categories = Array.isArray(data.categories) ? data.categories : [];
    data.posts = Array.isArray(data.posts) ? data.posts : [];
    data.logs = Array.isArray(data.logs) ? data.logs : [];
    return data;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.version === VERSION) return normalize(data);
      }
    } catch (err) {
      console.warn(err);
    }
    const data = normalize(clone(window.KIERA2_SEED));
    try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch (err) { console.warn(err); }
    return data;
  }

  function save() {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  function emit(message) {
    const payload = Object.assign({ type: 'state' }, message || {});
    if (channel) channel.postMessage(payload);
    listeners.forEach(function (fn) {
      try { fn(payload); } catch (err) { console.warn(err); }
    });
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return function () {};
    listeners.push(fn);
    return function () {
      listeners = listeners.filter(function (item) { return item !== fn; });
    };
  }

  window.addEventListener('storage', function (event) {
    if (event.key === DATA_KEY) {
      state = loadState();
      listeners.forEach(function (fn) { fn({ type: 'state' }); });
    }
    if (event.key === STUDENT_KEY || event.key === TEACHER_KEY) {
      listeners.forEach(function (fn) { fn({ type: 'session' }); });
    }
  });

  function reset() {
    state = normalize(clone(window.KIERA2_SEED));
    save();
    localStorage.removeItem(STUDENT_KEY);
    localStorage.removeItem(TEACHER_KEY);
    if (window.indexedDB) {
      try { indexedDB.deleteDatabase(MEDIA_DB); } catch (err) { console.warn(err); }
    }
    emit({ type: 'state', reset: true });
  }

  function departments() {
    return state.departments || window.KIERA2_SEED.departments;
  }

  function departmentName(id) {
    const d = departments().find(function (item) { return item.id === id; });
    return d ? d.name : '未填写';
  }

  function categories() {
    return state.categories.slice();
  }

  function categoryById(id) {
    return state.categories.find(function (c) { return c.id === id; }) || null;
  }

  function categoryCount(id) {
    return state.posts.filter(function (p) {
      return p.category_id === id && (p.status === 'published' || p.status === 'returned');
    }).length;
  }

  function userById(id) {
    return state.users.find(function (u) { return Number(u.id) === Number(id); }) || null;
  }

  function hashPassword(password, salt) {
    if (!window.CryptoJS) throw new Error('密码组件未加载');
    return CryptoJS.SHA256(String(salt) + ':' + String(password)).toString(CryptoJS.enc.Hex);
  }

  function login(role, username, password) {
    const user = state.users.find(function (u) {
      return u.username.toLowerCase() === String(username).trim().toLowerCase() && u.role === role;
    });
    if (!user) return { ok: false, message: '账号或密码错误' };
    if (Number(user.status) !== 1) return { ok: false, message: '该账号已被停用，请联系学生工作处' };
    if (hashPassword(password, user.password_salt) !== user.password_hash) {
      return { ok: false, message: '账号或密码错误' };
    }
    localStorage.setItem(role === 'teacher' ? TEACHER_KEY : STUDENT_KEY, JSON.stringify({ userId: user.id, at: Date.now() }));
    emit({ type: 'session', role: role });
    return { ok: true, user: user };
  }

  function currentUser(role) {
    try {
      const raw = JSON.parse(localStorage.getItem(role === 'teacher' ? TEACHER_KEY : STUDENT_KEY) || 'null');
      if (!raw || !raw.userId) return null;
      const user = userById(raw.userId);
      if (!user || user.role !== role || Number(user.status) !== 1) {
        clearSession(role);
        return null;
      }
      return user;
    } catch (err) {
      return null;
    }
  }

  function clearSession(role) {
    localStorage.removeItem(role === 'teacher' ? TEACHER_KEY : STUDENT_KEY);
    emit({ type: 'session', role: role });
  }

  function publicPosts() {
    return state.posts.filter(function (p) {
      return p.status === 'published' || p.status === 'returned';
    }).sort(function (a, b) {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      return parseDate(b.created_at) - parseDate(a.created_at);
    });
  }

  function postById(id) {
    return state.posts.find(function (p) { return Number(p.id) === Number(id); }) || null;
  }

  function postsOfUser(userId) {
    return state.posts.filter(function (p) { return Number(p.publisher_id) === Number(userId); })
      .sort(function (a, b) { return parseDate(b.created_at) - parseDate(a.created_at); });
  }

  function addLog(post, action, reason, operator) {
    state.logs.unshift({
      id: Math.max.apply(null, state.logs.map(function (l) { return Number(l.id); }).concat(0)) + 1,
      post_id: post.id,
      post_title: post.title,
      action: action,
      reason: reason || '',
      operator: operator ? operator.real_name : '系统',
      created_at: nowString()
    });
  }

  function addPost(data, user) {
    const category = categoryById(data.category_id);
    const post = {
      id: Math.max.apply(null, state.posts.map(function (p) { return Number(p.id); }).concat(0)) + 1,
      type: data.type,
      title: data.title,
      category_id: data.category_id,
      category_name: category ? category.name : '其他',
      description: data.description,
      location: data.location,
      happened_at: data.happened_at,
      contact: data.contact,
      publisher_id: user.id,
      publisher_name: user.real_name,
      publisher_department: user.department,
      publisher_class: user.class_name,
      status: 'published',
      pinned: false,
      image_url: '',
      image_key: data.image_key || '',
      thanks: '',
      created_at: nowString(),
      returned_at: '',
      views: 0
    };
    state.posts.unshift(post);
    addLog(post, 'submit', '学生发布', user);
    save();
    emit({ type: 'post:new', post: post });
    return post;
  }

  function deletePost(id, operator) {
    const post = postById(id);
    state.posts = state.posts.filter(function (p) { return Number(p.id) !== Number(id); });
    if (post) addLog(post, 'delete', '删除信息', operator);
    save();
    emit({ type: 'post:delete', id: Number(id) });
  }

  function togglePin(id, operator) {
    const post = postById(id);
    if (!post || post.status !== 'published') return null;
    post.pinned = !post.pinned;
    addLog(post, post.pinned ? 'pin' : 'unpin', post.pinned ? '置顶信息' : '取消置顶', operator);
    save();
    emit({ type: 'post:pin', post: post });
    return post;
  }

  function markReturned(id, thanks, operator) {
    const post = postById(id);
    if (!post) return null;
    post.status = 'returned';
    post.pinned = false;
    post.returned_at = nowString();
    post.thanks = thanks || '已经找到主人，谢谢每一位帮忙留意的同学。';
    addLog(post, 'return', post.thanks, operator);
    save();
    emit({ type: 'post:return', post: post });
    return post;
  }

  function addCategory(data) {
    const name = String(data.name || '').trim();
    if (!name) return { ok: false, message: '请填写分类名称' };
    if (state.categories.some(function (c) { return c.name === name; })) return { ok: false, message: '该分类已存在' };
    const category = {
      id: 'c' + Date.now(),
      name: name,
      color: data.color || '#3f7fae',
      icon: data.icon || 'assets/images/categories/other.svg'
    };
    state.categories.push(category);
    save();
    emit({ type: 'category:new', category: category });
    return { ok: true, category: category };
  }

  function updateCategory(id, data) {
    const category = categoryById(id);
    if (!category) return { ok: false, message: '分类不存在' };
    const name = String(data.name || '').trim();
    if (!name) return { ok: false, message: '请填写分类名称' };
    if (state.categories.some(function (c) { return c.id !== id && c.name === name; })) {
      return { ok: false, message: '该分类名称已存在' };
    }
    category.name = name;
    category.color = data.color || category.color;
    state.posts.forEach(function (p) {
      if (p.category_id === id) p.category_name = name;
    });
    save();
    emit({ type: 'category:update', category: category });
    return { ok: true, category: category };
  }

  function deleteCategory(id) {
    const category = categoryById(id);
    if (!category) return { ok: false, message: '分类不存在' };
    const used = state.posts.some(function (p) { return p.category_id === id; });
    if (used) return { ok: false, message: '该分类下已有信息，不能删除' };
    state.categories = state.categories.filter(function (c) { return c.id !== id; });
    save();
    emit({ type: 'category:delete', id: id });
    return { ok: true };
  }

  function toggleUserStatus(id) {
    const user = userById(id);
    if (!user || user.role !== 'student') return null;
    user.status = Number(user.status) === 1 ? 0 : 1;
    save();
    emit({ type: 'user:update', user: user });
    return user;
  }

  function parseDate(value) {
    if (!value) return new Date(0);
    const d = new Date(String(value).replace(' ', 'T'));
    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  function formatDate(value, withTime) {
    const d = parseDate(value);
    if (!d.getTime()) return '';
    const base = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return withTime ? base + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') : base;
  }

  function nowString() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
      + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':00';
  }

  function relativeTime(value) {
    const diff = Date.now() - parseDate(value).getTime();
    if (diff < 0) return formatDate(value, true);
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' 天前';
    return formatDate(value);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function typeText(type) {
    return type === 'lost' ? '寻物' : '招领';
  }

  function statusText(status) {
    return { published: '已发布', returned: '已归还' }[status] || '已发布';
  }

  function statusClass(status) {
    return { published: 'is-published', returned: 'is-returned' }[status] || '';
  }

  function summary() {
    const published = state.posts.filter(function (p) { return p.status === 'published'; });
    const returned = state.posts.filter(function (p) { return p.status === 'returned'; });
    const pinned = state.posts.filter(function (p) { return p.pinned; });
    const helpers = new Set(returned.map(function (p) { return p.publisher_id; }));
    return {
      total: state.posts.length,
      published: published.length,
      returned: returned.length,
      pinned: pinned.length,
      helpers: helpers.size,
      categories: state.categories.length
    };
  }

  function openMediaDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('no indexeddb'));
      const req = indexedDB.open(MEDIA_DB, 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains('files')) req.result.createObjectStore('files');
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    }).catch(function (err) {
      console.warn(err);
      return null;
    });
    return dbPromise;
  }

  async function putMedia(key, blob) {
    const db = await openMediaDB();
    if (!db) {
      memoryFiles.set(key, blob);
      return key;
    }
    return new Promise(function (resolve, reject) {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').put(blob, key);
      tx.oncomplete = function () { resolve(key); };
      tx.onerror = function () { reject(tx.error); };
    });
  }

  async function getMedia(key) {
    if (!key) return null;
    if (memoryFiles.has(key)) return memoryFiles.get(key);
    const db = await openMediaDB();
    if (!db) return null;
    return new Promise(function (resolve, reject) {
      const tx = db.transaction('files', 'readonly');
      const req = tx.objectStore('files').get(key);
      req.onsuccess = function () { resolve(req.result || null); };
      req.onerror = function () { reject(req.error); };
    });
  }

  async function mediaUrl(key) {
    if (!key) return '';
    if (urlCache.has(key)) return urlCache.get(key);
    const blob = await getMedia(key);
    if (!blob) return '';
    const url = URL.createObjectURL(blob);
    urlCache.set(key, url);
    return url;
  }

  async function hydrateMedia(root) {
    const images = Array.from((root || document).querySelectorAll('[data-image-key]'));
    for (const img of images) {
      const url = await mediaUrl(img.getAttribute('data-image-key'));
      if (url) img.src = url;
    }
  }

  function categoryIcon(categoryId) {
    const category = categoryById(categoryId);
    return category ? category.icon : 'assets/images/categories/other.svg';
  }

  window.KIERA2 = window.KIERA2 || {};
  window.KIERA2.core = {
    get state() { return state; },
    loadState,
    save,
    reset,
    emit,
    subscribe,
    departments,
    departmentName,
    categories,
    categoryById,
    categoryCount,
    categoryIcon,
    userById,
    login,
    currentUser,
    clearSession,
    publicPosts,
    postById,
    postsOfUser,
    addPost,
    deletePost,
    togglePin,
    markReturned,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleUserStatus,
    parseDate,
    formatDate,
    nowString,
    relativeTime,
    escapeHtml,
    typeText,
    statusText,
    statusClass,
    summary,
    putMedia,
    mediaUrl,
    hydrateMedia
  };
})();
