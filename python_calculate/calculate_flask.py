from calculate import calculate_expression
from flask import Flask, request, jsonify
from flask_cors import CORS  # 导入 CORS 扩展

app = Flask(__name__)
CORS(app)  # 启用 CORS 支持，允许所有域名跨域访问


@app.route('/calculate', methods=['POST', 'GET'])
def calculate_route():
    # 定义初始值
    expression = None

    try:
        if request.method == 'GET':
            if 'expression' in request.args:
                expression = request.args['expression']
            else:
                return jsonify({'error': '缺少必要参数: expression'}), 400

        elif request.method == 'POST':
            if request.content_type == 'application/json':
                data = request.get_json()
                if 'expression' in data:
                    expression = data['expression']
                else:
                    return jsonify({'error': '缺少必要参数: expression'}), 400
            else:
                return jsonify({'error': '不支持的请求内容类型，仅支持 application/json'}), 415

        # 参数验证
        if not isinstance(expression, str) or not expression.strip():
            return jsonify({'error': '表达式无效'}), 400

        try:
            # 调用修改后的表达式计算函数
            result = calculate_expression(expression)
            return jsonify({"calculate_result": result})

        except ValueError as ve:
            # 处理计算中的值错误（如除零）
            return jsonify({'error': f'计算错误: {str(ve)}'}), 422

        except TypeError as te:
            # 处理类型错误
            return jsonify({'error': f'参数类型错误: {str(te)}'}), 400

        except SyntaxError as se:
            # 处理表达式语法错误
            return jsonify({'error': f'表达式语法错误: {str(se)}'}), 400

        except Exception as e:
            # 处理其他异常
            return jsonify({'error': f'计算过程发生错误: {str(e)}'}), 500

    except Exception as e:
        # 处理路由内部错误
        return jsonify({'error': f'内部服务器错误: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)