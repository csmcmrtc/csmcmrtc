import cv2
img = cv2.imread('practice/sample.jpg')  # Read an image
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) #convert to grayscale
cv2.imshow('Grayscale Image', gray) #display the image
cv2.waitKey(0) # wait for a key press
cv2.destroyAllWindows() # close all windows
# This code reads an image, converts it to grayscale, and displays it.