const request = axios.create({
  baseURL: "http://localhost:5001",
  timeout: 5000,
});

// Add a request interceptor
request.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    console.log(error)
    return Promise.reject(error);
  }
)

// Add a response interceptor
request.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log(error)
    return Promise.reject(error);
  }
)

const sendEquation = (data) => {
  return request({
    url: '/calculate',
    method: 'get',
    params: data,
  })
}
new Vue({
  el: '#app',
  data: {
    equation: '0',
    isDecimalAdded: false,
    isOperatorAdded: false,
    isStarted: false,
  },
  methods: {
    // 测试，发送请求
    async send() {
      console.log(this.equation)
      // 将数据以加号分割，分割成为num1和num2
      const num1 = this.equation.split('+')[0]
      const num2 = this.equation.split('+')[1]
      const response = await sendEquation({ 
        flag: 0,
        num1: num1,
        num2: num2,
       })
      console.log(response)
    },
    // Check if the character is + / - / × / ÷
    isOperator(character) {
      return ['+', '-', '×', '÷'].indexOf(character) > -1
    },
    // When pressed Operators or Numbers
    append(character) {
      // Start
      if (this.equation === '0' && !this.isOperator(character)) {
        if (character === '.') {
          this.equation += '' + character
          this.isDecimalAdded = true
        } else {
          this.equation = '' + character
        }
        
        this.isStarted = true
        return
      }
      
      // If Number
      if (!this.isOperator(character)) {
        if (character === '.' && this.isDecimalAdded) {
          return
        }
        
        if (character === '.') {
          this.isDecimalAdded = true
          this.isOperatorAdded = true
        } else {
          this.isOperatorAdded = false
        }
        
        this.equation += '' + character
      }
      
      // Added Operator
      if (this.isOperator(character) && !this.isOperatorAdded) {
        this.equation += '' + character
        this.isDecimalAdded = false
        this.isOperatorAdded = true
      }
    },
    // When pressed '='
    calculate() {
      let result = this.equation.replace(new RegExp('×', 'g'), '*').replace(new RegExp('÷', 'g'), '/')
      
      this.equation = parseFloat(eval(result).toFixed(9)).toString()
      this.isDecimalAdded = false
      this.isOperatorAdded = false
    },
    // When pressed '+/-'
    calculateToggle() {
      if (this.isOperatorAdded || !this.isStarted) {
        return
      }
      
      this.equation = this.equation + '* -1'
      this.calculate()
    },
    // When pressed '%'
    calculatePercentage() {
      if (this.isOperatorAdded || !this.isStarted) {
        return
      }
      
      this.equation = this.equation + '* 0.01'
      this.calculate()
    },
    // When pressed 'AC'
    clear() {
      this.equation = '0'
      this.isDecimalAdded = false
      this.isOperatorAdded = false
      this.isStarted = false
    }
  }
})