// ==UserScript==
// @name         Google Scholar to dblp
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Quickly search on dblp.
// @author       yusanshi
// @match        https://scholar.google.com/scholar?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=scholar.google.com
// @require      https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  document.arrive(
    '#gs_res_ccl_mid > div.gs_r.gs_or.gs_scl',
    { existing: true },
    function () {
      const url = new URL('https://dblp.org/search');
      const title = this.querySelector('h3.gs_rt > a').innerText;
      url.searchParams.set('q', title);
      url.searchParams.set('clean', 'true');
      this.querySelector('div.gs_ri div.gs_fl').insertAdjacentHTML(
        'beforeend',
        `<button class="dblp-iframe-button" type="button" style="height:22px">Search dblp</button>`
      );
      this.querySelector('button.dblp-iframe-button').addEventListener(
        'click',
        () => {
          if (this.querySelectorAll('iframe').length > 0) {
            this.querySelector('iframe').remove();
          } else {
            this.insertAdjacentHTML(
              'beforeend',
              `<iframe width="100%" height="400" style="margin-top:10px;border:1px solid rgb(220, 220, 220);border-radius:5px;" src="${url.href}"></iframe>`
            );
          }
        }
      );
    }
  );

  // TODO: also add "Show Google Bib"
})();
