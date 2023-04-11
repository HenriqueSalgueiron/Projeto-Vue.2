//---------------------------- DETAILS COMPONENT --------------------------------------------------------

Vue.component('product-details', {
    template: `
    
    <ul>
        <li v-for="detail in details"> {{detail}} </li>
    </ul>    
    
    `,
    props: {
        details: {
            type: Array,
            required: true
        }
    }

})

//---------------------------- REVIEW COMPONENT --------------------------------------------------------

Vue.component('product-review-form', {
    template: `
    
    <form class = "review-form" @submit.prevent="submitReview"> 

        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors">{{error}}</li>
            </ul>
        </p>

        <p>Name: </p>
        <input v-model="username" id="txtname">

        <p>Review: </p>
        <textarea v-model="review" id="txtreview"></textarea>

        <p>Rating:
            <select v-model.number="rating" id="txtrating">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </p>

        <p>
            <input type="submit"  value="submit" >
        </p>
        
    </form> 
    `,

    data () { return {
        username: null,
        review: null,
        rating: null,
        errors: []
    }},
    methods: {
        submitReview () {
            if (this.username && this.review && this.rating) {
                let reviewInfo = {  // Clicar-se em submit, cria objeto com infos da review
                    username: this.username,
                    review: this.review,
                    rating: this.rating
                }
                console.log(reviewInfo)
                this.$emit('add-review', reviewInfo)
                this.username = null // Após criar objeto com info, limpa informações de data()
                this.review = null
                this.rating = null        
            } else {
                this.errors = []
                if (!this.username) this.errors.push('Name required')
                if (!this.review) this.errors.push('Review required.')
                if (!this.rating) this.errors.push('Rating required')
            }
        }
    },
})

//---------------------------- TABS COMPONENT --------------------------------------------------------
 
Vue.component('product-tabs', {
    props: {
        selectedVariantReview: {
            type: Array,
            required: true

        }
    },
    template: `

        <div>

            <div>
                <span class="tab" 
                v-for="(tab, index) in tabs" 
                :key="index"
                @click="selectedTab = tab"
                :class="{ activeTab: selectedTab === tab}">{{ tab }} </span> 
            </div>

            <div>
                <ul>
                    <li v-for="review in selectedVariantReview">
                        <p> Username: {{review.username}} </p>
                        <p> Review: {{review.review}} </p>
                        <p> Rating: {{review.rating}} </p>
                    </li>
                </ul>
            </div>


            <product-review-form @add-review="review"></product-review-form>
        </div>
    `,

    data() { return { 

        tabs: ['Reviews', 'Make a review'],
        selectedTab: 'Reviews'
        
    }
    }
})

//---------------------------- PRODUCT COMPONENT --------------------------------------------------------

Vue.component('product', {
    template: `
    <div class="product">

        <div class="product-image">
            <img :src="image">  <!-- ou <img v-bind:src = "image"> -->
        </div>

        <div class="product-info">
            <h1>{{title}}</h1>
            <p v-if="stock > 10">In stock</p>
            <p v-else-if="stock <= 10 && stock > 0">Almost sold out!</p>
            <p v-else class="outOfStock">Out of stock</p>
            <p>Shipping: {{shipping}}</p>

            <product-details :details="details"></product-details>

            <h2>Sizes:</h2>
            <ul>
                <li v-for="size in sizes"> {{size}} </li>
            </ul>

            <h2>Colors:</h2>

            <ul>
                <li v-for="(variant, index) in variants" :key="variant.variantId"> 
                    <div @mouseover="updateProduct(index)" class="color-box" :style="{backgroundColor: variant.variantColor}"></div> 
                </li>
            </ul>
            
            <button @click="addToCart" 
                    :disabled="cart == stock || stock == 0"
                    :class="{disabledButton: cart == stock || stock == 0}"
                    > Add to cart ({{stock}} available)</button>

            <button @click="removeFromCart"
                    :disable="variantCart == 0"
                    :class="{disabledButton: variantCart == 0}">Remove from cart</button>

            <product-tabs :selectedVariantReview="selectedVariantReview"></product-tabs>

            <h3 v-if="!selectedVariantReview.length">No reviews yet.</h3>

        </div>

    </div>`,

    props: {
        premium: {
            type: Boolean,
            required: true
        },
        cart: {
            type: Array,
            required: true
        }

    },
    data() {
        return {
        onSale: true,
        product:'Socks',
        brand: 'Vue Mastery',
        selectedVariant: 0,
        details: ['80% cotton', '20% polyester', 'gender-neutral'],
        sizes: ['S', 'L', 'LX'],
        variants: [
            {
                variantId: 'verde',
                variantColor: 'green',
                variantImage: 'green-socks.jpg',
                variantQuantity: 11,
                variantCart: 0,
                variantReview: []
            },
            {
                variantId: 'azul',
                variantColor: 'blue',
                variantImage: 'blue-socks.jpg',
                variantQuantity: 2,
                variantCart: 0,
                variantReview: []
            }
            ],
        onCart: [

        ]
        }       
    },
    methods: {
        addToCart: function () {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
            if (this.variants[this.selectedVariant].variantCart < this.variants[this.selectedVariant].variantQuantity) {
                this.variants[this.selectedVariant].variantCart += 1
            }
        },

        removeFromCart: function () {
            if (this.variants[this.selectedVariant].variantCart > 0) {
                this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
                this.variants[this.selectedVariant].variantCart -= 1
            }
        },
        updateProduct: function(index) {
            this.selectedVariant = index
        },
        review (reviewInfo) {
            this.variants[this.selectedVariant].variantReview.push(reviewInfo)      // atribuindo review dada ao produto
        },
    
    },
    computed: {
        title() {
            if (this.onSale) {
                return 'On sale!' + ' ' + this.brand + ' ' + this.product    
            } else { return this.brand + ' ' + this.product
            }
        },
        image () {
            return this.variants[this.selectedVariant].variantImage
        },
        stock () { 
            return this.variants[this.selectedVariant].variantQuantity - this.variants[this.selectedVariant].variantCart
        },

        variantCart () {
            return this.variants[this.selectedVariant].variantCart
        },
        shipping () {
            if (this.premium) {
                return "Free" 
            } return "$2.99"
        },
        selectedVariantReview () {                                        // talvez não use
            return this.variants[this.selectedVariant].variantReview
        }
    }
})

//---------------------------- VUE APP INSTANCE --------------------------------------------------------

var app = new Vue ({                    
    el: '#app',
    data:  {                            
        premium: false,
        cart: []       
    },
    methods: {
        updateCart: function(id) {
            this.cart.push(id)
        },
        updateCartRemove: function (id) {
            if (this.cart.length > 0) { 
                this.cart.splice(this.cart.indexOf(id),1)
            }         
        }
    }
})
