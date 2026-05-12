import cv2
from pygrabber.dshow_graph import FilterGraph

def get_iriun_camera_index():
    graph = FilterGraph()
    cameras = graph.get_input_devices() 
    
    # Duyệt qua danh sách camera, tìm cái nào có chữ "Iriun"
    for index, name in enumerate(cameras):
        if "Iriun" in name: 
            print(f"Đã tìm thấy Iriun Camera ở index: {index}")
            return index
            
    print("Không tìm thấy Iriun Camera!")
    return None

# --- Cách sử dụng ---
iriun_index = get_iriun_camera_index()

if iriun_index is not None:
    # Truyền đúng index tìm được vào VideoCapture
    cap = cv2.VideoCapture(iriun_index, cv2.CAP_DSHOW)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        cv2.imshow("Iriun Camera Feed", frame)
        
        # Nhấn phím 'q' để thoát
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()