import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_realistic_dataset(n_samples=10000):
    np.random.seed(42)
    
    # Generate timestamps over a 30-day period
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    timestamps = pd.date_range(start=start_date, end=end_date, periods=n_samples)
    
    # Generate user IDs and departments
    user_ids = np.random.randint(1000, 2000, n_samples)
    departments = np.random.choice(
        ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Engineering'],
        n_samples,
        p=[0.15, 0.1, 0.2, 0.2, 0.25, 0.1]
    )
    
    # Generate normal behavior data
    normal_data = {
        'timestamp': timestamps,
        'user_id': user_ids,
        'department': departments,
        'login_time': np.random.normal(12, 3, n_samples).round().astype(int),  # Most logins around noon
        'activity_type': np.zeros(n_samples),  # Initially all normal
        'file_access': np.random.poisson(15, n_samples),  # Average 15 files accessed
        'failed_logins': np.random.poisson(0.3, n_samples),  # Usually 0-1 failed attempts
        'device_id': [f"DEV_{np.random.randint(100, 200)}" for _ in range(n_samples)],
        'ip_address': [f"192.168.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}" 
                      for _ in range(n_samples)],
        'data_volume_mb': np.random.lognormal(3, 1, n_samples).round(),  # Most transfers < 100MB
        'usb_usage': np.zeros(n_samples),  # Initially no USB usage
        'printer_usage': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),  # 20% printer usage
        'website_category': np.random.choice(
            ['Work', 'Email', 'Social', 'Other'],
            n_samples,
            p=[0.7, 0.2, 0.05, 0.05]
        )
    }
    
    df = pd.DataFrame(normal_data)
    
    # Clean up login times
    df['login_time'] = df['login_time'].clip(0, 23)
    
    # Add weekend information
    df['is_weekend'] = df['timestamp'].dt.weekday >= 5
    
    # Add hour of day
    df['hour_of_day'] = df['timestamp'].dt.hour
    
    # Inject anomalous behavior
    anomaly_indices = np.random.choice(n_samples, size=int(n_samples*0.1), replace=False)
    
    for idx in anomaly_indices:
        anomaly_type = np.random.choice(['login', 'file', 'mixed'])
        
        if anomaly_type == 'login':
            # Suspicious login patterns
            df.loc[idx, 'login_time'] = np.random.choice(
                list(range(0, 6)) + list(range(20, 24))
            )
            df.loc[idx, 'failed_logins'] = np.random.randint(5, 10)
            df.loc[idx, 'activity_type'] = 1
            
        elif anomaly_type == 'file':
            # Suspicious file access patterns
            df.loc[idx, 'file_access'] = np.random.randint(40, 100)
            df.loc[idx, 'data_volume_mb'] = np.random.randint(200, 1000)
            df.loc[idx, 'usb_usage'] = 1
            df.loc[idx, 'activity_type'] = 1
            
        else:  # mixed
            # Combined suspicious patterns
            df.loc[idx, 'login_time'] = np.random.choice(
                list(range(0, 6)) + list(range(20, 24))
            )
            df.loc[idx, 'file_access'] = np.random.randint(40, 100)
            df.loc[idx, 'failed_logins'] = np.random.randint(5, 10)
            df.loc[idx, 'data_volume_mb'] = np.random.randint(200, 1000)
            df.loc[idx, 'usb_usage'] = 1
            df.loc[idx, 'activity_type'] = 1
    
    # Calculate risk score based on multiple factors
    def calculate_risk_score(row):
        score = 0
        
        # After hours login (before 7 AM or after 7 PM)
        if row['login_time'] < 7 or row['login_time'] > 19:
            score += 2
        
        # Failed login attempts
        if row['failed_logins'] > 3:
            score += 3
        elif row['failed_logins'] > 1:
            score += 1
            
        # High file access
        if row['file_access'] > 40:
            score += 3
        elif row['file_access'] > 25:
            score += 1
            
        # High data volume
        if row['data_volume_mb'] > 200:
            score += 3
        elif row['data_volume_mb'] > 100:
            score += 1
            
        # USB usage
        if row['usb_usage'] == 1:
            score += 2
            
        # Weekend activity
        if row['is_weekend']:
            score += 1
            
        # Suspicious activity type
        if row['activity_type'] == 1:
            score += 3
            
        # Normalize to 0-10 scale
        return min(10, score)
    
    # Calculate risk score for each row
    df['risk_score'] = df.apply(calculate_risk_score, axis=1)
    
    # Add some department-specific patterns
    # IT department might have more legitimate after-hours activity
    it_dept = df['department'] == 'IT'
    df.loc[it_dept, 'risk_score'] = df.loc[it_dept, 'risk_score'] * 0.8
    
    # Finance department might have stricter monitoring
    finance_dept = df['department'] == 'Finance'
    df.loc[finance_dept, 'risk_score'] = df.loc[finance_dept, 'risk_score'] * 1.2
    
    # Clean up and final adjustments
    df['risk_score'] = df['risk_score'].round(2)
    df['file_access'] = df['file_access'].clip(lower=0)
    df['failed_logins'] = df['failed_logins'].clip(lower=0)
    df['data_volume_mb'] = df['data_volume_mb'].clip(lower=0)
    
    return df

if __name__ == "__main__":
    # Generate dataset
    df = generate_realistic_dataset()
    
    # Save to CSV
    df.to_csv('user_behavior_large.csv', index=False)
    
    # Print dataset statistics
    print("\nDataset Statistics:")
    print("-" * 50)
    print(f"Total number of records: {len(df)}")
    print(f"Number of features: {len(df.columns)}")
    print(f"Number of high-risk activities (risk score > 7): {len(df[df['risk_score'] > 7])}")
    print("\nRisk Score Distribution:")
    print(df['risk_score'].describe())
    print("\nDepartment-wise Average Risk Scores:")
    print(df.groupby('department')['risk_score'].mean().round(2))
    print("\nDataset generated successfully!")