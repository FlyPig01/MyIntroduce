/**
 * 游戏社交个人介绍网页 - 交互逻辑
 * 功能：预加载 + 打字机 + 3D视差 + 粒子连线 + 进度条 + 回到顶部 + 复制 + Toast + 音乐
 */

(function () {
  'use strict';

  /**
   * 预加载动画
   */
  function initPreloader() {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;

    var done = false;
    function hide() {
      if (done) return;
      done = true;
      setTimeout(function () {
        preloader.classList.add('hidden');
        setTimeout(function () {
          if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
          document.body.classList.add('loaded');
          initScrollReveal();
        }, 500);
      }, 600);
    }

    window.addEventListener('load', hide);
    // 最长等3秒，超过则强制关闭（防止大文件阻塞）
    setTimeout(hide, 3000);
  }

  /**
   * 页面加载完成后触发入场动画（去掉preloader后的备用）
   */
  function initLoadAnimation() {
    // 由 preloader 接管
  }

  /**
   * 打字机效果
   */
  var typewriterPhrases = {
    zh: ['别人晨练我晨睡，别人学习我拱被', '懒癌晚期，放弃治疗', '今天也在游戏里度过', '想学的东西总在明天开始'],
    en: ['While others jog, I sleep in', 'Chronic procrastinator', 'Gaming all day every day', 'Tomorrow I will start learning'],
    ja: ['他人が朝練、私は朝寝', '怠け者、治療放棄', '今日もゲーム三昧', '勉強はいつも明日から'],
    ko: ['남들은 운동, 나는 침대', '게으름은 불치병', '오늘도 게임 속으로', '공부는 내일부터']
  };

  function initTypewriter() {
    var el = document.getElementById('typewriterLine');
    if (!el) return;

    var currentLang = 'zh';
    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var timeoutId = null;
    var cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    el.parentNode.insertBefore(cursor, el.nextSibling);

    function type() {
      var lang = getCurrentLang();
      var phrases = typewriterPhrases[lang] || typewriterPhrases.zh;
      var phrase = phrases[phraseIndex];

      if (isDeleting) {
        el.textContent = phrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = phrase.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === phrase.length) {
        timeoutId = setTimeout(function () { isDeleting = true; type(); }, 2000);
        return;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }

      var speed = isDeleting ? 40 : 80 + Math.random() * 60;
      timeoutId = setTimeout(type, speed);
    }

    // 初始延迟
    timeoutId = setTimeout(type, 1500);

    // 语言切换时重置并重启
    var flags = document.getElementById('langFlags');
    if (flags) {
      flags.addEventListener('click', function (e) {
        var btn = e.target.closest('.lang-flag');
        if (btn) {
          var lang = btn.getAttribute('data-lang');
          if (lang !== currentLang) {
            currentLang = lang;
            phraseIndex = 0;
            charIndex = 0;
            isDeleting = false;
            el.textContent = '';
            clearTimeout(timeoutId);
            timeoutId = setTimeout(type, 200);
          }
        }
      });
    }
  }

  function getCurrentLang() {
    var active = document.querySelector('.lang-flag.active');
    return active ? active.getAttribute('data-lang') : 'zh';
  }

  /**
   * 3D 视差头像
   */
  function initAvatarTilt() {
    var wrapper = document.querySelector('.avatar-wrapper');
    if (!wrapper) return;

    // 移动端跳过
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    wrapper.classList.add('tilt-active');
    var avatar = wrapper.querySelector('.avatar');

    wrapper.addEventListener('mousemove', function (e) {
      var rect = wrapper.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      var rotateX = (y / rect.height) * -20;
      var rotateY = (x / rect.width) * 20;

      avatar.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
      avatar.style.boxShadow =
        (x > 0 ? '' : '-') + '0 0 30px rgba(0, 212, 255, 0.35), ' +
        (x > 0 ? '-' : '') + '0 0 60px rgba(168, 85, 247, 0.2)';
    });

    wrapper.addEventListener('mouseleave', function () {
      avatar.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
      avatar.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.25), 0 0 60px rgba(0, 212, 255, 0.1)';
    });
  }

  /**
   * Intersection Observer 驱动滚动触发动画
   */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal-on-scroll');

    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
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
            observer.unobserve(entry.target);
            // 触发技能条动画
            if (entry.target.classList.contains('skills-section')) {
              animateSkillBars(entry.target);
            }
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
   * 技能进度条动画
   */
  function animateSkillBars(section) {
    var fills = section.querySelectorAll('.skill-bar-fill');
    for (var i = 0; i < fills.length; i++) {
      (function (fill, idx) {
        var pct = fill.parentElement.previousElementSibling.querySelector('.skill-pct');
        var target = parseInt(pct.getAttribute('data-pct')) || 0;
        var current = 0;
        var duration = 1000;
        var start = null;

        function step(timestamp) {
          if (!start) start = timestamp;
          var progress = Math.min((timestamp - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          current = Math.round(target * eased);
          fill.style.width = current + '%';
          pct.textContent = current + '%';
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }

        setTimeout(function () {
          requestAnimationFrame(step);
        }, 200 + idx * 150);
      })(fills[i], i);
    }
  }

  /**
   * 社交按钮点击波纹效果
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
        'position:absolute;border-radius:50%;background:rgba(255,255,255,0.15);' +
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + x + 'px;top:' + y + 'px;' +
        'transform:scale(0);animation:ripple 0.6s ease-out forwards;pointer-events:none;';

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    }

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', createRipple);
    }
  }

  function injectRippleKeyframes() {
    var style = document.createElement('style');
    style.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0;}}';
    document.head.appendChild(style);
  }

  /**
   * 社交按钮弹窗确认
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

    var buttons = document.querySelectorAll('.social-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        e.preventDefault();
        var info = this.getAttribute('data-info') || '';
        var desc = this.getAttribute('data-desc') || '';
        var href = this.getAttribute('href');
        var target = this.getAttribute('target');

        if (href === '#' || !href) {
          openModal(info, desc, null, null);
          return;
        }

        openModal(info, desc, href, target);
      });
    }

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

    cancelBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });
  }

  /**
   * Toast 提示
   */
  function showToast(message) {
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    toast.addEventListener('animationend', function (e) {
      if (e.animationName === 'toastOut') {
        toast.remove();
      }
    });
  }

  /**
   * 一键复制
   */
  function initCopyButtons() {
    var buttons = document.querySelectorAll('.copy-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        e.stopPropagation();
        var text = this.getAttribute('data-copy') || '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showToast('已复制');
          }).catch(function () {
            fallbackCopy(text);
          });
        } else {
          fallbackCopy(text);
        }
      });
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('已复制'); } catch (e) { showToast('复制失败'); }
      document.body.removeChild(ta);
    }
  }

  /**
   * 滚动进度条
   */
  function initScrollProgress() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollTop = window.scrollY || document.documentElement.scrollTop;
          var docHeight = document.documentElement.scrollHeight - window.innerHeight;
          var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          bar.style.width = Math.min(pct, 100) + '%';
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * 回到顶部
   */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 300) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * 背景音乐开关
   */
  function initMusicToggle() {
    var btn = document.getElementById('musicToggle');
    if (!btn) return;

    var audio = new Audio('audio/Jam - 七月上_H.ogg');
    audio.loop = true;
    audio.volume = 0.3;
    var playing = false;

    function play() {
      audio.play().then(function () {
        btn.classList.remove('paused');
        btn.classList.add('playing');
        playing = true;
      }).catch(function () {
        btn.classList.add('paused');
      });
    }

    function pause() {
      audio.pause();
      btn.classList.remove('playing');
      btn.classList.add('paused');
      playing = false;
    }

    btn.addEventListener('click', function () {
      if (playing) { pause(); } else { play(); }
    });

    // 自动播放：页面加载后尝试，失败则等首次点击
    setTimeout(function () {
      audio.play().then(function () {
        btn.classList.add('playing');
        playing = true;
      }).catch(function () {
        btn.classList.add('paused');
        function onFirstTouch() {
          play();
          document.removeEventListener('click', onFirstTouch);
          document.removeEventListener('touchstart', onFirstTouch);
        }
        document.addEventListener('click', onFirstTouch);
        document.addEventListener('touchstart', onFirstTouch);
      });
    }, 1000);
  }

  /**
   * 多语言翻译数据
   */
  var translations = {
    zh: {
      _name: '简体中文',
      subtitle: '轻尘亦可飞扬',
      about: '关于我',
      intro: '我是一个计算机专业的大学生——虽然对计算机其实一窍不通来着。<br>不习惯开麦，我主要一个人玩Minecraft、RimWorld、VRChat等游戏。<br>想学习blender，Godot，但是是个懒癌患者，只学了个开头，其实可以说是从未开始。<br>做事情总是半途而废，即使是自己的兴趣。',
      favGames: '喜欢的游戏',
      contact: '联系我',
      emailLabel: '邮箱',
      cancel: '取消',
      confirm: '确定',
      qq: { title: 'QQ: 3261547169', info: 'QQ号：3261547169', desc: '点击确定将尝试打开 QQ 对话窗口' },
      email: { title: '邮箱: 3261547169@qq.com', info: '邮箱地址：3261547169@qq.com', desc: '点击确定将打开邮件客户端' },
      steam: { title: 'Steam 个人主页', info: '即将跳转到 Steam 个人主页', desc: 'steamcommunity.com/profiles/76561199515925903' },
      learning: '正在学习',
      drawing: '绘画',
      coding: '编程',
      copyToast: '已复制',
      skillNote1: '学了开头，然后...打开了游戏',
      skillNote2: '下载了引擎，看了教程序章',
      skillNote3: '买了数位板，画了几条线',
      skillNote4: 'Hello World 之后的迷雾'
    },
    en: {
      _name: 'English',
      subtitle: 'Even dust can soar',
      about: 'About Me',
      intro: "I'm a CS major in college — though honestly, I barely know a thing about computers.<br>I don't use voice chat much; I mostly play Minecraft, RimWorld, VRChat solo.<br>I want to learn Blender and Godot, but I'm chronically lazy — only got through the intro, or rather, never really started.<br>I always give up halfway, even on things I'm interested in.",
      favGames: 'Favorite Games',
      contact: 'Contact Me',
      emailLabel: 'Email',
      cancel: 'Cancel',
      confirm: 'OK',
      qq: { title: 'QQ: 3261547169', info: 'QQ: 3261547169', desc: 'Click OK to open QQ chat' },
      email: { title: 'Email: 3261547169@qq.com', info: 'Email: 3261547169@qq.com', desc: 'Click OK to open email client' },
      steam: { title: 'Steam Profile', info: 'Opening Steam profile', desc: 'steamcommunity.com/profiles/76561199515925903' },
      learning: 'Learning',
      drawing: 'Drawing',
      coding: 'Coding',
      copyToast: 'Copied',
      skillNote1: 'Learned the basics, then... opened a game',
      skillNote2: 'Downloaded the engine, watched tutorial intro',
      skillNote3: 'Bought a tablet, drew a few lines',
      skillNote4: 'Lost in the fog beyond Hello World'
    },
    ja: {
      _name: '日本語',
      subtitle: '塵もまた舞い上がる',
      about: '自己紹介',
      intro: 'コンピューター専攻の大学生です——とはいえ、コンピューターのことは実はさっぱりわかりません。<br>ボイスチャットは苦手で、主にMinecraft、RimWorld、VRChatなどを一人でプレイしています。<br>BlenderやGodotを学びたいと思っていますが、怠け者なので最初の部分しか進まず、というか実質始めていません。<br>自分の興味あることでも、いつも途中で投げ出してしまいます。',
      favGames: '好きなゲーム',
      contact: '連絡先',
      emailLabel: 'メール',
      cancel: 'キャンセル',
      confirm: '確認',
      qq: { title: 'QQ: 3261547169', info: 'QQ番号：3261547169', desc: 'OKをクリックしてQQチャットを開く' },
      email: { title: 'メール: 3261547169@qq.com', info: 'メールアドレス：3261547169@qq.com', desc: 'OKをクリックしてメールクライアントを開く' },
      steam: { title: 'Steamプロフィール', info: 'Steamプロフィールに移動します', desc: 'steamcommunity.com/profiles/76561199515925903' },
      learning: '勉強中',
      drawing: '絵',
      coding: 'プログラミング',
      copyToast: 'コピーしました',
      skillNote1: '基礎を学んだ後…ゲームを起動',
      skillNote2: 'エンジンをDL、チュートリアル序章だけ',
      skillNote3: 'ペンタブ購入、数本の線を描いた',
      skillNote4: 'Hello Worldの先の霧'
    },
    ko: {
      _name: '한국어',
      subtitle: '먼지도 날아오를 수 있다',
      about: '자기소개',
      intro: '컴퓨터 전공 대학생입니다——솔직히 컴퓨터에 대해서는 거의 모릅니다.<br>보이스 채팅은 익숙하지 않고, 주로 Minecraft, RimWorld, VRChat 등을 혼자 플레이합니다.<br>Blender와 Godot를 배우고 싶지만, 게으른 편이라 시작만 해놓고 사실상 진행한 적이 없습니다.<br>흥미 있는 일조차 항상 중간에 포기해버립니다.',
      favGames: '좋아하는 게임',
      contact: '연락처',
      emailLabel: '이메일',
      cancel: '취소',
      confirm: '확인',
      qq: { title: 'QQ: 3261547169', info: 'QQ번호: 3261547169', desc: '확인을 클릭하여 QQ 채팅 열기' },
      email: { title: '이메일: 3261547169@qq.com', info: '이메일 주소: 3261547169@qq.com', desc: '확인을 클릭하여 이메일 클라이언트 열기' },
      steam: { title: 'Steam 프로필', info: 'Steam 프로필로 이동합니다', desc: 'steamcommunity.com/profiles/76561199515925903' },
      learning: '공부 중',
      drawing: '그림',
      coding: '코딩',
      copyToast: '복사됨',
      skillNote1: '기초 배운 후... 게임 실행',
      skillNote2: '엔진 다운로드, 튜토리얼 서문만',
      skillNote3: '타블렛 구매, 선 몇 개 그림',
      skillNote4: 'Hello World 너머의 안개'
    }
  };

  /**
   * 语言切换器
   */
  function initLanguageSwitcher() {
    var flags = document.getElementById('langFlags');
    var flagBtns = flags.querySelectorAll('.lang-flag');
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
      document.title = '尘易飞 - ' + t.about;

      // 更新国旗激活状态
      for (var n = 0; n < flagBtns.length; n++) {
        if (flagBtns[n].getAttribute('data-lang') === lang) {
          flagBtns[n].classList.add('active');
        } else {
          flagBtns[n].classList.remove('active');
        }
      }

      // 更新 <html> lang 属性
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;

      // 保存偏好
      try { localStorage.setItem('lang', lang); } catch (e) { }

      currentLang = lang;
    }

    // 点击国旗切换语言
    for (var i = 0; i < flagBtns.length; i++) {
      flagBtns[i].addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        if (lang !== currentLang) {
          applyLang(lang);
        }
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

      // 粒子连线网络
      var maxDist = 120;
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            var lineAlpha = (1 - dist / maxDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(0, 212, 255, ' + lineAlpha + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
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
    initPreloader();
    initTypewriter();
    initAvatarTilt();
    initScrollProgress();
    initBackToTop();
    initCopyButtons();
    initMusicToggle();
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
