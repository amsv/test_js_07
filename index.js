Vue.component('search', {
  template: `
    <form class="goods-search">
      <input v-model.trim="valueModel"
             class="search-input"
             type="text">
    </form>
  `,
  props: ['value'],
  computed: {
    valueModel: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    }
  }
});

Vue.component('cart', {
  props: ["good"],
  data: () => ({
    isVisibleCart: false,
  }),
  template: `
    <div class="cart" v-show="isVisibleCart">
      <button class="close-button" @click="toggleCart">❌</button>
    </div>
  `,
  methods: {
    toggleCart() {
      this.isVisibleCart = !this.isVisibleCart;
    }
  }
});

Vue.component('goods-item', {
  props: ["good"],
  template: `
    <div class="goods-item">
        <h3>{{ good.product_name }}</h3>
        <p>{{ good.price}}</p>
        <button @click="$emit('add-to-cart', good)">Добавить в корзину</button>
    </div>
  `
});

Vue.component('goods-list', {
  props: ['goods'],
  computed: {
    isGoodsEmpty() {
      return this.goods.length === 0;
    },
  },
  methods: {
    addToCart(good) {
      this.$emit('add-to-cart', good);
    }
  },
  template: `
    <div v-if="!isGoodsEmpty" class="goods-list">
       <goods-item v-for="good in goods" :key="good.id_product" :good="good" @add-to-cart="addToCart"></goods-item>
    </div>
    <div v-else class="goods-not-found">
      <h2>Нет данных</h2>
    </div>`
});

const app = new Vue({
  el: "#app",
  data: {
    goods: [],
    isLoading: true,
    errorMessage: '',
    errorTimeout: null,
    searchLine: '',
    currentSearch: new RegExp('', 'i'),
  },
  methods: {
    addToCart(good) {
      this.makePOSTRequest('/addToCart', JSON.stringify(good));
    },
    showError(error) {
      if (this.errorTimeout) clearTimeout(this.errorTimeout);
      this.errorMessage = error;
      this.errorTimeout = setTimeout(() => {
        this.errorTimeout = null;
        this.errorMessage = '';
      }, 5000);
    },
    makeGETRequest(url) {
      return new Promise((resolve, reject) => {
        let xhr;

        if (window.XMLHttpRequest) {
          xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
          xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xhr.onreadystatechange = () => {
          if (xhr.readyState !== 4) return;
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            this.showError('Ошибка обработки запроса');
            reject(xhr.status)
          }
        };

        xhr.open("GET", url);
        xhr.send();
      })
    },
    makePOSTRequest(url, data) {
      return new Promise((resolve, reject) => {
        let xhr;

        if (window.XMLHttpRequest) {
          xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
          xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xhr.onreadystatechange = () => {
          if (xhr.readyState !== 4) return;
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            this.showError('Ошибка обработки запроса');
            reject(xhr.status)
          }
        };

        xhr.open("POST", url);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(data);
      })
    },
    filterGoods(value) {
      this.currentSearch = new RegExp(value, 'i');
    },
    toggleCart() {
      this.$refs.cart.toggleCart();
    },
  },
  computed: {
    throttleFilter() {
      return _.throttle(this.filterGoods, 700);
    },
    filteredGoods() {
      if (!this.goods || !Array.isArray(this.goods)) return [];
      return this.goods.filter(good =>
        this.currentSearch.test(good.product_name));
    }
  },
  async mounted() {
    try {
      this.goods = await this.makeGETRequest('/catalogData');
      await this.$nextTick();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    }
  }
});
