(() => {

    const input = document.getElementById('name');
    const img = document.getElementById('headImg');
    const status = document.getElementById('status');
    let timer;

    /*   avatar  = 2D head
         helm    = 2D head with hat
         cube    = 3D 旋轉立方體
       想改 3D 請把 const type 改成 'cube'
    */
    const type = 'helm';     // 'avatar' | 'helm' | 'cube'
    const size = 256;        // 16~512 之間皆可

    /* ------------ 監聽輸入框 ------------ */
    input.addEventListener('input', () => {
        clearTimeout(timer);
        const name = input.value.trim();
        if (!name) { reset(); return; }
        timer = setTimeout(() => showHead(name), 200);
    });

    /* ------------ 產生圖片網址並顯示 ------------ */
    function showHead(name) {
        status.textContent = '';
        /* Minotar： https://minotar.net/{type}/{name}/{size} */
        img.src = `https://minotar.net/${type}/${encodeURIComponent(name)}/${size}`;
        img.alt = `${name} 的頭部`;
        /* 如果玩家不存在 => Minotar 送 Steve/Alex，不會觸發 error。
           不過網路斷線還是可能 error → fallback 一張本地紅叉圖 */
        img.onerror = () => {
            img.src = '';
            status.textContent = '載入失敗，請檢查網路或稍後再試';
        };
    }

    /* ------------ 清空預覽 ------------ */
    function reset() {
        img.removeAttribute('src');
        status.textContent = '';
    }

})();