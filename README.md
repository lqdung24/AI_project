# AI_project

README này hướng dẫn cách chạy backend (`app.py`) và mở frontend (`index.html`), cùng một số lưu ý thường gặp.

---

## Mô tả ngắn

Dự án `AI_project` gồm:

* `app.py`: file Python chạy backend (API / server).
* `index.html`: giao diện frontend tĩnh (có thể gọi API từ `app.py`).

## Yêu cầu (Prerequisites)

* Python 3.8+
* (Tùy chọn) `virtualenv` hoặc `venv`
* Trình duyệt web (Chrome, Firefox,...)

cài các gói cần thiết: 
```bash
python3 -m venv venv
source venv/bin/activate    # macOS / Linux
venv\Scripts\activate     # Windows (PowerShell)
pip install -r requirements.txt
```

## Chạy backend (`app.py`)

1. Kích hoạt môi trường ảo (nếu dùng):

   * macOS / Linux: `source venv/bin/activate`
   * Windows (PowerShell): `venv\Scripts\Activate.ps1`

2. Chạy file Python:

```bash
python app.py
```

3. Cổng mà server lắng nghe `http://127.0.0.1:8000`.


## Mở `index.html` trong trình duyệt

### Cách nhanh (file trực tiếp)

* Mở file trực tiếp: nhấp đúp vào `index.html` hoặc gõ đường dẫn file vào trình duyệt: `file:///path/to/index.html`.

**Lưu ý:** Nếu `index.html` gọi API bằng `fetch` hoặc AJAX, mở file trực tiếp có thể gặp lỗi CORS hoặc vấn đề `file://` — trong trường hợp đó, phục vụ file qua HTTP.

### Phục vụ tĩnh bằng Python (khuyến nghị khi frontend gọi API)

Từ thư mục chứa `index.html`:

```bash
# Python 3
cd ./02.ui
python -m http.server 8080
# Mở http://127.0.0.1:8080/index.html
```

Hoặc dùng `http.server` của Python 3 cho Windows/macOS/linux.

### Nếu bạn dùng Node (live-server)

```bash
npm install -g live-server
live-server .
```
## Tạo file `requirements.txt` (nếu chưa có)

```bash
pip freeze > requirements.txt
```

## Cách đóng góp / Git

* Thêm commit, push:pip freeze > requirements.txt

```bash
git add .
git commit -m "Add README and run instructions"
git push
```

## Liên hệ

Nếu cần mình có thể sửa README theo cấu trúc dự án thực tế của bạn (ví dụ: thêm `docker`, cấu hình `.env`, hướng dẫn deploy). Vui lòng cho biết ngữ cảnh: `app.py` dùng Flask/FastAPI/Django hay chỉ là script.

---

**License**: (nếu cần) thêm thông tin license vào README, ví dụ MIT.
