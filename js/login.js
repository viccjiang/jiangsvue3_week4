import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';

createApp({
  data() {
    return {
      // 使用 function return
      // 加入站點
      url: 'https:///vue3-course-api.hexschool.io',
      // 加入 API Path
      path: 'jiangsvue3',
      user: {
        username: '',
        password: '',
      },
    };
  },
  methods: {
    // 函式的集合
    // 發出登入請求，登入用 post
    // 取得 Token
    // 將 Token 存到 Cookie
    login() {
      const api = `${this.url}/admin/signin`;
      axios.post(api, this.user) // 發出請求，在登入時會把帳號密碼資料 user 帳密送出去
        .then((res) => {
          // console.log(res);
          if (res.data.success) {
            // const token = res.data.token;
            // const expired = res.data.expired;
            // 使用解構手法，因為res.data裡有token及expired
            const { token, expired } = res.data;
            console.log(token, expired);
            // 增加cookie
            // 儲存cookie
            // 儲存 cookie ( 這段程式碼來自 MDN ) 代入token ＆ 有效日期
            document.cookie = `hexToken=${token};expired=${new Date(expired)}; path=/`;
            window.location = 'index.html'; //成功的話跳轉到 index
          } else {
            alert('登入失敗，請檢查帳號、密碼');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  created() {
    // 元件生成，必定會執行的項目
  },
}).mount('#app');
