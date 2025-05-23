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
    history: '', // 用于存储历史记录
    lastCalculation: '', // 存储上一次完整的计算式
    lastResult: '' // 存储上一次的结果
  },
  methods: {
    async send() {
      console.log(this.equation)
      const num1 = this.equation.split('+')[0]
      const num2 = this.equation.split('+')[1]
      const response = await sendEquation({ 
        flag: 0,
        num1: num1,
        num2: num2,
      })
      console.log(response)
    },
    
    isOperator(character) {
      return ['+', '-', '×', '÷'].indexOf(character) > -1
    },
    
    append(character) {
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
      
      if (this.isOperator(character) && !this.isOperatorAdded) {
        this.equation += '' + character
        this.isDecimalAdded = false
        this.isOperatorAdded = true
      }
    },
    
    calculate() {
      // 保存当前计算式
      this.lastCalculation = this.equation
      
      let result = this.equation.replace(new RegExp('×', 'g'), '*').replace(new RegExp('÷', 'g'), '/')
      
      try {
        this.lastResult = parseFloat(eval(result).toFixed(9)).toString()
        this.equation = this.lastResult
        this.isDecimalAdded = false
        this.isOperatorAdded = false
        
        // 更新历史记录
        this.updateHistory()
      } catch (error) {
        console.error('计算错误:', error)
        this.equation = 'Error'
      }
    },
    
    // 更新历史记录
    updateHistory() {
      if (this.lastCalculation && this.lastResult) {
        this.history = `${this.lastCalculation} = ${this.lastResult}`
      }
    },
    
    calculateToggle() {
      if (this.isOperatorAdded || !this.isStarted) {
        return
      }
      
      this.equation = this.equation + '* -1'
      this.calculate()
    },
    
    calculatePercentage() {
      if (this.isOperatorAdded || !this.isStarted) {
        return
      }
      
      this.equation = this.equation + '* 0.01'
      this.calculate()
    },
    
    clear() {
      this.equation = '0'
      this.isDecimalAdded = false
      this.isOperatorAdded = false
      this.isStarted = false
      // 可以选择是否在清除时也清空历史
      // this.history = ''
    }
  }
})