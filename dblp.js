// ==UserScript==
// @name         DBLP Bib Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy BibTeX records quickly within search results.
// @author       yusanshi
// @license      MIT
// @match        https://dblp.org/search?*
// @match        https://dblp.org/pid/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dblp.org
// @require      https://cdn.jsdelivr.net/npm/arrive@2.4.1/minified/arrive.min.js
// @require      https://cdn.jsdelivr.net/gh/ORCID/bibtexParseJs@b55dc9e4015f9dec67921f56f8f23dadb71697ad/bibtexParse.min.js
// @require      https://cdn.jsdelivr.net/npm/lozad/dist/lozad.min.js
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  if (new URL(document.location).searchParams.get('clean') === 'true') {
    // https://stackoverflow.com/questions/4277792/hide-all-elements-except-one-div-and-its-child-element
    // DBLP has loaded jquery 3.x itself, no need to @require it.
    $('#completesearch-publs')
      .show()
      .parentsUntil('body')
      .addBack()
      .siblings()
      .hide();
    // why $('#completesearch-facets').hide() not working
    GM_addStyle('#completesearch-facets {display:none!important}');
  }

  const entrySelector = '#completesearch-publs li.entry';

  document.arrive(entrySelector, { existing: true }, async function () {
    const bibURL = this.querySelector(
      'nav.publ > ul > li:nth-child(2) > div.head > a'
    ).href.replace('.html', '.bib');
    const entryIndex = Array.from(
      document.querySelectorAll(entrySelector)
    ).indexOf(this);
    this.querySelector('cite').insertAdjacentHTML(
      'beforeend',
      `<textarea rows="10" id="bibtext${entryIndex}" class="bib-textarea verbatim" style="font-size:11px;margin-top:6px;width:100%;display:block;" onclick="this.select()" data-src="${bibURL}">Fetching BibTeX record...</textarea>`
    );
    // lazy loads bibtex entries
    const observer = lozad(`#bibtext${entryIndex}`, {
      load: function(element) {
        const bibURL = element.getAttribute('data-src');
        function reqListener () {
          const bibText = this.responseText;
          const bibJSON = bibtexParse.toJSON(bibText);
          bibJSON[0].citationKey = bibJSON[0].citationKey.replace(
            /[^a-zA-Z0-9]+/g,
            '_'
          );
          element.value = bibtexParse.toBibtex(
            bibJSON,
            false
          );
        }
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", reqListener);
        oReq.open("GET", bibURL);
        oReq.send();
      }
    });
    observer.observe();
  });
})();
