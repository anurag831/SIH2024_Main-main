from ultralytics import YOLO
import cv2

def run_yolo():
    model = YOLO("floor_detector.pt")  # or use 'yolov8s.pt', 'yolov8m.pt', etc., based on the desired model size

    cap = cv2.VideoCapture(0)  

    if not cap.isOpened():
        print("Error: Could not open video stream from webcam.")
        exit()

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture image from webcam.")
            break

        # Perform object detection
        results = model.predict(source=frame, save=True, conf=0.6)

        # Visualize the results
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get coordinates and draw rectangles
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                conf = box.conf[0]
                label = result.names[int(box.cls[0])]
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.putText(frame, f'{label} {conf}', (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)

        # Display the frame with bounding boxes
        cv2.imshow('YOLOv8 Real-Time Object Detection', frame)

        # Break the loop if the 'q' key is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the webcam and close all OpenCV windows
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_yolo()

