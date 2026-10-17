import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import cv2

# NumPy: Create a sample array
arr = np.array([[1, 2, 3], [4, 5, 6]])
print("NumPy Array:\n", arr)

# Pandas: Create a simple DataFrame
df = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})
print("\nPandas DataFrame:\n", df)

# Matplotlib: Plot a simple graph
plt.plot([1, 2, 3], [4, 5, 6])
plt.title('Sample Plot')
plt.xlabel('X')
plt.ylabel('Y')
plt.show()

# OpenCV: Read and display an image (replace 'sample.jpg' with your image file)
# img = cv2.imread('sample.jpg')
# cv2.imshow('Sample Image', img)
# cv2.waitKey(0)
# cv2.destroyAllWindows()

print("All libraries imported and tested successfully!")
