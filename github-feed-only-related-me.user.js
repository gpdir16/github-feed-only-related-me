// ==UserScript==
// @name         github-feed-only-related-me
// @namespace    https://github.com/gpdir16/github-feed-only-related-me
// @version      1.0.0
// @author       gpdir16 <me@gpdir16.com>
// @supportURL   https://github.com/gpdir16/github-feed-only-related-me
// @license      MIT
// @description  Show only activity directly related to you in your GitHub home feed. (hide activity from people you follow)
// @match        https://github.com/
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// TIP:
// If you want to see the unfiltered feed, go to https://github.com/dashboard.

// 팁:
// 필터링되지 않은 피드를 보고싶다면 https://github.com/dashboard로 접속하세요.

(() => {
    'use strict';

    const KEEP_PATTERNS = [
        /\bstarred your repository\b/i,
        /\bforked your repository\b/i,
        /\bstarted following you\b/i,
        /\bmentioned you\b/i,
        /\bassigned you\b/i,
        /\brequested your review\b/i,
        /\bcommented on your issue\b/i,
        /\bcommented on your pull request\b/i,
        /\bcommented on your discussion\b/i,
    ];

    const FEED_ITEM_SELECTOR = [
        'article.js-feed-item-component',
        '[data-testid="feed-item"]',
    ].join(',');

    function normalizeText(element) {
        return (element.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isRelatedToMe(item) {
        const text = normalizeText(item);
        return KEEP_PATTERNS.some(pattern => pattern.test(text));
    }

    function filterItem(item) {
        if (!(item instanceof HTMLElement)) return;

        if (isRelatedToMe(item)) {
            item.style.removeProperty('display');
            item.removeAttribute('data-my-feed-hidden');
        } else {
            item.style.setProperty('display', 'none', 'important');
            item.setAttribute('data-my-feed-hidden', 'true');
        }
    }

    function filterAll() {
        document
            .querySelectorAll(FEED_ITEM_SELECTOR)
            .forEach(filterItem);
    }

    // 처음 로딩된 카드 처리
    filterAll();

    // 무한스크롤 대응
    let timer = null;

    const observer = new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(filterAll, 50);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    // SPA 페이지 이동 대응
    document.addEventListener('turbo:load', filterAll);
    document.addEventListener('pjax:end', filterAll);
})();
