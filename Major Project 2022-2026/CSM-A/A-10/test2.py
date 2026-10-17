import pandas as pd


df = pd.DataFrame({'A': [1,2], 'B': [3,4]})
print("Pandas DataFrame:\n",df)
df['C'] = df['A'] + df['B']
print("Updated DataFrame:\n",df)
df['D'] = df['A'] * df['B']
print("Updated Dataframe:\n",df)
df['E'] = df['A'] / df['B']
print("Updated Dataframe:\n",df)
df['F'] = df['A'] - df['B']
print("Updated Dataframe:\n",df)
df['G'] = df['A'] ** 2
print("Updated Dataframe:\n",df)
df['H'] = df['A'] % 2
print("Updated Dataframe:\n",df)

