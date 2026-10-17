import os
import numpy as np
import cv2
from sklearn.model_selection import train_test_split
# import shutil
import random

# Paths
DATASET_DIR = 'dataset'
CATEGORIES = ['no','yes']
IMG_SIZE = 128

def balance_dataset(yes_dir, no_dir):
    yes_files = [f for f in os.listdir(yes_dir) if os.path.isfile(os.path.join(yes_dir, f))]
    no_files = [f for f in os.listdir(no_dir) if os.path.isfile(os.path.join(no_dir, f))]
    n_yes = len(yes_files)
    n_no = len(no_files)
    print(f"Tumor (yes): {n_yes}, No Tumor (no): {n_no}")
    if n_yes == n_no:
        print("Dataset already balanced.")
        return
    # Downsample the larger class
    if n_yes > n_no:
        to_remove = random.sample(yes_files, n_yes - n_no)
        for f in to_remove:
            os.remove(os.path.join(yes_dir, f))
        print(f"Removed {len(to_remove)} files from 'yes' to balance dataset.")
    else:
        to_remove = random.sample(no_files, n_no - n_yes)
        for f in to_remove:
            os.remove(os.path.join(no_dir, f))
        print(f"Removed {len(to_remove)} files from 'no' to balance dataset.")

def augment_image(img):
    # Random horizontal flip
    if random.random() > 0.5:
        img = cv2.flip(img, 1)
    # Random vertical flip
    if random.random() > 0.5:
        img = cv2.flip(img, 0)
    # Random rotation (0, 90, 180, 270 degrees)
    angle = random.choice([0, 90, 180, 270])
    if angle != 0:
        if angle == 90:
            img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
        elif angle == 180:
            img = cv2.rotate(img, cv2.ROTATE_180)
        elif angle == 270:
            img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
    return img

def load_data(augment=False):
    data = []
    labels = []
    for idx, category in enumerate(CATEGORIES):
        print(f"Category: {category}, Label: {idx}")
        folder = os.path.join(DATASET_DIR, category)
        for filename in os.listdir(folder):
            img_path = os.path.join(folder, filename)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if img is not None:
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                data.append(img)
                labels.append(idx)
                # Data augmentation: add augmented images
                if augment:
                    for _ in range(2): 
                        aug_img = augment_image(img)
                        data.append(aug_img)
                        labels.append(idx)
    data = np.array(data).reshape(-1, IMG_SIZE, IMG_SIZE, 1) / 255.0
    labels = np.array(labels)
    return data, labels

if __name__ == "__main__":
    yes_dir = os.path.join('dataset', 'yes')
    no_dir = os.path.join('dataset', 'no')  
    balance_dataset(yes_dir, no_dir)

    data, labels = load_data(augment=True)
    X_train, X_test, y_train, y_test = train_test_split(data, labels, test_size=0.2, random_state=42, stratify=labels)

    np.savez('brain_tumor_data.npz', X_train=X_train, X_test=X_test, y_train=y_train, y_test=y_test)
    print('Data loaded, augmented, and saved as brain_tumor_data.npz')