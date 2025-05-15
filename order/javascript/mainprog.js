/* ===== 3. 取得 DOM ================================================= */
const tbody = document.querySelector("#itemTable tbody");
const addItemBtn = document.getElementById("addItemBtn");
const subTotalS = document.getElementById("subTotal");
const discountS = document.getElementById("discount");
const totalPriceS = document.getElementById("totalPrice");
const couponInput = document.getElementById("coupon");
const applyBtn = document.getElementById("applyCoupon");
const couponMsg = document.getElementById("couponMsg");
const itemsInp = document.getElementById("items");
const couponInp = document.getElementById("couponCode");
const discountInp = document.getElementById("discountVal");
const totalInp = document.getElementById("totalVal");
const orderIdInp = document.getElementById("orderId");
const form = document.getElementById("orderForm");
const resultMsg = document.getElementById("resultMsg");
const submitBtn = document.getElementById("submitBtn");

let selectedCoupon = null;

/* ===== 4. 建立商品列 ============================================== */
function createRow() {
    const tr = document.createElement("tr");

    const prodSel = document.createElement("select");
    prodSel.innerHTML = `<option value="" hidden selected>選擇商品</option>` +
        Object.entries(products).map(([k, p]) => `<option value="${k}">${p.display}</option>`).join("");
    const varSel = document.createElement("select");
    varSel.disabled = true; varSel.innerHTML = `<option value="" hidden selected>請先選商品</option>`;
    const qtyInp = document.createElement("input");
    qtyInp.type = "number"; qtyInp.min = 1; qtyInp.value = 1; qtyInp.disabled = true;
    const priceTd = document.createElement("td"); priceTd.textContent = "—";
    const delBtn = document.createElement("button");
    delBtn.type = "button"; delBtn.textContent = "✕"; delBtn.className = "delBtn";

    tr.append(
        cell(prodSel), cell(varSel),
        cell(qtyInp), priceTd, cell(delBtn)
    );
    tbody.append(tr);

    function cell(el) { const td = document.createElement("td"); td.append(el); return td; }

    prodSel.addEventListener("change", () => {
        const key = prodSel.value;
        varSel.innerHTML = ""; priceTd.textContent = "—"; qtyInp.value = 1;
        if (!key) {
            varSel.disabled = qtyInp.disabled = true;
            varSel.innerHTML = `<option value="" hidden selected>請先選商品</option>`;
            updateTotals(); return;
        }
        const { variants, limit } = products[key];
        varSel.append(new Option("選擇方案", "", true, true));
        for (const v of Object.keys(variants))
            varSel.append(new Option(`${v} - $${variants[v]}`, v));
        varSel.disabled = qtyInp.disabled = false; qtyInp.max = limit;
    });

    varSel.addEventListener("change", updateRowPrice);
    qtyInp.addEventListener("input", () => { if (qtyInp.value < 1) qtyInp.value = 1; updateRowPrice(); });
    delBtn.addEventListener("click", () => { tr.remove(); updateTotals(); });

    function updateRowPrice() {
        const key = prodSel.value, plan = varSel.value;
        if (products[key] && products[key].variants[plan]) {
            const price = products[key].variants[plan] * Number(qtyInp.value);
            priceTd.textContent = `$${price}`;
        } else priceTd.textContent = "—";
        updateTotals();
    }
}

/* ===== 5. 計算價格 =============================================== */
function updateTotals() {
    let subtotal = 0, hasTarget = false;
    [...tbody.rows].forEach(tr => {
        const priceTxt = tr.cells[3].textContent;
        if (priceTxt.startsWith("$")) subtotal += parseFloat(priceTxt.slice(1));
        // 指定商品檢查
        if (selectedCoupon && selectedCoupon.target) {
            const vSel = tr.cells[1].querySelector("select");
            if (vSel && vSel.value === selectedCoupon.target) hasTarget = true;
        }
    });

    let discount = 0; couponMsg.textContent = "";
    if (selectedCoupon) {
        const { type, value, threshold = 0, target, desc } = selectedCoupon;
        let ok = subtotal >= threshold;
        if (target && !hasTarget) ok = false;
        if (ok) {
            discount = type === "flat" ? value : subtotal * (value / 100);
            couponMsg.textContent = `已套用優惠：${desc}`;
        } else {
            if (target && !hasTarget) couponMsg.textContent = `不適用於此商品，此優惠只適用於 ${target} 。`;
            else couponMsg.textContent = `未達門檻 $${threshold}，折扣尚未生效`;
        }
    }

    const total = subtotal - discount;
    subTotalS.textContent = `$${subtotal.toFixed(2)}`;
    discountS.textContent = `-$${discount.toFixed(2)}`;
    totalPriceS.textContent = `$${total.toFixed(2)}`;

    totalInp.value = total.toFixed(2);
    discountInp.value = discount.toFixed(2);
}

/* ===== 6. 優惠碼 ================================================ */
applyBtn.addEventListener("click", () => {
    const code = couponInput.value.trim();
    const obj = window.coupons[code];
    if (!code) { couponMsg.textContent = "請輸入優惠碼"; selectedCoupon = null; couponInp.value = ""; updateTotals(); return; }
    if (!obj) { couponMsg.textContent = "優惠碼無效"; selectedCoupon = null; couponInp.value = ""; updateTotals(); return; }
    selectedCoupon = obj; couponInp.value = code; updateTotals();
});

/* ===== 7. 初始一列 ============================================== */
createRow(); addItemBtn.addEventListener("click", createRow);