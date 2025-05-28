import requests

# 定义请求参数
params = {
    "flag": 0,
    "num1": 1.23,
    "num2": 2.45
}

# # 发送GET请求
# response = requests.get("http://localhost:5001/calculate", params=params)
# print(response.json())

# 发送JSON格式的POST请求
headers = {"Content-Type": "application/json"}
response = requests.post("http://localhost:5001/calculate", json=params, headers=headers)
print(response.json())

# # 发送表单格式的POST请求
# response = requests.post("http://localhost:5001/calculate", data=params)
# print(response.json())