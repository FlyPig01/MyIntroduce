/**
 * 游戏社交个人介绍网页 - 交互逻辑
 * 功能：页面加载动画 + 滚动触发动画（Intersection Observer）
 */

(function () {
  'use strict';

  /**
   * 页面加载完成后触发入场动画
   */
  function initLoadAnimation() {
    // 延迟一帧确保 CSS transition 初始状态已渲染
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add('loaded');
      });
    });
  }

  /**
   * Intersection Observer 驱动滚动触发动画
   * 元素进入视口时添加 .visible class
   */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal-on-scroll');

    if (!elements.length) return;

    // 检查 IntersectionObserver 支持
    if (!('IntersectionObserver' in window)) {
      // 不支持时直接显示所有元素
      for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add('visible');
      }
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // 每个元素只触发一次
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    for (var j = 0; j < elements.length; j++) {
      observer.observe(elements[j]);
    }
  }

  /**
   * 社交按钮点击波纹效果（可选微交互增强）
   */
  function initButtonRipple() {
    var buttons = document.querySelectorAll('.social-btn');

    function createRipple(event) {
      var btn = event.currentTarget;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var x = event.clientX - rect.left - size / 2;
      var y = event.clientY - rect.top - size / 2;

      var ripple = document.createElement('span');
      ripple.style.cssText =
        'position:absolute;' +
        'border-radius:50%;' +
        'background:rgba(255,255,255,0.15);' +
        'width:' +
        size +
        'px;' +
        'height:' +
        size +
        'px;' +
        'left:' +
        x +
        'px;' +
        'top:' +
        y +
        'px;' +
        'transform:scale(0);' +
        'animation:ripple 0.6s ease-out forwards;' +
        'pointer-events:none;';

      btn.appendChild(ripple);

      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });
    }

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', createRipple);
    }
  }

  // 注入 ripple 动画 keyframes（通过 JS 动态注入，保持 CSS 文件整洁）
  function injectRippleKeyframes() {
    var style = document.createElement('style');
    style.textContent =
      '@keyframes ripple{' +
      'to{transform:scale(4);opacity:0;}' +
      '}';
    document.head.appendChild(style);
  }

  /**
   * 社交按钮弹窗确认
   * 点击按钮 → 显示弹窗 → 确定后跳转
   */
  function initSocialModal() {
    var overlay = document.getElementById('modalOverlay');
    var infoEl = document.getElementById('modalInfo');
    var descEl = document.getElementById('modalDesc');
    var confirmBtn = document.getElementById('modalConfirm');
    var cancelBtn = document.getElementById('modalCancel');
    var pendingHref = null;
    var pendingTarget = null;

    function openModal(info, desc, href, target) {
      infoEl.textContent = info;
      descEl.textContent = desc;
      pendingHref = href;
      pendingTarget = target;
      overlay.classList.add('active');
    }

    function closeModal() {
      overlay.classList.remove('active');
      pendingHref = null;
      pendingTarget = null;
    }

    // 拦截社交按钮点击
    var buttons = document.querySelectorAll('.social-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        e.preventDefault();
        var info = this.getAttribute('data-info') || '';
        var desc = this.getAttribute('data-desc') || '';
        var href = this.getAttribute('href');
        var target = this.getAttribute('target');

        // Discord 占位（href="#"）不跳转
        if (href === '#' || !href) {
          openModal(info, desc, null, null);
          return;
        }

        openModal(info, desc, href, target);
      });
    }

    // 确定按钮 → 跳转
    confirmBtn.addEventListener('click', function () {
      if (pendingHref) {
        if (pendingTarget === '_blank') {
          window.open(pendingHref, '_blank', 'noopener');
        } else {
          window.location.href = pendingHref;
        }
      }
      closeModal();
    });

    // 取消按钮 → 关闭
    cancelBtn.addEventListener('click', closeModal);

    // 点击遮罩层 → 关闭
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // ESC 键关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeModal();
      }
    });
  }

  /**
   * 多语言翻译数据
   */
  var translations = {
    zh: {
      _name: '简体中文',
      nickname: '尘易飞',
      subtitle: '轻尘亦可飞扬',
      about: '关于我',
      intro: '我是一个计算机专业的大学生——虽然对计算机其实一窍不通来着。<br>不习惯开麦，我主要一个人玩Minecraft、RimWorld、VRChat等游戏。<br>想学习blender，Godot，但是是个懒癌患者，只学了个开头，其实可以说是从未开始。<br>做事情总是半途而废，即使是自己的兴趣。',
      favGames: '喜欢的游戏',
      contact: '联系我',
      emailLabel: '邮箱',
      footer: '别人晨练我晨睡，别人学习我拱被',
      cancel: '取消',
      confirm: '确定',
      qq: { title: 'QQ: 3261547169', info: 'QQ号：3261547169', desc: '点击确定将尝试打开 QQ 对话窗口' },
      email: { title: '邮箱: 3261547169@qq.com', info: '邮箱地址：3261547169@qq.com', desc: '点击确定将打开邮件客户端' },
      steam: { title: 'Steam 个人主页', info: '即将跳转到 Steam 个人主页', desc: 'steamcommunity.com/profiles/76561199515925903' }
    },
    en: {
      _name: 'English',
      nickname: 'ChenYiFei',
      subtitle: 'Even dust can soar',
      about: 'About Me',
      intro: "I'm a CS major in college — though honestly, I barely know a thing about computers.<br>I don't use voice chat much; I mostly play Minecraft, RimWorld, VRChat solo.<br>I want to learn Blender and Godot, but I'm chronically lazy — only got through the intro, or rather, never really started.<br>I always give up halfway, even on things I'm interested in.",
      favGames: 'Favorite Games',
      contact: 'Contact Me',
      emailLabel: 'Email',
      footer: 'While others jog at dawn, I sleep in; while others study, I hide under the covers.',
      cancel: 'Cancel',
      confirm: 'OK',
      qq: { title: 'QQ: 3261547169', info: 'QQ: 3261547169', desc: 'Click OK to open QQ chat' },
      email: { title: 'Email: 3261547169@qq.com', info: 'Email: 3261547169@qq.com', desc: 'Click OK to open email client' },
      steam: { title: 'Steam Profile', info: 'Opening Steam profile', desc: 'steamcommunity.com/profiles/76561199515925903' }
    },
    ja: {
      _name: '日本語',
      nickname: '尘易飞',
      subtitle: '塵もまた舞い上がる',
      about: '自己紹介',
      intro: 'コンピューター専攻の大学生です——とはいえ、コンピューターのことは実はさっぱりわかりません。<br>ボイスチャットは苦手で、主にMinecraft、RimWorld、VRChatなどを一人でプレイしています。<br>BlenderやGodotを学びたいと思っていますが、怠け者なので最初の部分しか進まず、というか実質始めていません。<br>自分の興味あることでも、いつも途中で投げ出してしまいます。',
      favGames: '好きなゲーム',
      contact: '連絡先',
      emailLabel: 'メール',
      footer: '他人が朝トレしている頃、私は朝寝。他人が勉強している頃、私は布団に潜る。',
      cancel: 'キャンセル',
      confirm: '確認',
      qq: { title: 'QQ: 3261547169', info: 'QQ番号：3261547169', desc: 'OKをクリックしてQQチャットを開く' },
      email: { title: 'メール: 3261547169@qq.com', info: 'メールアドレス：3261547169@qq.com', desc: 'OKをクリックしてメールクライアントを開く' },
      steam: { title: 'Steamプロフィール', info: 'Steamプロフィールに移動します', desc: 'steamcommunity.com/profiles/76561199515925903' }
    },
    ko: {
      _name: '한국어',
      nickname: '尘易飞',
      subtitle: '먼지도 날아오를 수 있다',
      about: '자기소개',
      intro: '컴퓨터 전공 대학생입니다——솔직히 컴퓨터에 대해서는 거의 모릅니다.<br>보이스 채팅은 익숙하지 않고, 주로 Minecraft, RimWorld, VRChat 등을 혼자 플레이합니다.<br>Blender와 Godot를 배우고 싶지만, 게으른 편이라 시작만 해놓고 사실상 진행한 적이 없습니다.<br>흥미 있는 일조차 항상 중간에 포기해버립니다.',
      favGames: '좋아하는 게임',
      contact: '연락처',
      emailLabel: '이메일',
      footer: '남들은 아침 운동을 할 때 나는 아침 잠을 자고, 남들은 공부를 할 때 나는 이불 속으로.',
      cancel: '취소',
      confirm: '확인',
      qq: { title: 'QQ: 3261547169', info: 'QQ번호: 3261547169', desc: '확인을 클릭하여 QQ 채팅 열기' },
      email: { title: '이메일: 3261547169@qq.com', info: '이메일 주소: 3261547169@qq.com', desc: '확인을 클릭하여 이메일 클라이언트 열기' },
      steam: { title: 'Steam 프로필', info: 'Steam 프로필로 이동합니다', desc: 'steamcommunity.com/profiles/76561199515925903' }
    }
  };

  /**
   * 语言切换器
   */
  function initLanguageSwitcher() {
    var switcher = document.getElementById('langSwitcher');
    var btn = document.getElementById('langBtn');
    var menu = document.getElementById('langMenu');
    var currentLabel = document.getElementById('langCurrent');
    var items = menu.querySelectorAll('li');
    var currentLang = 'zh';

    // 从 localStorage 恢复语言偏好
    var saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) { }
    if (saved && translations[saved]) {
      currentLang = saved;
    }

    /**
     * 应用翻译到页面
     */
    function applyLang(lang) {
      var t = translations[lang];
      if (!t) return;

      // 更新 data-i18n 文本元素
      var els = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < els.length; i++) {
        var key = els[i].getAttribute('data-i18n');
        if (t[key]) els[i].textContent = t[key];
      }

      // 更新 data-i18n-html HTML 元素
      var htmlEls = document.querySelectorAll('[data-i18n-html]');
      for (var j = 0; j < htmlEls.length; j++) {
        var hKey = htmlEls[j].getAttribute('data-i18n-html');
        if (t[hKey]) htmlEls[j].innerHTML = t[hKey];
      }

      // 更新社交按钮的 title / data-info / data-desc
      var btns = document.querySelectorAll('.social-btn');
      var btnClasses = ['qq', 'email', 'steam'];
      for (var k = 0; k < btns.length; k++) {
        for (var m = 0; m < btnClasses.length; m++) {
          if (btns[k].classList.contains(btnClasses[m]) && t[btnClasses[m]]) {
            btns[k].setAttribute('title', t[btnClasses[m]].title);
            btns[k].setAttribute('data-info', t[btnClasses[m]].info);
            btns[k].setAttribute('data-desc', t[btnClasses[m]].desc);
            break;
          }
        }
      }

      // 更新页面标题
      document.title = t.nickname + ' - ' + t.about;

      // 更新语言按钮显示
      currentLabel.textContent = t._name;

      // 更新菜单激活状态
      for (var n = 0; n < items.length; n++) {
        if (items[n].getAttribute('data-lang') === lang) {
          items[n].classList.add('active');
        } else {
          items[n].classList.remove('active');
        }
      }

      // 更新 <html> lang 属性
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;

      // 保存偏好
      try { localStorage.setItem('lang', lang); } catch (e) { }

      currentLang = lang;
    }

    // 切换菜单开合
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      switcher.classList.toggle('open');
    });

    // 点击外部关闭菜单
    document.addEventListener('click', function () {
      switcher.classList.remove('open');
    });

    // 菜单项点击切换语言
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener('click', function (e) {
        e.stopPropagation();
        var lang = this.getAttribute('data-lang');
        applyLang(lang);
        switcher.classList.remove('open');
      });
    }

    // 初始化应用语言
    applyLang(currentLang);
  }

  /**
   * Canvas 粒子背景
   * 轻量级粒子系统，向上漂浮的发光粒子
   */
  function initParticles() {
    var canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 100;
    var colors = ['rgba(0, 212, 255, ', 'rgba(168, 85, 247, ', 'rgba(255, 255, 255, ', 'rgba(0, 255, 200, '];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        size: Math.random() * 3 + 0.5,
        speed: Math.random() * 0.8 + 0.2,
        drift: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.01
      };
    }

    function initParticleArray() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        var p = createParticle();
        p.y = Math.random() * canvas.height;
        particles.push(p);
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y -= p.speed;
        p.x += p.drift;
        p.twinkle += p.twinkleSpeed;

        var flicker = (Math.sin(p.twinkle) + 1) * 0.5;
        var alpha = p.opacity * (0.5 + flicker * 0.5);

        // 粒子主体
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha + ')';
        ctx.fill();

        // 粒子光晕
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (alpha * 0.15) + ')';
        ctx.fill();

        // 重置出界粒子
        if (p.y < -20) {
          particles[i] = createParticle();
        }
      }

      requestAnimationFrame(animate);
    }

    resize();
    initParticleArray();
    animate();

    window.addEventListener('resize', function () {
      resize();
      initParticleArray();
    });
  }

  // --- 初始化 ---
  function init() {
    injectRippleKeyframes();
    initLoadAnimation();
    initScrollReveal();
    initButtonRipple();
    initSocialModal();
    initLanguageSwitcher();
    initParticles();
  }

  // DOM 就绪后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
