// ==UserScript==
// @name         dblp BibTeX Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy BibTeX record quickly within search results.
// @author       yusanshi
// @match        https://dblp.org/search?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dblp.org
// @require      https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  if (new URL(document.location).searchParams.get('clean') === 'true') {
    // https://stackoverflow.com/questions/4277792/hide-all-elements-except-one-div-and-its-child-element
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
    this.querySelector('cite').insertAdjacentHTML(
      'beforeend',
      '<br><textarea rows="10" class="bibtex-record" style="font-size:11px;margin-top:6px;border-color:rgb(220,220,220);border-radius:5px;outline:none;width:100%;color:gray;" onclick="this.select()">Fetching BibTeX record...</textarea>'
    );
    const entryIndex = Array.from(
      document.querySelectorAll(entrySelector)
    ).indexOf(this);
    await new Promise((r) => setTimeout(r, 3000 * entryIndex));
    const bibURL = this.querySelector(
      'nav.publ > ul > li:nth-child(2) > div.head > a'
    ).href.replace('.html', '.bib');
    const bibText = await fetch(bibURL).then((e) => e.text());
    this.querySelector('textarea.bibtex-record').value = bibText;
  });

  // TODO: clean bib text with https://github.com/ORCID/bibtexParseJs
})();
