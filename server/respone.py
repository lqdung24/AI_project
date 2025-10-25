from flask import jsonify

def make_response(status: str='sucess', message: str='Request handled successfully', data=None, code: int = 200):
    """
    Tạo response JSON thống nhất cho toàn API.

    Args:
        status (str): "success" hoặc "error"
        message (str): Mô tả ngắn gọn kết quả
        data (any, optional): Dữ liệu trả về (mặc định None)
        code (int, optional): HTTP status code (mặc định 200)
    """
    response = {
        "status": status,
        "message": message,
        "data": data
    }
    return jsonify(response), code