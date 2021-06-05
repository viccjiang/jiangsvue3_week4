// 使用 CDN ES module 引入
import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.js';

// 區域註冊 載入分頁元件
import pagination from './pagination.js';

// 定義接近全域變數，任何元件下都可以使用，全域都可呼叫
// 都是空值的差異
// null       由開發者加入
// undefined  由系統產生
// 助教寫法    let productModal = null; 空值
// 卡斯伯寫法  let productModal = {}; 空物件空字串
// 兩者最後結果相同
// 所以也可改用Ray助教寫法 let productModal = null;
// 為何是用空物件呢？因為 new bootstrap.Modal(document.getElementById('productModal')); 回傳的結果是物件
let productModal = {};
let delProductModal = {};

const app = createApp({
  data() {
    return {
      // 使用 function return
      // 加入站點
      apiUrl: 'https://vue3-course-api.hexschool.io',
      // 加入個人 API Path
      apiPath: 'jiangsvue3',
      products: [],// 產品列表
      isNew: false, // 判斷點擊的是新增按鈕方法還是編輯按鈕方法
      tempProduct: {
        // 預計調整資料使用結構，如:新增產品時的暫時資料儲存
        imagesUrl: [], // 第二層結構 //額外的結構
      },
      pagination: {},
    };
  },
  // 區域註冊，註冊分頁元件，區域註冊會加上s
  components: {
    pagination,
  },
  mounted() {
    // 取得資料、DOM元素
    this.getProducts();

    // Bootstrap 實體 modal 元件  => 建立新產品、編輯產品
    // https://bootstrap5.hexschool.com/docs/5.0/components/modal/
    // 把 new bootstrap 加到 productModal 變數裡面（變數是跨域的方式調用 ）

    // 建立新產品、編輯產品
    productModal = new bootstrap.Modal(document.getElementById('productModal'),
      {
        // keyboard:false時，按下esc時不關閉當前畫面
        keyboard: false,
      }
    );

    // 刪除產品
    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'),
      {
        // keyboard:false時，按下esc時不關閉當前畫面
        keyboard: false,
      }
    );
  },
  methods: {
    //取得產品列表，要取得產品列表要先取得 token
    getProducts(page = 1) {
      // 取得產品列表
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products?page=${page}`;
      axios
        .get(url) // 發出取得產品列表的請求
        .then((response) => { //接收回應
          if (response.data.success) { //如果資料狀態成功
            this.products = response.data.products; // 回傳回來的 products 結果
            this.pagination = response.data.pagination; // 回傳回來的 pagination 結果
          } else {
            console.log(response.data.message);// 帶入錯誤訊息
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    // 開啟建立新產品、編輯、刪除方法 
    // this.isNew = isNew; // “新增” 這件事情先存起來，如果是新的就走isNew的方法
    openModal(isNew, item) {
      if (isNew === 'new') {
        // 傳入new，等於新增產品
        // 把暫存資料清空
        this.tempProduct = {
          imagesUrl: [],
        };
        this.isNew = true;
        productModal.show();
      } else if (isNew === 'edit') {
        // 傳入edit，等於編輯產品
        this.tempProduct = { ...item };
        this.isNew = false;
        productModal.show();
      } else if (isNew === 'delete') {
        // 傳入delete，等於刪除產品
        this.tempProduct = { ...item };
        delProductModal.show();
      }
    },

    // // 圖片新增
    // createImages() {
    //   this.tempProduct.imagesUrl = [];
    //   this.tempProduct.imagesUrl.push('');
    // },

    // 新增產品 商品建立的 api
    // 會有兩種狀態作切換
    // 編輯訂單內容
    updateProduct(tempProduct) {
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
      let method = 'post'; // post 新增產品
      if (!this.isNew) { //如果不是新增，是編輯，則套用 put 
        url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${tempProduct.id}`;
        method = 'put'; // put 編輯產品
      }
      axios[method](url, { data: tempProduct }) // 套用method這個變數（陣列取值）
        .then((response) => {
          if (response.data.success) { //資料成功
            alert('產品新增、編輯成功');
            productModal.hide(); //關閉 modal
            this.getProducts(); //重新取得產品列表
          } else {
            // alert('response.data.message');
            alert('請重新輸入')
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    // 刪除產品方法
    delProduct(tempProduct) {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${tempProduct.id}`;
      axios.delete(url)
        .then((response) => {
          if (response.data.success) {
            alert('產品刪除成功');
            delProductModal.hide();
            this.getProducts();
          } else {
            console.log(response.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  created() {
    // 元件生成，必定會執行的項目
    // 取得產品列表要先取得 token ，要驗證 （此段程式碼在）MDN 有
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      '$1'
    );
    if (token === '') {
      // promise 先跳出提示視窗，按確定後才跳轉回登入頁
      alert('您尚未登入請重新登入。')
        .then(() => {
          window.location = './login.html';
        })
        .catch((error) => {
          console.log(error);
        });
    }
    axios.defaults.headers.common['Authorization'] = token;
  },
});

// 全域註冊建立新產品、編輯產品
app.component('productModal', {
  template: `<div id="productModal" ref="productModal" class="modal fade" tabindex="-1" aria-labelledby="productModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content border-0">
            <div class="modal-header bg-dark text-white">
                <h5 id="productModalLabel" class="modal-title">
                    <span v-if="isNew">新增產品</span>
                    <span v-else>編輯產品</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-sm-4">
                        <div class="form-group">
                            <label for="imageUrl">主要圖片</label>
                            <input v-model="tempProduct.imageUrl" type="text" class="form-control"
                                placeholder="請輸入圖片連結">
                            <img class="img-fluid" :src="tempProduct.imageUrl">
                        </div>
                        <div class="mb-1">多圖新增</div>
                        <div v-if="Array.isArray(tempProduct.imagesUrl)">
                            <div class="mb-1" v-for="(image, key) in tempProduct.imagesUrl" :key="key">
                                <div class="form-group">
                                    <label for="imageUrl">圖片網址</label>
                                    <input v-model="tempProduct.imagesUrl[key]" type="text" class="form-control"
                                        placeholder="請輸入圖片連結">
                                </div>
                                <img class="img-fluid" :src="image">
                            </div>
                            <div
                                v-if="!tempProduct.imagesUrl.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1]">
                                <button class="btn btn-outline-primary btn-sm d-block w-100"
                                    @click="tempProduct.imagesUrl.push('')">
                                    新增圖片
                                </button>
                            </div>
                            <div v-else>
                                <button class="btn btn-outline-danger btn-sm d-block w-100"
                                    @click="tempProduct.imagesUrl.pop()">
                                    刪除圖片
                                </button>
                            </div>
                        </div>
                        <div v-else>
                            <button class="btn btn-outline-primary btn-sm d-block w-100" @click="createImages">
                                新增圖片
                            </button>
                        </div>
                    </div>
                    <div class="col-sm-8">
                        <div class="form-group">
                            <label for="title">標題</label>
                            <input id="title" v-model="tempProduct.title" type="text" class="form-control"
                                placeholder="請輸入標題">
                        </div>

                        <div class="row">
                            <div class="form-group col-md-6">
                                <label for="category">分類</label>
                                <input id="category" v-model="tempProduct.category" type="text"
                                    class="form-control" placeholder="請輸入分類">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="price">單位</label>
                                <input id="unit" v-model="tempProduct.unit" type="text" class="form-control"
                                    placeholder="請輸入單位">
                            </div>
                        </div>

                        <div class="row">
                            <div class="form-group col-md-6">
                                <label for="origin_price">原價</label>
                                <input id="origin_price" v-model.number="tempProduct.origin_price" type="number"
                                    min="0" class="form-control" placeholder="請輸入原價">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="price">售價</label>
                                <input id="price" v-model.number="tempProduct.price" type="number" min="0"
                                    class="form-control" placeholder="請輸入售價">
                            </div>
                        </div>
                        <hr>

                        <div class="form-group">
                            <label for="description">產品描述</label>
                            <textarea id="description" v-model="tempProduct.description" type="text"
                                class="form-control" placeholder="請輸入產品描述">
            </textarea>
                        </div>
                        <div class="form-group">
                            <label for="content">說明內容</label>
                            <textarea id="description" v-model="tempProduct.content" type="text"
                                class="form-control" placeholder="請輸入說明內容">
            </textarea>
                        </div>
                        <div class="form-group">
                            <div class="form-check">
                                <input id="is_enabled" v-model="tempProduct.is_enabled" class="form-check-input"
                                    type="checkbox" :true-value="1" :false-value="0">
                                <label class="form-check-label" for="is_enabled">是否啟用</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    取消
                </button>
                <button type="button" class="btn btn-primary" @click="$emit('update-product', tempProduct)">
                    確認
                </button>
            </div>
        </div>
    </div>
  </div>`,
  props: ['tempProduct', 'isNew'], //props
  methods: {
    // 圖片新增
    createImages() {
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push('');
    },
  },
});

// 全域註冊刪除產品
app.component('delProductModal', {
  template: `<div id="delProductModal" ref="delProductModal" class="modal fade" tabindex="-1"
    aria-labelledby="delProductModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content border-0">
            <div class="modal-header bg-danger text-white">
                <h5 id="delProductModalLabel" class="modal-title">
                    <span>刪除產品</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                是否刪除
                <strong class="text-danger">{{ tempProduct.title }}</strong> 商品(刪除後將無法恢復)。
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    取消
                </button>
                <button type="button" class="btn btn-danger" @click="$emit('del-product', tempProduct)">
                    確認刪除
                </button>
            </div>
        </div>
    </div>
  </div>`,
  props: ['tempProduct', 'isNew'],
});

app.mount('#app');
