from flask import Flask, request, jsonify

app = Flask(__name__)

from calculate import calculate

@app.route('/calculate', methods=['POST', 'GET'])
def port_detection():
    try:
        # 定义初始值
        num1 = None
        num2 = None
        flag = None

        if request.method == 'GET':
            if 'flag' in request.args:
                flag = int(request.args['flag'])
            if 'num1' in request.args:
                num1 = float(request.args['num1'])
            if 'num2' in request.args:
                num2 = float(request.args['num2'])

        elif request.method == 'POST':
            if request.content_type == 'application/json':
                data = request.get_json()
                if 'flag' in data:
                    flag = int(data['flag'])
                if 'num1' in data:
                    num1 = float(data['num1'])
                if 'num2' in data:
                    num2 = float(data['num2'])
            else:
                return jsonify({'error': '不支持的请求内容类型'}), 405

        # 参数验证
        if flag is None or num1 is None or num2 is None:
            return jsonify({'error': '缺少必要参数'}), 400
        try:
            result_num = calculate(flag, num1, num2)
            return jsonify({"calculate_result": result_num})
        except ValueError as ve:
            return jsonify({'error': f'参数值错误: {str(ve)}'}), 422
        except TypeError as te:
            return jsonify({'error': f'参数类型错误: {str(te)}'}), 400
        except Exception as e:
            return jsonify({'error': f'计算过程发生错误: {str(e)}'}), 500  # 可能是服务器问题

    except Exception as e:
        return jsonify({'error': f'内部错误: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)