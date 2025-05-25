def add(a, b):
    return round(a + b, 4)

def subtract(a, b):
    return round(a - b, 4)

def multiply(a, b):
    return round(a * b, 4)

def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为零")
    return round(a / b, 4)

def calculate(flag, a, b):
    # 校验 flag 类型
    if not isinstance(flag, int):
        raise TypeError(f"flag 必须是整数类型，但得到了 {type(flag).__name__}")

    # 校验 a 和 b 类型
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError(f"参数 a 和 b 必须是数值类型（整数或浮点数），但得到了 {type(a).__name__} 和 {type(b).__name__}")
    operations = {
        0: add,
        1: subtract,
        2: multiply,
        3: divide
    }
    if flag not in operations:
        raise ValueError("flag必须是0、1、2、3中的一个")
    return operations[flag](a, b)


def parse_expression(expression):
    # 去除空格
    expression = expression.replace(" ", "")

    # 处理负数开头的情况
    if expression.startswith('-'):
        expression = '0' + expression

    # 分割数字和运算符
    numbers = []
    operators = []
    current_number = ''

    for char in expression:
        if char in '+-*/':
            numbers.append(float(current_number))
            operators.append(char)
            current_number = ''
        else:
            current_number += char

    # 添加最后一个数字
    numbers.append(float(current_number))

    return numbers, operators


def calculate_expression(expression):
    numbers, operators = parse_expression(expression)

    # 定义运算符到flag的映射
    operator_to_flag = {
        '+': 0,
        '-': 1,
        '*': 2,
        '/': 3
    }

    # 处理乘除法（优先级高）
    i = 0
    while i < len(operators):
        if operators[i] in '*/':
            flag = operator_to_flag[operators[i]]
            a = numbers[i]
            b = numbers[i + 1]
            result = calculate(flag, a, b)
            numbers[i] = result
            del numbers[i + 1]
            del operators[i]
        else:
            i += 1

    # 处理加减法
    result = numbers[0]
    for i in range(len(operators)):
        flag = operator_to_flag[operators[i]]
        result = calculate(flag, result, numbers[i + 1])

    return result

if __name__ == "__main__":
    print(calculate_expression("12+3*34"))