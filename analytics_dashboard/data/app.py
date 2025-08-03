import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import datetime

# --- 1. Load User's Data ---
# Load your data from 'installment application.csv'
print("Loading data from 'installment application.csv'...")
try:
    df = pd.read_csv('installment application.csv')
    print(f"Data loaded successfully with {len(df)} transactions.")
    print("First 5 rows of your data:")
    print(df.head())
    print("\n" + "="*50 + "\n")

except FileNotFoundError:
    print("Error: 'installment application.csv' not found. Please ensure the file is in the same directory as the script.")
    # Exit or handle the error appropriately if the file isn't found
    exit()
except Exception as e:
    print(f"An error occurred while loading the CSV: {e}")
    exit()


# --- 2. Data Preprocessing and Feature Engineering ---
print("Starting data preprocessing and feature engineering...")

# Convert date columns to datetime objects
# Ensure column names match your CSV. Adjust if they are different.
df['created_at'] = pd.to_datetime(df['created_at'])
df['transaction_date'] = pd.to_datetime(df['transaction_date'])

# Sort data by user and then by transaction date to prepare for sequence analysis
# Assuming 'nic' is the primary user identifier. If you have a 'user_id' column, use that.
df = df.sort_values(by=['nic', 'transaction_date']).reset_index(drop=True)

# Create a unique user identifier (if 'nic' is not already unique enough)
df['user_id'] = df['nic'] # Using NIC as user_id for simplicity

# Feature Engineering:
# 1. Time-based features
df['transaction_day_of_week'] = df['transaction_date'].dt.dayofweek
df['transaction_hour'] = df['transaction_date'].dt.hour
df['time_to_verify'] = (df['transaction_date'] - df['created_at']).dt.total_seconds() / 3600 # hours

# 2. Lag features for sequential prediction (predicting the *next* merchant)
# We need to group by user and then shift to get the previous transaction's merchant
df['prev_merchant'] = df.groupby('user_id')['merchant'].shift(1)
df['prev_bill_amount'] = df.groupby('user_id')['bill_amount'].shift(1)
df['prev_installment_plan'] = df.groupby('user_id')['installment_plan'].shift(1)

# For the first transaction of each user, these 'prev_' features will be NaN.
# We'll drop these rows later or impute them. Dropping them for now as
# the "next best offer" implies a history.
initial_rows_count = len(df)
df.dropna(subset=['prev_merchant', 'prev_bill_amount', 'prev_installment_plan'], inplace=True)
print(f"Dropped {initial_rows_count - len(df)} rows due to missing previous transaction data.")


# 3. Aggregate features (e.g., average bill amount for a user)
user_agg_features = df.groupby('user_id').agg(
    avg_bill_amount=('bill_amount', 'mean'),
    num_transactions=('id', 'count'),
    distinct_merchants=('merchant', lambda x: x.nunique())
).reset_index()

# Merge aggregated features back to the main dataframe
df = pd.merge(df, user_agg_features, on='user_id', how='left')

# --- 3. Target Variable Creation ---
# The target is the 'merchant' of the *current* transaction, which is the 'next' merchant
# relative to the 'prev_merchant' we just created.
df['target_merchant'] = df['merchant']

print("Data preprocessing and feature engineering complete.")
print("First 5 rows with new features:")
print(df.head())
print("\n" + "="*50 + "\n")

# --- 4. Prepare Data for Model Training ---
print("Preparing data for model training...")

# Select features (X) and target (y)
# Drop sensitive PII and original 'merchant' as it's directly the target
# Ensure these columns exist in your CSV or adjust accordingly.
features = [
    'prev_merchant', 'prev_bill_amount', 'prev_installment_plan',
    'transaction_day_of_week', 'transaction_hour', 'time_to_verify',
    'avg_bill_amount', 'num_transactions', 'distinct_merchants'
]

# Check if all required features exist in the DataFrame
missing_features = [f for f in features if f not in df.columns]
if missing_features:
    print(f"Error: Missing required features in your dataset: {missing_features}")
    print("Please ensure your CSV contains these columns or adjust the 'features' list.")
    exit()

X = df[features]
y = df['target_merchant']

# Handle categorical features using Label Encoding (for simplicity with RandomForest)
label_encoder_prev_merchant = LabelEncoder()
X['prev_merchant_encoded'] = label_encoder_prev_merchant.fit_transform(X['prev_merchant'])
X = X.drop('prev_merchant', axis=1)

label_encoder_target_merchant = LabelEncoder()
y_encoded = label_encoder_target_merchant.fit_transform(y)

# Split data into training and testing sets
# Ensure there are enough samples per class for stratification, otherwise remove stratify
try:
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)
except ValueError as e:
    print(f"Warning: Could not stratify split due to: {e}. Proceeding without stratification.")
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)


print(f"Training data shape: {X_train.shape}")
print(f"Testing data shape: {X_test.shape}")
print("\n" + "="*50 + "\n")

# --- 5. Model Training ---
print("Training the RandomForestClassifier model...")

# Initialize the RandomForestClassifier
model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)

# Train the model
model.fit(X_train, y_train)

print("Model training complete.")
print("\n" + "="*50 + "\n")

# --- 6. Model Prediction and Evaluation ---
print("Making predictions and evaluating the model...")

# Make predictions on the test set
y_pred = model.predict(X_test)

# Evaluate the model
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred, target_names=label_encoder_target_merchant.classes_, zero_division=0)

print(f"Model Accuracy: {accuracy:.4f}")
print("\nClassification Report:\n", report)
print("\n" + "="*50 + "\n")

# --- 7. Example Prediction for a New Scenario ---
print("Demonstrating a 'Next Best Offer' prediction for a hypothetical user...")

if not df.empty:
    # Let's pick a random user from the dataset to simulate a prediction scenario
    sample_user_id = df['user_id'].sample(1).iloc[0]
    user_history = df[df['user_id'] == sample_user_id].sort_values('transaction_date')

    if not user_history.empty:
        last_transaction = user_history.iloc[-1]

        print(f"\nLast transaction details for user '{sample_user_id}':")
        print(last_transaction[['merchant', 'bill_amount', 'installment_plan', 'transaction_date']])

        # Find the aggregated features for this specific user
        user_current_agg = user_agg_features[user_agg_features['user_id'] == sample_user_id]
        if not user_current_agg.empty:
            user_current_agg = user_current_agg.iloc[0]
        else:
            print(f"Warning: Aggregated features not found for user {sample_user_id}. Cannot make a full prediction.")
            exit()

        # Create a DataFrame for the single prediction
        # Ensure column order matches X_train
        predict_features = pd.DataFrame([{
            'prev_merchant': last_transaction['merchant'],
            'prev_bill_amount': last_transaction['bill_amount'],
            'prev_installment_plan': last_transaction['installment_plan'],
            'transaction_day_of_week': last_transaction['transaction_date'].dayofweek,
            'transaction_hour': last_transaction['transaction_date'].hour,
            'time_to_verify': (last_transaction['transaction_date'] - last_transaction['created_at']).total_seconds() / 3600,
            'avg_bill_amount': user_current_agg['avg_bill_amount'],
            'num_transactions': user_current_agg['num_transactions'],
            'distinct_merchants': user_current_agg['distinct_merchants']
        }])

        # Encode 'prev_merchant' for prediction
        # Handle cases where a new merchant appears that wasn't in training data
        try:
            predict_features['prev_merchant_encoded'] = label_encoder_prev_merchant.transform(predict_features['prev_merchant'])
        except ValueError:
            print(f"Warning: 'prev_merchant' '{predict_features['prev_merchant'].iloc[0]}' not seen during training. Cannot encode.")
            print("Skipping prediction for this user.")
            exit()

        predict_features = predict_features.drop('prev_merchant', axis=1)

        # Ensure prediction features have the same columns as X_train
        # This is crucial if some features were dropped during training due to NaNs or other reasons
        # We need to align columns before prediction
        missing_cols = set(X_train.columns) - set(predict_features.columns)
        for c in missing_cols:
            predict_features[c] = 0 # Or appropriate default value/imputation strategy

        predict_features = predict_features[X_train.columns] # Ensure column order is the same

        # Make the prediction
        predicted_merchant_encoded = model.predict(predict_features)
        predicted_merchant = label_encoder_target_merchant.inverse_transform(predicted_merchant_encoded)

        # Get probabilities for all merchants (for "best offer" ranking)
        predicted_probabilities = model.predict_proba(predict_features)[0]
        
        # Create a mapping of encoded class to original merchant name
        merchant_mapping = {i: name for i, name in enumerate(label_encoder_target_merchant.classes_)}
        
        # Pair probabilities with merchant names and sort
        merchant_probabilities = sorted(
            [(merchant_mapping[i], prob) for i, prob in enumerate(predicted_probabilities)],
            key=lambda item: item[1],
            reverse=True
        )

        print(f"\nPredicted Next Best Offer (Merchant): {predicted_merchant[0]}")
        print("\nTop 3 Recommended Merchants with Probabilities:")
        for merchant, prob in merchant_probabilities[:3]:
            print(f"- {merchant}: {prob:.4f}")

    else:
        print("Could not find enough history for the selected user to demonstrate prediction.")
else:
    print("The loaded dataset is empty. Cannot perform analysis or prediction.")

