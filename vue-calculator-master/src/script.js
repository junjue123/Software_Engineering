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
    history: '',
    lastCalculation: '',
    lastResult: '',
    isError: false
  },
  mounted() {
    // 挂载组件时添加键盘事件监听
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    // 组件销毁前移除键盘事件监听，防止内存泄漏
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    // 键盘事件处理函数
    handleKeyDown(event) {
      // 阻止默认行为，避免某些按键触发浏览器默认操作
      event.preventDefault();
      
      // 获取按键值
      const key = event.key;
      
      // 数字键 0-9
      if (/[0-9]/.test(key)) {
        this.append(key);
        return;
      }
      
      // 小数点
      if (key === '.') {
        this.append('.');
        return;
      }
      
      // 操作符键
      switch (key) {
        case '+':
          this.append('+');
          break;
        case '-':
          this.append('-');
          break;
        case '*':
          this.append('×');
          break;
        case '/':
          this.append('÷');
          break;
        case '%':
          this.calculatePercentage();
          break;
        case '=':
        case 'Enter':
          this.calculate();
          break;
        case 'Escape':
          this.clear();
          break;
        case 'Backspace':
          this.deleteLast();
          break;
        case 'Delete':
          this.clear();
          break;
        case '~':
          this.calculateToggle();
          break;
        default:
          // 其他按键不处理
          return;
      }
    },
    
    // 检查字符是否为操作符
    isOperator(character) {
      return ['+', '-', '×', '÷'].includes(character);
    },
    
    // 检查当前是否可以添加操作符
    canAddOperator() {
      // 不能连续添加操作符，除非是负号
      if (this.isOperatorAdded) {
        return false;
      }
      
      // 防止以操作符开头，除非是负号
      if (this.equation === '0' && this.isOperator(character) && character !== '-') {
        return false;
      }
      
      return true;
    },
    
    // 处理数字和小数点输入
    handleNumberInput(character) {
      // 处理数字0的特殊情况
      if (this.equation === '0') {
        if (character === '.') {
          // 允许在0后直接添加小数点
          this.equation = '0.';
          this.isDecimalAdded = true;
        } else {
          this.equation = character;
        }
        this.isStarted = true;
        this.isError = false;
        return;
      }
      
      // 处理小数点
      if (character === '.') {
        // 检查当前数字段是否已有小数点
        const lastNumber = this.getLastNumber();
        if (!lastNumber.includes('.')) {
          this.equation += character;
          this.isDecimalAdded = true;
          this.isOperatorAdded = false;
          this.isError = false;
        }
        return;
      }
      
      // 处理数字
      this.equation += character;
      this.isOperatorAdded = false;
      this.isError = false;
    },
    
    // 处理操作符输入
    handleOperatorInput(character) {
      // 处理负号的特殊情况
      if (character === '-' && this.canAddNegative()) {
        this.equation += character;
        this.isOperatorAdded = true;
        this.isDecimalAdded = false;
        return;
      }
      
      // 处理其他操作符
      if (this.canAddOperator()) {
        this.equation += character;
        this.isOperatorAdded = true;
        this.isDecimalAdded = false;
        this.isError = false;
      }
    },
    
    // 检查是否可以添加负号
    canAddNegative() {
      // 可以在表达式开始处添加负号
      if (this.equation === '0') {
        return true;
      }
      
      // 可以在操作符后添加负号
      const lastChar = this.equation[this.equation.length - 1];
      return this.isOperator(lastChar) || lastChar === '(';
    },
    
    // 获取表达式中的最后一个数字段
    getLastNumber() {
      // 从后向前查找最后一个数字段
      let i = this.equation.length - 1;
      while (i >= 0) {
        const char = this.equation[i];
        if (this.isOperator(char) && char !== '-') {
          break;
        }
        i--;
      }
      return this.equation.substring(i + 1);
    },
    
    // 添加字符到表达式
    append(character) {
      if (this.isError) {
        this.clear();
      }
      
      if (this.isOperator(character)) {
        this.handleOperatorInput(character);
      } else {
        this.handleNumberInput(character);
      }
    },
    
    // 计算表达式结果
    calculate() {
      // 防止以操作符结尾
      const lastChar = this.equation[this.equation.length - 1];
      if (this.isOperator(lastChar)) {
        return;
      }
      
      // 保存当前计算式
      this.lastCalculation = this.equation;
      
      // 转换操作符为JavaScript可识别的格式
      let result = this.equation
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      try {
        // 计算结果并格式化
        const calculated = eval(result);
        
        // 处理除零错误
        if (!isFinite(calculated)) {
          throw new Error('除数不能为零');
        }
        
        // 保留最多9位小数，去除末尾的零
        this.lastResult = parseFloat(calculated.toFixed(9)).toString();
        this.equation = this.lastResult;
        
        // 重置状态
        this.isDecimalAdded = this.lastResult.includes('.');
        this.isOperatorAdded = false;
        this.isStarted = true;
        this.isError = false;
        
        // 更新历史记录
        this.updateHistory();
      } catch (error) {
        console.error('计算错误:', error);
        this.equation = 'Error';
        this.isError = true;
      }
    },
    
    // 更新历史记录
    updateHistory() {
      if (this.lastCalculation && this.lastResult) {
        this.history = `${this.lastCalculation} = ${this.lastResult}`;
      }
    },
    
    // 切换正负号
    calculateToggle() {
      // 如果表达式为空或只有0，直接返回
      if (this.equation === '0' || !this.isStarted) {
        return;
      }
      
      // 获取最后一个数字段及其起始位置
      let lastNumberStart = this.equation.length - 1;
      
      // 从后向前查找最后一个数字段的起始位置
      while (lastNumberStart > 0) {
        const char = this.equation[lastNumberStart - 1];
        if (this.isOperator(char) && char !== '-') {
          break;
        }
        lastNumberStart--;
      }
      
      // 获取最后一个数字段
      const lastNumber = this.equation.substring(lastNumberStart);
      
      // 如果最后一个数字段已经是负数，移除负号
      if (lastNumber.startsWith('-')) {
        this.equation = this.equation.substring(0, lastNumberStart) + 
                        lastNumber.substring(1);
      } else {
        // 如果最后一个数字段是正数，添加负号
        this.equation = this.equation.substring(0, lastNumberStart) + 
                        '-' + lastNumber;
      }
    },
    
    // 计算百分比
    calculatePercentage() {
      // 如果表达式为空或只有0，直接返回
      if (this.equation === '0' || !this.isStarted) {
        return;
      }
      
      // 获取最后一个数字段及其起始位置
      let lastNumberStart = this.equation.length - 1;
      
      // 从后向前查找最后一个数字段的起始位置
      while (lastNumberStart > 0) {
        const char = this.equation[lastNumberStart - 1];
        if (this.isOperator(char) && char !== '-') {
          break;
        }
        lastNumberStart--;
      }
      
      // 获取最后一个数字段
      const lastNumber = this.equation.substring(lastNumberStart);
      
      // 将最后一个数字转换为百分比（除以100）
      const percentageValue = parseFloat(lastNumber) / 100;
      
      // 更新表达式，将最后一个数字替换为百分比值
      this.equation = this.equation.substring(0, lastNumberStart) + 
                      percentageValue.toString();
    },
    
    // 清除当前表达式
    clear() {
      this.equation = '0';
      this.isDecimalAdded = false;
      this.isOperatorAdded = false;
      this.isStarted = false;
      this.isError = false;
    },
    
    // 删除最后一个字符
    deleteLast() {
      if (this.equation === '0' || this.equation === 'Error') {
        return;
      }
      
      // 删除最后一个字符
      this.equation = this.equation.slice(0, -1);
      
      // 如果表达式为空，重置为0
      if (this.equation === '') {
        this.clear();
        return;
      }
      
      // 更新状态
      const lastChar = this.equation[this.equation.length - 1];
      this.isOperatorAdded = this.isOperator(lastChar);
      this.isDecimalAdded = this.equation.includes('.');
    },
    
    // 发送计算请求
    async send() {
      console.log(this.equation);
      const num1 = this.equation.split('+')[0];
      const num2 = this.equation.split('+')[1];
      const response = await sendEquation({ 
        flag: 0,
        num1: num1,
        num2: num2,
      });
      console.log(response);
    }
  }
})
