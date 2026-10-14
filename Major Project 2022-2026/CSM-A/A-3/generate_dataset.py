import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_dataset(n_samples=10000):
    np.random.seed(42)
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    timestamps = pd.date_range(start=start_date, end=end_date, periods=n_samples)
    
    normal_data = {
        'timestamp': timestamps,
        'user_id': np.random.randint(1000, 2000, n_samples),
        'login_time': np.random.randint(7, 19, n_samples),
        'activity_type': np.random.choice([0, 1], n_samples, p=[0.95, 0.05]),
        'file_access': np.random.normal(15, 5, n_samples).astype(int),
        'failed_logins': np.random.poisson(0.3, n_samples),
        'device_id': np.random.randint(100, 200, n_samples),
        'ip_address': [f"192.168.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}" 
                      for _ in range(n_samples)],
        'department': np.random.choice(['IT', 'HR', 'Finance', 'Marketing', 'Sales'], n_samples),
        'data_volume_mb': np.random.normal(50, 20, n_samples),
        'usb_usage': np.random.choice([0, 1], n_samples, p=[0.97, 0.03]),
        'printer_usage': np.random.choice([0, 1], n_samples, p=[0.9, 0.1]),
        'website_category': np.random.choice(['Work', 'Email', 'Social', 'Other'], n_samples, 
                                           p=[0.7, 0.2, 0.05, 0.05])
    }
    
    df = pd.DataFrame(normal_data)
    
    anomaly_indices = np.random.choice(n_samples, size=int(n_samples*0.1), replace=False)
    
    for idx in anomaly_indices:
        anomaly_type = np.random.choice(['login', 'file', 'mixed'])
        
        if anomaly_type == 'login':
            df.loc[idx, 'login_time'] = np.random.choice([np.random.randint(0, 6), 
                                                         np.random.randint(20, 24)])
            df.loc[idx, 'failed_logins'] = np.random.randint(5, 10)
            df.loc[idx, 'activity_type'] = 1
            
        elif anomaly_type == 'file':
            df.loc[idx, 'file_access'] = np.random.randint(40, 100)
            df.loc[idx, 'data_volume_mb'] = np.random.normal(200, 50)
            df.loc[idx, 'usb_usage'] = 1
            df.loc[idx, 'activity_type'] = 1
            
        else:
            df.loc[idx, 'login_time'] = np.random.choice([np.random.randint(0, 6), 
                                                         np.random.randint(20, 24)])
            df.loc[idx, 'file_access'] = np.random.randint(40, 100)
            df.loc[idx, 'failed_logins'] = np.random.randint(5, 10)
            df.loc[idx, 'usb_usage'] = 1
            df.loc[idx, 'activity_type'] = 1
    
    df['is_weekend'] = df['timestamp'].dt.weekday >= 5
    df['hour_of_day'] = df['timestamp'].dt.hour
    df['risk_score'] = calculate_risk_score(df)
    
    df['file_access'] = df['file_access'].clip(lower=0)
    df['failed_logins'] = df['failed_logins'].clip(lower=0)
    df['data_volume_mb'] = df['data_volume_mb'].clip(lower=0)
    
    return df

def calculate_risk_score(df):
    risk_score = np.zeros(len(df))
    risk_score += ((df['login_time'] < 7) | (df['login_time'] > 19)) * 2
    risk_score += (df['failed_logins'] > 3) * 3
    risk_score += (df['file_access'] > 30) * 2
    risk_score += df['usb_usage'] * 2
    risk_score += (df['data_volume_mb'] > 150) * 2
    risk_score += df['activity_type'] * 3
    risk_score = (risk_score / risk_score.max() * 10).round(2)
    return risk_score

if __name__ == "__main__":
    df = generate_dataset()
    df.to_csv('user_behavior_large.csv', index=False)
    print("\nDataset generated successfully!")