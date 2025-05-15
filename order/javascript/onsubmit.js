/* ===== 8. 送出訂單 ============================================== */
const genId = () => Math.floor(10000 + Math.random() * 90000).toString();

form.addEventListener("submit", e => {
    e.preventDefault(); resultMsg.textContent = ""; submitBtn.disabled = true;

    // 取商品
    const items = [];
    [...tbody.rows].forEach(tr => {
        const pSel = tr.cells[0].querySelector("select");
        const vSel = tr.cells[1].querySelector("select");
        const qInp = tr.cells[2].querySelector("input");
        if (pSel.value && vSel.value) {
            items.push({
                product: products[pSel.value].display,
                variant: vSel.value,
                qty: Number(qInp.value),
                unit: products[pSel.value].variants[vSel.value]
            });
        }
    });
    if (!items.length) { resultMsg.className = "err"; resultMsg.textContent = "請至少選擇一項商品"; submitBtn.disabled = false; return; }

    // 數量限制
    const counter = {};
    for (const it of items) {
        const key = Object.keys(products).find(k => products[k].display === it.product);
        counter[key] = (counter[key] || 0) + it.qty;
        if (counter[key] > products[key].limit) {
            resultMsg.className = "err";
            resultMsg.textContent = `「${products[key].display}」購買數量超出上限`;
            submitBtn.disabled = false; return;
        }
    }

    // Hidden 欄位
    itemsInp.value = JSON.stringify(items);
    orderIdInp.value = genId();

    const fd = new FormData(form);

    /* ---------- 8-1. 寫入 Google 試算表 ---------- */
    const sendSheet = fetch(scriptURL, { method: "POST", body: fd });

    /* ---------- 8-2. 發送 Discord Webhook -------- */
    // 文字組裝
    const lines = items.map(it => `• ${it.variant} ×${it.qty} － $${(it.unit * it.qty).toFixed(2)}`).join("\n");
    const discordMsg = {
        username: "Kangaroo Bot",
        avatar_url: "",            // 可留空或自訂
        content:
            `🎉 **收到新訂單 #${fd.get("orderId")}**\n` +
            `👤 **${fd.get("name")}** | ✉️ ${fd.get("email")}\n` +
            `💰 總計：$${fd.get("total")}\n` +
            `💳 付款：${fd.get("payment")}\n` +
            `-----------------------------\n${lines}`
    };
    const sendDiscord = fetch(discordWebhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordMsg)
    });

    /* ---------- 結果處理 ---------- */
    Promise.all([sendSheet, sendDiscord])
        .then(r => {
            if (!r[0].ok) throw new Error("試算表寫入失敗");
            resultMsg.className = "ok";
            resultMsg.textContent = `✅落單成功！您的訂單編號 #${fd.get("orderId")}，請私訊您的訂單編號。`;
            form.reset(); tbody.innerHTML = ""; createRow();
            selectedCoupon = null; couponInput.value = ""; couponMsg.textContent = ""; updateTotals();
        })
        .catch(err => {
            resultMsg.className = "err";
            resultMsg.textContent = `落單失敗 (${err})`;
        })
        .finally(() => submitBtn.disabled = false);
});