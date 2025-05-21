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
