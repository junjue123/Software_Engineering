
# 计算器接口说明

## 一、基本信息
- **接口地址**：`http://localhost:5001/calculate`  
- **请求方法**：`GET`/`POST`  
- **响应格式**：JSON  

## 二、请求说明
### （一）输入参数
| 参数名 | 类型   | 是否必填 | 描述                                |
|--------|--------|----------|-----------------------------------|
| `flag` | int    | 是       | 操作标识（`0`=加法，`1`=减法，`2`=乘法，`3`=除法） |
| `num1` | float  | 是       | 操作数 1                             |
| `num2` | float  | 是       | 操作数 2（除法运算中不可为 `0`）               |

### （二）请求示例
#### 1. `GET` 请求  
```bash
curl "http://localhost:5001/calculate?flag=0&num1=3.5&num2=2.1"
```

#### 2. `POST` 请求（JSON 格式）  
```bash
curl -X POST -H "Content-Type: application/json" -d '{"flag": 1, "num1": 5, "num2": 1.5}' http://localhost:5001/calculate
```

## 三、响应说明
### （一）成功响应  
- **状态码**：`200`  
- **返回结果**：  
  ```json
  {
    "calculate_result": float  
  }
  ```

### （二）错误响应  
| 错误类型               | 状态码   | 错误信息示例                     | 说明                                    |
|------------------------|-------|----------------------------|---------------------------------------|
| 缺少必要参数           | `400` | `{"error": "缺少必要参数:**"}`   | `flag`/`num1`/`num2` 任一参数未提供时返回       |
| 参数类型错误           | `400` | `{"error": "参数类型错误:**"}`   | `flag` 非整数或 `num1`/`num2` 非数字时返回      |
| 除数为零               | `422` | `{"error": "参数值错误:**"}`    | 当 `flag` 不在范围或 `num2=0` 时返回           |
| 无效操作标识           | `500` | `{"error": "计算过程发生错误:**"}` | 计算过程出现了除去数值错误外的系统性错误                  |
| 不支持的内容类型       | `405` | `{"error": "不支持的请求内容类型"}`  | `POST` 请求未使用 `application/json` 格式时返回 |
| 内部服务器错误         | `500` | `{"error": "内部错误:**"}`     | 其他未预期的服务器错误                           |

## 四、操作标识（`flag`）映射表
| `flag` | 操作   | 说明         |
|--------|--------|--------------|
| `0`    | 加法   | `num1 + num2` |
| `1`    | 减法   | `num1 - num2` |
| `2`    | 乘法   | `num1 * num2` |
| `3`    | 除法   | `num1 / num2` |
