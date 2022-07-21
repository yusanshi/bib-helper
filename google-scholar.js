// ==UserScript==
// @name         Google Scholar Bib Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy BibTeX record quickly within search results.
// @author       yusanshi
// @match        https://scholar.google.com/scholar?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=scholar.google.com
// @require      https://cdn.jsdelivr.net/npm/arrive@2.4.1/minified/arrive.min.js
// @grant        none
// ==/UserScript==

function toggleShowHide(div) {
  if (div.style.display !== 'none') {
    div.style.display = 'none';
  } else {
    div.style.display = 'block';
  }
}

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
        `<button class="google-bib-button" type="button" style="height:22px">Show Bib</button> <button class="dblp-iframe-button" type="button" style="height:22px;margin-left:8px;">Search DBLP</button>`
      );
      this.insertAdjacentHTML(
        'beforeend',
        `<div class="google-bib-container"></div> <div class="dblp-iframe-container"></div>`
      );

      this.querySelector('.google-bib-button').addEventListener('click', () => {
        const container = this.querySelector('.google-bib-container');
        if (container.hasChildNodes()) {
          toggleShowHide(container);
        } else {
          container.innerHTML = `<textarea rows="10" class="bib-textarea" style="font-size:11px;margin-top:8px;border-color:rgb(220,220,220);border-radius:5px;outline:none;width:100%;color:gray;" onclick="this.select()">Fetching BibTeX record...</textarea>`;

          const bibTextArea = this.querySelector('.bib-textarea');
          document.arrive('#gs_citi', { existing: true }, async () => {
            const bibTagArray = Array.from(
              document.querySelectorAll('#gs_citi a')
            ).filter((e) => e.textContent === 'BibTeX');
            if (bibTagArray.length === 1) {
              const bibURL = bibTagArray[0].href;
              try {
                const bibText = await fetch(bibURL).then((e) => e.text());
                bibTextArea.value = bibText;
              } catch (error) {
                bibTextArea.value = bibURL;
              }
            } else {
              bibTextArea.value = 'BibTeX entry not found!';
            }
          });
        }
      });
      this.querySelector('.dblp-iframe-button').addEventListener(
        'click',
        () => {
          const container = this.querySelector('.dblp-iframe-container');
          if (container.hasChildNodes()) {
            toggleShowHide(container);
          } else {
            container.innerHTML = `<iframe width="100%" height="400" style="margin-top:8px;border:1px solid rgb(220, 220, 220);border-radius:5px;" src="${url.href}"></iframe>`;
          }
        }
      );
    }
  );
})();
