//產品DOM
const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
//初始化畫面
function init() {
    getProductData();
    getCartData();
}
init();
//axios接產品資料
let productData;
function getProductData() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).then(function (response) {
        productData = response.data.products;
        // console.log(productData);
        renderProductData();
    })
        .catch(function (error) {
            // 失敗會回傳的內容
            console.log(error);
        })
}
//組產品字串函式
function combineProductList(value) {
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${value.images}"
        alt="">
    <a href="#" class="addCardBtn" data-id='${value.id}' data-title='${value.title}' >加入購物車</a>
    <h3>${value.title}</h3>
    <del class="originPrice">NT$${value.origin_price}</del>
    <p class="nowPrice">NT$${value.price}</p>
</li>`;
}
//產品資料渲染
function renderProductData() {
    let str = '';
    productData.forEach(function (value) {
        str += combineProductList(value);
    })
    productWrap.innerHTML = str;
}
//下拉選單資料篩選
productSelect.addEventListener('change', function (e) {
    if (e.target.value == '全部') {
        renderProductData();
        return;
    }
    let str = ''
    productData.forEach(function (value) {
        if (value.category == e.target.value) {
            str += combineProductList(value);
        }
    })
    productWrap.innerHTML = str;
})

//購物車DOM
const shoppingCartList = document.querySelector('.shoppingCart-list');
const cartTotalPrice = document.querySelector('.cart-total-price');
const shoppingCartTable = document.querySelector('.shoppingCart-table');
//axios接購物車資料
let cartData;
function getCartData() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).then(function (response) {
        cartData = response.data;
        // console.log(cartData);
        renderCartList();
    })
}
//顯示購物車資料
function renderCartList() {
    let str = '';
    cartData.carts.forEach(function (value) {
        str += `<tr>
<td>
    <div class="cardItem-title">
        <img src="${value.product.images}" alt="">
        <p>${value.product.title}</p>
    </div>
</td>
<td>NT$${value.product.price}</td>
<td>${value.quantity}</td>
<td>NT$${value.product.price * value.quantity}</td>
<td class="discardBtn">
    <a href="#" class="material-icons" cartId="${value.id}" id="cart-delete">
        clear
    </a>
</td>
</tr>`
    })
    shoppingCartList.innerHTML = str;
    cartTotalPrice.textContent = `NT$${cartData.finalTotal}`;
}
//加入購物車資料
productWrap.addEventListener('click', function (e) {
    e.preventDefault();
    let productName = e.target.getAttribute('data-title');
    if (e.target.getAttribute('class') !== 'addCardBtn') {
        console.log('沒有點擊到加入購物車按鈕');
        return;
    }
    let productId = e.target.getAttribute('data-id');
    let productNum = 1;
    cartData.carts.forEach(function (value) {
        if (value.product.id == productId) {
            value.quantity = value.quantity + 1;
            productNum = value.quantity;
            // console.log(`與購物車資料相符${productNum}`);
        }
    })
    // console.log(`與購物車資料不同${productNum}`);
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productId,
            "quantity": productNum
        }
    }).then(function (response) {
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: `${productName}加入購物車成功`,
            showConfirmButton: false,
            timer: 1500
        })
        getCartData();
    }).catch(function (error) {
        console.log(error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
        })
    })
})
//刪除購物車資料
shoppingCartTable.addEventListener('click', function (e) {
    e.preventDefault();
    let cartId = e.target.getAttribute('cartId');
    //刪除購物車單筆資料
    if (e.target.getAttribute('id') == 'cart-delete') {
        // console.log('成功點擊到刪除單筆訂單按鈕');
        // console.log(cartId);
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
            .then(function (response) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: `刪除購物車資料成功`,
                    showConfirmButton: false,
                    timer: 1500
                });
                getCartData();
            })
            .catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong!',
                })
                console.log(error);
            })
    }
    //刪除全部購物車資料
    if (e.target.getAttribute('class') == 'discardAllBtn') {
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
            .then(function (response) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: `刪除全部購物車資料成功`,
                    showConfirmButton: false,
                    timer: 1500
                });
                getCartData();
            })
            .catch(function (error) {
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `${error.response.data.message}`,
                })
            })
    }
})

//訂單DOM
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const orderInfoForm = document.querySelector('.orderInfo-form');
//新增訂單(條件：購物車有資料&&訂單資料欄位都有填寫)
orderInfoBtn.addEventListener('click', function (e) {
    e.preventDefault();
    let cartLength = cartData.carts.length;
    if (cartLength == 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...訂單無法成立!',
            text: '請先加入購物車後再成立訂單',
        })
        orderInfoForm.reset();
        return;
    }
    if (customerName.value == '' || customerPhone.value == '' || customerEmail.value == '' || customerAddress.value == '' || tradeWay.value == '') {
        Swal.fire({
            icon: 'error',
            title: 'Oops...訂單無法成立!',
            text: '請正確填寫訂單資料',
        })
        orderInfoForm.reset();
        return;
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
        "data": {
            "user": {
                "name": customerName.value,
                "tel": customerPhone.value,
                "email": customerEmail.value,
                "address": customerAddress.value,
                "payment": tradeWay.value
            }
        }
    }).then(function (response) {
        getCartData();
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: `訂單已成立，感謝您的訂購`,
            showConfirmButton: false,
            timer: 1500
        });
    }).catch(function (error) {
        console.log(error.response.data.message);
    })
    orderInfoForm.reset();
})
