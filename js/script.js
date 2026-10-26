/* TCsM portfolio — progressive enhancement only. The site works without JS. */
(function () {
    'use strict';

    /* ---------- Hamburger nav ---------- */
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('headerNav');
    if (toggle && nav) {
        var setOpen = function (open) {
            nav.classList.toggle('open', open);
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
        };
        toggle.addEventListener('click', function () {
            setOpen(!nav.classList.contains('open'));
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setOpen(false);
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) setOpen(false);
        });
    }

    /* ---------- Certificate carousel ---------- */
    var track = document.getElementById('upgradesTrack');
    if (track) {
        var step = function () {
            var card = track.querySelector('.main-about-upgrade-card');
            return card ? card.offsetWidth + 20 : 280;
        };
        var left = document.querySelector('.main-about-upgrades-arrow.left');
        var right = document.querySelector('.main-about-upgrades-arrow.right');
        if (left) left.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
        if (right) right.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
        track.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') track.scrollBy({ left: -step(), behavior: 'smooth' });
            if (e.key === 'ArrowRight') track.scrollBy({ left: step(), behavior: 'smooth' });
        });
    }

    /* ---------- Missions filter ---------- */
    var filterBtns = document.querySelectorAll('.main-missions-filter-btn');
    var cards = document.querySelectorAll('.main-missions-card');
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var f = btn.dataset.filter;
            filterBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
            cards.forEach(function (c) {
                c.classList.toggle('hidden', f !== 'all' && c.dataset.category !== f);
            });
        });
    });

    /* ---------- Close mission modal with Esc ---------- */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && /^#mission-/.test(location.hash)) {
            location.hash = '#missions-closed';
        }
    });

    /* ---------- Scroll reveal ---------- */
    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    var el = en.target;
                    el.classList.add('in');
                    io.unobserve(el);
                    // once revealed, hand control back to the element's own hover styles
                    setTimeout(function () {
                        el.classList.remove('reveal');
                        el.style.transitionDelay = '';
                    }, 1000);
                }
            });
        }, { threshold: 0.12 });
        items.forEach(function (el, i) {
            el.style.transitionDelay = (i % 3) * 90 + 'ms';
            io.observe(el);
        });
    } else {
        items.forEach(function (el) { el.classList.add('in'); });
    }

    /* ---------- Stat counters ---------- */
    var counters = document.querySelectorAll('[data-count]');
    counters.forEach(function (el) {
        var target = parseInt(el.dataset.count, 10) || 0;
        if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        el.textContent = '0';
        var cio = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return;
            cio.disconnect();
            var start = null;
            var tick = function (ts) {
                if (start === null) start = ts;
                var p = Math.min((ts - start) / 900, 1);
                el.textContent = String(Math.round(target * p));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
        cio.observe(el);
    });

    /* ---------- Contact form: send through EmailJS ---------- */
    var form = document.getElementById('transmitForm');
    var btn = document.getElementById('transmitSubmitBtn');
    var status = document.getElementById('transmitStatus');
    if (form && btn) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }
            if (form.website && form.website.value) return; // honeypot: bots only

            var key = form.dataset.emailjsKey;
            if (!window.emailjs || !key || key.indexOf('YOUR_') === 0) { form.submit(); return; } // fallback to send.php

            btn.disabled = true;
            btn.textContent = 'Transmitting...';
            emailjs.init({ publicKey: key });
            emailjs.send(form.dataset.emailjsService, form.dataset.emailjsTemplate, {
                title:   'Portfolio',
                name:    form.name.value,
                email:   form.email.value,
                message: form.message.value,
                time:    new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })
            })
                .then(function () {
                    status.className = 'main-transmit-status success';
                    status.textContent = 'TRANSMISSION SENT \u2014 STAND BY FOR REPLY.';
                    form.reset();
                })
                .catch(function () {
                    status.className = 'main-transmit-status error';
                    status.textContent = 'TRANSMISSION FAILED \u2014 TRY AGAIN OR EMAIL ME DIRECTLY.';
                })
                .finally(function () {
                    btn.disabled = false;
                    btn.textContent = 'Send Transmission';
                });
        });
    }
})();
