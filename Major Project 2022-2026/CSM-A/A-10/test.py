import numpy as np
arr = np.array([[1,2,3],[4,5,6]])
arr_sum = np.sum(arr)
arr_mean = np.mean(arr)
arr_shape = arr.shape
arr_transpose = arr.T
arr_reshape = arr.reshape(3,2)
arr_flatten = arr.flatten()
arr_max = np.max(arr)
arr_min = np.min(arr)
arr_std = np.std(arr)
arr_var = np.var(arr)
arr_sum_axis0 = np.sum(arr, axis=0)
arr_sum_axis1 = np.sum(arr, axis=1)
arr_dot = np.dot(arr, arr.T)
arr_concat = np.concatenate((arr, arr), axis=0)
arr_split = np.split(arr, 2, axis=0)
arr_unique = np.unique(arr)
arr_sort = np.sort(arr, axis=0)
arr_argsort = np.argsort(arr, axis=0)
arr_nonzero = np.nonzero(arr)
arr_where = np.where(arr > 3)
arr_clip = np.clip(arr, 2, 5)

arr2 = arr + 10
arr3 = arr * 2
arr4 = arr - 5
arr5 = arr / 2
arr6 = arr ** 2
arr7 = arr % 2
arr8 = arr // 2
arr9 = arr & 1
arr10 = arr / 0

sub_arr = arr[:, 1]

print("Array:", arr)
print("Array Sum:", arr_sum)
print("Array Mean:", arr_mean)
print("Array Shape:",arr_shape)
print("Array Transpose:\n", arr_transpose)
print("Array Reshape:\n", arr_reshape)
print("Array Flatten:",arr_flatten)
print("Array Max:", arr_max)
print("Array Min:", arr_min)
print("Array Std:", arr_std)
print("Array Var:", arr_var)
print("Array Sum Axis 0:", arr_sum_axis0)
print("Array Sum Axis 1:", arr_sum_axis1)
print("Array Dot Product:\n", arr_dot)
print("Array Concatenate:\n", arr_concat)
print("Array Split:\n", arr_split)
print("Array Unique:", arr_unique)
print("Array Sort:\n", arr_sort)
print("Array Argsort:\n", arr_argsort)
print("Array Nonzero:", arr_nonzero)
print("Array Where:", arr_where)
print("Array Clip:\n", arr_clip)
print("Array + 10:\n", arr2)
print("Array * 2:\n", arr3)
print("Array - 5:\n", arr4)
print("Array / 2:\n", arr5)
print("Array ** 2:\n", arr6)
print("Array % 2:\n", arr7)
print("Array // 2:\n", arr8)

print("Array & 1:\n", arr9)
print("Array / 0:\n", arr10)
print("Sub-array:\n", sub_arr)
print("All operations completed successfully!")


