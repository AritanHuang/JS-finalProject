const orderList = document.querySelector('.orderList');
//初始化後台畫面資料
function init() {
    getOrderData();
}
init();
//接訂單資料api
let orderData = [];
function getOrderData() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders
`, {
        headers: {
            'Authorization': token
        }
    }).then(function (response) {
        orderData = response.data.orders;
        // console.log(orderData);
        renderOrderData();
    })
}

//渲染訂單資料
function renderOrderData() {
    //訂單狀態處理
    let str = ''
    orderData.forEach(function (value) {
        //處理訂單日期
        let date = new Date(value.createdAt * 1000);
        let orderYear = date.getFullYear();
        let orderMonth = date.getMonth() + 1;
        let orderDate = date.getDate();
        let orderTime = `${orderYear}/${orderMonth}/${orderDate}`;
        // console.log(value);
        //組產品資料字串
        let productStr = '';
        value.products.forEach(function (productValue) {
            productStr += `${productValue.title}*${productValue.quantity}`
        })
        // console.log(productStr);
        //判斷訂單狀態
        let orderStatus = '';
        if (value.paid == true) {
            orderStatus = '已處理';
        }
        else {
            orderStatus = '未處理';
        }
        str += `<tr>
        <td>${value.id}</td>
        <td>
            <p>${value.user.name}</p>
            <p>${value.user.tel}</p>
        </td>
        <td>${value.user.address}</td>
        <td>${value.user.email}</td>
        <td>
            <p>${productStr}</p>
        </td>
        <td>${orderTime}</td>
        <td class="orderStatus">
            <a class='btn-status'data-id="${value.id}"  data-status="${value.paid}"href="#">${orderStatus}</a>
        </td>
        <td>
            <input type="button" data-id="${value.id}" class="delSingleOrder-Btn" value="刪除">
        </td>
    </tr>`;
    })
    orderList.innerHTML = str;
    renderC3();
}
//監聽點擊按鈕
orderList.addEventListener('click', function (e) {
    e.preventDefault();
    let id = e.target.getAttribute('data-id');
    if (e.target.getAttribute('class') == 'btn-status') {
        // alert('點擊到訂單狀態按鈕');
        let status = e.target.getAttribute('data-status')
        // console.log(typeof (status));
        changeStatus(status, id);
    }
    else if (e.target.getAttribute('class') == 'delSingleOrder-Btn') {
        deleteOrder(id);
    }
})

//修改訂單狀態
function changeStatus(status, id) {
    let newStatus;
    // console.log(status == 'true');
    if (status == 'true') {
        newStatus = false;
    }
    else {
        newStatus = true;
    }
    // console.log(newStatus);
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders
    `, {
        "data": {
            "id": id,
            "paid": newStatus
        }
    }, {
        headers: {
            'Authorization': token
        }
    }).then(function (response) {
        // console.log(response);
        alert('修改訂單成功');
        getOrderData();
    }).catch(function (error) {
        console.log(error);
    })
}
//刪除單筆訂單
function deleteOrder(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}
`, {
        headers: {
            'Authorization': token
        }
    }).then(function (response) {
        console.log(response);
        alert(`刪除${id}訂單成功`);
        getOrderData();
    }).catch(function (error) {
        console.log(error);
    })
}
// C3JS圖表渲染
function renderC3() {
    let categoryTotal = {};
    orderData.forEach(function (value) {
        value.products.forEach(function (productValue) {
            if (categoryTotal[productValue.category] == undefined) {
                categoryTotal[productValue.category] = productValue.price * productValue.quantity
            }
            else {
                categoryTotal[productValue.category] += productValue.price * productValue.quantity
            }
        })
    })
    const categoryAry = Object.keys(categoryTotal);
    let totalAry = [];
    categoryAry.forEach(function (value) {
        let ary = [];
        ary.push(value);
        ary.push(categoryTotal[value]);
        totalAry.push(ary);
    })
    // console.log(totalAry);
    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: totalAry,
            colors: {
                "床架": "#DACBFF",
                "收納": "#9D7FEA",
                "窗簾": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}
//刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token
        }
    }).then(function (response) {
        console.log(response);
        alert('全部訂單已刪除');
        getOrderData();
    }).catch(function (error) {
        console.log(error);
    })
})
